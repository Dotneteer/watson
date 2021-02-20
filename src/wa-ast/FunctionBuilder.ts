import {
  Abs,
  Add,
  And,
  Block,
  Branch,
  BranchIf,
  BranchTable,
  Call,
  CallIndirect,
  Ceil,
  Clz,
  Comment,
  ConstVal,
  Convert32,
  Convert64,
  CopySign,
  Ctz,
  Demote64,
  Div,
  Drop,
  Eq,
  Eqz,
  Extend32,
  Floor,
  Func,
  Ge,
  GlobalGet,
  GlobalSet,
  Gt,
  If,
  Le,
  Load,
  Local,
  LocalGet,
  LocalSet,
  LocalTee,
  Loop,
  Lt,
  Max,
  MemoryGrow,
  MemorySize,
  Min,
  Mul,
  Ne,
  Nearest,
  Neg,
  Nop,
  Or,
  Promote32,
  ReinterpretF32,
  ReinterpretF64,
  ReinterpretI32,
  ReinterpretI64,
  Rem,
  Return,
  Rotl,
  Rotr,
  Select,
  Shl,
  Shr,
  Sqrt,
  Store,
  Sub,
  Trunc,
  Trunc32,
  Trunc64,
  Unreachable,
  WaBitSpec,
  WaInstruction,
  WaParameter,
  WaType,
  Wrap64,
  Xor,
} from "./wa-nodes";

/**
 * This class represents a function node that can be used as a builder to
 * inject function body instructions
 */
export class FunctionBuilder implements Func {
  readonly type = "Func";
  readonly body: WaInstruction[];
  readonly locals: Local[];
  constructor(
    public readonly id: string,
    public readonly params: WaParameter[],
    public readonly resultType?: WaType,
    locals?: Local[],
    body?: WaInstruction[]
  ) {
    this.locals = locals ?? [];
    this.body = body ?? [];
  }

  /**
   * Injects the specified instructions to the function body
   * @param instr Instructions to inject
   */
  inject(...instr: WaInstruction[]): this {
    this.body.push(...instr);
    return this;
  }

  /**
   * Adds a local node to the function locals
   * @param id
   * @param valueType Value type of operation
   */
  addLocal(id: string, valueType: WaType): Local {
    const newNode = <Local>{
      type: "Local",
      id,
      valueType,
    };
    this.locals.push(newNode);
    return newNode;
  }
}

/**
 * Factory method for a const WA instrcution
 * @param valueType Value type of operation
 * @param value Constant value
 */
export function constVal(
  valueType: WaType,
  value: number | bigint
): ConstVal {
  return <ConstVal>{
    type: "ConstVal",
    valueType,
    value,
  };
}

/**
 * Factory method for an unreachable WA instruction
 */
export function unreachable(): Unreachable {
  return <Unreachable>{
    type: "Unreachable",
  };
}

/**
 * Factory method for an nop WA instruction
 */
export function nop(): Nop {
  return <Nop>{
    type: "Nop",
  };
}

/**
 * Factory method for a br WA instruction
 * @param label Target label
 */
export function branch(label: string): Branch {
  return <Branch>{
    type: "Branch",
    label,
  };
}

/**
 * Factory method for a br_if WA instruction
 * @param label Target label
 */
export function branchIf(
  label: string,
): BranchIf {
  return <BranchIf>{
    type: "BranchIf",
    label,
  };
}

/**
 * Factory method for a br_table WA instruction
 * @param caseIds Branch IDs
 * @param defaultId Default branch ID
 */
export function branchTable(
  caseIds: string[],
  defaultId: string,
): BranchTable {
  return <BranchTable>{
    type: "BranchTable",
    caseIds,
    defaultId,
  };
}

/**
 * Factory method for a return WA instruction
 */
export function ret(): Return {
  return <Return>{
    type: "Return",
  };
}

/**
 * Factory method for a call WA instruction
 * @param id Function ID
 */
