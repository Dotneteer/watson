import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Assignment,
  BinaryExpression,
  BreakStatement,
  ContinueStatement,
  DoStatement,
  Expression,
  IfStatement,
  Literal,
  LiteralSource,
  LocalFunctionInvocation,
  LocalVariable,
  Node,
  ReturnStatement,
  UnaryExpression,
  WhileStatement,
} from "../compiler/source-tree";
import { WaInstruction, WaParameter, WaType } from "../wa-ast/wa-nodes";
import {
  FunctionDeclaration,
  Intrinsics,
  IntrinsicType,
  Statement,
  TypeSpec,
} from "./source-tree";
import {
  createGlobalName,
  createLocalName,
  createParameterName,
  WatSharpCompiler,
  waTypeMappings,
} from "./WatSharpCompiler";
import {
  and,
  constVal,
  convert32,
  convert64,
  demote64,
  extend32,
  FunctionBuilder,
  le,
  localSet,
  shl,
  shr,
  wrap64,
} from "../wa-ast/FunctionBuilder";
import {
  applyBinaryOperation,
  applyBuiltInFunction,
  applyTypeCast,
  applyUnaryOperation,
  renderExpression,
} from "./expression-resolver";

/**
 * This class is responsible for compiling a function body
 */
export class FunctionCompiler {
  // --- Local parameters and variabled of the function
  private _locals = new Map<string, LocalDeclaration>();

  // --- The result value of the function
  private _resultType: WaType | null = null;

  private _builder: FunctionBuilder;
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
   * Adds a trace message
   * @param traceFactory Factory function to generate trace message
   */
  addTrace(traceFactory: () => [string, number | undefined, string]): void {
    this.wsCompiler.addTrace(traceFactory);
  }

