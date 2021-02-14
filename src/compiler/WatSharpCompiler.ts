import { ErrorCodes, errorMessages, ParserErrorMessage } from "../core/errors";
import { IncludeHandlerResult } from "../preprocessor/PreprocessorParser";
import {
  Declaration,
  Expression,
  FunctionDeclaration,
  instrisicSizes as intrisicSizes,
  Intrinsics,
  TableDeclaration,
  TypeSpec,
} from "./source-tree";
import { WatSharpParser } from "./WatSharpParser";
import { Node } from "../compiler/source-tree";
import { TokenLocation } from "../core/tokens";
import {
  applyTypeCast,
  resolveConstantExpression,
} from "./expression-resolver";
import { FunctionCompiler } from "./FunctionCompiler";
import { WaTree } from "../wa-ast/WaTree";
import { WaParameter, WaType } from "../wa-ast/wa-nodes";

/**
 * This class implements the WAT# compiler
 */
export class WatSharpCompiler {
  // --- Use this parser instance
  private readonly _parser: WatSharpParser;

  // --- Keep track of error messages
  private _errors: ParserErrorMessage[] = [];

  // --- Stores the WebAssemble tree
  private _waTree: WaTree | null = null;

  // --- Trace helper members
  private _shouldTrace: boolean = false;
  private readonly _traceMessages: CompilerTraceMessage[] = [];

  // --- The number of table entries to emit
  private _tableEntries = 0;

  constructor(
    public readonly source: string,
    public readonly includeHandler?: (filename: string) => IncludeHandlerResult,
    public readonly preprocessorSymbols?: string[]
  ) {
    this._parser = new WatSharpParser(
      source,
      includeHandler,
      preprocessorSymbols
    );
  }

  /**
   * Turn on comiler tracing
   */
  trace(): void {
    this._shouldTrace = true;
  }

  /**
   * Execute the compilation of the source
   */
  compile(): string | null {
    // --- Step #1: parse the program and sign any syntax issues.
    this._parser.parseProgram();
    this._errors = this._parser.errors.slice(0);
    if (this._errors.length > 0) {
      return null;
    }

    // --- Step #2: resolve dependencies among declarations
    this.resolveDependencies();
    if (this._errors.length > 0) {
      return null;
    }

    // --- Step #3: emit declaration nodes
    this._waTree = new WaTree();
    this.emitDeclarationNodes();

    // --- Step #4: process function bodies
    this.processFunctionBodies();
    if (this._errors.length > 0) {
      return null;
    }

    // --- Step #5: complete code emission
    this.completeCodeEmission();

    // --- Step #6: render the tree
    return this._waTree.render();
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): ParserErrorMessage[] {
    return this._errors;
  }

  /**
   * Indicates if there were any errors during the parse phase
   */
  get hasErrors(): boolean {
    return this._errors.length > 0;
  }

  /**
   * Gets the declarations of the WAT# program
   */
  get declarations(): Map<string, Declaration> {
    return this._parser.declarations;
  }

  /**
   * Gets the WebAssembly tree with the emitted code
   */
  get waTree(): WaTree | null {
    return this._waTree;
  }

  /**
   * Gets compiler trace messages
   */
  get traceMessages(): CompilerTraceMessage[] {
    return this._traceMessages;
  }

  /**
   * Adds a trace message
   * @param traceFactory Factory function to generate trace message
   */
  addTrace(traceFactory: () => [string, number | undefined, string]): void {
    if (this._shouldTrace) {
      const trace = traceFactory();
      this._traceMessages.push({
        source: trace[0],
        point: trace[1],
        message: trace[2],
      });
    }
  }

  // ==========================================================================
  // Declaration resolution