export function call(id: string): Call {
  return <Call>{
    type: "Call",
    id,
  };
}

/**
 * Factory method for a call_indirect WA instruction
 * @param id Function ID
 * @param typeId Function type identifier
 */
export function callIndirect(
  id: string,
  typeId: string,
): CallIndirect {
  return <CallIndirect>{
    type: "CallIndirect",
    id,
    typeId,
  };
}

/**
 * Factory method for a drop WA instruction
 */
export function drop(): Drop {
  return <Drop>{
    type: "Drop",
  };
}

/**
 * Factory method for a select WA instruction
 */
export function select(): Select {
  return <Select>{
    type: "Select",
  };
}

/**
 * Factory method for a local_get WA instruction
 * @param id Identifier
 */
export function localGet(id: string): LocalGet {
  return <LocalGet>{
    type: "LocalGet",
    id,
  };
}

/**
 * Factory method for a local_set WA instruction
 * @param id Identifier
 */
export function localSet(id: string): LocalSet {
  return <LocalSet>{
    type: "LocalSet",
    id,
  };
}

/**
 * Factory method for a local_tee WA instruction
 * @param id Identifier
 */
export function localTee(id: string): LocalTee {
  return <LocalTee>{
    type: "LocalTee",
    id,
  };
}

/**
 * Factory method for a global_get WA instruction
 * @param id Identifier
 */
export function globalGet(id: string): GlobalGet {
  return <GlobalGet>{
    type: "GlobalGet",
    id,
  };
}

/**
 * Factory method for a global_set WA instruction
 * @param id Identifier
 */
export function globalSet(id: string): GlobalSet {
  return <GlobalSet>{
    type: "GlobalSet",
    id,
  };
}

/**
 * Factory method for a load WA instruction
 * @param valueType Value type of operation
 * @param bits Bit specification
 * @param offset Optional offset
 * @param align Optional alignment
 * @param signed Signed operation?
 */
export function load(
  valueType: WaType,
  bits: WaBitSpec = WaBitSpec.None,
  offset: number = 0,
  align: number = 0,
  signed = false,
): Load {
  // --- Check input consistency
  if (
    (valueType === WaType.f32 || valueType === WaType.f64) &&
    bits !== WaBitSpec.None
  ) {
    throw new Error(
      "Cannot use floating-point load instruction with bit-width specification"
    );
  } else if (valueType === WaType.i32 && bits === WaBitSpec.Bit32) {
    bits = WaBitSpec.None;
  }
  return <Load>{
    type: "Load",
    valueType,
    bits,
    offset,
    align,
    signed,
  };
}

/**
 * Factory method for a load WA instruction
 * @param valueType Value type of operation
 * @param bits Bit specification
 * @param offset Optional offset
 * @param align Optional alignment
 */
export function store(
  valueType: WaType,
  bits: WaBitSpec = WaBitSpec.None,
  offset: number = 0,
  align: number = 0,
): Store {
  // --- Check input consistency
  if (
    (valueType === WaType.f32 || valueType === WaType.f64) &&
    bits !== WaBitSpec.None
  ) {
    throw new Error(
      "Cannot use floating-point store instruction with bit-width specification"
    );
  } else if (valueType === WaType.i32 && bits === WaBitSpec.Bit32) {
    bits = WaBitSpec.None;
  }
  return <Store>{
    type: "Store",
    valueType,
    bits,
    offset,
    align,
  };
}

/**
 * Factory method for a memory.size WA instruction
 */
export function memSize(): MemorySize {
  return <MemorySize>{
    type: "MemorySize",
  };
}

/**
 * Factory method for a memory.grow WA instruction
 */
export function memGrow(): MemoryGrow {
  return <MemoryGrow>{
    type: "MemoryGrow",
  };
}

/**
 * Factory method for a clz WA instruction
 * @param valueType Value type of operation
 */
