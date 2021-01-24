import {
  Add,
  And,
  Branch,
  BranchIf,
  BranchTable,
  Call,
  CallIndirect,
  Clz,
  ConstVal,
  Ctz,
  Div,
  Drop,
  Eq,
  Eqz,
  Func,
  Ge,
  GlobalGet,
  GlobalSet,
  Gt,
  Le,
  Load,
  Local,
  LocalGet,
  LocalSet,
  LocalTee,
  Lt,
  MemoryGrow,
  MemorySize,
  Mul,
  Ne,
  Nop,
  Or,
  Rem,
  Return,
  Rotl,
  Rotr,
  Select,
  Shl,
  Shr,
  Store,
  Sub,
  Unreachable,
  WaBitSpec,
  WaInstruction,
  WaParameter,
  WaType,
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
   * @param valueType
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
 * @param valueType Type of constant
 * @param value Constant value
 * @param children Optional child nodes
 */
export function constVal(
  valueType: WaType,
  value: number | BigInt,
  ...children: WaInstruction[]
): ConstVal {
  return <ConstVal>{
    type: "ConstVal",
    valueType,
    value,
    children,
  };
}

/**
 * Factory method for an unreachable WA instruction
 * @param children Optional child nodes
 */
export function unreachable(...children: WaInstruction[]): Unreachable {
  return <Unreachable>{
    type: "Unreachable",
    children,
  };
}

/**
 * Factory method for an nop WA instruction
 * @param children Optional child nodes
 */
export function nop(...children: WaInstruction[]): Nop {
  return <Nop>{
    type: "Nop",
    children,
  };
}

/**
 * Factory method for a br WA instruction
 * @param label Target label
 * @param children Optional child nodes
 */
export function branch(label: string, ...children: WaInstruction[]): Branch {
  return <Branch>{
    type: "Branch",
    label,
    children,
  };
}

/**
 * Factory method for a br_if WA instruction
 * @param label Target label
 * @param children Optional child nodes
 */
export function branchIf(
  label: string,
  ...children: WaInstruction[]
): BranchIf {
  return <BranchIf>{
    type: "BranchIf",
    label,
    children,
  };
}

/**
 * Factory method for a br_table WA instruction
 * @param caseIds Branch IDs
 * @param defaultId Default branch ID
 * @param children Optional child nodes
 */
export function branchTable(
  caseIds: string[],
  defaultId: string,
  ...children: WaInstruction[]
): BranchTable {
  return <BranchTable>{
    type: "BranchTable",
    caseIds,
    defaultId,
    children,
  };
}

/**
 * Factory method for a return WA instruction
 * @param children Optional child nodes
 */
export function ret(...children: WaInstruction[]): Return {
  return <Return>{
    type: "Return",
    children,
  };
}

/**
 * Factory method for a call WA instruction
 * @param id Function ID
 * @param children Optional child nodes
 */
export function call(id: string, ...children: WaInstruction[]): Call {
  return <Call>{
    type: "Call",
    id,
    children,
  };
}

/**
 * Factory method for a call_indirect WA instruction
 * @param id Function ID
 * @param typeId Function type identifier
 * @param children Optional child nodes
 */
export function callIndirect(
  id: string,
  typeId: string,
  ...children: WaInstruction[]
): CallIndirect {
  return <CallIndirect>{
    type: "CallIndirect",
    id,
    typeId,
    children,
  };
}

/**
 * Factory method for a drop WA instruction
 * @param children Optional child nodes
 */
export function drop(...children: WaInstruction[]): Drop {
  return <Drop>{
    type: "Drop",
    children,
  };
}

/**
 * Factory method for a select WA instruction
 * @param children Optional child nodes
 */
export function select(...children: WaInstruction[]): Select {
  return <Select>{
    type: "Select",
    children,
  };
}

/**
 * Factory method for a local_get WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function localGet(id: string, ...children: WaInstruction[]): LocalGet {
  return <LocalGet>{
    type: "LocalGet",
    id,
    children,
  };
}

/**
 * Factory method for a local_set WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function localSet(id: string, ...children: WaInstruction[]): LocalSet {
  return <LocalSet>{
    type: "LocalSet",
    id,
    children,
  };
}

/**
 * Factory method for a local_tee WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function localTee(id: string, ...children: WaInstruction[]): LocalTee {
  return <LocalTee>{
    type: "LocalTee",
    id,
    children,
  };
}

/**
 * Factory method for a global_get WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function globalGet(id: string, ...children: WaInstruction[]): GlobalGet {
  return <GlobalGet>{
    type: "GlobalGet",
    id,
    children,
  };
}

/**
 * Factory method for a global_set WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function globalSet(id: string, ...children: WaInstruction[]): GlobalSet {
  return <GlobalSet>{
    type: "GlobalSet",
    id,
    children,
  };
}

/**
 * Factory method for a load WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function load(
  valueType: WaType,
  bits: WaBitSpec = WaBitSpec.None,
  offset: number = 0,
  align: number = 0,
  signed = false,
  ...children: WaInstruction[]
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
    children,
  };
}

/**
 * Factory method for a load WA instruction
 * @param id Identifier
 * @param children Optional child nodes
 */
export function store(
  valueType: WaType,
  bits: WaBitSpec = WaBitSpec.None,
  offset: number = 0,
  align: number = 0,
  ...children: WaInstruction[]
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
    children,
  };
}

/**
 * Factory method for a memory.size WA instruction
 * @param children Optional child nodes
 */
