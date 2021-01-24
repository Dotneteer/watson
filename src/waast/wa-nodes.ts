/**
 * Discriminated union of available WebAssembly node types
 */
export type WaNode = Module | WaModuleField | WaFunctionBody;

export type WaModuleField = WaImportNode | Table | Global | TypeDef | Func;

export type WaFunctionBody = Local | WaInstruction;

export type WaInstruction =
  | ConstVal
  | Unreachable
  | Nop
  | Branch
  | BranchIf
  | BranchTable
  | Return
  | Call
  | CallIndirect
  | Drop
  | Select
  | LocalGet
  | LocalSet
  | LocalTee
  | GlobalGet
  | GlobalSet
  | Load
  | Store
  | MemorySize
  | MemoryGrow
  | Clz
  | Ctz
  | PopCnt
  | Add
  | Sub
  | Mul
  | Div
  | Rem
  | And
  | Xor
  | Or
  | Shl
  | Shr
  | Rotl
  | Rotr
  | Eqz
  | Eq
  | Ne
  | Le
  | Lt
  | Ge
  | Gt
  | Wrap64
  | Extend32
  | Trunc32
  | Trunc64
  | Convert32
  | Convert64
  | Demote64
  | Promote32
  | ReinterpretF32
  | ReinterpretF64
  | ReinterpretI32
  | ReinterpretI64
  | Extend
  | Abs
  | Neg
  | Ceil
  | Floor
  | Trunc
  | Nearest
  | Sqrt
  | Min
  | Max
  | CopySign
  | Block
  | Loop
  | If;

export type WaImportNode = FuncImport;

// ============================================================================
// Fundamental WebAssembly AST types

/**
 * Types in WebAssembly
 */
export enum WaType {
  i32,
  i64,
  f32,
  f64,
}

/**
 * Bit count specification for storage statements
 */
export enum WaBitSpec {
  None,
  Bit8,
  Bit16,
  Bit32,

}

/**
 * The common root of all WebAssembly AST nodes
 */
interface WaNodeBase {
  readonly type: WaNode["type"];
}

/**
 * Export specification
 */
interface WaExport {
  name: string;
}

/**
 * Import specification
 */
interface WaImport {
  readonly name1: string;
  readonly name2: string;
}

/**
 * Represents memory modifier
 */
interface Memory {
  export?: WaExport;
  limit?: number;
}

/**
 * Represents a parameter
 */
export interface WaParameter {
  readonly type: WaType;
  readonly id?: string;
}

/**
 * The base node for all nodes that can be in a function body
 */
export interface WaInstructionBase extends WaNodeBase {
  readonly children: WaInstruction[];
}

// ============================================================================
// Module

/**
 * Webassembly module
 */
export interface Module extends WaNodeBase {
  readonly type: "Module";
  readonly memory: Memory;
  table?: Table;
  fields?: WaModuleField[];
}

/**
 * Webassembly table
 */
export interface Table extends WaNodeBase {
  readonly type: "Table";
  readonly id: string;
  readonly limit: number;
}

/**
 * Mutable global declaration
 */
export interface Global extends WaNodeBase {
  readonly type: "Global";
  readonly id: string;
  readonly valueType?: WaType;
  readonly initialValue?: BigInt;
  readonly exportSpec?: WaExport;
}

/**
 * Type definition
 */
export interface TypeDef extends WaNodeBase {
  readonly type: "TypeDef";
  readonly id: string;
  readonly params: WaParameter[];
  readonly resultType?: WaType;
}

/**
 * WebAssembly function
 */
export interface Func extends WaNodeBase {
  readonly type: "Func";
  readonly id: string;
  readonly params: WaParameter[];
  readonly resultType?: WaType;
  readonly locals?: Local[];
  readonly body: WaInstruction[];
}

// ============================================================================
// Imports

/**
 * Base node for import specifications
 */
interface WaImportSpecification extends WaNodeBase {
  id: string;
  import: WaImport;
}

/**
 * Represents a function import
 */
export interface FuncImport extends WaImportSpecification {
  type: "FuncImport";
  params: WaParameter[];
  resultType?: WaType;
}

// ============================================================================
// Local declarations

/**
 * Local variable of a function
 */
export interface Local extends WaNodeBase {
  type: "Local";
  id: string;
  valueType: WaType;
}

// ============================================================================
// Instructions

/**
 * Const
 */
export interface ConstVal extends WaInstructionBase {
  type: "ConstVal";
  valueType: WaType;
  value: number | BigInt;
}

/**
 * Unreachable
 */
export interface Unreachable extends WaInstructionBase {
  type: "Unreachable";
}

