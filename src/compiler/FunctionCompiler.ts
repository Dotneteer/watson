import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Assignment,
  BreakStatement,
  ContinueStatement,
  DoStatement,
  Expression,
  IfStatement,
  LocalFunctionInvocation,
  LocalVariable,
  Node,
  ReturnStatement,
  WhileStatement,
} from "../compiler/source-tree";
import { WaType } from "../wa-ast/wa-nodes";
import {
  FunctionDeclaration,
  Intrinsics,
  IntrinsicType,
  Statement,
  TypeSpec,
} from "./source-tree";
import { WatSharpCompiler } from "./WatSharpCompiler";

/**
 * This class is responsible for compiling a function body
 */
export class FunctionCompiler {
  // --- Local parameters and variabled of the function
  private _locals = new Map<string, LocalDeclaration>();

  // --- The result value of the function
  private _resultType: WaType | null = null;

  /**
   * Initializes a function compiler instance
   * @param wsCompiler WAT# compiler instance
   * @param func Function to compile
   */
  constructor(
    public readonly wsCompiler: WatSharpCompiler,
    public readonly func: FunctionDeclaration
  ) {}

  /**
   * Gets the locals of this function
   */
  get locals(): Map<string, LocalDeclaration> {
    return this._locals;
  }

  /**
   * Processes the body of the function
   */
  process(): void {
    this.processHead();
    this.func.body.forEach(this.processStatement);
  }

  /**
   * Processes the function parameters and result type
   */
  private processHead(): void {
    // --- Map the result type
    this._resultType = this.func.resultType
      ? waTypeMappings[this.func.resultType.underlying]
      : null;

    // --- Map parameters to locals
    this.func.params.forEach((param) => {
      if (this._locals.has(param.name)) {
        this.reportError("W140", this.func);
      } else {
        const paramType =
          param.spec.type === "Pointer"
            ? WaType.i32
            : waTypeMappings[(param.spec as IntrinsicType).underlying];
        this.locals.set(param.name, {
          type: param.spec,
          waType: paramType,
        });
      }
    });
  }

  /**
   * Processes the specified function statement
   * @param stmt Statement to process
   */
  private processStatement(stmt: Statement): void {
    switch (stmt.type) {
      case "LocalVariable":
        this.processLocalDeclaration(stmt);
        return;

      case "Assignment":
        this.processAssignment(stmt);
        return;
      case "Break":
        this.processBreak(stmt);
        return;
      case "Continue":
        this.processContinue(stmt);
        return;
      case "Do":
        this.processDoWhileLoop(stmt);
        return;
      case "If":
        this.processIf(stmt);
        return;
      case "LocalFunctionInvocation":
        this.processLocalFunctionInvocation(stmt);
        return;
      case "Return":
        this.processReturn(stmt);
        return;
      case "While":
        this.processWhileLoop(stmt);
        return;
    }
  }

  /**
   * Processes a local variable declaration
   */
  private processLocalDeclaration(localVar: LocalVariable): void {
    if (this._locals.has(localVar.name)) {
      this.reportError("W140", this.func);
      return;
    } else {
      let initExpr: ProcessedExpression | null = null;
      if (localVar.initExpr) {
         initExpr = this.processExpression(localVar.initExpr);
      }
      const paramType =
        localVar.spec.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(localVar.spec as IntrinsicType).underlying];
      this.locals.set(localVar.name, {
        type: localVar.spec,
        waType: paramType,
      });
      
    }
  }

  /**
   * Processes the specified assignment
   */
  private processAssignment(asgn: Assignment): void {
    // TODO: Implement this method
  }

  /**
   * Processes a break statement
   */
  private processBreak(breakStmt: BreakStatement): void {
    // TODO: Implement this method
  }

  /**
   * Processes a continue statement
   */
  private processContinue(contStmt: ContinueStatement): void {
    // TODO: Implement this method
  }

  /**
   * Processes a do..while loop
   */
  private processDoWhileLoop(doLoop: DoStatement): void {
    // TODO: Implement this method
  }

  /**
   * Processes a while loop
   */
  private processWhileLoop(doLoop: WhileStatement): void {
    // TODO: Implement this method
  }

  /**
   * Processes an if statement
   */
  private processIf(ifStmt: IfStatement): void {
    // TODO: Implement this method
  }

  /**
   * Processes a local function invocation
   */
  private processLocalFunctionInvocation(
    invocation: LocalFunctionInvocation
  ): void {
    // TODO: Implement this method
  }

  /**
   * Processes an if statement
   */
  private processReturn(retStmt: ReturnStatement): void {
    // TODO: Implement this method
  }

  // ==========================================================================
  // Expression processing

  /**
   * Processes the specified expression
   */
  private processExpression(expr: Expression): ProcessedExpression | null {
    return null;
  }

  // ==========================================================================
  // Helpers

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
    this.wsCompiler.reportError(errorCode, node, ...options);
  }
}

/**
 * Information about a local variable type
 */
interface LocalDeclaration {
  type: TypeSpec;
  waType: WaType;
}

/**
 * Represents a processed expression
 */
interface ProcessedExpression {
  exprType: TypeSpec;
}

/**
 * Mappings from intrinsic types to WA types
 */
const waTypeMappings: Record<Intrinsics, WaType> = {
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
