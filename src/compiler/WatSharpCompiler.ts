import { ErrorCodes, errorMessages, ParserErrorMessage } from "../core/errors";
import { IncludeHandlerResult } from "../preprocessor/PreprocessorParser";
import {
  Declaration,
  Expression,
  instrisicSizes as intrisicSizes,
  TypeSpec,
} from "./source-tree";
import { WatSharpParser } from "./WatSharpParser";
import { Node } from "../compiler/source-tree";
import { TokenLocation } from "../core/tokens";
import { applyTypeCast, resolveConstantExpression } from "./expression-resolver";

/**
 * This class implements the WAT# compiler
 */
export class WatSharpCompiler {
  // --- Use this parser instance
  private readonly _parser: WatSharpParser;

  // --- Keep track of error messages
  private _errors: ParserErrorMessage[] = [];

  constructor(
    public readonly source: string,
    public readonly includeHandler?: (filename: string) => IncludeHandlerResult,
    preprocessorSymbols?: string[]
  ) {
    this._parser = new WatSharpParser(
      source,
      includeHandler,
      preprocessorSymbols
    );
  }

  /**
   * Execute the compilation of the source
   */
  compile(): void {
    // --- Step #1: parse the program and sign any syntax issues.
    this._parser.parseProgram();
    this._errors = this._parser.errors.slice(0);
    if (this._errors.length > 0) {
      return;
    }

    // --- Step #2: resolve dependencies among declarations
    this.resolveDependencies();
    if (this._errors.length > 0) {
      return;
    }
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

  // ==========================================================================
  // Declaration resolution

  /**
   * Resolve unresolved declaration dependencies
   */
  private resolveDependencies(): void {
    // --- Declarations to resolve
    const compiler = this;
    const declarations = this._parser.declarations;
    const resolutionQueue: Declaration[] = [...declarations.values()];
    const namedStack: string[] = [];

    while (resolutionQueue.length > 0) {
      const decl = resolutionQueue.shift();
      try {
        resolveDeclarationDependency(decl);
      } catch (err) {
        this.reportError("W107", decl, err.toString());
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

      decl.resolved = true;
      switch (decl.type) {
        case "ConstDeclaration":
          resolveExpression(decl.expr);
          if (decl.expr.value !== undefined) {
            decl.value = applyTypeCast(decl.underlyingType, decl.expr.value);
          }
          break;
        case "DataDeclaration":
          decl.exprs.forEach(expr => resolveExpression(expr));
          break;
        case "FunctionDeclaration":
          // TODO: Implement this case
          break;
        case "GlobalDeclaration":
          if (decl.initExpr) {
            resolveExpression(decl.initExpr);
          }
          break;
        case "ImportedFunctionDeclaration":
          // TODO: Implement this case
          break;
        case "TableDeclaration":
          // TODO: Implement this case
          break;
        case "TypeDeclaration":
          resolveTypeDeclaration(decl.spec);
          break;
        case "VariableDeclaration":
          if (decl.expr) {
            resolveExpression(decl.expr);
          }
          break;
      }
      return;
    }

    /**
     * Resolve the given type specification
     * @param typeSpec Type specification to resolve
     */
    function resolveTypeDeclaration(typeSpec: TypeSpec): void {
      // --- Type has already been resolved
      if (typeSpec.resolved) {
        return;
      }

      const typeQueue: TypeSpec[] = [typeSpec];
      while (typeQueue.length > 0) {
        const spec = typeQueue.shift();
        // --- Let's make the type is resolved
        spec.resolved = true;

        switch (spec.type) {
          case "Intrinsic":
            spec.sizeof = intrisicSizes[spec.underlying];
            break;

          case "Pointer":
            spec.sizeof = 4;
            typeQueue.push(spec.spec);
            break;

          case "Struct":
            spec.sizeof = 0;
            for (let i = 0; i < spec.fields.length; i++) {
              spec.fields[i].offset = spec.sizeof;
              const typeSpec = spec.fields[i].spec;
              if (typeSpec.type === "NamedType") {
                // --- Resolve named types of structs immediately
                // --- After circular reference check
                if (namedStack.includes(typeSpec.name)) {
                  compiler.reportError("W103", typeSpec, typeSpec.name);
                  break;
                }

                // --- Use a stack to detect circular references
                namedStack.push(typeSpec.name);

                const decl = declarations.get(typeSpec.name);
                if (decl) {
                  if (decl.type === "TypeDeclaration") {
                    resolveDeclarationDependency(decl);
                    spec.sizeof += compiler.getSizeof(decl.spec);
                  } else {
                    compiler.reportError("W102", typeSpec, typeSpec.name);
                  }
                } else {
                  compiler.reportError("W101", typeSpec, typeSpec.name);
                }
                namedStack.pop();
              } else {
                resolveTypeDeclaration(typeSpec);
                spec.sizeof += typeSpec.sizeof;
              }
            }
            break;

          case "Array":
            resolveTypeDeclaration(spec.spec);
            // TODO: Calculate array size
            const arraySize = 1;
            spec.sizeof = arraySize * spec.spec.sizeof;
            break;

          case "NamedType":
            const decl = declarations.get(spec.name);
            if (decl) {
              if (decl.type === "TypeDeclaration") {
                typeQueue.push(decl.spec);
                return;
              } else {
                compiler.reportError("W102", spec, spec.name);
              }
            } else {
              compiler.reportError("W101", spec, spec.name);
            }
            break;

          default:
            spec.resolved = false;
            return;
        }
      }
    }

    /**
     * Resolves the specified expression
     * @param expr Expression to resolve
     */
    function resolveExpression(expr: Expression): void {
      resolveConstantExpression(
        expr,
        (_name) => {
          throw new Error("Not implemented yet");
        },
        (_spec) => {
          return 0;
        },
        compiler.reportError.bind(compiler)
      );
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
  // Error reporting

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  private reportError(
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