  /**
   * Resolve unresolved declaration dependencies
   */
  private resolveDependencies(): void {
    const compiler = this;

    // --- Declarations to resolve
    const declarations = this._parser.declarations;

    // --- Queue to hold dependent declarations to resolve
    const resolutionQueue: ResolutionQueueItem[] = [
      ...declarations.values(),
    ].map((item) => <ResolutionQueueItem>{ decl: item });

    // --- Stack of name to check circular references
    const namedStack: string[] = [];

    // --- Next address in memory
    let nextMemoryAddress = 0;

    // --- Iterate through the queue of items to resolve
    while (resolutionQueue.length > 0) {
      const item = resolutionQueue.shift();
      let itemToReport: Declaration | TypeSpec | Expression | undefined;

      // --- Resolve a declaration, type, or expression
      try {
        if (item.decl) {
          itemToReport = item.decl;
          resolveDeclarationDependency(item.decl);
        } else if (item.typeSpec) {
          itemToReport = item.typeSpec;
          resolveTypeSpecification(item.typeSpec);
        } else if (item.expr) {
          itemToReport = item.expr;
          resolveExpression(item.expr);
        }
      } catch (err) {
        this.reportError("W107", itemToReport, err.toString());
      }
    }

    /**
     * Resolve a single declaration
     * @param decl Declaration instance
     */
    function resolveDeclarationDependency(decl: Declaration): void {
      // --- Declaration has already been resolved
      if (decl.resolved) {
        return;
      }

      // --- Push the name to the stack
      namedStack.push(decl.name);

      // --- Resolve a particular type of declaration
      switch (decl.type) {
        case "ConstDeclaration":
          resolveExpression(decl.expr);
          if (decl.expr.value !== undefined) {
            decl.value = applyTypeCast(decl.underlyingType, decl.expr.value);
          }
          break;

        case "DataDeclaration":
          decl.exprs.forEach((expr) => resolveExpression(expr));
          break;

        case "GlobalDeclaration":
          if (decl.initExpr) {
            resolveExpression(decl.initExpr);
          }
          break;

        case "TableDeclaration":
          resolveTableDeclaration(decl);
          break;

        case "TypeDeclaration":
          resolveTypeSpecification(decl.spec);
          break;

        case "VariableDeclaration":
          resolveTypeSpecification(decl.spec);
          if (decl.addressExpr) {
            resolveExpression(decl.addressExpr);
            if (decl.addressExpr.value) {
              decl.address = Number(decl.addressExpr.value);
            }
          }
          if (decl.address === undefined) {
            decl.address = nextMemoryAddress;
          }
          nextMemoryAddress = decl.address + compiler.getSizeof(decl.spec);
          break;
      }

      // --- Done. Remove the name fromt he stack and complete the resolution
      namedStack.pop();
      decl.resolved = true;
      return;
    }

    /**
     * Resolve the given type specification
     * @param typeSpec Type specification to resolve
     */
    function resolveTypeSpecification(spec: TypeSpec): void {
      // --- Type has already been resolved
      if (spec.resolved) {
        return;
      }

      // --- Let's make the type resolved
      spec.resolved = true;

      switch (spec.type) {
        case "Intrinsic":
          spec.sizeof = intrisicSizes[spec.underlying];
          break;

        case "Pointer":
          spec.sizeof = 4;
          resolutionQueue.push({ typeSpec: spec.spec });
          break;

        case "Struct":
          spec.sizeof = 0;
          for (let i = 0; i < spec.fields.length; i++) {
            spec.fields[i].offset = spec.sizeof;
            const typeSpec = spec.fields[i].spec;
            resolveTypeSpecification(typeSpec);
            spec.sizeof += compiler.getSizeof(typeSpec);
          }
          break;

        case "Array":
          resolveTypeSpecification(spec.spec);
          resolveExpression(spec.size);
          const arraySize = Number(spec.size.value ?? 0);
          spec.sizeof = arraySize * compiler.getSizeof(spec.spec);
          break;

        case "NamedType":
          // --- Check circular references
          if (namedStack.includes(spec.name)) {
            compiler.reportError("W103", spec, spec.name);
            break;
          }
          const decl = declarations.get(spec.name);
          if (decl) {
            if (decl.type === "TypeDeclaration") {
              // --- Use a stack to detect circular references
              namedStack.push(spec.name);
              resolveDeclarationDependency(decl);
              namedStack.pop();
              break;
            } else {
              // --- Name is not a type declaration
              compiler.reportError("W102", spec, spec.name);
            }
          } else {
            // --- Unknown declaration
            compiler.reportError("W101", spec, spec.name);
          }
          break;

        default:
          spec.resolved = false;
          break;
      }
    }

    /**
     * Resolves the specified expression
     * @param expr Expression to resolve
     */
    function resolveExpression(expr: Expression): void {
      // --- "Outsource" to resolveConstantExpression
      resolveConstantExpression(
        expr,

        // --- This function resolves identifiers in constant expressions
        (id) => {
          // --- Check for circular reference
          if (namedStack.includes(id.name)) {
            compiler.reportError("W103", id, id.name);
            return;
          }

          // --- Resolve the const declaration
          const decl = declarations.get(id.name);
          if (decl) {
            if (decl.type === "ConstDeclaration") {
              // --- Use a stack to detect circular references
              namedStack.push(id.name);
              resolveDeclarationDependency(decl);
              id.value = decl.value;
              namedStack.pop();
            } else {
              // --- This is not a const declaration
              compiler.reportError("W108", id, id.name);
            }
          } else {
            // --- Unknown declaration
            compiler.reportError("W101", id, id.name);
          }
        },

        // --- This function resolves the "sizeof" operator
        (typeSpec) => {
          resolveTypeSpecification(typeSpec);
          return typeSpec.resolved ? compiler.getSizeof(typeSpec) : 0;
        },

        // --- Use this function to report errors
        compiler.reportError.bind(compiler)
      );
    }

    /**
     * Resolves the specified table declaration
     * @param table Table declaration
     */
    function resolveTableDeclaration(table: TableDeclaration): void {
      // --- Iterate through all table idetifiers
      table.entryIndex = compiler._tableEntries;
      table.ids.forEach((id) => {
        const decl = declarations.get(id);
        if (!decl) {
          // --- Unknown identifier
          compiler.reportError("W101", table, id);
          return;
        }
        if (decl.type !== "FunctionDeclaration") {
          // --- This ID is not a function
          compiler.reportError("W109", table, id);
        }
        compiler._tableEntries++;
      });
      table.resolved = true;
    }
  }