/**
 * Nop
 */
export interface Nop extends WaInstructionBase {
  type: "Nop";
}

/**
 * Branch
 */
export interface Branch extends WaInstructionBase {
  type: "Branch";
  label: string;
}

/**
 * Branch if
 */
export interface BranchIf extends WaInstructionBase {
  type: "BranchIf";
  label: string;
}

/**
 * Branch table
 */
export interface BranchTable extends WaInstructionBase {
  type: "BranchTable";
  caseIds: string[];
  defaultId: string;
}

/**
 * Return
 */
export interface Return extends WaInstructionBase {
  type: "Return";
}

/**
 * Call
 */
export interface Call extends WaInstructionBase {
  type: "Call";
  id: string;
}

/**
 * Call indirect
 */
export interface CallIndirect extends WaInstructionBase {
  type: "CallIndirect";
  id: string;
  typeId: string;
}

/**
 * Drop
 */
export interface Drop extends WaInstructionBase {
  type: "Drop";
}

/**
 * Select
 */
export interface Select extends WaInstructionBase {
  type: "Select";
}

/**
 * Local get
 */
export interface LocalGet extends WaInstructionBase {
  type: "LocalGet";
  id: string;
}

/**
 * Local set
 */
export interface LocalSet extends WaInstructionBase {
  type: "LocalSet";
  id: string;
}

/**
 * Local tee
 */
export interface LocalTee extends WaInstructionBase {
  type: "LocalTee";
  id: string;
}

/**
 * Global get
 */
export interface GlobalGet extends WaInstructionBase {
  type: "GlobalGet";
  id: string;
}

/**
 * Global set
 */
export interface GlobalSet extends WaInstructionBase {
  type: "GlobalSet";
  id: string;
}

/**
 * Load
 */
export interface Load extends WaInstructionBase {
  type: "Load";
  valueType: WaType,
  bits: WaBitSpec;
  offset?: number;
  align?: number;
  signed?: boolean;
}

/**
 * Store
 */
export interface Store extends WaInstructionBase {
  type: "Store";
  valueType: WaType,
  bits: WaBitSpec;
  offset?: number;
  align?: number;
}

/**
 * Memory size
 */
export interface MemorySize extends WaInstructionBase {
  type: "MemorySize";
}

/**
 * Memory grow
 */
export interface MemoryGrow extends WaInstructionBase {
  type: "MemoryGrow";
}

/**
 * Count leading zeros
 */
export interface Clz extends WaInstructionBase {
  type: "Clz";
  valueType: WaType;
}

/**
 * Count trailing zeros
 */
export interface Ctz extends WaInstructionBase {
  type: "Ctz";
  valueType: WaType;
}

/**
 * Integer population count
 */
export interface PopCnt extends WaInstructionBase {
  type: "Clz";
  valueType: WaType;
}

/**
 * Addition
 */
export interface Add extends WaInstructionBase {
  type: "Add";
  valueType: WaType;
}

/**
 * Subtraction
 */
export interface Sub extends WaInstructionBase {
  type: "Sub";
  valueType: WaType;
}

/**
 * Multiplication
 */
export interface Mul extends WaInstructionBase {
  type: "Mul";
  valueType: WaType;
}

/**
 * Division
 */
