import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Assignment,
  BinaryExpression,
  BreakStatement,
  ContinueStatement,
  DoStatement,
  Expression,
  GlobalDeclaration,
  Identifier,
  IfStatement,
  Literal,
  LiteralSource,
  LocalFunctionInvocation,
  LocalVariable,
  Node,
  ReturnStatement,
  UnaryExpression,
  VariableDeclaration,
  WhileStatement,
} from "../compiler/source-tree";
import {
  WaBitSpec,
  WaInstruction,
  WaParameter,
  WaType,
} from "../wa-ast/wa-nodes";
import {
  FunctionDeclaration,
  Intrinsics,
  IntrinsicType,
  Statement,
  TypeSpec,
} from "./source-tree";
import {
  bitwiseNotMasks,
  createGlobalName,
  createLocalName,
  createParameterName,
  WatSharpCompiler,
  waTypeMappings,
} from "./WatSharpCompiler";
import {
  add,
  and,
  constVal,
  convert32,
  convert64,
  demote64,
  div,
  eq,
  eqz,
  extend32,
  FunctionBuilder,
  ge,
  globalGet,
  gt,
  le,
  load,
  localGet,
  localSet,
  lt,
  mul,
  ne,
  or,
  promote32,
  rem,
  shl,
  shr,
  sub,
  trunc32,
  trunc64,
  unreachable,
  wrap64,
  xor,
} from "../wa-ast/FunctionBuilder";
import {
  applyBinaryOperation,
  applyBuiltInFunction,
  applyTypeCast,
  applyUnaryOperation,
  renderExpression,
} from "./expression-resolver";
import { resolve } from "path";

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
        const paramName = createParameterName(param.name);
        this.locals.set(param.name, {
          name: paramName,
          type: param.spec,
          waType: paramType,
        });
        waPars.push({
          id: paramName,
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
        if (initExpr) {
          this.castForStorage(
            localVar.spec,
            initExpr.exprType,
            true,
            initExpr?.expr.value
          );
          this.inject(localSet(localName));
        }
      }
      const paramType =
        localVar.spec.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(localVar.spec as IntrinsicType).underlying];
      this.locals.set(localVar.name, {
        name: localName,
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
    if (!exprType) {
      return null;
    }
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

  /**
   * Compiles the specified expression
   * @param expr Expression to compile
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileExpression(expr: Expression, emit = true): TypeSpec | null {
    switch (expr.type) {
      case "Literal":
        return this.compileLiteral(expr, emit);
      case "Identifier":
        return this.compileIdentifier(expr, emit);
      case "UnaryExpression":
        return this.compileUnaryExpression(expr, emit);
      case "BinaryExpression":
        return this.compileBinaryExpression(expr, emit);
    }
    return i32Desc;
  }

  /**
   * Compiles a literal
   * @param lit Literal to compile
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileLiteral(lit: Literal, emit = true): TypeSpec | null {
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
    if (emit) {
      this.inject(instr);
    }
    return typeSpec;
  }

  /**
   * Compiles an identifier
   * @param id Identifier to compile
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileIdentifier(id: Identifier, emit = true): TypeSpec | null {
    const resolvedId = this.resolveIdentifier(id);
    if (!resolvedId) {
      return null;
    }
    if (resolvedId.local) {
      if (emit) {
        this.inject(localGet(resolvedId.local.name));
      }
      return resolvedId.local.type;
    }
    if (resolvedId.global) {
      if (emit) {
        this.inject(globalGet(createGlobalName(resolvedId.global.name)));
      }
      return <IntrinsicType>{
        type: "Intrinsic",
        underlying: resolvedId.global.underlyingType,
      };
    }
    if (resolvedId.var) {
      const typeSpec = resolvedId.var.spec;
      if (typeSpec.type !== "Intrinsic") {
        this.reportError("W143", id);
        return null;
      }
      const waType = waTypeMappings[typeSpec.underlying];
      switch (typeSpec.underlying) {
        case "f32":
        case "f64":
          if (emit) {
            this.inject(
              load(
                waType,
                undefined,
                undefined,
                undefined,
                undefined,
                constVal(WaType.i32, resolvedId.var.address)
              )
            );
          }
          break;
        case "i8":
        case "u8":
          if (emit) {
            this.inject(
              load(
                waType,
                WaBitSpec.Bit8,
                undefined,
                undefined,
                typeSpec.underlying === "i8",
                constVal(WaType.i32, resolvedId.var.address)
              )
            );
          }
          break;
        case "i16":
        case "u16":
          if (emit) {
            this.inject(
              load(
                waType,
                WaBitSpec.Bit16,
                undefined,
                undefined,
                typeSpec.underlying === "i16",
                constVal(WaType.i32, resolvedId.var.address)
              )
            );
          }
          break;
        case "i32":
        case "u32":
          if (emit) {
            this.inject(
              load(
                waType,
                WaBitSpec.Bit32,
                undefined,
                undefined,
                typeSpec.underlying === "i32",
                constVal(WaType.i32, resolvedId.var.address)
              )
            );
          }
          break;
        case "i64":
        case "u64":
          if (emit) {
            this.inject(
              load(
                waType,
                undefined,
                undefined,
                undefined,
                typeSpec.underlying === "i64",
                constVal(WaType.i32, resolvedId.var.address)
              )
            );
          }
          break;
      }
      return typeSpec;
    }
  }

  /**
   * Compiles a unary expression
   * @param unary Expression to compile
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileUnaryExpression(
    unary: UnaryExpression,
    emit = true
  ): TypeSpec | null {
    switch (unary.operator) {
      case "+": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand);
        if (operandType === null) {
          return null;
        }

        // --- Allow intrinsic types only
        if (operandType.type !== "Intrinsic") {
          this.reportError("W144", unary, "unary +");
          return null;
        }

        // --- "+" means type cast to i32
        this.castIntrinsicToIntrinsic(
          i32Desc,
          operandType as IntrinsicType,
          emit,
          unary.operand?.value
        );
        return i32Desc;
      }

      case "-": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand);
        if (operandType === null) {
          return null;
        }

        // --- Allow intrinsic types only
        if (operandType.type !== "Intrinsic") {
          this.reportError("W144", unary, "unary -");
          return null;
        }

        // --- "-" --> -1 * operand
        const waType = waTypeMappings[operandType.underlying];
        this.inject(mul(waType, constVal(waType, -1)));
        return operandType;
      }

      case "!":
      case "~": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand);
        if (operandType === null) {
          return null;
        }

        // --- Allow intrinsic types only
        if (operandType.type !== "Intrinsic") {
          this.reportError("W145", unary, "logical NOT");
          return null;
        }
        const waType = waTypeMappings[operandType.underlying];

        // --- Allow integer types only
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W145", unary, "logical NOT");
          return null;
        }
        if (unary.operator === "!") {
          // --- "!" --> eqz
          this.inject(eqz(waType));
          return i32Desc;
        } else {
          // --- "~" --> xor with all bits 1
          this.inject(
            xor(
              waType,
              constVal(
                waType,
                bitwiseNotMasks[(operandType as IntrinsicType).underlying]
              )
            )
          );
          return operandType;
        }
      }

      case "&": {
        const address = this.calculateAddressOf(unary.operand);
        if (address === null) {
          return null;
        }
        return i32Desc;
      }
      case "*":
        break;
    }
    return null;
  }

  /**
   * Compiles a binary expression
   * @param binary Expression to compile
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileBinaryExpression(
    binary: BinaryExpression,
    emit = true
  ): TypeSpec | null {
    // --- Compile the left and right operands to obtain result types
    const left = this.compileExpression(binary.left, false);
    if (left === null) {
      return null;
    }
    const right = this.compileExpression(binary.right, false);
    if (right === null) {
      return null;
    }

    // --- Make sure both operands are intrinsic
    if (left.type !== "Intrinsic" || right.type !== "Intrinsic") {
      this.reportError("W144", binary, `binary ${binary.operator}`);
      return null;
    }

    // --- Check if the operation should be signed
    const isSigned =
      left.underlying.startsWith("i") || right.underlying.startsWith("i");

    // --- Calculate operation type
    let resultType = i32Desc;
    if (left.underlying.startsWith("f") || right.underlying.startsWith("f")) {
      resultType = f64Desc;
    } else if (
      left.underlying.endsWith("64") ||
      right.underlying.endsWith("64")
    ) {
      resultType = i64Desc;
    }

    // --- Compile the operands and cast them to the appropriate type
    this.compileExpression(binary.left);
    this.castIntrinsicToIntrinsic(resultType, left, emit);
    this.compileExpression(binary.right);
    this.castIntrinsicToIntrinsic(resultType, right, emit);
    const waType = waTypeMappings[resultType.underlying];

    // --- Process operations
    switch (binary.operator) {
      case "+":
        if (emit) {
          this.inject(add(waType));
        }
        break;

      case "-":
        if (emit) {
          this.inject(sub(waType));
        }
        break;

      case "*":
        if (emit) {
          this.inject(mul(waType));
        }
        break;

      case "/":
        if (emit) {
          this.inject(div(waType, isSigned));
        }
        break;

      case "%":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "remainder (%)");
          return null;
        }
        if (emit) {
          this.inject(rem(waType, isSigned));
        }
        break;

      case "&":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise AND");
          return null;
        }
        if (emit) {
          this.inject(and(waType));
        }
        break;

      case "|":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise OR");
          return null;
        }
        if (emit) {
          this.inject(or(waType));
        }
        break;

      case "^":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise XOR");
          return null;
        }
        if (emit) {
          this.inject(xor(waType));
        }
        break;

      case "<<":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift left");
          return null;
        }
        if (emit) {
          this.inject(shl(waType));
        }
        break;

      case ">>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "signed shift right");
          return null;
        }
        if (emit) {
          this.inject(shr(waType, true));
        }
        break;

      case ">>>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift right");
          return null;
        }
        if (emit) {
          this.inject(shr(waType, false));
        }
        break;

      case "==":
        if (emit) {
          this.inject(eq(waType));
        }
        break;

      case "!=":
        if (emit) {
          this.inject(ne(waType));
        }
        break;

      case "<":
        if (emit) {
          this.inject(lt(waType, isSigned));
        }
        break;

      case "<=":
        if (emit) {
          this.inject(le(waType, isSigned));
        }
        break;
      case ">":
        if (emit) {
          this.inject(gt(waType, isSigned));
        }
        break;

      case ">=":
        if (emit) {
          this.inject(ge(waType, isSigned));
        }
        break;
    }
    return resultType;
  }

  /**
   * Casts a storage type to another storage type
   * @param left
   * @param right
   * @param emit Should emit code?
   */
  private castForStorage(
    left: TypeSpec,
    right: TypeSpec,
    emit = true,
    value?: number | bigint
  ): void {
    switch (left.type) {
      case "Intrinsic":
        if (right.type !== "Intrinsic") {
          this.reportError("W141", right);
          return;
        }
        this.castIntrinsicToIntrinsic(left, right, emit, value);
        break;

      case "Pointer":
        if (right.type === "Pointer") {
          return;
        }
        if (
          right.type !== "Intrinsic" ||
          right.underlying === "f64" ||
          right.underlying === "f32"
        ) {
          this.reportError("W141", right);
          return;
        }
        if (right.underlying === "i64" || right.underlying === "u64") {
          this.inject(wrap64());
        }
        break;
    }
  }

  /**
   * Casts an intinsice type to another intrinsic type
   * @param left Left value
   * @param right Right expression
   * @param emit Should emit code?
   */
  private castIntrinsicToIntrinsic(
    left: IntrinsicType,
    right: IntrinsicType,
    emit = true,
    value?: number | bigint
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

    const compiler = this;
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
            tighten(0xffff, 16, left.underlying, value);
            return;
          case "i8":
          case "u8":
            this.inject(wrap64());
            tighten(0xff, 24, left.underlying, value);
            return;
        }
        break;

      case "i32":
      case "u32":
      case "i16":
      case "u16":
      case "i8":
      case "u8":
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
            tighten(0xffff, 16, left.underlying, value);
            return;
          case "i8":
          case "u8":
            tighten(0xff, 24, left.underlying, value);
            return;
        }
        break;

      case "f64":
        switch (left.underlying) {
          case "f32":
            this.inject(demote64());
            return;
          case "i64":
            this.inject(trunc64(WaType.f64, true));
            return;
          case "u64":
            this.inject(trunc64(WaType.f64, false));
            return;
          case "i32":
            this.inject(trunc32(WaType.f64, true));
            return;
          case "u32":
            this.inject(trunc32(WaType.f64, false));
            return;
          case "i16":
          case "u16":
            this.inject(trunc32(WaType.f64, false));
            tighten(0xffff, 16, left.underlying, value);
            return;
          case "i8":
          case "u8":
            this.inject(trunc32(WaType.f64, false));
            tighten(0xff, 24, left.underlying, value);
            return;
        }
        break;

      case "f32":
        switch (left.underlying) {
          case "f64":
            this.inject(promote32());
            return;
          case "i64":
            this.inject(trunc64(WaType.f32, true));
            return;
          case "u64":
            this.inject(trunc64(WaType.f32, false));
            return;
          case "i32":
            this.inject(trunc32(WaType.f32, true));
            return;
          case "u32":
            this.inject(trunc32(WaType.f32, false));
            return;
          case "i16":
          case "u16":
            this.inject(trunc32(WaType.f32, false));
            tighten(0xffff, 16, left.underlying, value);
            return;
          case "i8":
          case "u8":
            this.inject(trunc32(WaType.f32, false));
            tighten(0xff, 24, left.underlying, value);
            return;
        }
        break;
    }

    /**
     * Demotes a 32-bit value to a smaller one
     * @param mask Bit mask
     * @param bits Bit count
     * @param typename Type name
     */
    function tighten(
      mask: number,
      bits: number,
      typename: string,
      value?: number | bigint
    ) {
      if (value && typeof value === "number") {
        const rightBits = 32 - bits;
        const lower = typename.startsWith("i") ? -(2 ** (rightBits - 1)) : 0;
        const upper = lower + 2 ** rightBits;
        if (value >= lower && value <= upper) {
          return;
        }
      }
      compiler.inject(and(WaType.i32, constVal(WaType.i32, mask)));
      if (typename.startsWith("i")) {
        compiler.inject(shl(WaType.i32, constVal(WaType.i32, bits)));
        compiler.inject(shr(WaType.i32, true, constVal(WaType.i32, bits)));
      }
    }
  }

  /**
   * Resolves an identifier to a declaration
   * @param id
   */
  private resolveIdentifier(id: Identifier): ResolvedDeclaration | null {
    const local = this._locals.get(id.name);
    if (local) {
      return {
        local,
      };
    }
    const decl = this.wsCompiler.declarations.get(id.name);
    if (!decl) {
      this.reportError("W142", id, id.name);
      return null;
    }
    if (decl.type === "GlobalDeclaration") {
      return {
        global: decl,
      };
    }
    if (decl.type === "VariableDeclaration") {
      return {
        var: decl,
      };
    }
    this.reportError("W142", id, id.name);
    return null;
  }

  /**
   * Calculates the address of the specified expression
   * @param expr Address expression
   * @param emit Should emit code?
   */
  private calculateAddressOf(
    expr: Expression,
    emit = true
  ): ResolvedAddress | null {
    switch (expr.type) {
      case "Identifier": {
        // --- Only variables have an address
        const resolvedId = this.resolveIdentifier(expr);
        if (resolvedId === null || !resolvedId.var) {
          this.reportError("W146", expr);
          return null;
        }

        // --- Inject variable address if requested
        if (emit) {
          this.inject(constVal(WaType.i32, resolvedId.var.address));
        }

        // --- Retrieve address/type information
        return {
          address: resolvedId.var.address,
          spec: resolvedId.var.spec,
        };
      }

      case "MemberAccess": {
        // --- Start with the calculation of the object address
        const leftAddress = this.calculateAddressOf(expr.object, false);
        if (leftAddress === null) {
          return null;
        }

        // --- Member access needs a struct object
        if (leftAddress.spec.type !== "Struct") {
          this.reportError("W147", expr);
          return null;
        }

        // --- Obtain struct field information
        const field = leftAddress.spec.fields.filter(
          (fi) => fi.id === expr.member
        );
        if (!field) {
          this.reportError("W147", expr);
          return null;
        }

        // --- Field exists, add its offset to the address
        let address = leftAddress.address;
        const offset = field[0].offset;
        if (leftAddress.address < 0) {
          // --- Calculated address
          address = -1;
          if (offset) {
            this.inject(add(WaType.i32, constVal(WaType.i32, offset)));
          }
        } else {
          // --- Constant address
          address += offset;
          if (emit) {
            this.inject(constVal(WaType.i32, address));
          }
        }
        return {
          address,
          spec: field[0].spec,
        };
      }

      case "ItemAccess": {
        // --- Start with the calculation of the object address
        const arrayAddress = this.calculateAddressOf(expr.array, false);
        if (arrayAddress === null) {
          return null;
        }

        // --- Calculate the item size
        let address = arrayAddress.address;
        if (arrayAddress.spec.type !== "Array") {
          this.reportError("W149", expr);
          return null;
        }
        const itemSize = this.wsCompiler.getSizeof(arrayAddress.spec.spec);

        if (expr.index.type === "Literal") {
          // --- We can get a constant address
          address += itemSize * Number(expr.index.value);
          if (emit) {
            this.inject(constVal(WaType.i32, address));
          }
        } else {
          // --- We use a calculated address
          this.inject(constVal(WaType.i32, address));
          const indexType = this.compileExpression(expr.index);
          if (indexType === null) {
            return null;
          }
          this.castForStorage(i32Desc, indexType, emit, expr.index.value);
          this.inject(mul(WaType.i32, constVal(WaType.i32, itemSize)));
          this.inject(add(WaType.i32));
          address = -1;
        }
        return {
          address,
          spec: arrayAddress.spec.spec,
        };
      }
    }
    return null;
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
  name: string;
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
 * Represents a resolved declaration
 */
interface ResolvedDeclaration {
  local?: LocalDeclaration;
  global?: GlobalDeclaration;
  var?: VariableDeclaration;
}

/**
 * Represents a resolved address
 */
interface ResolvedAddress {
  address: number;
  spec: TypeSpec;
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

const u32Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "u32",
} as IntrinsicType;

const u64Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "u64",
} as IntrinsicType;

const f32Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "f32",
} as IntrinsicType;

const f64Desc: IntrinsicType = {
  type: "Intrinsic",
  underlying: "f64",
} as IntrinsicType;