  /**
   * Processes the body of the function
   */
  process(): void {
    this.processHead();
    this.func.body.forEach((stmt) => this.processStatement(stmt));
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
    const waPars: WaParameter[] = [];
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
        waPars.push({
          id: createParameterName(param.name),
          type: paramType,
        });
      }
    });

    // --- Create the function builder
    this.wsCompiler.waTree.separatorLine();
    this._builder = this.wsCompiler.waTree.func(
      createGlobalName(this.func.name),
      waPars,
      this._resultType
    );
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
      const localName = createLocalName(localVar.name);
      let initExpr: ProcessedExpression | null = null;
      if (localVar.initExpr) {
        initExpr = this.processExpression(localVar.initExpr);
        this.castForStorage(localVar.spec, initExpr.exprType);
        this.inject(localSet(localName));
      }
      const paramType =
        localVar.spec.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(localVar.spec as IntrinsicType).underlying];
      this.locals.set(localVar.name, {
        type: localVar.spec,
        waType: paramType,
      });
      const local = this._builder.addLocal(localName, paramType);
      this.addTrace(() => [
        "local",
        0,
        this.wsCompiler.waTree.renderLocal(local),
      ]);
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
    this.addTrace(() => ["pExpr", 0, renderExpression(expr)]);
    const simplified = this.simplifyExpression(expr);
    this.addTrace(() => ["pExpr", 1, renderExpression(simplified)]);
    const exprType = this.compileExpression(simplified);
    return {
      expr: simplified,
      exprType,
    };
  }

  /**
   * Simplifies the expression
   * @param expr Expression to simplify
   */
  simplifyExpression(expr: Expression): Expression {
    expr = this.removeTrivialLiteralsFromBinaryOps(expr);
    expr = this.orderLiteralsToRight(expr);
    expr = this.refoldBinaryOps(expr);
    expr = this.processLiterals(expr);
    return expr;
  }

  /**
   *
   * @param expr
   * @param action
   */
  visitExpression(
    expr: Expression,
    action: (vexp: Expression) => Expression
  ): Expression {
    switch (expr.type) {
      case "BinaryExpression":
        const left = this.visitExpression(expr.left, action);
        if (left !== expr.left) {
          expr.left = left;
        }
        const right = this.visitExpression(expr.right, action);
        if (right !== expr.right) {
          expr.right = right;
        }
        break;

      case "BuiltInFunctionInvocation":
      case "FunctionInvocation":
        for (let i = 0; i < expr.arguments.length; i++) {
          const arg = this.visitExpression(expr.arguments[i], action);
          if (arg !== expr.arguments[i]) {
            expr.arguments[i] = arg;
          }
        }
        break;

      case "ConditionalExpression":
        const condition = this.visitExpression(expr.condition, action);
        if (condition !== expr.condition) {
          expr.condition = condition;
        }
        const consequent = this.visitExpression(expr.consequent, action);
        if (consequent !== expr.consequent) {
          expr.consequent = consequent;
        }
        const alternate = this.visitExpression(expr.alternate, action);
        if (alternate !== expr.alternate) {
          expr.condition = condition;
        }
        break;

      case "ItemAccess":
        const array = this.visitExpression(expr.array, action);
        if (array !== expr.array) {
          expr.array = array;
        }
        const index = this.visitExpression(expr.index, action);
        if (index !== expr.index) {
          expr.index = index;
        }
        break;

      case "MemberAccess":
        const obj = this.visitExpression(expr.object, action);
        if (obj !== expr.object) {
          expr.object = obj;
        }
        break;

      case "TypeCast":
      case "UnaryExpression":
        const operand = this.visitExpression(expr.operand, action);
        if (operand !== expr.operand) {
          expr.operand = operand;
        }
        break;
    }
    return action(expr);
  }

  /**
   * Flips constant values to the right for
   * commutative binary ops
   * @param expr
   */
  private orderLiteralsToRight(expr: Expression): Expression {
    return this.visitExpression(expr, (e) => {
      const commExpr = isCommutativeOp(e);
      if (!commExpr) {
        return e;
      }

      if (
        commExpr.left.type === "Literal" &&
        commExpr.right.type !== "Literal"
      ) {
        const tmp = commExpr.left;
        commExpr.left = commExpr.right;
        commExpr.right = tmp;
      }
      return commExpr;
    });
  }

  /**
   * Removes literals from expressions, which do not change the result of an operation
   * @param expr Expression to manage
   */
  private removeTrivialLiteralsFromBinaryOps(expr: Expression): Expression {
    return this.visitExpression(expr, (e) => {
      if (e.type !== "BinaryExpression") {
        return e;
      }

      switch (e.operator) {
        case "+":
        case "|":
        case "^":
          if (e.left.type === "Literal" && e.left.value === 0) {
            return e.right;
          }
          if (e.right.type === "Literal" && e.right.value === 0) {
            return e.left;
          }
          break;

        case ">>":
        case ">>>":
        case "<<":
          if (e.right.type === "Literal" && e.right.value === 0) {
            return e.left;
          }
          break;

        case "-":
          if (e.left.type === "Literal" && e.left.value === 0) {
            return <UnaryExpression>{
              type: "UnaryExpression",
              operator: "-",
              operand: e.right,
            };
          }
          if (e.right.type === "Literal" && e.right.value === 0) {
            return e.left;
          }
          break;

        case "*":
          if (e.right.type === "Literal" && e.right.value === 1) {
            return e.left;
          }
          if (e.left.type === "Literal" && e.left.value === 1) {
            return e.right;
          }
          break;

        case "/":
          if (e.right.type === "Literal" && e.right.value === 1) {
            return e.left;
          }
          break;

        case "%":
          if (e.right.type === "Literal" && e.right.value === 1) {
            return createLiteral(0);
          }
          break;

        case "&":
          if (
            (e.left.type === "Literal" && e.left.value === 0) ||
            (e.right.type === "Literal" && e.right.value === 0)
          ) {
            return createLiteral(0);
          }
          break;
      }
      return e;
    });
  }

  /**
   * Processes literal values; evaluates constant expressions
   * @param expr Expression to manage
   */
  private processLiterals(expr: Expression): Expression {
    const compiler = this.wsCompiler;
    return this.visitExpression(expr, (e) => calculate(e));

    function calculate(e: Expression): Expression {
      switch (e.type) {
        case "ConditionalExpression":
          if (
            e.condition.type === "Literal" &&
            e.consequent.type === "Literal" &&
            e.alternate.type === "Literal"
          ) {
            return createLiteral(
              e.condition.value ? e.consequent.value : e.alternate.value
            );
          }
          break;

        case "BinaryExpression":
          if (e.left.type === "Literal" && e.right.type === "Literal") {
            return createLiteral(
              applyBinaryOperation(e.operator, e.left.value, e.right.value)
            );
          }
          break;

        case "UnaryExpression":
          if (e.operand.type === "Literal") {
            return createLiteral(
              applyUnaryOperation(e.operator, e.operand.value)
            );
          }
          break;

        case "BuiltInFunctionInvocation":
          const nonLiteralArgs = e.arguments.filter(
            (a) => a.type !== "Literal"
          );
          if (nonLiteralArgs.length === 0) {
            return createLiteral(
              applyBuiltInFunction(
                e.name,
                e.arguments.map((a) => a.value)
              )
            );
          }
          break;

        case "TypeCast":
          if (e.operand.type === "Literal") {
            try {
              const cast = applyTypeCast(e.name, e.operand.value);
              return createLiteral(cast, e.name === "u64");
            } catch {
              // --- Intentionally ignored
            }
          }
          break;

        case "SizeOfExpression":
          compiler.resolveDependencies(e.spec);
          return createLiteral(compiler.getSizeof(e.spec));

        case "Identifier":
          const decl = compiler.declarations.get(e.name);
          if (decl?.type === "ConstDeclaration") {
            return createLiteral(decl.value);
          }
          break;
      }
      return e;
    }
  }

  /**
   * Refolds expressions to process literals
   * @param expr
   */
  private refoldBinaryOps(expr: Expression): Expression {
    return this.visitExpression(expr, (e) => refold(e));

    function refold(expr: Expression): Expression {
      if (
        expr.type !== "BinaryExpression" ||
        expr.right.type !== "Literal" ||
        expr.left.type !== "BinaryExpression" ||
        expr.left.right.type !== "Literal"
      ) {
        return expr;
      }

      // --- The expression is like (expr binop2 literal2) binop1 literal1)
      const binop1 = expr.operator;
      const literal1 = expr.right.value;
      const binop2 = expr.left.operator;
      const literal2 = expr.left.right.value;
      switch (binop2) {
        case "+":
          if (binop1 === "+") {
            return foldLiterlIntoBinary(expr.left, add(literal2, literal1));
          } else if (binop1 === "-") {
            return foldLiterlIntoBinary(expr.left, add(literal2, -literal1));
          }
        case "-":
          if (binop1 === "+") {
            return foldLiterlIntoBinary(expr.left, add(literal2, -literal1));
          } else if (binop1 === "-") {
            return foldLiterlIntoBinary(expr.left, add(literal2, literal1));
          }
      }
      return expr;
    }

    function foldLiterlIntoBinary(
      binExpr: BinaryExpression,
      value: number | bigint
    ): BinaryExpression {
      return <BinaryExpression>(<unknown>{
        type: "BinaryExpression",
        operator: binExpr.operator,
        left: binExpr.left,
        right: createLiteral(value),
      });
    }

    function add(
      left: number | bigint,
      right: number | bigint
    ): number | bigint {
      return typeof left === "number" && typeof right === "number"
        ? left + right
        : BigInt(left) + BigInt(right);
    }
  }

  // ==========================================================================
  // Expression compilation

  private compileExpression(expr: Expression): TypeSpec | null {
    switch (expr.type) {
      case "Literal":
        return this.compileLiteral(expr);
    }
    return i32Desc;
  }

  /**
   * Compiles a literal
   * @param lit Literal to compile
   */
  private compileLiteral(lit: Literal): TypeSpec {
    let instr: WaInstruction;
    let typeSpec: TypeSpec;
    if (typeof lit.value === "number") {
      if (Number.isInteger(lit.value)) {
        instr = constVal(WaType.i32, lit.value);
        typeSpec = i32Desc;
      } else {
        instr = constVal(WaType.f64, lit.value);
        typeSpec = f64Desc;
      }
    } else {
      instr = constVal(WaType.i64, lit.value);
      typeSpec = i64Desc;
    }
    this.inject(instr);
    return typeSpec;
  }

  private castForStorage(left: TypeSpec, right: TypeSpec): void {
    switch (left.type) {
      case "Intrinsic":
        if (right.type !== "Intrinsic") {
          this.reportError("W141", right);
          return;
        }
        this.castIntrinsicToIntrinsic(left, right);
      case "Pointer":
        break;
    }
  }

  /**
   * Casts an intinsice type to another intrinsic type
   * @param left Left value
   * @param right Right expression
   */
  private castIntrinsicToIntrinsic(
    left: IntrinsicType,
    right: IntrinsicType
  ): void {
    if (left.underlying === right.underlying) {
      return;
    }
    if (
      (left.underlying === "i32" && right.underlying === "u32") ||
      (left.underlying === "u32" && right.underlying === "i32")
    ) {
      return;
    }
    if (
      (left.underlying === "i64" && right.underlying === "u64") ||
      (left.underlying === "u64" && right.underlying === "i64")
    ) {
      return;
    }

    switch (right.underlying) {
      case "i64":
      case "u64":
        switch (left.underlying) {
          case "f32":
            this.inject(convert32(WaType.i64));
            return;
          case "f64":
            this.inject(convert64(WaType.i64));
            return;
          case "i32":
          case "u32":
            this.inject(wrap64());
            return;
          case "i16":
          case "u16":
            this.inject(wrap64());
            this.inject(and(WaType.i32, constVal(WaType.i32, 0xffff)));
            if (left.underlying === "i16") {
              this.inject(shl(WaType.i32, constVal(WaType.i32, 16)));
              this.inject(shr(WaType.i32, true, constVal(WaType.i32, 16)));
            }
            return;
          case "i8":
          case "u8":
            this.inject(wrap64());
            this.inject(and(WaType.i32, constVal(WaType.i32, 0xff)));
            if (left.underlying === "i8") {
              this.inject(shl(WaType.i32, constVal(WaType.i32, 24)));
              this.inject(shr(WaType.i32, true, constVal(WaType.i32, 24)));
            }
            return;
        }

      case "i32":
      case "u32":
        switch (left.underlying) {
          case "f32":
            this.inject(convert32(WaType.i32));
            return;
          case "f64":
            this.inject(convert64(WaType.i32));
            return;
          case "i64":
            this.inject(extend32(true));
            return;
          case "u64":
            this.inject(extend32(false));
            return;
          case "i16":
          case "u16":
            this.inject(and(WaType.i32, constVal(WaType.i32, 0xffff)));
            if (left.underlying === "i16") {
              this.inject(shl(WaType.i32, constVal(WaType.i32, 16)));
              this.inject(shr(WaType.i32, true, constVal(WaType.i32, 16)));
            }
            return;
          case "i8":
          case "u8":
            this.inject(and(WaType.i32, constVal(WaType.i32, 0xff)));
            if (left.underlying === "i8") {
              this.inject(shl(WaType.i32, constVal(WaType.i32, 24)));
              this.inject(shr(WaType.i32, true, constVal(WaType.i32, 24)));
            }
            return;
        }
    }
  }

  // ==========================================================================
  // Helpers

  /**
   * Injects the specifiec WebAssembly instructions into the function
   * @param instr Instructions to inject
   */
  private inject(...instr: WaInstruction[]): void {
    this._builder.inject(...instr);
    instr.forEach((ins) => {
      this.addTrace(() => [
        "inject",
        0,
        this.wsCompiler.waTree.renderInstructionNode(ins),
      ]);
    });
  }

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
  expr: Expression;
}

