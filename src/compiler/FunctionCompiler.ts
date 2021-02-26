import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Assignment,
  BinaryExpression,
  BreakStatement,
  BuiltInFunctionInvocationExpression,
  ConditionalExpression,
  ContinueStatement,
  DoStatement,
  Expression,
  FunctionInvocationExpression,
  GlobalDeclaration,
  Identifier,
  IfStatement,
  IndirectAccessExpression,
  Literal,
  LiteralSource,
  LocalFunctionInvocation,
  LocalVariable,
  Node,
  ReturnStatement,
  TypeCastExpression,
  UnaryExpression,
  VariableDeclaration,
  VoidType,
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
  IntrinsicType,
  Statement,
  TypeSpec,
} from "./source-tree";
import {
  bitwiseNotMasks,
  createGlobalName,
  createLocalName,
  createParameterName,
  createTableName,
  mapFunctionParameterType,
  WatSharpCompiler,
  waTypeMappings,
} from "./WatSharpCompiler";
import {
  abs,
  add,
  and,
  call,
  callIndirect,
  ceil,
  clz,
  constVal,
  convert32,
  convert64,
  copysign,
  ctz,
  demote64,
  div,
  drop,
  eq,
  eqz,
  extend32,
  floor,
  FunctionBuilder,
  ge,
  globalGet,
  globalSet,
  gt,
  ifBlock,
  le,
  load,
  localGet,
  localSet,
  localTee,
  lt,
  max,
  min,
  mul,
  ne,
  nearest,
  neg,
  or,
  popcnt,
  promote32,
  rem,
  ret,
  select,
  shl,
  shr,
  sqrt,
  store,
  sub,
  trunc32,
  trunc64,
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
import { optimizeWat } from "./wat-optimizer";

/**
 * This class is responsible for compiling a function body
 */
export class FunctionCompiler {
  // --- Local parameters and variabled of the function
  private _locals = new Map<string, LocalDeclaration>();

  // --- The result value of the function
  private _resultType: WaType | null = null;

  // --- The function builder object
  private _builder: FunctionBuilder;

  // --- Temporary locals assigned to the function
  private _tempLocals = new Set<WaType>();

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
    this.func.body.forEach((stmt) =>
      this.processStatement(stmt, this._builder.body)
    );
    optimizeWat(this._builder.body);
    this._builder.body.forEach((ins) => {
      if (ins.type !== "Comment") {
        this.addTrace(() => [
          "inject",
          0,
          this.wsCompiler.waTree.renderInstructionNode(ins),
        ]);
      }
    });
  }

  /**
   * Processes the function parameters and result type
   */
  private processHead(): void {
    // --- Map the result type
    this._resultType = mapFunctionParameterType(this.func.resultType);

    // --- Map parameters to locals
    const waPars: WaParameter[] = [];
    this.func.params.forEach((param) => {
      if (this._locals.has(param.name)) {
        this.reportError("W140", this.func);
      } else {
        const paramType = mapFunctionParameterType(param.spec);
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
   * @param body Body to put the statements in
   */
  private processStatement(stmt: Statement, body: WaInstruction[]): void {
    switch (stmt.type) {
      case "LocalVariable":
        this.processLocalDeclaration(stmt, body);
        return;
      case "Assignment":
        this.processAssignment(stmt, body);
        return;
      case "Break":
        this.processBreak(stmt, body);
        return;
      case "Continue":
        this.processContinue(stmt, body);
        return;
      case "Do":
        this.processDoWhileLoop(stmt, body);
        return;
      case "If":
        this.processIf(stmt, body);
        return;
      case "LocalFunctionInvocation":
        this.processLocalFunctionInvocation(stmt, body);
        return;
      case "Return":
        this.processReturn(stmt, body);
        return;
      case "While":
        this.processWhileLoop(stmt, body);
        return;
    }
  }

  /**
   * Processes a local variable declaration
   * @param body Body to put the statements in
   */
  private processLocalDeclaration(
    localVar: LocalVariable,
    body: WaInstruction[]
  ): void {
    if (this._locals.has(localVar.name)) {
      this.reportError("W140", this.func);
      return;
    } else {
      const localName = createLocalName(localVar.name);
      let initExpr: ProcessedExpression | null = null;
      if (localVar.initExpr) {
        initExpr = this.processExpression(localVar.initExpr, body);
        if (initExpr) {
          this.castForStorage(
            localVar.spec,
            initExpr.exprType,
            body,
            true,
            initExpr?.expr.value
          );
          this.inject(true, localSet(localName), body);
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
   * @param body Body to put the statements in
   */
  private processAssignment(asgn: Assignment, body: WaInstruction[]): void {
    // --- Check the left value type
    let leftSide: "local" | "global" | "var" = "var";
    let leftType: TypeSpec | undefined;
    let idAddress = false;
    let varName: string | undefined;
    if (asgn.lval.type == "Identifier") {
      // --- A single identifier may be a global, a local, or a memory variable
      varName = asgn.lval.name;
      const resolvedId = this.resolveIdentifier(asgn.lval);
      if (!resolvedId) {
        return;
      }
      idAddress = true;
      if (resolvedId.global) {
        // --- Left side is a global
        leftSide = "global";
        leftType = <IntrinsicType>{
          type: "Intrinsic",
          underlying: resolvedId.global.underlyingType,
        };
      } else if (resolvedId.local) {
        // --- Left side is a local
        leftSide = "local";
        leftType = <IntrinsicType>{
          type: "Intrinsic",
          underlying:
            resolvedId.local.type.type === "Intrinsic"
              ? resolvedId.local.type.underlying
              : "i32",
        };
      } else {
        // --- Left side is a variable with a const address
        leftType = resolvedId.var.spec;
        this.inject(true, constVal(WaType.i32, resolvedId.var.address), body);
      }
    } else {
      // --- Left side is a compound left value expression
      const resolvedAddr = this.calculateAddressOf(asgn.lval, body);
      if (!resolvedAddr) {
        return;
      }
      leftType = resolvedAddr.spec;
    }

    // --- Now, we accept only intrinsic types and pointers as left values
    if (leftType.type !== "Intrinsic" && leftType.type !== "Pointer") {
      this.reportError("W161", asgn);
      return;
    }

    // --- If it is an addressed variable, calculate the address
    let tmpAddrVar = "";
    if (leftSide === "var") {
      // --- Do we need double access to this address?
      if (!idAddress && asgn.asgn !== "=") {
        tmpAddrVar = this.createTempLocal(WaType.i32, "asgn");
        this.inject(true, localTee(tmpAddrVar), body);
        this.inject(true, localGet(tmpAddrVar), body);
        // --- At this point we have the variable acces on the top of the stack
      }
    }

    // --- We need to get the value
    const leftIntrinsic = leftType.type === "Intrinsic" ? leftType : i32Desc;
    if (asgn.asgn !== "=") {
      switch (leftSide) {
        case "global":
          this.inject(true, globalGet(createGlobalName(varName)), body);
          break;
        case "local":
          this.inject(true, localGet(createLocalName(varName)), body);
          break;
        case "var":
          this.compileIntrinsicVariableGet(leftIntrinsic, body);
          break;
      }
    }

    // --- Now, evaluate the right-side expression
    const rightType = this.compileExpression(asgn.expr, body);

    // --- Valid type?
    if (!rightType) {
      return;
    }

    // --- Match intrinsic left type with intrinsic right type
    if (leftType.type === "Intrinsic" && rightType.type !== "Intrinsic") {
      this.reportError("W141", asgn);
      return;
    }

    // --- Match pointer left type with pointer or integral right type
    if (
      leftType.type === "Pointer" &&
      rightType.type !== "Pointer" &&
      (rightType.type !== "Intrinsic" || rightType.underlying.startsWith("f"))
    ) {
      this.reportError("W141", asgn);
      return;
    }

    // --- Instrinsic types for the right side
    const rightIntrinsic = rightType.type === "Intrinsic" ? rightType : i32Desc;

    // --- Is it a compound assignment?
    if (asgn.asgn !== "=") {
      // --- Check if the operation should be signed
      const isSigned =
        leftIntrinsic.underlying.startsWith("i") ||
        rightIntrinsic.underlying.startsWith("i");

      // --- Calculate operation type
      let resultType = i32Desc;
      if (
        leftIntrinsic.underlying.startsWith("f") ||
        rightIntrinsic.underlying.startsWith("f")
      ) {
        resultType = f64Desc;
      } else if (
        leftIntrinsic.underlying.endsWith("64") ||
        rightIntrinsic.underlying.endsWith("64")
      ) {
        resultType = i64Desc;
      }

      // --- Compile the operands and cast them to the appropriate type
      this.castIntrinsicToIntrinsic(resultType, rightIntrinsic, body);
      const waType = waTypeMappings[resultType.underlying];

      // --- Compile the assignment operation
      switch (asgn.asgn) {
        case "+=":
          this.inject(true, add(waType), body);
          break;
        case "-=":
          this.inject(true, sub(waType), body);
          break;
        case "*=":
          this.inject(true, mul(waType), body);
          break;
        case "/=":
          this.inject(true, div(waType, isSigned), body);
          break;
        case "%=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "remainder (%)");
            return;
          }
          this.inject(true, rem(waType, isSigned), body);
          break;
        case "&=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise AND");
            return;
          }
          this.inject(true, and(waType), body);
          break;
        case "|=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise OR");
            return;
          }
          this.inject(true, or(waType), body);
          break;
        case "^=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise XOR");
            return;
          }
          this.inject(true, xor(waType), body);
          break;
        case "<<=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "shift left");
            return;
          }
          this.inject(true, shl(waType), body);
          break;
        case ">>=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "signed shift right");
            return;
          }
          this.inject(true, shr(waType, true), body);
          break;

        case ">>>=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "shift right");
            return;
          }
          this.inject(true, shr(waType, false), body);
          break;
      }
    }

    // --- Cast the result
    this.castIntrinsicToIntrinsic(leftIntrinsic, rightIntrinsic, body);

    // --- Store the resuls
    switch (leftSide) {
      case "global":
        this.inject(true, globalSet(createGlobalName(varName)), body);
        break;
      case "local":
        this.inject(true, localSet(createLocalName(varName)), body);
        break;
      case "var":
        this.compileIntrinsicVariableSet(leftIntrinsic, body);
        break;
    }
  }

  /**
   * Processes a break statement
   * @param body Body to put the statements in
   */
  private processBreak(breakStmt: BreakStatement, body: WaInstruction[]): void {
    // TODO: Implement this method
  }

  /**
   * Processes a continue statement
   * @param body Body to put the statements in
   */
  private processContinue(
    contStmt: ContinueStatement,
    body: WaInstruction[]
  ): void {
    // TODO: Implement this method
  }

  /**
   * Processes a do..while loop
   * @param body Body to put the statements in
   */
  private processDoWhileLoop(doLoop: DoStatement, body: WaInstruction[]): void {
    // TODO: Implement this method
  }

  /**
   * Processes a while loop
   * @param body Body to put the statements in
   */
  private processWhileLoop(
    doLoop: WhileStatement,
    body: WaInstruction[]
  ): void {
    // TODO: Implement this method
  }

  /**
   * Processes an if statement
   * @param body Body to put the statements in
   */
  private processIf(ifStmt: IfStatement, body: WaInstruction[]): void {
    this.compileExpression(ifStmt.test, body);
    //this.inject(true, ifBlock())
  }

  /**
   * Processes a local function invocation
   * @param body Body to put the statements in
   */
  private processLocalFunctionInvocation(
    invocation: LocalFunctionInvocation,
    body: WaInstruction[]
  ): void {
    const resultTypeSpec = this.compileFunctionInvocation(
      invocation.invoked,
      body
    );

    // --- Remove the result of a non-void function
    if (resultTypeSpec.type !== "Void") {
      this.inject(true, drop(), body);
    }
  }

  /**
   * Processes a return statement
   * @param body Body to put the statements in
   */
  private processReturn(retStmt: ReturnStatement, body: WaInstruction[]): void {
    // --- Check for return argument
    if (!this.func.resultType && retStmt.expr) {
      this.reportError("W156", retStmt);
      return;
    }
    if (this.func.resultType && !retStmt.expr) {
      this.reportError("W157", retStmt);
      return;
    }

    // --- Ok, we can compile this return
    if (retStmt.expr) {
      // --- Compile the expression
      const returnType = this.compileExpression(retStmt.expr, body);
      if (returnType === null) {
        return null;
      }

      // --- Cast it to the return type
      this.castForStorage(this.func.resultType, returnType, body);
    }

    // --- Issue the return
    this.inject(true, ret(), body);
  }

  // ==========================================================================
  // Expression processing

  /**
   * Processes the specified expression
   * @param body Body to put the statements in
   */
  private processExpression(
    expr: Expression,
    body: WaInstruction[]
  ): ProcessedExpression | null {
    this.addTrace(() => ["pExpr", 0, renderExpression(expr)]);
    const simplified = this.simplifyExpression(expr);
    this.addTrace(() => ["pExpr", 1, renderExpression(simplified)]);
    const exprType = this.compileExpression(simplified, body);
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
   * @param body Body to inject the code into
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileExpression(
    expr: Expression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    switch (expr.type) {
      case "Literal":
        return this.compileLiteral(expr, body, emit);
      case "Identifier":
        return this.compileIdentifier(expr, body, emit);
      case "UnaryExpression":
        return this.compileUnaryExpression(expr, body, emit);
      case "BinaryExpression":
        return this.compileBinaryExpression(expr, body, emit);
      case "ConditionalExpression":
        return this.compileConditionalExpression(expr, body, emit);
      case "TypeCast":
        return this.compileTypeCast(expr, body, emit);
      case "MemberAccess":
      case "ItemAccess":
      case "DereferenceExpression":
        return this.compileIndirectAccess(expr, body, emit);
      case "BuiltInFunctionInvocation":
        return this.compileBuiltinFunctionInvocation(expr, body, emit);
      case "FunctionInvocation":
        return this.compileFunctionInvocation(expr, body, emit);
    }
    return i32Desc;
  }

  /**
   * Compiles a literal
   * @param lit Literal to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileLiteral(
    lit: Literal,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    let instr: WaInstruction;
    let typeSpec: TypeSpec;
    if (typeof lit.value === "number") {
      if (Number.isInteger(lit.value)) {
        const shrunkVal = Number(BigInt.asIntN(32, BigInt(lit.value)));
        instr = constVal(WaType.i32, shrunkVal);
        typeSpec = i32Desc;
      } else {
        instr = constVal(WaType.f64, lit.value);
        typeSpec = f64Desc;
      }
    } else {
      const shrunkVal = BigInt.asIntN(64, BigInt(lit.value));
      instr = constVal(WaType.i64, shrunkVal);
      typeSpec = i64Desc;
    }
    this.inject(emit, instr, body);
    return typeSpec;
  }

  /**
   * Compiles an identifier
   * @param id Identifier to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileIdentifier(
    id: Identifier,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    const resolvedId = this.resolveIdentifier(id);
    if (!resolvedId) {
      return null;
    }
    if (resolvedId.local) {
      this.inject(emit, localGet(resolvedId.local.name), body);
      return resolvedId.local.type;
    }
    if (resolvedId.global) {
      this.inject(
        emit,
        globalGet(createGlobalName(resolvedId.global.name)),
        body
      );
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
      this.inject(emit, constVal(WaType.i32, resolvedId.var.address), body);
      this.compileIntrinsicVariableGet(typeSpec, body, emit);
      return typeSpec;
    }
  }

  /**
   * Compiles getter to a variable with the specified type
   * @param typeSpec Variabel type
   * @param body Body to put the statements in
   * @param emit Should emit code?
   */
  private compileIntrinsicVariableGet(
    typeSpec: IntrinsicType,
    body: WaInstruction[],
    emit = true
  ): void {
    const waType = waTypeMappings[typeSpec.underlying];
    switch (typeSpec.underlying) {
      case "f32":
      case "f64":
        this.inject(emit, load(waType), body);
        break;
      case "i8":
      case "u8":
        this.inject(
          emit,
          load(
            waType,
            WaBitSpec.Bit8,
            undefined,
            undefined,
            typeSpec.underlying === "i8"
          ),
          body
        );
        break;
      case "i16":
      case "u16":
        this.inject(
          emit,
          load(
            waType,
            WaBitSpec.Bit16,
            undefined,
            undefined,
            typeSpec.underlying === "i16"
          ),
          body
        );
        break;
      case "i32":
      case "u32":
        this.inject(
          emit,
          load(
            waType,
            WaBitSpec.Bit32,
            undefined,
            undefined,
            typeSpec.underlying === "i32"
          ),
          body
        );
        break;
      case "i64":
      case "u64":
        this.inject(
          emit,
          load(
            waType,
            undefined,
            undefined,
            undefined,
            typeSpec.underlying === "i64"
          ),
          body
        );
    }
  }

  /**
   * Compiles setter to a variable with the specified type
   * @param typeSpec Variabel type
   * @param body Body to put the statements in
   * @param emit Should emit code?
   */
  private compileIntrinsicVariableSet(
    typeSpec: IntrinsicType,
    body: WaInstruction[],
    emit = true
  ): void {
    const waType = waTypeMappings[typeSpec.underlying];
    switch (typeSpec.underlying) {
      case "f32":
      case "f64":
        this.inject(emit, store(waType), body);
        break;
      case "i8":
      case "u8":
        this.inject(emit, store(waType, WaBitSpec.Bit8), body);
        break;
      case "i16":
      case "u16":
        this.inject(emit, store(waType, WaBitSpec.Bit16), body);
        break;
      case "i32":
      case "u32":
        this.inject(emit, store(waType, WaBitSpec.Bit32), body);
        break;
      case "i64":
      case "u64":
        this.inject(emit, store(waType), body);
    }
  }

  /**
   * Compiles a unary expression
   * @param unary Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileUnaryExpression(
    unary: UnaryExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    switch (unary.operator) {
      case "+": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body, emit);
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
          body,
          emit,
          unary.operand?.value
        );
        return i32Desc;
      }

      case "-": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body, emit);
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
        this.inject(emit, constVal(waType, -1), body);
        this.inject(emit, mul(waType), body);
        return operandType;
      }

      case "!":
      case "~": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body, emit);
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
          this.inject(emit, eqz(waType), body);
          return i32Desc;
        } else {
          // --- "~" --> xor with all bits 1
          this.inject(
            emit,
            constVal(
              waType,
              bitwiseNotMasks[(operandType as IntrinsicType).underlying]
            ),
            body
          );
          this.inject(emit, xor(waType), body);
          return operandType;
        }
      }

      case "&": {
        const address = this.calculateAddressOf(unary.operand, body, emit);
        if (address === null) {
          return null;
        }
        return i32Desc;
      }
    }
  }

  /**
   * Compiles a binary expression
   * @param binary Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileBinaryExpression(
    binary: BinaryExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    // --- Compile the left and right operands to obtain result types
    const left = this.compileExpression(binary.left, body, false);
    if (left === null) {
      return null;
    }
    const right = this.compileExpression(binary.right, body, false);
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
    this.compileExpression(binary.left, body, emit);
    this.castIntrinsicToIntrinsic(resultType, left, body, emit);
    this.compileExpression(binary.right, body, emit);
    this.castIntrinsicToIntrinsic(resultType, right, body, emit);
    const waType = waTypeMappings[resultType.underlying];

    // --- Process operations
    switch (binary.operator) {
      case "+":
        this.inject(emit, add(waType), body);
        break;

      case "-":
        this.inject(emit, sub(waType), body);
        break;

      case "*":
        this.inject(emit, mul(waType), body);
        break;

      case "/":
        this.inject(emit, div(waType, isSigned), body);
        break;

      case "%":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "remainder (%)");
          return null;
        }
        this.inject(emit, rem(waType, isSigned), body);
        break;

      case "&":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise AND");
          return null;
        }
        this.inject(emit, and(waType), body);
        break;

      case "|":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise OR");
          return null;
        }
        this.inject(emit, or(waType), body);
        break;

      case "^":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise XOR");
          return null;
        }
        this.inject(emit, xor(waType), body);
        break;

      case "<<":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift left");
          return null;
        }
        this.inject(emit, shl(waType), body);
        break;

      case ">>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "signed shift right");
          return null;
        }
        this.inject(emit, shr(waType, true), body);
        break;

      case ">>>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift right");
          return null;
        }
        this.inject(emit, shr(waType, false), body);
        break;

      case "==":
        this.inject(emit, eq(waType), body);
        break;

      case "!=":
        this.inject(emit, ne(waType), body);
        break;

      case "<":
        this.inject(emit, lt(waType, isSigned), body);
        break;

      case "<=":
        this.inject(emit, le(waType, isSigned), body);
        break;
      case ">":
        this.inject(emit, gt(waType, isSigned), body);
        break;

      case ">=":
        this.inject(emit, ge(waType, isSigned), body);
        break;
    }
    return resultType;
  }

  /**
   * Compiles a conditional expression
   * @param conditional Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileConditionalExpression(
    conditional: ConditionalExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    // --- Compile the condition, consequent, and alternate values
    const condition = this.compileExpression(
      conditional.condition,
      body,
      false
    );
    if (condition === null) {
      return null;
    }
    const consequent = this.compileExpression(
      conditional.consequent,
      body,
      false
    );
    if (consequent === null) {
      return null;
    }
    const alternate = this.compileExpression(
      conditional.alternate,
      body,
      false
    );
    if (alternate === null) {
      return null;
    }

    // --- Make sure both operands are intrinsic
    if (
      condition.type !== "Intrinsic" ||
      consequent.type !== "Intrinsic" ||
      alternate.type !== "Intrinsic"
    ) {
      this.reportError("W144", conditional, "conditional");
      return null;
    }

    // --- Calculate operation type
    let resultType = i32Desc;
    if (
      consequent.underlying.startsWith("f") ||
      alternate.underlying.startsWith("f")
    ) {
      resultType = f64Desc;
    } else if (
      alternate.underlying.endsWith("64") ||
      alternate.underlying.endsWith("64")
    ) {
      resultType = i64Desc;
    }

    // --- Compile the operands and cast them to the appropriate type
    this.compileExpression(conditional.consequent, body, emit);
    this.castIntrinsicToIntrinsic(resultType, consequent, body, emit);
    this.compileExpression(conditional.alternate, body, emit);
    this.castIntrinsicToIntrinsic(resultType, alternate, body, emit);
    this.compileExpression(conditional.condition, body, emit);
    this.castIntrinsicToIntrinsic(i32Desc, condition, body, emit);

    // --- Inject the "select" operation
    this.inject(emit, select(), body);

    // --- Done
    return resultType;
  }

  /**
   * Compiles a type cast
   * @param cast Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileTypeCast(
    cast: TypeCastExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    const operand = this.compileExpression(cast.operand, body, false);
    if (operand === null) {
      return null;
    }
    if (operand.type !== "Intrinsic") {
      this.reportError("W144", cast, `${cast.name}()`);
      return null;
    }
    const resultType = <IntrinsicType>{
      type: "Intrinsic",
      underlying: cast.name,
    };
    this.compileExpression(cast.operand, body, emit);
    this.castIntrinsicToIntrinsic(resultType, operand, body, emit);
    return resultType;
  }

  /**
   * Compiles an indirect value access
   * @param expr Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileIndirectAccess(
    expr: IndirectAccessExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    const varAddr = this.calculateAddressOf(expr, body, emit);
    if (varAddr == null) {
      return null;
    }
    let typeSpec = varAddr.spec;
    if (typeSpec.type === "Intrinsic") {
      this.compileIntrinsicVariableGet(typeSpec, body, emit);
    }
    return typeSpec;
  }

  /**
   * Compiles a built-in function invocation
   * @param func Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileBuiltinFunctionInvocation(
    func: BuiltInFunctionInvocationExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    // --- Prepare function argument types
    const argTypes = func.arguments.map((arg) =>
      this.compileExpression(arg, body, false)
    );
    const hasF64Arg =
      argTypes.filter(
        (arg) => arg.type === "Intrinsic" && arg.underlying === "f64"
      ).length > 0;

    const argType =
      argTypes.length == 0 ? undefined : (argTypes[0] as IntrinsicType);
    const argIns = argType ? argType.underlying : "";
    let waType = argIns === "" ? WaType.i32 : waTypeMappings[argIns];
    let resultType = argType;

    // --- Compile function argument types
    func.arguments.forEach((arg, index) => {
      this.compileExpression(arg, body, emit);
      if (func.name === "min" || func.name === "max") {
        this.castIntrinsicToIntrinsic(
          hasF64Arg ? f64Desc : f32Desc,
          argTypes[index] as IntrinsicType,
          body
        );
      }
    });

    // --- Inject the appropriate operation
    switch (func.name) {
      case "abs": {
        if (argIns.startsWith("i")) {
          // --- Integer absolute value
          const local = this.createTempLocal(waType);
          this.inject(
            emit,
            [
              localTee(local),
              constVal(waType, 0),
              lt(waType, true),
              ifBlock(
                [localGet(local), constVal(waType, -1), mul(waType)],
                [localGet(local)],
                waType
              ),
            ],
            body
          );
        } else if (argIns.startsWith("f")) {
          this.inject(emit, abs(waType), body);
        }
        break;
      }

      case "ceil":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "ceil");
          return null;
        }
        this.inject(emit, ceil(waType), body);
        break;

      case "clz":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "clz");
          return null;
        }
        this.inject(emit, clz(waType), body);
        break;

      case "copysign":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "copysign");
          return null;
        }
        this.inject(emit, copysign(waType), body);
        break;

      case "ctz":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "ctz");
          return null;
        }
        this.inject(emit, ctz(waType), body);
        break;

      case "floor":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "floor");
          return null;
        }
        this.inject(emit, floor(waType), body);
        break;

      case "nearest":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "nearest");
          return null;
        }
        this.inject(emit, nearest(waType), body);
        break;

      case "neg":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "neg");
          return null;
        }
        this.inject(emit, neg(waType), body);
        break;

      case "popcnt":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "popcnt");
          return null;
        }
        this.inject(emit, popcnt(waType), body);
        break;

      case "sqrt":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "sqrt");
          return null;
        }
        this.inject(emit, sqrt(waType), body);
        break;

      case "min":
      case "max":
        resultType = hasF64Arg ? f64Desc : f32Desc;
        waType = hasF64Arg ? WaType.f64 : WaType.f32;
        for (let i = 1; i < func.arguments.length; i++) {
          this.inject(
            emit,
            func.name === "min" ? min(waType) : max(waType),
            body
          );
        }
        break;
    }
    return resultType;
  }

  /**
   * Compiles a function invocation
   * @param invoc Expression to compile
   * @param body Body to put the statements in
   * @param emit Should emit code?
   * @returns Type specification of the result
   */
  private compileFunctionInvocation(
    invoc: FunctionInvocationExpression,
    body: WaInstruction[],
    emit = true
  ): TypeSpec | null {
    // --- Check if the invoked function exists
    const calledDecl = this.wsCompiler.declarations.get(invoc.name);
    if (calledDecl === null) {
      this.reportError("W153", invoc, invoc.name);
      return null;
    }

    // --- Only function and table invocations are allowed
    if (
      calledDecl.type !== "FunctionDeclaration" &&
      calledDecl.type !== "TableDeclaration"
    ) {
      this.reportError("W153", invoc, invoc.name);
      return null;
    }

    // --- Prepare the function parameters
    const funcParams = calledDecl.params;
    const funcResult = calledDecl.resultType;

    // --- Check the dispatch expression
    if (calledDecl.type === "TableDeclaration") {
      if (!invoc.dispatcher) {
        this.reportError("W159", invoc);
        return null;
      }
    } else if (invoc.dispatcher) {
      this.reportError("W160", invoc);
      return null;
    }

    // --- Test if number of arguments equals the number of parameters
    if (funcParams.length !== invoc.arguments.length) {
      this.reportError(
        "W154",
        invoc,
        funcParams.length,
        invoc.arguments.length
      );
      return null;
    }

    // --- Match and convert parameter types one-by-one
    for (let i = 0; i < funcParams.length; i++) {
      const par = funcParams[i];
      const waParType =
        par.spec.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(par.spec as IntrinsicType).underlying];
      const argType = this.compileExpression(invoc.arguments[i], body);
      const waArgType =
        argType.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(argType as IntrinsicType).underlying];

      // --- Do not allow implicit type mappings from floating-point to integer
      if (
        (waParType === WaType.i32 || waParType === WaType.i64) &&
        (waArgType === WaType.f32 || waArgType === WaType.f64)
      ) {
        this.reportError("W155", invoc);
        return null;
      }

      // --- Argument is OK, cast it to the parameter's type
      this.castForStorage(par.spec, argType, body);
    }

    // --- Call the function
    if (calledDecl.type === "TableDeclaration") {
      this.inject(emit, constVal(WaType.i32, calledDecl.entryIndex), body);
      const exprType = this.compileExpression(invoc.dispatcher, body, emit);
      if (exprType) {
        this.castForStorage(i32Desc, exprType, body);
        this.inject(emit, add(WaType.i32), body);
        this.inject(emit, callIndirect(createTableName(invoc.name)), body);
      }
    } else {
      this.inject(emit, call(createGlobalName(invoc.name)), body);
    }

    // --- Done
    return funcResult ?? voidDesc;
  }

  /**
   * Casts a storage type to another storage type
   * @param left
   * @param right
   * @param body Body to put the statements in
   * @param emit Should emit code?
   */
  private castForStorage(
    left: TypeSpec,
    right: TypeSpec,
    body: WaInstruction[],
    emit = true,
    value?: number | bigint
  ): void {
    switch (left.type) {
      case "Intrinsic":
        if (right.type !== "Intrinsic") {
          this.reportError("W141", right);
          return;
        }
        this.castIntrinsicToIntrinsic(left, right, body, emit, value);
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
          this.inject(emit, wrap64(), body);
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
    body: WaInstruction[],
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
            this.inject(emit, convert32(WaType.i64), body);
            return;
          case "f64":
            this.inject(emit, convert64(WaType.i64), body);
            return;
          case "i32":
          case "u32":
            this.inject(emit, wrap64(), body);
            return;
          case "i16":
          case "u16":
            this.inject(emit, wrap64(), body);
            tighten(0xffff, 16, left.underlying, body, emit, value);
            return;
          case "i8":
          case "u8":
            this.inject(emit, wrap64(), body);
            tighten(0xff, 24, left.underlying, body, emit, value);
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
            this.inject(emit, convert32(WaType.i32), body);
            return;
          case "f64":
            this.inject(emit, convert64(WaType.i32), body);
            return;
          case "i64":
            this.inject(emit, extend32(true), body);
            return;
          case "u64":
            this.inject(emit, extend32(false), body);
            return;
          case "i16":
          case "u16":
            tighten(0xffff, 16, left.underlying, body, emit, value);
            return;
          case "i8":
          case "u8":
            tighten(0xff, 24, left.underlying, body, emit, value);
            return;
        }
        break;

      case "f64":
        switch (left.underlying) {
          case "f32":
            this.inject(emit, demote64(), body);
            return;
          case "i64":
            this.inject(emit, trunc64(WaType.f64, true), body);
            return;
          case "u64":
            this.inject(emit, trunc64(WaType.f64, false), body);
            return;
          case "i32":
            this.inject(emit, trunc32(WaType.f64, true), body);
            return;
          case "u32":
            this.inject(emit, trunc32(WaType.f64, false), body);
            return;
          case "i16":
          case "u16":
            this.inject(emit, trunc32(WaType.f64, false), body);
            tighten(0xffff, 16, left.underlying, body, emit, value);
            return;
          case "i8":
          case "u8":
            this.inject(emit, trunc32(WaType.f64, false), body);
            tighten(0xff, 24, left.underlying, body, emit, value);
            return;
        }
        break;

      case "f32":
        switch (left.underlying) {
          case "f64":
            this.inject(emit, promote32(), body);
            return;
          case "i64":
            this.inject(emit, trunc64(WaType.f32, true), body);
            return;
          case "u64":
            this.inject(emit, trunc64(WaType.f32, false), body);
            return;
          case "i32":
            this.inject(emit, trunc32(WaType.f32, true), body);
            return;
          case "u32":
            this.inject(emit, trunc32(WaType.f32, false), body);
            return;
          case "i16":
          case "u16":
            this.inject(emit, trunc32(WaType.f32, false), body);
            tighten(0xffff, 16, left.underlying, body, emit, value);
            return;
          case "i8":
          case "u8":
            this.inject(emit, trunc32(WaType.f32, false), body);
            tighten(0xff, 24, left.underlying, body, emit, value);
            return;
        }
        break;
    }

    /**
     * Demotes a 32-bit value to a smaller one
     * @param mask Bit mask
     * @param bits Bit count
     * @param typename Type name
     * @param body Body to put the statements in
     * @param emit Should emit code?
     * @param value: Optional value to check if tightening is needed at all
     */
    function tighten(
      mask: number,
      bits: number,
      typename: string,
      body: WaInstruction[],
      emit = true,
      value?: number | bigint
    ): void {
      if (value && typeof value === "number") {
        const rightBits = 32 - bits;
        const lower = typename.startsWith("i") ? -(2 ** (rightBits - 1)) : 0;
        const upper = lower + 2 ** rightBits;
        if (value >= lower && value <= upper) {
          return;
        }
      }
      compiler.inject(emit, constVal(WaType.i32, mask), body);
      compiler.inject(emit, and(WaType.i32), body);
      if (typename.startsWith("i")) {
        compiler.inject(emit, constVal(WaType.i32, bits), body);
        compiler.inject(emit, shl(WaType.i32), body);
        compiler.inject(emit, constVal(WaType.i32, bits), body);
        compiler.inject(emit, shr(WaType.i32, true), body);
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
   * @param body Body to put the statements in
   * @param emit Should emit code?
   */
  private calculateAddressOf(
    expr: Expression,
    body: WaInstruction[],
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
        this.inject(emit, constVal(WaType.i32, resolvedId.var.address), body);

        // --- Retrieve address/type information
        return {
          address: resolvedId.var.address,
          spec: resolvedId.var.spec,
        };
      }

      case "DereferenceExpression": {
        // --- Start with the calculation of the operand address
        const operandAddr = this.calculateAddressOf(expr.operand, body);
        if (operandAddr === null) {
          return null;
        }

        // --- Member access needs a struct object
        if (operandAddr.spec.type !== "Pointer") {
          this.reportError("W152", expr);
          return null;
        }

        // --- Load the pointer from the address
        this.inject(emit, load(WaType.i32), body);

        // --- Retrieve address/type information
        return {
          address: operandAddr.address,
          spec: operandAddr.spec.spec,
        };
      }

      case "MemberAccess": {
        // --- Start with the calculation of the object address
        const leftAddress = this.calculateAddressOf(expr.object, body);
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
        if (offset !== 0) {
          this.inject(true, constVal(WaType.i32, offset), body);
          this.inject(true, add(WaType.i32), body);
        }
        return {
          address,
          spec: field[0].spec,
        };
      }

      case "ItemAccess": {
        // --- Start with the calculation of the object address
        const arrayAddress = this.calculateAddressOf(expr.array, body);
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

        const indexType = this.compileExpression(expr.index, body, emit);
        if (indexType === null) {
          return null;
        }
        this.castForStorage(i32Desc, indexType, body, emit, expr.index.value);
        this.inject(emit, constVal(WaType.i32, itemSize), body);
        this.inject(emit, mul(WaType.i32), body);
        this.inject(emit, add(WaType.i32), body);
        return {
          address,
          spec: arrayAddress.spec.spec,
        };
      }
    }
    return null;
  }

  // ==========================================================================
  // Temporary locals

  /**
   * Creates a temporary local with the specified type
   * @param type
   */
  private createTempLocal(type: WaType, prefix: string = ""): string {
    const tmpName = `$tloc$${prefix}${WaType[type].toString()}`;
    if (!this._tempLocals.has(type)) {
      const local = this._builder.addLocal(tmpName, type);
      this._tempLocals.add(type);
      this.addTrace(() => [
        "local",
        0,
        this.wsCompiler.waTree.renderLocal(local),
      ]);
    }
    return tmpName;
  }

  // ==========================================================================
  // Helpers

  /**
   * Injects the specifiec WebAssembly instructions into the function
   * @param emit Should emit code?
   * @param instr Instructions to inject
   * @param body Body to inject the instructions
   */
  private inject(
    emit: boolean,
    instr: WaInstruction | WaInstruction[],
    body: WaInstruction[]
  ): void {
    if (!emit) {
      return;
    }
    if (Array.isArray(instr)) {
      body.push(...instr);
    } else {
      body.push(instr);
    }
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
const voidDesc: VoidType = {
  type: "Void",
} as VoidType;

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