export function clz(valueType: WaType): Clz {
  checkInteger(valueType, "clz");
  return <Clz>{
    type: "Clz",
    valueType,
  };
}

/**
 * Factory method for a ctz WA instruction
 * @param valueType Value type of operation
 */
export function ctz(valueType: WaType): Ctz {
  checkInteger(valueType, "ctz");
  return <Ctz>{
    type: "Ctz",
    valueType,
  };
}

/**
 * Factory method for an add WA instruction
 * @param valueType Value type of operation
 */
export function add(valueType: WaType): Add {
  return <Add>{
    type: "Add",
    valueType,
  };
}

/**
 * Factory method for a sub WA instruction
 * @param valueType Value type of operation
 */
export function sub(valueType: WaType): Sub {
  return <Sub>{
    type: "Sub",
    valueType,
  };
}

/**
 * Factory method for a mul WA instruction
 * @param valueType Value type of operation
 */
export function mul(valueType: WaType): Mul {
  return <Mul>{
    type: "Mul",
    valueType,
  };
}

/**
 * Factory method for a div WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function div(
  valueType: WaType,
  signed?: boolean,
): Div {
  return <Div>{
    type: "Div",
    valueType,
    signed,
  };
}

/**
 * Factory method for a rem WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function rem(
  valueType: WaType,
  signed?: boolean,
): Rem {
  return <Rem>{
    type: "Rem",
    valueType,
    signed,
  };
}

/**
 * Factory method for an and WA instruction
 * @param valueType Value type of operation
 */
export function and(valueType: WaType): And {
  checkInteger(valueType, "and");
  return <And>{
    type: "And",
    valueType,
  };
}

/**
 * Factory method for an xor WA instruction
 * @param valueType Value type of operation
 */
export function xor(valueType: WaType): Xor {
  checkInteger(valueType, "xor");
  return <Xor>{
    type: "Xor",
    valueType,
  };
}

/**
 * Factory method for an or WA instruction
 * @param valueType Value type of operation
 */
export function or(valueType: WaType): Or {
  checkInteger(valueType, "or");
  return <Or>{
    type: "Or",
    valueType,
  };
}

/**
 * Factory method for a shl WA instruction
 * @param valueType Value type of operation
 */
export function shl(valueType: WaType): Shl {
  checkInteger(valueType, "shl");
  return <Shl>{
    type: "Shl",
    valueType,
  };
}

/**
 * Factory method for a shr WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function shr(
  valueType: WaType,
  signed?: boolean,
): Shr {
  checkInteger(valueType, "shr");
  return <Shr>{
    type: "Shr",
    valueType,
    signed,
  };
}

/**
 * Factory method for a rotl WA instruction
 * @param valueType Value type of operation
 */
export function rotl(valueType: WaType): Rotl {
  checkInteger(valueType, "rotl");
  return <Rotl>{
    type: "Rotl",
    valueType,
  };
}

/**
 * Factory method for a rotr WA instruction
 * @param valueType Value type of operation
 */
export function rotr(valueType: WaType): Rotr {
  checkInteger(valueType, "rotr");
  return <Rotr>{
    type: "Rotr",
    valueType,
  };
}

/**
 * Factory method for an eqz WA instruction
 * @param valueType Value type of operation
 */
export function eqz(valueType: WaType): Eqz {
  checkInteger(valueType, "eqz");
  return <Eqz>{
    type: "Eqz",
    valueType,
  };
}

/**
 * Factory method for an eq WA instruction
 * @param valueType Value type of operation
 */
export function eq(valueType: WaType): Eq {
  checkInteger(valueType, "eq");
  return <Eq>{
    type: "Eq",
    valueType,
  };
}

/**
 * Factory method for an ne WA instruction
 * @param valueType Value type of operation
 */
export function ne(valueType: WaType): Ne {
  checkInteger(valueType, "ne");
  return <Ne>{
    type: "Ne",
    valueType,
  };
}