/**
 * Tests if the expression in a commutative binary operation
 * @param expr Expression to test
 * @returns Binary operation
 */
function isCommutativeOp(expr: Expression): BinaryExpression | null {
  if (expr.type !== "BinaryExpression") {
    return null;
  }
  switch (expr.operator) {
    case "!=":
    case "==":
    case "&":
    case "*":
    case "+":
    case "^":
    case "|":
      return expr;
    default:
      return null;
  }
}

/**
 * Creates a literal value
 * @param value Value to wrap into a literal
 * @param asU64 Wrap a 64-bit value as u64?
 */
function createLiteral(value: number | bigint, asU64 = false): Literal {
  return <Literal>(<unknown>{
    type: "Literal",
    value:
      typeof value === "bigint"
        ? asU64
          ? BigInt.asUintN(64, value)
          : BigInt.asIntN(64, value)
        : value,
    literalSource:
      typeof value === "number"
        ? Number.isInteger(value)
          ? LiteralSource.Int
          : LiteralSource.Real
        : LiteralSource.BigInt,
  });
}

// --- Intrinsic type instances
const i32Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "i32",
} as IntrinsicType;

const i64Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "i64",
} as IntrinsicType;

const f32Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "f32",
} as IntrinsicType;

const f64Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "f64",
} as IntrinsicType;