export interface Div extends WaInstructionBase {
  type: "Div";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Remainder
 */
export interface Rem extends WaInstructionBase {
  type: "Rem";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Bitwise And
 */
export interface And extends WaInstructionBase {
  type: "And";
  valueType: WaType;
}

/**
 * Bitwise Xor
 */
export interface Xor extends WaInstructionBase {
  type: "Xor";
  valueType: WaType;
}

/**
 * Bitwise Or
 */
export interface Or extends WaInstructionBase {
  type: "Or";
  valueType: WaType;
}

/**
 * Shift left
 */
export interface Shl extends WaInstructionBase {
  type: "Shl";
  valueType: WaType;
}

/**
 * Shift right
 */
export interface Shr extends WaInstructionBase {
  type: "Shr";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Rotate left
 */
export interface Rotl extends WaInstructionBase {
  type: "Rotl";
  valueType: WaType;
}

/**
 * Rotate right
 */
export interface Rotr extends WaInstructionBase {
  type: "Rotr";
  valueType: WaType;
}

/**
 * Equal to zero
 */
export interface Eqz extends WaInstructionBase {
  type: "Eqz";
  valueType: WaType;
}

/**
 * Equal
 */
export interface Eq extends WaInstructionBase {
  type: "Eq";
  valueType: WaType;
}

/**
 * Equal
 */
export interface Ne extends WaInstructionBase {
  type: "Ne";
  valueType: WaType;
}

/**
 * Less than or Equal
 */
export interface Le extends WaInstructionBase {
  type: "Le";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Less than
 */
export interface Lt extends WaInstructionBase {
  type: "Lt";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Greater than or Equal
 */
export interface Ge extends WaInstructionBase {
  type: "Ge";
  valueType: WaType;
  signed?: boolean;
}

/**
 * Greater than
 */
export interface Gt extends WaInstructionBase {
  type: "Gt";
  valueType: WaType;
  signed?: boolean;
}

/**
 * i64 to i32
 */
export interface Wrap64 extends WaInstructionBase {
  type: "Wrap64";
  valueType: WaType;
}

/**
 * i32 to i64
 */
export interface Extend32 extends WaInstructionBase {
  type: "Extend64";
  valueType: WaType;
  signed?: boolean;
}

/**
 * f32 to i32/i64
 */
export interface Trunc32 extends WaInstructionBase {
  type: "Trunc32";
  valueType: WaType;
  signed?: boolean;
}

/**
 * f64 to i32/i64
 */
export interface Trunc64 extends WaInstructionBase {
  type: "Trunc64";
  valueType: WaType;
  signed?: boolean;
}

/**
 * i32 to f32/f64
 */
export interface Convert32 extends WaInstructionBase {
  type: "Convert32";
  valueType: WaType;
  signed?: boolean;
}

/**
 * i64 to f32/f64
 */
export interface Convert64 extends WaInstructionBase {
  type: "Convert64";
  valueType: WaType;
  signed?: boolean;
}

/**
 * f64 to f32
 */
export interface Demote64 extends WaInstructionBase {
  type: "Demote64";
}

/**
 * f32 to f64
 */
export interface Promote32 extends WaInstructionBase {
  type: "Promote32";
}

/**
 * Reinterpret f32 as i32
 */
export interface ReinterpretF32 extends WaInstructionBase {
  type: "ReinterpretF32";
}

/**
 * Reinterpret f64 as i64
 */
export interface ReinterpretF64 extends WaInstructionBase {
  type: "ReinterpretF64";
}

/**
 * Reinterpret i32 as f32
 */
export interface ReinterpretI32 extends WaInstructionBase {
  type: "ReinterpretI32";
}

/**
 * Reinterpret i64 as f64
 */
export interface ReinterpretI64 extends WaInstructionBase {
  type: "ReinterpretI64";
}

/**
 * Extend integer
 */
export interface Extend extends WaInstructionBase {
  type: "Extend";
  valueType: WaType;
  bits: WaBitSpec;
  signed?: boolean;
}

/**
 * Abs function
 */
export interface Abs extends WaInstructionBase {
  type: "Abs";
  valueType: WaType;
}

/**
 * Neg function
 */
export interface Neg extends WaInstructionBase {
  type: "Neg";
  valueType: WaType;
}

/**
 * Ceil function
 */
export interface Ceil extends WaInstructionBase {
  type: "Ceil";
  valueType: WaType;
}

/**
 * Floor function
 */
export interface Floor extends WaInstructionBase {
  type: "Floor";
  valueType: WaType;
}

/**
 * Trunc function
 */
export interface Trunc extends WaInstructionBase {
  type: "Trunc";
  valueType: WaType;
}

/**
 * Nearest function
 */
export interface Nearest extends WaInstructionBase {
  type: "Nearest";
  valueType: WaType;
}

/**
 * Sqrt function
 */
export interface Sqrt extends WaInstructionBase {
  type: "Sqrt";
  valueType: WaType;
}

/**
 * Min function
 */
export interface Min extends WaInstructionBase {
  type: "Min";
  valueType: WaType;
}

/**
 * Max function
 */
export interface Max extends WaInstructionBase {
  type: "Max";
  valueType: WaType;
}

/**
 * CopySign function
 */
export interface CopySign extends WaInstructionBase {
  type: "CopySign";
  valueType: WaType;
}

/**
 * CopySign function
 */
export interface CopySign extends WaInstructionBase {
  type: "CopySign";
  valueType: WaType;
}

/**
 * Block instruction
 */
export interface Block extends WaInstructionBase {
  type: "Block";
  id: string;
  resultType?: WaType;
  body: WaInstruction[];
}

/**
 * Loop instruction
 */
export interface Loop extends WaInstructionBase {
  type: "Loop";
  id: string;
  resultType?: WaType;
  body: WaInstruction[];
}

/**
 * If instruction
 */
export interface If extends WaInstructionBase {
  type: "If";
  id: string;
  resultType?: WaType;
  consequtive: WaInstruction[];
  alternate?: WaInstruction[];
}