/**
 * Factory method for a le WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function le(
  valueType: WaType,
  signed?: boolean,
): Le {
  return <Le>{
    type: "Le",
    valueType,
    signed,
  };
}

/**
 * Factory method for a lt WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function lt(
  valueType: WaType,
  signed?: boolean,
): Lt {
  return <Lt>{
    type: "Lt",
    valueType,
    signed,
  };
}

/**
 * Factory method for a ge WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function ge(
  valueType: WaType,
  signed?: boolean,
): Ge {
  return <Ge>{
    type: "Ge",
    valueType,
    signed,
  };
}

/**
 * Factory method for a ge WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function gt(
  valueType: WaType,
  signed?: boolean,
): Gt {
  return <Gt>{
    type: "Gt",
    valueType,
    signed,
  };
}

/**
 * Factory method for an i32.wrap_i64 WA instruction
 */
export function wrap64(): Wrap64 {
  return <Wrap64>{
    type: "Wrap64"
  };
}

/**
 * Factory method for an extend32 WA instruction
 * @param signed Signed operation?
 */
export function extend32(
  signed?: boolean,
): Extend32 {
  return <Extend32>{
    type: "Extend32",
    signed,
  };
}

/**
 * Factory method for an i32.trunc WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function trunc32(
  valueType: WaType,
  signed?: boolean,
): Trunc32 {
  checkFloat(valueType, "trunc32");
  return <Trunc32>{
    type: "Trunc32",
    valueType,
    signed,
  };
}

/**
 * Factory method for an i64.trunc WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function trunc64(
  valueType: WaType,
  signed?: boolean,
): Trunc64 {
  checkFloat(valueType, "trunc64");
  return <Trunc64>{
    type: "Trunc64",
    valueType,
    signed,
  };
}

/**
 * Factory method for an f32.convert WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function convert32(
  valueType: WaType,
  signed?: boolean,
): Convert32 {
  checkInteger(valueType, "convert32");
  return <Convert32>{
    type: "Convert32",
    valueType,
    signed,
  };
}

/**
 * Factory method for an f64.convert WA instruction
 * @param valueType Value type of operation
 * @param signed Signed operation?
 */
export function convert64(
  valueType: WaType,
  signed?: boolean,
): Convert64 {
  checkInteger(valueType, "convert64");
  return <Convert64>{
    type: "Convert64",
    valueType,
    signed,
  };
}

/**
 * Factory method for an f64.demote WA instruction
 */
export function demote64(): Demote64 {
  return <Demote64>{
    type: "Demote64",
  };
}

/**
 * Factory method for an f32.promote WA instruction
 */
export function promote32(): Promote32 {
  return <Promote32>{
    type: "Promote32",
  };
}

/**
 * Factory method for an i32.reinterpret WA instruction
 */
export function reinterpretF32(): ReinterpretF32 {
  return <ReinterpretF32>{
    type: "ReinterpretF32",
  };
}

/**
 * Factory method for an i64.reinterpret WA instruction
 */
export function reinterpretF64(): ReinterpretF64 {
  return <ReinterpretF64>{
    type: "ReinterpretF64",
  };
}

/**
 * Factory method for an f32.reinterpret WA instruction
 */
export function reinterpretI32(): ReinterpretI32 {
  return <ReinterpretI32>{
    type: "ReinterpretI32",
  };
}

/**
 * Factory method for an f64.reinterpret WA instruction
 */
export function reinterpretI64(): ReinterpretI64 {
  return <ReinterpretI64>{
    type: "ReinterpretI64",
  };
}

/**
 * Factory method for an abs WA instruction
 * @param valueType Value type of operation
 */
export function abs(valueType: WaType): Abs {
  checkFloat(valueType, "abs");
  return <Abs>{
    type: "Abs",
    valueType,
  };
}

/**
 * Factory method for a neg WA instruction
 * @param valueType Value type of operation
 */
