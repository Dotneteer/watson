import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Assignment,
  BinaryExpression,
  BinaryOpSymbols,
  BuiltInFunctionInvocationExpression,
  ConditionalExpression,
  DataDeclaration,
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
  PointerType,
  ReturnStatement,
  TypeCastExpression,
  UnaryExpression,
  VariableDeclaration,
  VoidType,
  WhileStatement,
} from "../compiler/source-tree";
import {
  ConstVal,
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
  createBreakLabel,
  createGlobalName,
  createLocalName,
  createLoopLabel,
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
  block,
  branch,
  branchIf,
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
  loop,
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
import {
  optimizeConstants,
  optimizeLastInlineParam,
  optimizeLocalUsage,
  optimizeWat,
} from "./wat-optimizer";
import {
  countInstructions,
  findInstruction,
  visitInstructions,
} from "./wat-helpers";
import { types } from "util";

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

  // --- The current loop depth
  private _loopDepth = 0;

  // --- Do not emit
  private _suspendCount = 0;

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
   * Gets the builder of this function
   */
  get builder(): FunctionBuilder {
    return this._builder;
  }

  /**
   * Gets the body of the compiled function
   */
  getInstructionBody(): WaInstruction[] {
    return this._builder.body;
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
    // --- Prepare the function signature
    this.processSignature();

    // --- Compile the function body
    this.func.body.forEach((stmt) =>
      this.compileStatement(stmt, this._builder.body)
    );

    // --- Optimize the emitted WA code of the function body
    optimizeWat(this._builder.body);

    // --- Remove unused locals
    optimizeLocalUsage(this._builder);

    // --- Create trace information for test purposes
    this._builder.body.forEach((ins) => {
      if (ins.type !== "Comment") {
        const parts = this.wsCompiler.waTree
          .renderInstructionNode(ins)
          .split("\n")
          .map((item) => item.trim());
        parts.forEach((p) => {
          this.addTrace(() => ["inject", this.func.funcId, p]);
        });
      }
    });
  }

  /**
   * Processes the function parameters and result type
   */
  private processSignature(): void {
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
          fromParameter: true,
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
  private compileStatement(stmt: Statement, body: WaInstruction[]): void {
    switch (stmt.type) {
      case "LocalVariable":
        this.compileLocalDeclaration(stmt, body);
        return;
      case "Assignment":
        this.compileAssignment(stmt, body);
        return;
      case "Break":
        this.compileBreak(body);
        return;
      case "Continue":
        this.compileContinue(body);
        return;
      case "Do":
        this.compileDoWhileLoop(stmt, body);
        return;
      case "If":
        this.compileIf(stmt, body);
        return;
      case "LocalFunctionInvocation":
        this.compileLocalFunctionInvocation(stmt, body);
        return;
      case "Return":
        this.compileReturn(stmt, body);
        return;
      case "While":
        this.compileWhileLoop(stmt, body);
        return;
    }
  }

  /**
   * Processes a local variable declaration
   * @param body Body to put the statements in
   */
  private compileLocalDeclaration(
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
            initExpr?.expr.value
          );
          this.inject(localSet(localName), body);
        }
      }
      const paramType =
        localVar.spec.type === "Pointer"
          ? WaType.i32
          : waTypeMappings[(localVar.spec as IntrinsicType).underlying];
      this.locals.set(localVar.name, {
        fromParameter: false,
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
  private compileAssignment(asgn: Assignment, body: WaInstruction[]): void {
    // --- Check the left value type
    let leftSide: "local" | "global" | "var" = "var";
    let leftType: TypeSpec | undefined;
    let idAddress = false;
    let varName: string | undefined;
    let isParam = false;
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
        isParam = resolvedId.local.fromParameter;
      } else if (resolvedId.data) {
        // --- Left side is a data variable with a const address
        leftType = <IntrinsicType>{
          type: "Intrinsic",
          underlying: resolvedId.data.underlyingType,
        };
        this.inject(constVal(WaType.i32, resolvedId.data.address), body);
        if (asgn.asgn !== "=" && asgn.asgn !== ":=") {
          // --- We need to put this address to the stack twice
          this.inject(constVal(WaType.i32, resolvedId.var.address), body);
        }
      } else {
        // --- Left side is a variable with a const address
        leftType = resolvedId.var.spec;
        this.inject(constVal(WaType.i32, resolvedId.var.address), body);
        if (asgn.asgn !== "=" && asgn.asgn !== ":=") {
          // --- We need to put this address to the stack twice
          this.inject(constVal(WaType.i32, resolvedId.var.address), body);
        }
      }
    } else {
      // --- Left side is a compound left value expression
      const resolvedAddr = this.calculateAddressOf(asgn.lval, body);
      if (!resolvedAddr) {
        return;
      }
      leftType = resolvedAddr.spec;
    }

    // --- Handle copy assignment separately
    if (asgn.asgn === ":=") {
      this.compileCopyAssignmentTail(asgn, leftType, body);
      return;
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
        this.inject(localTee(tmpAddrVar), body);
        this.inject(localGet(tmpAddrVar), body);

        // --- At this point we have the variable access on the top of the stack
      }
    }

    // --- We need to get the value
    const leftIntrinsic = leftType.type === "Intrinsic" ? leftType : i32Desc;
    if (asgn.asgn !== "=") {
      switch (leftSide) {
        case "global":
          this.inject(globalGet(createGlobalName(varName)), body);
          break;
        case "local":
          this.inject(
            localGet(
              isParam ? createParameterName(varName) : createLocalName(varName)
            ),
            body
          );
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
        case "-=":
          if (leftType.type === "Pointer" && rightType.type === "Intrinsic") {
            // --- Pointer arithmetic, use the size of the target type
            this.inject(
              constVal(WaType.i32, this.wsCompiler.getSizeof(leftType.spec)),
              body
            );

            // --- Calculate the result
            this.inject(mul(WaType.i32), body);
          }
          if (asgn.asgn === "+=") {
            this.inject(add(waType), body);
          } else {
            this.inject(sub(waType), body);
          }
          break;
        case "*=":
          this.inject(mul(waType), body);
          break;
        case "/=":
          this.inject(div(waType, isSigned), body);
          break;
        case "%=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "remainder (%)");
            return;
          }
          this.inject(rem(waType, isSigned), body);
          break;
        case "&=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise AND");
            return;
          }
          this.inject(and(waType), body);
          break;
        case "|=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise OR");
            return;
          }
          this.inject(or(waType), body);
          break;
        case "^=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "bitwise XOR");
            return;
          }
          this.inject(xor(waType), body);
          break;
        case "<<=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "shift left");
            return;
          }
          this.inject(shl(waType), body);
          break;
        case ">>=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "signed shift right");
            return;
          }
          this.inject(shr(waType, true), body);
          break;

        case ">>>=":
          if (resultType.underlying.startsWith("f")) {
            this.reportError("W145", asgn, "shift right");
            return;
          }
          this.inject(shr(waType, false), body);
          break;
      }
    }

    // --- Cast the result
    this.castIntrinsicToIntrinsic(leftIntrinsic, rightIntrinsic, body);

    // --- Store the resuls
    switch (leftSide) {
      case "global":
        this.inject(globalSet(createGlobalName(varName)), body);
        break;
      case "local":
        this.inject(
          localSet(
            isParam ? createParameterName(varName) : createLocalName(varName)
          ),
          body
        );
        break;
      case "var":
        this.compileIntrinsicVariableSet(leftIntrinsic, body);
        break;
    }
  }

  /**
   * Compiles the tail of a copy assignment
   * @param asgn Assignment to compile
   * @param leftType Left value type
   * @param body Body to put the statements in
   */
  private compileCopyAssignmentTail(
    asgn: Assignment,
    leftType: TypeSpec,
    body: WaInstruction[]
  ): void {
    // --- The left value address is already on the stack
    // --- Test the left value type
    if (leftType.type !== "Array" && leftType.type !== "Struct") {
      this.reportError("W166", asgn);
      return;
    }

    // --- Check if the left side has a constand address
    let leftAddrCons: ConstVal | undefined;
    let leftTmpVar: string | undefined;
    if (body.length > 0 && body[body.length - 1].type === "ConstVal") {
      // --- Constant address
      leftAddrCons = body[body.length - 1] as ConstVal;
      body.splice(body.length - 1, 1);
    } else {
      // --- Compound address
      leftTmpVar = this.createTempLocal(WaType.i32, "lcpy");
      this.inject(localSet(leftTmpVar), body);
    }

    // --- Get the right side value
    const rightType = this.compileExpression(asgn.expr, body);
    if (!rightType) {
      return;
    }

    // --- Check right side type
    if (
      rightType.type !== "Intrinsic" ||
      rightType.underlying.startsWith("f")
    ) {
      this.reportError("W167", asgn);
      return;
    }

    // --- Check if the left side has a constand address
    let rightAddrCons: ConstVal | undefined;
    let rightTmpVar: string | undefined;
    if (body.length > 0 && body[body.length - 1].type === "ConstVal") {
      // --- Constant address
      rightAddrCons = body[body.length - 1] as ConstVal;
      body.splice(body.length - 1, 1);
    } else {
      // --- Compound address
      rightTmpVar = this.createTempLocal(WaType.i32, "rcpy");
      this.inject(localSet(rightTmpVar), body);
    }

    // --- Compile the entiry structure, provided its length is less than 256 bytes
    let copyLength = this.wsCompiler.getSizeof(leftType);
    if (copyLength < 0 || copyLength > 256) {
      this.reportError("W168", asgn);
      return;
    }

    // --- Generate copy instructions
    let offset = 0;
    while (copyLength >= 8) {
      if (leftAddrCons) {
        this.inject(constVal(WaType.i32, leftAddrCons.value), body);
      } else {
        this.inject(localGet(leftTmpVar), body);
      }
      if (rightAddrCons) {
        this.inject(constVal(WaType.i32, rightAddrCons.value), body);
      } else {
        this.inject(localGet(rightTmpVar), body);
      }
      this.inject(load(WaType.i64, undefined, offset), body);
      this.inject(store(WaType.i64, undefined, offset), body);
      offset += 8;
      copyLength -= 8;
    }
    while (copyLength >= 4) {
      if (leftAddrCons) {
        this.inject(constVal(WaType.i32, leftAddrCons.value), body);
      } else {
        this.inject(localGet(leftTmpVar), body);
      }
      if (rightAddrCons) {
        this.inject(constVal(WaType.i32, rightAddrCons.value), body);
      } else {
        this.inject(localGet(rightTmpVar), body);
      }
      this.inject(load(WaType.i32, undefined, offset), body);
      this.inject(store(WaType.i32, undefined, offset), body);
      offset += 4;
      copyLength -= 4;
    }
    while (copyLength >= 2) {
      if (leftAddrCons) {
        this.inject(constVal(WaType.i32, leftAddrCons.value), body);
      } else {
        this.inject(localGet(leftTmpVar), body);
      }
      if (rightAddrCons) {
        this.inject(constVal(WaType.i32, rightAddrCons.value), body);
      } else {
        this.inject(localGet(rightTmpVar), body);
      }
      this.inject(load(WaType.i32, WaBitSpec.Bit16, offset), body);
      this.inject(store(WaType.i32, WaBitSpec.Bit16, offset), body);
      offset += 2;
      copyLength -= 2;
    }
    while (copyLength > 0) {
      if (leftAddrCons) {
        this.inject(constVal(WaType.i32, leftAddrCons.value), body);
      } else {
        this.inject(localGet(leftTmpVar), body);
      }
      if (rightAddrCons) {
        this.inject(constVal(WaType.i32, rightAddrCons.value), body);
      } else {
        this.inject(localGet(rightTmpVar), body);
      }
      this.inject(load(WaType.i32, WaBitSpec.Bit8, offset), body);
      this.inject(store(WaType.i32, WaBitSpec.Bit8, offset), body);
      offset += 1;
      copyLength -= 1;
    }
  }

  /**
   * Processes a break statement
   * @param body Body to put the statements in
   */
  private compileBreak(body: WaInstruction[]): void {
    this.inject(branch(createBreakLabel(this._loopDepth)), body);
  }

  /**
   * Processes a continue statement
   * @param body Body to put the statements in
   */
  private compileContinue(body: WaInstruction[]): void {
    this.inject(branch(createLoopLabel(this._loopDepth)), body);
  }

  /**
   * Processes a do..while loop
   * @param body Body to put the statements in
   */
  private compileDoWhileLoop(dLoop: DoStatement, body: WaInstruction[]): void {
    const hasBreak = dLoop.loopBody.some((st) => this.hasBreak(st));

    // --- New loop depth
    this._loopDepth++;

    // --- This contains the body of the loop
    const loopBody: WaInstruction[] = [];

    // --- Compilet the main loop
    const loopLabel = createLoopLabel(this._loopDepth);
    dLoop.loopBody.forEach((stmt) => this.compileStatement(stmt, loopBody));

    // --- Compile the test
    if (!this.compileExpression(dLoop.test, loopBody)) {
      return;
    }

    // --- Combine the test and the body into a loop
    const loopToInject = loop(loopLabel, [...loopBody, branchIf(loopLabel)]);

    if (hasBreak) {
      // --- Encapsulate the loop into a break block
      const breakBlock = block(createBreakLabel(this._loopDepth), [
        loopToInject,
      ]);
      this.inject(breakBlock, body);
    } else {
      // --- Inject the loop
      this.inject(loopToInject, body);
    }

    // --- Back to previous loop back
    this._loopDepth--;
  }

  /**
   * Processes a while loop
   * @param body Body to put the statements in
   */
  private compileWhileLoop(wLoop: WhileStatement, body: WaInstruction[]): void {
    const hasBreak = wLoop.loopBody.some((st) => this.hasBreak(st));

    // --- New loop depth
    this._loopDepth++;

    // --- This contains the body of the loop
    const loopBody: WaInstruction[] = [];

    // --- Compile the test
    if (!this.compileExpression(wLoop.test, loopBody)) {
      return;
    }

    // --- Compile the loop body
    const loopMain: WaInstruction[] = [];
    const loopLabel = createLoopLabel(this._loopDepth);
    wLoop.loopBody.forEach((stmt) => this.compileStatement(stmt, loopMain));
    this.inject(branch(loopLabel), loopMain);

    // --- Combine the test and the body into a loop
    const loopToInject = loop(loopLabel, [...loopBody, ifBlock(loopMain)]);

    if (hasBreak) {
      // --- Encapsulate the loop into a break block
      const breakBlock = block(createBreakLabel(this._loopDepth), [
        loopToInject,
      ]);
      this.inject(breakBlock, body);
    } else {
      // --- Inject the loop
      this.inject(loopToInject, body);
    }

    // --- Back to previous loop back
    this._loopDepth--;
  }

  /**
   * Tests if the specified statement is a break or contains a break
   * @param stmt Statement to check
   * @returns True, if a break found; otherwise, false
   */
  private hasBreak(stmt: Statement): boolean {
    switch (stmt.type) {
      case "Break":
        return true;
      case "If":
        const hasIt = stmt.consequent.some((st) => this.hasBreak(st));
        if (hasIt) {
          return true;
        }
        if (stmt.alternate) {
          return stmt.alternate.some((st) => this.hasBreak(st));
        }
        break;
    }
    return false;
  }

  /**
   * Processes an if statement
   * @param body Body to put the statements in
   */
  private compileIf(ifStmt: IfStatement, body: WaInstruction[]): void {
    // --- Test expression
    if (!this.compileExpression(ifStmt.test, body)) {
      return;
    }

    // --- Consequent branch
    const consequentBody: WaInstruction[] = [];
    ifStmt.consequent.forEach((stmt) =>
      this.compileStatement(stmt, consequentBody)
    );

    // --- Alternate branch
    let alternateBody: WaInstruction[] | undefined;
    if (ifStmt.alternate) {
      alternateBody = [];
      ifStmt.alternate.forEach((stmt) =>
        this.compileStatement(stmt, alternateBody)
      );
    }

    // --- Combined if statement
    this.inject(ifBlock(consequentBody, alternateBody), body);
  }

  /**
   * Processes a local function invocation
   * @param body Body to put the statements in
   */
  private compileLocalFunctionInvocation(
    invocation: LocalFunctionInvocation,
    body: WaInstruction[]
  ): void {
    const resultTypeSpec = this.compileFunctionInvocation(
      invocation.invoked,
      body
    );
    if (!resultTypeSpec) {
      return;
    }

    // --- Remove the result of a non-void function
    if (resultTypeSpec.type !== "Void") {
      this.inject(drop(), body);
    }
  }

  /**
   * Processes a return statement
   * @param body Body to put the statements in
   */
  private compileReturn(retStmt: ReturnStatement, body: WaInstruction[]): void {
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
    this.inject(ret(), body);
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
            return foldLiteralIntoBinary(expr.left, add(literal2, literal1));
          } else if (binop1 === "-") {
            return foldLiteralIntoBinary(expr.left, add(literal2, -literal1));
          }
        case "-":
          if (binop1 === "+") {
            return foldLiteralIntoBinary(expr.left, add(literal2, -literal1));
          } else if (binop1 === "-") {
            return foldLiteralIntoBinary(expr.left, add(literal2, literal1));
          }
      }
      return expr;
    }

    function foldLiteralIntoBinary(
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

  private compileExpressionWithNoEmit(
    expr: Expression,
    body: WaInstruction[]
  ): TypeSpec | null {
    this._suspendCount++;
    try {
      return this.compileExpression(expr, body);
    } finally {
      this._suspendCount--;
    }
  }

  /**
   * Compiles the specified expression
   * @param expr Expression to compile
   * @param body Body to inject the code into
   * @returns Type specification of the result
   */
  private compileExpression(
    expr: Expression,
    body: WaInstruction[]
  ): TypeSpec | null {
    switch (expr.type) {
      case "Literal":
        return this.compileLiteral(expr, body);
      case "Identifier":
        return this.compileIdentifier(expr, body);
      case "UnaryExpression":
        return this.compileUnaryExpression(expr, body);
      case "BinaryExpression":
        return this.compileBinaryExpression(expr, body);
      case "ConditionalExpression":
        return this.compileConditionalExpression(expr, body);
      case "TypeCast":
        return this.compileTypeCast(expr, body);
      case "MemberAccess":
      case "ItemAccess":
      case "DereferenceExpression":
        return this.compileIndirectAccess(expr, body);
      case "BuiltInFunctionInvocation":
        return this.compileBuiltinFunctionInvocation(expr, body);
      case "FunctionInvocation":
        return this.compileFunctionInvocation(expr, body);
    }
    return i32Desc;
  }

  /**
   * Compiles a literal
   * @param lit Literal to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileLiteral(lit: Literal, body: WaInstruction[]): TypeSpec | null {
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
    this.inject(instr, body);
    return typeSpec;
  }

  /**
   * Compiles an identifier
   * @param id Identifier to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileIdentifier(
    id: Identifier,
    body: WaInstruction[]
  ): TypeSpec | null {
    // --- Check for a constant value
    const local = this._locals.get(id.name);
    if (!local) {
      // --- Ok, this name in not for a local
      const decl = this.wsCompiler.declarations.get(id.name);
      if (decl && decl.type === "ConstDeclaration") {
        return this.compileLiteral(
          <Literal>{
            type: "Literal",
            value: decl.value,
          },
          body
        );
      }
    }

    // --- Go on with a non-constant identifier
    const resolvedId = this.resolveIdentifier(id);
    if (!resolvedId) {
      return null;
    }
    if (resolvedId.local) {
      this.inject(localGet(resolvedId.local.name), body);
      return resolvedId.local.type;
    }
    if (resolvedId.global) {
      this.inject(globalGet(createGlobalName(resolvedId.global.name)), body);
      return <IntrinsicType>{
        type: "Intrinsic",
        underlying: resolvedId.global.underlyingType,
      };
    }
    if (resolvedId.var) {
      const typeSpec = resolvedId.var.spec;
      if (typeSpec.type !== "Intrinsic" && typeSpec.type !== "Pointer") {
        this.reportError("W143", id);
        return null;
      }
      this.inject(constVal(WaType.i32, resolvedId.var.address), body);
      this.compileIntrinsicVariableGet(
        typeSpec.type === "Intrinsic" ? typeSpec : i32Desc,
        body
      );
      return typeSpec;
    }
    if (resolvedId.data) {
      const typeSpec = <IntrinsicType>{
        type: "Intrinsic",
        underlying: resolvedId.data.underlyingType,
      };
      this.inject(constVal(WaType.i32, resolvedId.data.address), body);
      this.compileIntrinsicVariableGet(typeSpec, body);
      return typeSpec;
    }
  }

  /**
   * Compiles getter to a variable with the specified type
   * @param typeSpec Variabel type
   * @param body Body to put the statements in
   */
  private compileIntrinsicVariableGet(
    typeSpec: IntrinsicType,
    body: WaInstruction[]
  ): void {
    const waType = waTypeMappings[typeSpec.underlying];
    switch (typeSpec.underlying) {
      case "f32":
      case "f64":
        this.inject(load(waType), body);
        break;
      case "i8":
      case "u8":
        this.inject(
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
   */
  private compileIntrinsicVariableSet(
    typeSpec: IntrinsicType,
    body: WaInstruction[]
  ): void {
    const waType = waTypeMappings[typeSpec.underlying];
    switch (typeSpec.underlying) {
      case "f32":
      case "f64":
        this.inject(store(waType), body);
        break;
      case "bool":
      case "i8":
      case "u8":
        this.inject(store(waType, WaBitSpec.Bit8), body);
        break;
      case "i16":
      case "u16":
        this.inject(store(waType, WaBitSpec.Bit16), body);
        break;
      case "i32":
      case "u32":
        this.inject(store(waType, WaBitSpec.Bit32), body);
        break;
      case "i64":
      case "u64":
        this.inject(store(waType), body);
    }
  }

  /**
   * Compiles a unary expression
   * @param unary Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileUnaryExpression(
    unary: UnaryExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    switch (unary.operator) {
      case "+": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body);
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
          unary.operand?.value
        );
        return i32Desc;
      }

      case "-": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body);
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
        this.inject(constVal(waType, -1), body);
        this.inject(mul(waType), body);
        return operandType;
      }

      case "!":
      case "~": {
        // --- Compile the operand
        const operandType = this.compileExpression(unary.operand, body);
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
          this.inject(eqz(waType), body);
          return i32Desc;
        } else {
          // --- "~" --> xor with all bits 1
          this.inject(
            constVal(
              waType,
              bitwiseNotMasks[(operandType as IntrinsicType).underlying]
            ),
            body
          );
          this.inject(xor(waType), body);
          return operandType;
        }
      }

      case "&": {
        const address = this.calculateAddressOf(unary.operand, body);
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
   * @returns Type specification of the result
   */
  private compileBinaryExpression(
    binary: BinaryExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    // --- Compile the left and right operands to obtain result types
    const left = this.compileExpressionWithNoEmit(binary.left, body);
    if (left === null) {
      return null;
    }
    const right = this.compileExpressionWithNoEmit(binary.right, body);
    if (right === null) {
      return null;
    }

    // --- Special case: pointer arithmetic
    if (left.type === "Pointer" && right.type === "Intrinsic") {
      return this.compilePointerBinaryExpression(
        binary.left,
        left,
        binary.right,
        right,
        binary.operator,
        body
      );
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
    this.compileExpression(binary.left, body);
    this.castIntrinsicToIntrinsic(resultType, left, body);
    this.compileExpression(binary.right, body);
    this.castIntrinsicToIntrinsic(resultType, right, body);
    const waType = waTypeMappings[resultType.underlying];

    // --- Process operations
    switch (binary.operator) {
      case "+":
        this.inject(add(waType), body);
        break;

      case "-":
        this.inject(sub(waType), body);
        break;

      case "*":
        this.inject(mul(waType), body);
        break;

      case "/":
        this.inject(div(waType, isSigned), body);
        break;

      case "%":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "remainder (%)");
          return null;
        }
        this.inject(rem(waType, isSigned), body);
        break;

      case "&":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise AND");
          return null;
        }
        this.inject(and(waType), body);
        break;

      case "|":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise OR");
          return null;
        }
        this.inject(or(waType), body);
        break;

      case "^":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "bitwise XOR");
          return null;
        }
        this.inject(xor(waType), body);
        break;

      case "<<":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift left");
          return null;
        }
        this.inject(shl(waType), body);
        break;

      case ">>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "signed shift right");
          return null;
        }
        this.inject(shr(waType, true), body);
        break;

      case ">>>":
        if (resultType.underlying.startsWith("f")) {
          this.reportError("W145", binary, "shift right");
          return null;
        }
        this.inject(shr(waType, false), body);
        break;

      case "==":
        this.inject(eq(waType), body);
        break;

      case "!=":
        this.inject(ne(waType), body);
        break;

      case "<":
        this.inject(lt(waType, isSigned), body);
        break;

      case "<=":
        this.inject(le(waType, isSigned), body);
        break;
      case ">":
        this.inject(gt(waType, isSigned), body);
        break;

      case ">=":
        this.inject(ge(waType, isSigned), body);
        break;
    }
    return resultType;
  }

  /**
   * Compiles a pointer binary operation
   * @param left Left operand
   * @param leftType Left operand type
   * @param right Right operand
   * @param rightType Right operand type
   * @param op Operation
   * @param body
   */
  private compilePointerBinaryExpression(
    left: Expression,
    leftType: PointerType,
    right: Expression,
    rightType: IntrinsicType,
    op: BinaryOpSymbols,
    body: WaInstruction[]
  ): TypeSpec | null {
    if (op !== "+" && op !== "-") {
      this.reportError("W164", left);
      return null;
    }
    if (rightType.underlying.startsWith("f")) {
      this.reportError("W165", right);
      return null;
    }

    // --- Get the pointer value
    this.compileExpression(left, body);

    // --- Get the increment value
    this.compileExpression(right, body);
    this.castIntrinsicToIntrinsic(i32Desc, rightType, body);

    // --- Get the multiplier value
    this.inject(
      constVal(WaType.i32, this.wsCompiler.getSizeof(leftType.spec)),
      body
    );

    // --- Calculate the result
    this.inject(mul(WaType.i32), body);
    this.inject(op === "+" ? add(WaType.i32) : sub(WaType.i32), body);
    return leftType;
  }

  /**
   * Compiles a conditional expression
   * @param conditional Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileConditionalExpression(
    conditional: ConditionalExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    // --- Compile the condition, consequent, and alternate values

    const condition = this.compileExpressionWithNoEmit(
      conditional.condition,
      body
    );
    if (condition === null) {
      return null;
    }
    const consequent = this.compileExpressionWithNoEmit(
      conditional.consequent,
      body
    );
    if (consequent === null) {
      return null;
    }
    const alternate = this.compileExpressionWithNoEmit(
      conditional.alternate,
      body
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
    this.compileExpression(conditional.consequent, body);
    this.castIntrinsicToIntrinsic(resultType, consequent, body);
    this.compileExpression(conditional.alternate, body);
    this.castIntrinsicToIntrinsic(resultType, alternate, body);
    this.compileExpression(conditional.condition, body);
    this.castIntrinsicToIntrinsic(i32Desc, condition, body);

    // --- Inject the "select" operation
    this.inject(select(), body);

    // --- Done
    return resultType;
  }

  /**
   * Compiles a type cast
   * @param cast Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileTypeCast(
    cast: TypeCastExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    const operand = this.compileExpressionWithNoEmit(cast.operand, body);
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
    this.compileExpression(cast.operand, body);
    this.castIntrinsicToIntrinsic(resultType, operand, body);
    return resultType;
  }

  /**
   * Compiles an indirect value access
   * @param expr Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileIndirectAccess(
    expr: IndirectAccessExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    const varAddr = this.calculateAddressOf(expr, body);
    if (varAddr == null) {
      return null;
    }
    let typeSpec = varAddr.spec;
    if (typeSpec.type === "Intrinsic") {
      this.compileIntrinsicVariableGet(typeSpec, body);
    }
    return typeSpec;
  }

  /**
   * Compiles a built-in function invocation
   * @param func Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileBuiltinFunctionInvocation(
    func: BuiltInFunctionInvocationExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    // --- Prepare function argument types
    const argTypes = func.arguments.map((arg) => {
      const type = this.compileExpressionWithNoEmit(arg, body);
      return type;
    });
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
      this.compileExpression(arg, body);
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
          this.inject(abs(waType), body);
        }
        break;
      }

      case "ceil":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "ceil");
          return null;
        }
        this.inject(ceil(waType), body);
        break;

      case "clz":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "clz");
          return null;
        }
        this.inject(clz(waType), body);
        break;

      case "copysign":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "copysign");
          return null;
        }
        this.inject(copysign(waType), body);
        break;

      case "ctz":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "ctz");
          return null;
        }
        this.inject(ctz(waType), body);
        break;

      case "floor":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "floor");
          return null;
        }
        this.inject(floor(waType), body);
        break;

      case "nearest":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "nearest");
          return null;
        }
        this.inject(nearest(waType), body);
        break;

      case "neg":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "neg");
          return null;
        }
        this.inject(neg(waType), body);
        break;

      case "popcnt":
        if (waType === WaType.f32 || waType === WaType.f64) {
          this.reportError("W151", func, "popcnt");
          return null;
        }
        this.inject(popcnt(waType), body);
        break;

      case "sqrt":
        if (waType === WaType.i32 || waType === WaType.i64) {
          this.reportError("W150", func, "sqrt");
          return null;
        }
        this.inject(sqrt(waType), body);
        break;

      case "min":
      case "max":
        resultType = hasF64Arg ? f64Desc : f32Desc;
        waType = hasF64Arg ? WaType.f64 : WaType.f32;
        for (let i = 1; i < func.arguments.length; i++) {
          this.inject(func.name === "min" ? min(waType) : max(waType), body);
        }
        break;
    }
    return resultType;
  }

  /**
   * Compiles a function invocation
   * @param invoc Expression to compile
   * @param body Body to put the statements in
   * @returns Type specification of the result
   */
  private compileFunctionInvocation(
    invoc: FunctionInvocationExpression,
    body: WaInstruction[]
  ): TypeSpec | null {
    // --- Check if the invoked function exists
    const calledDecl = this.wsCompiler.declarations.get(invoc.name);
    if (!calledDecl) {
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

    // --- Can we inline it?
    let inlineIt = false;
    let funcId = -1;
    if (calledDecl.type === "FunctionDeclaration") {
      inlineIt = calledDecl.canBeInlined;
      funcId = calledDecl.funcId;
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

    // --- We use this during inline optimization
    let lastInlineParamName: string | undefined;
    let startInstructionIndex = 0;
    const builderBody = this._builder.body;

    // --- Match and convert parameter types one-by-one
    for (let i = 0; i < funcParams.length; i++) {
      startInstructionIndex = builderBody.length;
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

      // --- Handle parameters of an inline function
      if (inlineIt) {
        const inlineParamName = `$${funcId}${createParameterName(par.name)}`;
        this.createCompileTimeLocal(inlineParamName, par.spec);
        this.inject(localSet(inlineParamName), body);
        lastInlineParamName = inlineParamName;
      }
    }

    // --- Call the function
    if (calledDecl.type === "TableDeclaration") {
      // --- Non-inlined function call
      this.inject(constVal(WaType.i32, calledDecl.entryIndex), body);
      const exprType = this.compileExpression(invoc.dispatcher, body);
      if (exprType) {
        this.castForStorage(i32Desc, exprType, body);
        this.inject(add(WaType.i32), body);
        this.inject(callIndirect(createTableName(invoc.name)), body);
      }
    } else {
      // --- We call the function, count the invocations
      calledDecl.invocationCount++;

      if (inlineIt) {
        // --- Just copy the locals and the body of the inline function
        this.wsCompiler.getFunctionLocals(calledDecl.name).forEach((loc) => {
          if (!this._builder.locals.some((l) => l.id === loc.id)) {
            this._builder.locals.push(loc);
          }
        });
        this.wsCompiler
          .getFunctionBodyInstructions(calledDecl.name)
          .forEach((ins) => {
            this.inject(ins, body);
          });

        // --- Do optimization
        optimizeConstants(builderBody);
        optimizeLastInlineParam(
          builderBody,
          lastInlineParamName,
          startInstructionIndex
        );
        optimizeConstants(builderBody);
      } else {
        this.inject(call(createGlobalName(invoc.name)), body);
      }
      if (inlineIt) {
        // --- Obtain the return value from the inline function
        if (calledDecl.hasReturn) {
          const resultName = `$${funcId}$res`;
          this.createCompileTimeLocal(resultName, calledDecl.resultType);
          this.inject(localGet(resultName), body);
        }
      }
    }

    // --- Done
    return funcResult ?? voidDesc;
  }

  /**
   * Casts a storage type to another storage type
   * @param left
   * @param right
   * @param body Body to put the statements in
   */
  private castForStorage(
    left: TypeSpec,
    right: TypeSpec,
    body: WaInstruction[],
    value?: number | bigint
  ): void {
    switch (left.type) {
      case "Intrinsic":
        if (right.type !== "Intrinsic") {
          this.reportError("W141", right);
          return;
        }
        this.castIntrinsicToIntrinsic(left, right, body, value);
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
          this.inject(wrap64(), body);
        }
        break;
    }
  }

  /**
   * Casts an intinsice type to another intrinsic type
   * @param left Left value
   * @param right Right expression
   * @param body Array of instrcutions
   * @param value optional value to test
   */
  private castIntrinsicToIntrinsic(
    left: IntrinsicType,
    right: IntrinsicType,
    body: WaInstruction[],
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
            this.inject(convert32(WaType.i64), body);
            return;
          case "f64":
            this.inject(convert64(WaType.i64), body);
            return;
          case "i32":
          case "u32":
            this.inject(wrap64(), body);
            return;
          case "i16":
          case "u16":
            this.inject(wrap64(), body);
            tighten(0xffff, 16, left.underlying, body, value);
            return;
          case "i8":
          case "u8":
            this.inject(wrap64(), body);
            tighten(0xff, 24, left.underlying, body, value);
            return;
          case "bool":
            this.inject(eqz(WaType.i64), body);
            this.inject(eqz(WaType.i64), body);
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
            this.inject(convert32(WaType.i32), body);
            return;
          case "f64":
            this.inject(convert64(WaType.i32), body);
            return;
          case "i64":
            this.inject(extend32(true), body);
            return;
          case "u64":
            this.inject(extend32(false), body);
            return;
          case "i16":
          case "u16":
            tighten(0xffff, 16, left.underlying, body, value);
            return;
          case "i8":
          case "u8":
            tighten(0xff, 24, left.underlying, body, value);
            return;
          case "bool":
            this.inject(eqz(WaType.i32), body);
            this.inject(eqz(WaType.i32), body);
            return;
        }
        break;

      case "f64":
        switch (left.underlying) {
          case "f32":
            this.inject(demote64(), body);
            return;
          case "i64":
            this.inject(trunc64(WaType.f64, true), body);
            return;
          case "u64":
            this.inject(trunc64(WaType.f64, false), body);
            return;
          case "i32":
            this.inject(trunc32(WaType.f64, true), body);
            return;
          case "u32":
            this.inject(trunc32(WaType.f64, false), body);
            return;
          case "i16":
          case "u16":
            this.inject(trunc32(WaType.f64, false), body);
            tighten(0xffff, 16, left.underlying, body, value);
            return;
          case "i8":
          case "u8":
            this.inject(trunc32(WaType.f64, false), body);
            tighten(0xff, 24, left.underlying, body, value);
            return;
          case "bool":
            this.inject(trunc64(WaType.f64, true), body);
            this.inject(eqz(WaType.i64), body);
            this.inject(eqz(WaType.i64), body);
            return;
        }
        break;

      case "f32":
        switch (left.underlying) {
          case "f64":
            this.inject(promote32(), body);
            return;
          case "i64":
            this.inject(trunc64(WaType.f32, true), body);
            return;
          case "u64":
            this.inject(trunc64(WaType.f32, false), body);
            return;
          case "i32":
            this.inject(trunc32(WaType.f32, true), body);
            return;
          case "u32":
            this.inject(trunc32(WaType.f32, false), body);
            return;
          case "i16":
          case "u16":
            this.inject(trunc32(WaType.f32, false), body);
            tighten(0xffff, 16, left.underlying, body, value);
            return;
          case "i8":
          case "u8":
            this.inject(trunc32(WaType.f32, false), body);
            tighten(0xff, 24, left.underlying, body, value);
            return;
          case "bool":
            this.inject(trunc32(WaType.f32, true), body);
            this.inject(eqz(WaType.i32), body);
            this.inject(eqz(WaType.i32), body);
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
     * @param value: Optional value to check if tightening is needed at all
     */
    function tighten(
      mask: number,
      bits: number,
      typename: string,
      body: WaInstruction[],
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
      compiler.inject(constVal(WaType.i32, mask), body);
      compiler.inject(and(WaType.i32), body);
      if (typename.startsWith("i")) {
        compiler.inject(constVal(WaType.i32, bits), body);
        compiler.inject(shl(WaType.i32), body);
        compiler.inject(constVal(WaType.i32, bits), body);
        compiler.inject(shr(WaType.i32, true), body);
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
    if (decl.type === "DataDeclaration") {
      return {
        data: decl,
      };
    }
    this.reportError("W142", id, id.name);
    return null;
  }

  /**
   * Calculates the address of the specified expression
   * @param expr Address expression
   * @param body Body to put the statements in
   */
  private calculateAddressOf(
    expr: Expression,
    body: WaInstruction[]
  ): ResolvedAddress | null {
    switch (expr.type) {
      case "Identifier": {
        // --- Only variables have an address
        const resolvedId = this.resolveIdentifier(expr);
        if (resolvedId === null || (!resolvedId.var && !resolvedId.data)) {
          this.reportError("W146", expr);
          return null;
        }

        const address = resolvedId.var
          ? resolvedId.var.address
          : resolvedId.data.address;
        const spec = resolvedId.var
          ? resolvedId.var.spec
          : <IntrinsicType>{
              type: "Intrinsic",
              underlying: resolvedId.data.underlyingType,
            };
        // --- Inject variable address if requested
        this.inject(constVal(WaType.i32, address), body);

        // --- Retrieve address/type information
        return {
          address,
          spec,
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
        this.inject(load(WaType.i32), body);

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
        if (!field || field.length === 0) {
          this.reportError("W147", expr);
          return null;
        }

        // --- Field exists, add its offset to the address
        let address = leftAddress.address;
        const offset = field[0].offset;
        if (offset !== 0) {
          this.inject(constVal(WaType.i32, offset), body);
          this.inject(add(WaType.i32), body);
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

        const indexType = this.compileExpression(expr.index, body);
        if (indexType === null) {
          return null;
        }
        this.castForStorage(i32Desc, indexType, body, expr.index.value);
        this.inject(constVal(WaType.i32, itemSize), body);
        this.inject(mul(WaType.i32), body);
        this.inject(add(WaType.i32), body);
        return {
          address,
          spec: arrayAddress.spec.spec,
        };
      }
    }
    return null;
  }

  // ==========================================================================
  // Inline function compilation

  /**
   * Prepares the current function for inlining after it was compiled
   * The compiler calls this method only on functions explicitly marked
   * for inlining
   */
  prepareForInlining(): void {
    this.func.canBeInlined = false;

    // --- No inlining for functions with more than two parameters
    if (this.func.params.length > 2) {
      return;
    }

    // --- No inlining over 32 instructions
    if (countInstructions(this._builder.body) > 80) {
      return;
    }

    // --- No inlining for functions that contain calls to other functions
    if (
      findInstruction(
        this._builder.body,
        (ins) => ins.type === "Call" || ins.type === "CallIndirect"
      )
    ) {
      return;
    }

    // --- No inlining with multiple returns
    let returnCount = 0;
    visitInstructions(this._builder.body, (ins) => {
      if (ins.type === "Return") {
        returnCount++;
      }
    });
    if (returnCount > 1) {
      return;
    }

    // --- Return should be in the main branch of the function
    let mainReturnIndex = -1;
    this._builder.body.forEach((ins, index) => {
      if (ins.type === "Return") {
        mainReturnIndex = index;
      }
    });
    if (returnCount > 0 && mainReturnIndex < 0) {
      return;
    }

    // --- Ok, this function can be inlined, so let's carry out a few trnasforms
    this.func.canBeInlined = true;

    // --- Change the return statement to set_local to store function result
    if (mainReturnIndex >= 0) {
      this._builder.body[mainReturnIndex] = localSet(
        `$${this.func.funcId}$res`
      );
      this.func.hasReturn = true;
    }

    // --- Transform all local names to include the function identifier
    this._builder.locals.forEach((l) => {
      l.id = `$${this.func.funcId}${l.id}`;
    });
    visitInstructions(this._builder.body, (ins) => {
      if (
        ins.type === "LocalGet" ||
        ins.type === "LocalSet" ||
        ins.type === "LocalTee"
      ) {
        ins.id = `$${this.func.funcId}${ins.id}`;
      }
    });
  }

  // ==========================================================================
  // Helpers for locals

  /**
   * Creates a temporary local with the specified type
   * @param type
   */
  private createTempLocal(type: WaType, prefix: string = ""): string {
    const underlying = WaType[type].toString();
    const tmpName = `$tloc$${prefix}${underlying}`;
    if (!this._tempLocals.has(type)) {
      const local = this._builder.addLocal(tmpName, type);
      this.locals.set(tmpName, {
        fromParameter: false,
        name: tmpName,
        waType: type,
        type: <IntrinsicType>{
          type: "Intrinsic",
          underlying,
        },
      });
      this._tempLocals.add(type);
      this.addTrace(() => [
        "local",
        0,
        this.wsCompiler.waTree.renderLocal(local),
      ]);
    }
    return tmpName;
  }

  /**
   * Creates a compile-time local with the specified name and type
   * @param name Local name
   * @param spec Local type specification
   */
  private createCompileTimeLocal(name: string, spec: TypeSpec): void {
    // --- Avoid declaring the same local
    if (this.locals.has(name)) {
      return;
    }

    // --- Add the new local
    const localWaType =
      spec.type === "Pointer"
        ? WaType.i32
        : waTypeMappings[(spec as IntrinsicType).underlying];
    this._builder.addLocal(name, localWaType);
    this.locals.set(name, {
      fromParameter: false,
      name,
      waType: localWaType,
      type: <IntrinsicType>{
        type: "Intrinsic",
        underlying: WaType[localWaType].toString(),
      },
    });
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
    instr: WaInstruction | WaInstruction[],
    body: WaInstruction[]
  ): void {
    if (this._suspendCount > 0) {
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
  fromParameter: boolean;
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
  data?: DataDeclaration;
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