  /**
   * Get the size of a type specification
   * @param typeSpec
   */
  getSizeof(typeSpec: TypeSpec): number {
    if (typeSpec.type !== "NamedType") {
      return typeSpec.sizeof;
    }
    const decl = this._parser.declarations.get(typeSpec.name);
    if (decl.type !== "TypeDeclaration" || !decl.spec.sizeof) {
      return 0;
    }
    return decl.spec.sizeof;
  }

  // ==========================================================================
  // Emit declaration nodes

  /**
   * Emit the code for module declarations
   */
  private emitDeclarationNodes(): void {
    this.emitImports();
    this.emitExports();
    this.emitGlobals();
    this.emitVariableMap();
  }

  /**
   * Emit module exports code
   */
  private emitExports(): void {
    let header = false;
    for (const decl of this.declarations.values()) {
      if (decl.type === "FunctionDeclaration" && decl.isExport) {
        if (!header) {
          this._waTree.separatorLine();
          this._waTree.comment("Exported functions");
          header = true;
        }
        this._waTree.functionExport(createGlobalName(decl.name), decl.name);
      }
    }
  }

  /**
   * Emit module exports code
   */
  private emitImports(): void {
    for (const decl of this.declarations.values()) {
      if (decl.type === "ImportedFunctionDeclaration") {
        this._waTree.functionImport(
          createGlobalName(decl.name),
          decl.name1,
          decl.name2,
          decl.parSpecs.map(
            (ps) =>
              <WaParameter>{
                type: waTypeMappings[ps.underlying],
              }
          )
        );
      }
    }
  }