export function neg(valueType: WaType): Neg {
  checkFloat(valueType, "neg");
  return <Neg>{
    type: "Neg",
    valueType,
  };
}

/**
 * Factory method for a ceil WA instruction
 * @param valueType Value type of operation
 */
export function ceil(valueType: WaType): Ceil {
  checkFloat(valueType, "ceil");
  return <Ceil>{
    type: "Ceil",
    valueType,
  };
}

/**
 * Factory method for a floor WA instruction
 * @param valueType Value type of operation
 */
export function floor(valueType: WaType): Floor {
  checkFloat(valueType, "floor");
  return <Floor>{
    type: "Floor",
    valueType,
  };
}

/**
 * Factory method for a trunc WA instruction
 * @param valueType Value type of operation
 */
export function trunc(valueType: WaType): Trunc {
  checkFloat(valueType, "trunc");
  return <Trunc>{
    type: "Trunc",
    valueType,
  };
}

/**
 * Factory method for a nearest WA instruction
 * @param valueType Value type of operation
 */
export function nearest(
  valueType: WaType,
): Nearest {
  checkFloat(valueType, "nearest");
  return <Nearest>{
    type: "Nearest",
    valueType,
  };
}

/**
 * Factory method for an sqrt WA instruction
 * @param valueType Value type of operation
 */
export function sqrt(valueType: WaType): Sqrt {
  checkFloat(valueType, "sqrt");
  return <Sqrt>{
    type: "Sqrt",
    valueType,
  };
}

/**
 * Factory method for a min WA instruction
 * @param valueType Value type of operation
 */
export function min(valueType: WaType): Min {
  checkFloat(valueType, "min");
  return <Min>{
    type: "Min",
    valueType,
  };
}

/**
 * Factory method for a max WA instruction
 * @param valueType Value type of operation
 */
export function max(valueType: WaType): Max {
  checkFloat(valueType, "max");
  return <Max>{
    type: "Max",
    valueType,
  };
}

/**
 * Factory method for a copysign WA instruction
 * @param valueType Value type of operation
 */
export function copysign(
  valueType: WaType,
): CopySign {
  checkFloat(valueType, "copysign");
  return <CopySign>{
    type: "CopySign",
    valueType,
  };
}

/**
 * Factory method for a block WA instruction
 * @param id Block identifier
 * @param body Block body
 * @param resultType Type of optional block result
 */
export function block(
  id: string,
  body: WaInstruction[],
  resultType?: WaType
): Block {
  return <Block>{
    type: "Block",
    id,
    body,
    resultType,
  };
}

/**
 * Factory method for a loop WA instruction
 * @param id Loop identifier
 * @param body Loop body
 * @param resultType Type of optional loop result
 */
export function loop(
  id: string,
  body: WaInstruction[],
  resultType?: WaType
): Loop {
  return <Loop>{
    type: "Loop",
    id,
    body,
    resultType,
  };
}

/**
 * Factory method for an if WA instruction
 * @param consequtive Consequtive branch body
 * @param alternate Alternate branch body
 * @param resultType Type of optional result
 */
export function ifBlock(
  consequtive: WaInstruction[],
  alternate?: WaInstruction[],
  resultType?: WaType
): If {
  return <If>{
    type: "If",
    consequtive,
    alternate,
    resultType,
  };
}

/**
 * Factory method for a WA comment
 * @param text Comment text
 * @param isBlock Block comment?
 */
export function comment(text: string, isBlock?: boolean): Comment {
  return <Comment>{
    type: "Comment",
    text,
    isBlock,
  };
}

// ============================================================================
// Helpers

function checkInteger(type: WaType, op: string): void {
  if (type !== WaType.i32 && type !== WaType.i64) {
    throw new Error(`Only i32 and i64 accepted for ${op}`);
  }
}

function checkFloat(type: WaType, op: string): void {
  if (type !== WaType.f32 && type !== WaType.f64) {
    throw new Error(`Only f32 and f64 accepted for ${op}`);
  }
}