export function memSize(...children: WaInstruction[]): MemorySize {
  return <MemorySize>{
    type: "MemorySize",
    children,
  };
}

/**
 * Factory method for a memory.grow WA instruction
 * @param children Optional child nodes
 */
export function memGrow(...children: WaInstruction[]): MemoryGrow {
  return <MemoryGrow>{
    type: "MemoryGrow",
    children,
  };
}

/**
 * Factory method for a clz WA instruction
 * @param children Optional child nodes
 */
export function clz(valueType: WaType, ...children: WaInstruction[]): Clz {
  checkInteger(valueType, "clz");
  return <Clz>{
    type: "Clz",
    valueType,
    children,
  };
}

/**
 * Factory method for a ctz WA instruction
 * @param children Optional child nodes
 */
export function ctz(valueType: WaType, ...children: WaInstruction[]): Ctz {
  checkInteger(valueType, "ctz");
  return <Ctz>{
    type: "Ctz",
    valueType,
    children,
  };
}

/**
 * Factory method for an add WA instruction
 * @param children Optional child nodes
 */
export function add(valueType: WaType, ...children: WaInstruction[]): Add {
  return <Add>{
    type: "Add",
    valueType,
    children,
  };
}

/**
 * Factory method for a sub WA instruction
 * @param children Optional child nodes
 */
export function sub(valueType: WaType, ...children: WaInstruction[]): Sub {
  return <Sub>{
    type: "Sub",
    valueType,
    children,
  };
}

/**
 * Factory method for a mul WA instruction
 * @param children Optional child nodes
 */
export function mul(valueType: WaType, ...children: WaInstruction[]): Mul {
  return <Mul>{
    type: "Mul",
    valueType,
    children,
  };
}

/**
 * Factory method for a div WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function div(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Div {
  return <Div>{
    type: "Div",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for a rem WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function rem(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Rem {
  return <Rem>{
    type: "Rem",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for an and WA instruction
 * @param children Optional child nodes
 */
export function and(valueType: WaType, ...children: WaInstruction[]): And {
  checkInteger(valueType, "and");
  return <And>{
    type: "And",
    valueType,
    children,
  };
}

/**
 * Factory method for an xor WA instruction
 * @param children Optional child nodes
 */
export function xor(valueType: WaType, ...children: WaInstruction[]): Xor {
  checkInteger(valueType, "xor");
  return <Xor>{
    type: "Xor",
    valueType,
    children,
  };
}

/**
 * Factory method for an or WA instruction
 * @param children Optional child nodes
 */
export function or(valueType: WaType, ...children: WaInstruction[]): Or {
  checkInteger(valueType, "or");
  return <Or>{
    type: "Or",
    valueType,
    children,
  };
}

/**
 * Factory method for a shl WA instruction
 * @param children Optional child nodes
 */
export function shl(valueType: WaType, ...children: WaInstruction[]): Shl {
  checkInteger(valueType, "shl");
  return <Shl>{
    type: "Shl",
    valueType,
    children,
  };
}

/**
 * Factory method for a shr WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function shr(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Shr {
  checkInteger(valueType, "shr");
  return <Shr>{
    type: "Shr",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for a rotl WA instruction
 * @param children Optional child nodes
 */
export function rotl(valueType: WaType, ...children: WaInstruction[]): Rotl {
  checkInteger(valueType, "rotl");
  return <Rotl>{
    type: "Rotl",
    valueType,
    children,
  };
}

/**
 * Factory method for a rotr WA instruction
 * @param children Optional child nodes
 */
export function rotr(valueType: WaType, ...children: WaInstruction[]): Rotr {
  checkInteger(valueType, "rotr");
  return <Rotr>{
    type: "Rotr",
    valueType,
    children,
  };
}

/**
 * Factory method for an eqz WA instruction
 * @param children Optional child nodes
 */
export function eqz(valueType: WaType, ...children: WaInstruction[]): Eqz {
  checkInteger(valueType, "eqz");
  return <Eqz>{
    type: "Eqz",
    valueType,
    children,
  };
}

/**
 * Factory method for an eq WA instruction
 * @param children Optional child nodes
 */
export function eq(valueType: WaType, ...children: WaInstruction[]): Eq {
  checkInteger(valueType, "eq");
  return <Eq>{
    type: "Eq",
    valueType,
    children,
  };
}

/**
 * Factory method for an ne WA instruction
 * @param children Optional child nodes
 */
export function ne(valueType: WaType, ...children: WaInstruction[]): Ne {
  checkInteger(valueType, "ne");
  return <Ne>{
    type: "Ne",
    valueType,
    children,
  };
}

/**
 * Factory method for a le WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function le(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Le {
  return <Le>{
    type: "Le",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for a lt WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function lt(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Lt {
  return <Lt>{
    type: "Lt",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for a ge WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function ge(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Ge {
  return <Ge>{
    type: "Ge",
    valueType,
    signed,
    children,
  };
}

/**
 * Factory method for a ge WA instruction
 * @param children Optional child nodes
 * @param signed Use signed operation?
 */
export function gt(
  valueType: WaType,
  signed?: boolean,
  ...children: WaInstruction[]
): Gt {
  return <Gt>{
    type: "Gt",
    valueType,
    signed,
    children,
  };
}

// ============================================================================
// Helpers

function checkInteger(type: WaType, op: string): void {
  if (type !== WaType.i32 && type !== WaType.i64) {
    throw new Error(`Only i32 and i64 accepted for ${op}`);
  }
}