  /**
   * Emit globals code
   */
  private emitGlobals(): void {
    let header = false;
    for (const decl of this.declarations.values()) {
      if (decl.type === "GlobalDeclaration") {
        if (!header) {
          this._waTree.separatorLine();
          this._waTree.comment("Global declarations");
          header = true;
        }
        this._waTree.global(
          createGlobalName(decl.name),
          waTypeMappings[decl.underlyingType],
          decl?.initExpr?.value
        );
      }
    }
  }

  /**
   * Emit globals code
   */
  private emitVariableMap(): void {
    this._waTree.separatorLine();
    this._waTree.comment("Variable mappings");
    for (const decl of this.declarations.values()) {
      if (decl.type === "VariableDeclaration") {
        this._waTree.comment(
          `0x${decl.address.toString(16).padStart(6, "0")} (${this.getSizeof(
            decl.spec
          )}): ${decl.name}`
        );
      }
    }
  }

  // ==========================================================================
  // Process function bodies

  /**
   * Processes the bodies of functions
   */
  private processFunctionBodies(): void {
    for (const decl of this.declarations.values()) {
      if (decl.type === "FunctionDeclaration") {
        this.processFunctionBody(decl);
      }
    }
  }

  /**
   * Processes the specified function
   * @param func Function to process
   */
  private processFunctionBody(func: FunctionDeclaration): void {
    const fCompiler = new FunctionCompiler(this, func);
    fCompiler.process();
  }

  // ==========================================================================
  // Complete code emission

  private completeCodeEmission(): void {
    // --- Calculate memory size
    let maxAddr = 0;
    for (const decl of this.declarations.values()) {
      if (decl.type !== "VariableDeclaration") {
        continue;
      }
      const thisEndAddr = decl.address + this.getSizeof(decl.spec);
      if (isNaN(thisEndAddr)) {
        throw new Error(`Unexpected memory size of variable ${decl.name}`);
      }
      if (thisEndAddr > maxAddr) {
        maxAddr = thisEndAddr;
      }
    }
    const memPages = (maxAddr >> 16) + 1;
    this._waTree.setMemorySpecification(memPages);
  }

  // ==========================================================================
  // Error reporting

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  reportError(
    errorCode: ErrorCodes,
    node: Node | TokenLocation,
    ...options: any[]
  ): void {
    let errorText: string = errorMessages[errorCode] ?? "Unkonwn error";
    if (options) {
      options.forEach(
        (_o, idx) =>
          (errorText = replace(errorText, `{${idx}}`, options[idx].toString()))
      );
    }
    this._errors.push({
      code: errorCode,
      text: errorText,
      line: node.startLine,
      column: node.startColumn,
      position: node.startPosition,
    });

    function replace(
      input: string,
      placeholder: string,
      replacement: string
    ): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
    }
  }
}

/**
 * An item within the resolution queue
 */
interface ResolutionQueueItem {
  decl?: Declaration;
  typeSpec?: TypeSpec;
  expr?: Expression;
}

/**
 * Represents a comiler trace message
 */
export interface CompilerTraceMessage {
  source: string;
  point?: number;
  message: string;
}

/**
 * Mappings from intrinsic types to WA types
 */
export const waTypeMappings: Record<Intrinsics, WaType> = {
  i8: WaType.i32,
  u8: WaType.i32,
  i16: WaType.i32,
  u16: WaType.i32,
  i32: WaType.i32,
  u32: WaType.i32,
  i64: WaType.i64,
  u64: WaType.i64,
  f32: WaType.f32,
  f64: WaType.f64,
};

/**
 * Creates a WebAssembly function name
 * @param name Name to use as input
 */
export function createGlobalName(name: string): string {
  return `$${name}`;
}

/**
 * Creates a WebAssembly local name
 * @param name Name to use as input
 */
export function createLocalName(name: string): string {
  return `$loc_${name}`;
}

/**
 * Creates a WebAssembly parameter name
 * @param name Name to use as input
 */
export function createParameterName(name: string): string {
  return `$par_${name}`;
}
