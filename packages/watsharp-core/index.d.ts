/**
 * Describes the structure of error messages
 */
export interface ParserErrorMessage {
  code: ErrorCodes;
  text: string;
  position: number;
  line: number;
  column: number;
}
export declare type ErrorCodes = "P001" | "P002" | "P003" | "P004" | "P005" | "P006" | "P007" | "P008" | "P009" | "P010" | "P011" | "P012" | "P013" | "P014" | "P015" | "P016" | "W001" | "W002" | "W003" | "W004" | "W005" | "W006" | "W007" | "W008" | "W009" | "W010" | "W011" | "W012" | "W013" | "W014" | "W015" | "W016" | "W017" | "W018" | "W019" | "W020" | "W021" | "W022" | "W023" | "W024" | "W025" | "W100" | "W101" | "W102" | "W103" | "W104" | "W105" | "W106" | "W107" | "W108" | "W109" | "W110" | "W111" | "W112" | "W140" | "W141" | "W142" | "W143" | "W144" | "W145" | "W146" | "W147" | "W148" | "W149" | "W150" | "W151" | "W152" | "W153" | "W154" | "W155" | "W156" | "W157" | "W158" | "W159" | "W160" | "W161" | "W162" | "W163" | "W164" | "W165" | "W166" | "W167" | "W168";
/**
 * Result of an include handler
 */
export interface IncludeHandlerResult {
  /**
   * Include source to process
   */
  source: string;
  /**
   * File index information to store
   */
  fileIndex: number;
}
/**
 * This type represents the discriminated union of all WAT# source tree
 * node types
 */
export declare type Node = TypeSpec | Expression | Declaration | FunctionParameter | Statement;
/**
 * This class represents the root class of all source tree nodes
 */
export interface BaseNode {
  /**
   * Node type discriminator
   */
  type: Node["type"];
  /**
   * Start position (inclusive) of the node
   */
  startPosition: number;
  /**
   * End position (exclusive)
   */
  endPosition: number;
  /**
   * Start line number of the start token of the node
   */
  startLine: number;
  /**
   * End line number of the end token of the node
   */
  endLine: number;
  /**
   * Start column number (inclusive) of the node
   */
  startColumn: number;
  /**
   * End column number (exclusive) of the node
   */
  endColumn: number;
}
/**
 * Discriminated unions of type specifications
 */
export declare type TypeSpec = VoidType | IntrinsicType | PointerType | ArrayType | StructType | StructField | NamedType;
/**
 * Type identifiers for intrinsic types
 */
export declare type Intrinsics = "i8" | "u8" | "i16" | "u16" | "i32" | "u32" | "i64" | "u64" | "f32" | "f64";
export interface TypeSpecBase extends BaseNode {
  resolved?: boolean;
  flattened?: boolean;
  sizeof?: number;
}
/**
 * Represents a void function result type
 */
export interface VoidType extends TypeSpecBase {
  type: "Void";
}
/**
 * Instrinsic type specification
 */
export interface IntrinsicType extends TypeSpecBase {
  type: "Intrinsic";
  underlying: Intrinsics;
}
/**
 * Pointer type specification
 */
export interface PointerType extends TypeSpecBase {
  type: "Pointer";
  spec: TypeSpec;
}
/**
 * Array type specification
 */
export interface ArrayType extends TypeSpecBase {
  type: "Array";
  spec: TypeSpec;
  size: Expression;
}
/**
 * Struct type specification
 */
export interface StructType extends TypeSpecBase {
  type: "Struct";
  fields: StructField[];
}
/**
 * Describes a structure field
 */
export interface StructField extends TypeSpecBase {
  type: "StructField";
  id: string;
  spec: TypeSpec;
  offset?: number;
}
/**
 * Unresolved type specification
 */
export interface NamedType extends TypeSpecBase {
  type: "NamedType";
  name: string;
}
/**
 * All syntax nodes that represent an expression
 */
export declare type Expression = DereferenceExpression | UnaryExpression | BinaryExpression | ConditionalExpression | SizeOfExpression | BuiltInFunctionInvocationExpression | TypeCastExpression | FunctionInvocationExpression | MemberAccessExpression | ItemAccessExpression | Identifier | Literal;
/**
 * Common base node for all expression syntax nodes
 */
export interface ExpressionBase extends BaseNode {
  /**
   * The value of the expression. If defined, the expression has
   * been evaluated; otherwise, not
   */
  value?: number | bigint;
}
/**
 * Symbols that can be unary operators
 */
export declare type UnaryOpSymbols = "+" | "-" | "~" | "!" | "&";
/**
 * Symbols that can be unary operators
 */
export declare type BinaryOpSymbols = "*" | "/" | "%" | "+" | "-" | "<<" | ">>" | ">>>" | "<" | "<=" | ">" | ">=" | "==" | "!=" | "&" | "|" | "^";
/**
 * Built-in function names
 */
export declare type BuiltInFunctionNames = "clz" | "ctz" | "popcnt" | "abs" | "ceil" | "floor" | "trunc" | "nearest" | "sqrt" | "min" | "max" | "neg" | "copysign";
/**
 * Represents a dereference expression
 */
export interface DereferenceExpression extends ExpressionBase {
  type: "DereferenceExpression";
  operand: Expression;
}
/**
 * Represents an unary expression
 */
export interface UnaryExpression extends ExpressionBase {
  type: "UnaryExpression";
  operator: UnaryOpSymbols;
  operand: Expression;
}
/**
 * Represents a binary expression
 */
export interface BinaryExpression extends ExpressionBase {
  type: "BinaryExpression";
  operator: BinaryOpSymbols;
  left: Expression;
  right: Expression;
}
/**
 * Represents a ternary conditional expression
 */
export interface ConditionalExpression extends ExpressionBase {
  type: "ConditionalExpression";
  condition: Expression;
  consequent: Expression;
  alternate: Expression;
}
/**
 * Represents a "sizeof" expression
 */
export interface SizeOfExpression extends ExpressionBase {
  type: "SizeOfExpression";
  spec: TypeSpec;
}
/**
 * Represents a built-in function invocation expression
 */
export interface BuiltInFunctionInvocationExpression extends ExpressionBase {
  type: "BuiltInFunctionInvocation";
  name: BuiltInFunctionNames;
  arguments: Expression[];
}
/**
 * Represents a type cast expression
 */
export interface TypeCastExpression extends ExpressionBase {
  type: "TypeCast";
  name: string;
  operand: Expression;
}
/**
 * Represents a built-in function invocation expression
 */
export interface FunctionInvocationExpression extends ExpressionBase {
  type: "FunctionInvocation";
  name: string;
  arguments: Expression[];
  dispatcher?: Expression;
}
/**
 * Represents a member access expression
 */
export interface MemberAccessExpression extends ExpressionBase {
  type: "MemberAccess";
  object: Expression;
  member: string;
}
/**
 * Represents an item access expression
 */
export interface ItemAccessExpression extends ExpressionBase {
  type: "ItemAccess";
  array: Expression;
  index: Expression;
}
/**
 * Represents an identifier
 */
export interface Identifier extends ExpressionBase {
  type: "Identifier";
  name: string;
}
/**
 * Represents a literal
 */
export interface Literal extends ExpressionBase {
  type: "Literal";
  value: number | bigint;
  source: LiteralSource;
}
declare enum LiteralSource {
  Int = 0,
  BigInt = 1,
  Real = 2,
}
export declare type Declaration = ConstDeclaration | GlobalDeclaration | TypeDeclaration | TableDeclaration | DataDeclaration | VariableDeclaration | ImportedFunctionDeclaration | FunctionDeclaration;
/**
 * Represents the base information for all declaration
 */
export interface DeclarationBase extends BaseNode {
  name: string;
  order?: number;
  resolved?: boolean;
}
/**
 * Constant declaration
 */
export interface ConstDeclaration extends DeclarationBase {
  type: "ConstDeclaration";
  underlyingType: Intrinsics;
  expr: Expression;
  value?: number | bigint;
}
/**
 * Global declaration
 */
export interface GlobalDeclaration extends DeclarationBase {
  type: "GlobalDeclaration";
  underlyingType: Intrinsics;
  initExpr?: Expression;
}
/**
 * Type declaration
 */
export interface TypeDeclaration extends DeclarationBase {
  type: "TypeDeclaration";
  spec: TypeSpec;
}
/**
 * Table declaration
 */
export interface TableDeclaration extends DeclarationBase {
  type: "TableDeclaration";
  ids: string[];
  resultType?: IntrinsicType;
  params: FunctionParameter[];
  entryIndex?: number;
}
/**
 * Data declaration
 */
export interface DataDeclaration extends DeclarationBase {
  type: "DataDeclaration";
  underlyingType?: Intrinsics;
  exprs: Expression[];
}
/**
 * Variable declaration
 */
export interface VariableDeclaration extends DeclarationBase {
  type: "VariableDeclaration";
  spec: TypeSpec;
  addressAlias?: Identifier;
  address?: number;
}
/**
 * Imported function declaration
 */
export interface ImportedFunctionDeclaration extends DeclarationBase {
  type: "ImportedFunctionDeclaration";
  name1: string;
  name2: string;
  resultType?: IntrinsicType;
  parSpecs: IntrinsicType[];
}
/**
 * Function declaration
 */
export interface FunctionDeclaration extends DeclarationBase {
  type: "FunctionDeclaration";
  funcId: number;
  resultType?: IntrinsicType | PointerType;
  params: FunctionParameter[];
  isExport?: boolean;
  isInline?: boolean;
  body: Statement[];
  canBeInlined?: boolean;
  hasReturn?: boolean;
  invocationCount?: number;
}
/**
 * Describes a function parameter field
 */
export interface FunctionParameter extends BaseNode {
  type: "FunctionParameter";
  name: string;
  spec: TypeSpec;
}
/**
 * Discriminated unions of WAT# statements
 */
export declare type Statement = Assignment | LocalVariable | LocalFunctionInvocation | IfStatement | WhileStatement | DoStatement | BreakStatement | ContinueStatement | ReturnStatement;
/**
 * Symbols that can be unary operators
 */
export declare type AssignmentSymbols = "=" | "*=" | "/=" | "%=" | "+=" | "-=" | "<<=" | ">>=" | ">>>=" | "&=" | "|=" | "^=" | ":=";
/**
 * Base class of statement nodes
 */
export interface StatementBase extends BaseNode {}
/**
 * Local variable statement
 */
export interface LocalVariable extends StatementBase {
  type: "LocalVariable";
  spec: TypeSpec;
  name: string;
  initExpr?: Expression;
}
/**
 * Assignment statement
 */
export interface Assignment extends StatementBase {
  type: "Assignment";
  lval: Expression;
  asgn: AssignmentSymbols;
  expr: Expression;
}
/**
 * Local function invocation
 */
export interface LocalFunctionInvocation extends StatementBase {
  type: "LocalFunctionInvocation";
  invoked: FunctionInvocationExpression;
}
/**
 * If statement
 */
export interface IfStatement extends StatementBase {
  type: "If";
  test: Expression;
  consequent: Statement[];
  alternate?: Statement[];
}
/**
 * Do-while statement
 */
export interface WhileStatement extends StatementBase {
  type: "While";
  loopBody: Statement[];
  test: Expression;
}
/**
 * Do statement
 */
export interface DoStatement extends StatementBase {
  type: "Do";
  loopBody: Statement[];
  test: Expression;
}
/**
 * Break statement
 */
export interface BreakStatement extends StatementBase {
  type: "Break";
}
/**
 * Continue statement
 */
export interface ContinueStatement extends StatementBase {
  type: "Continue";
}
/**
 * Break statement
 */
export interface ReturnStatement extends StatementBase {
  type: "Return";
  expr?: Expression;
}
/**
 * Represents the location of a token
 */
export interface TokenLocation {
  /**
   * The index of file in which token can be found
   */
  readonly fileIndex: number;
  /**
   * Start position in the source stream
   */
  readonly startPosition: number;
  /**
   * End position (exclusive) in the source stream
   */
  readonly endPosition: number;
  /**
   * Start line number
   */
  readonly startLine: number;
  /**
   * End line number of the token
   */
  readonly endLine: number;
  /**
   * Start column number of the token
   */
  readonly startColumn: number;
  /**
   * End column number of the token
   */
  readonly endColumn: number;
}
/**
 * Discriminated union of available WebAssembly node types
 */
export declare type WaNode = Module | WaModuleField | WaFunctionBody;
export declare type WaModuleField = WaExportNode | WaImportNode | Table | Element | Global | TypeDef | Func | Comment | SeparatorLine;
export declare type WaFunctionBody = Local | WaInstruction;
export declare type WaInstruction = ConstVal | Unreachable | Nop | Branch | BranchIf | BranchTable | Return | Call | CallIndirect | Drop | Select | LocalGet | LocalSet | LocalTee | GlobalGet | GlobalSet | Load | Store | MemorySize | MemoryGrow | Clz | Ctz | PopCnt | Add | Sub | Mul | Div | Rem | And | Xor | Or | Shl | Shr | Rotl | Rotr | Eqz | Eq | Ne | Le | Lt | Ge | Gt | Wrap64 | Extend32 | Trunc32 | Trunc64 | Convert32 | Convert64 | Demote64 | Promote32 | ReinterpretF32 | ReinterpretF64 | ReinterpretI32 | ReinterpretI64 | Abs | Neg | Ceil | Floor | Trunc | Nearest | Sqrt | Min | Max | CopySign | Block | Loop | If | Comment | SeparatorLine;
export declare type WaImportNode = FuncImport;
export declare type WaExportNode = FuncExport;
declare enum WaType {
  None = 0,
  i32 = 1,
  i64 = 2,
  f32 = 3,
  f64 = 4,
}
declare enum WaBitSpec {
  None = 0,
  Bit8 = 1,
  Bit16 = 2,
  Bit32 = 3,
}
/**
 * The common root of all WebAssembly AST nodes
 */
export interface WaNodeBase {
  readonly type: WaNode["type"];
}
/**
 * Export specification
 */
export interface WaExport {
  name: string;
}
/**
 * Import specification
 */
export interface WaImport {
  readonly name1: string;
  readonly name2: string;
}
/**
 * Represents memory modifier
 */
export interface Memory {
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
export interface WaInstructionBase extends WaNodeBase {}
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
 * Webassembly element
 */
export interface Element extends WaNodeBase {
  readonly type: "Element";
  readonly index: number;
  readonly ids: string[];
}
/**
 * Mutable global declaration
 */
export interface Global extends WaNodeBase {
  readonly type: "Global";
  readonly id: string;
  readonly valueType?: WaType;
  readonly initialValue?: bigint;
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
/**
 * Base node for import specifications
 */
export interface WaImportSpecification extends WaNodeBase {
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
/**
 * Base node for export specifications
 */
export interface WaExportSpecification extends WaNodeBase {
  id: string;
  export: WaExport;
}
export interface FuncExport extends WaExportSpecification {
  type: "FuncExport";
}
/**
 * Local variable of a function
 */
export interface Local extends WaNodeBase {
  type: "Local";
  id: string;
  valueType: WaType;
}
/**
 * Const
 */
export interface ConstVal extends WaInstructionBase {
  type: "ConstVal";
  valueType: WaType;
  value: number | bigint;
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
  valueType: WaType;
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
  valueType: WaType;
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
  type: "PopCnt";
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
  type: "Extend32";
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
  resultType?: WaType;
  consequtive: WaInstruction[];
  alternate?: WaInstruction[];
}
/**
 * Block/end-of-line comment
 */
export interface Comment extends WaInstructionBase {
  type: "Comment";
  isBlock?: boolean;
  text: string;
}
/**
 * Block/end-of-line comment
 */
export interface SeparatorLine extends WaInstructionBase {
  type: "SeparatorLine";
}
declare class FunctionBuilder implements Func {
  readonly id: string;
  readonly params: WaParameter[];
  readonly resultType?: WaType;
  readonly type = "Func";
  readonly body: WaInstruction[];
  locals: Local[];
  constructor(id: string, params: WaParameter[], resultType?: WaType, locals?: Local[], body?: WaInstruction[]);
  /**
   * Adds a local node to the function locals
   * @param id
   * @param valueType Value type of operation
   */
  addLocal(id: string, valueType: WaType): Local;
}
declare class WaTree {
  /**
   * Initializes the tree
   */
  constructor();
  /**
   * Gets the root module of the tree
   */
  get module(): Module;
  /**
   * Sets the module's memory specification
   * @param limit Memory limit (in 64K pages)
   * @param exp Optional memory export name
   */
  setMemorySpecification(limit: number, exp?: string): void;
  /**
   * Sets the module's table specification
   * @param limit Table size
   * @param id Optional table name
   */
  setTable(limit: number, id?: string): void;
  /**
   * Adds a function builder to this tree
   * @param builder
   */
  addFunc(builder: FunctionBuilder): void;
  /**
   * Injects a function import node into the tree
   * @param id Function identifier
   * @param name1 First import nametag
   * @param name2 Second import nametag
   * @param params Function parameters
   * @param resultType Function result type
   */
  functionImport(id: string, name1: string, name2: string, params: WaParameter[], resultType?: WaType): FuncImport;
  /**
   * Injects a function import node into the tree
   * @param id Function identifier
   * @param name1 First import nametag
   * @param name2 Second import nametag
   * @param params Function parameters
   * @param resultType Function result type
   */
  functionExport(id: string, name: string): FuncExport;
  /**
   * Injects a mutable global declaration into the tree
   * @param id Global identifier
   * @param valueType Declaration value type
   * @param initialValue Initial value
   * @param exportId Optional export name
   */
  global(id: string, valueType?: WaType, initialValue?: number | bigint, exportId?: string): Global;
  /**
   * Injects a type definition into the tree
   * @param id Type identifier
   * @param params Function parameters
   * @param resultType Optional result type
   */
  typeDef(id: string, params: WaParameter[], resultType?: WaType): TypeDef;
  /**
   * Injects an element into the tree
   * @param index Element index
   * @param ids Element IDs
   */
  element(index: number, ids: string[]): Element;
  /**
   * Injects a function into the tree
   * @param id Function identifier
   * @param params Function parameters
   * @param resultType Optional result type
   * @param body Instructions of the function body
   */
  func(id: string, params: WaParameter[], resultType?: WaType, locals?: Local[], body?: WaInstruction[]): FunctionBuilder;
  /**
   * Injects a comment into the tree
   * @param id Type identifier
   * @param params Function parameters
   * @param resultType Optional result type
   */
  comment(text: string, isBlock?: boolean): Comment;
  /**
   * Injects a separator line into the tree
   */
  separatorLine(): void;
  /**
   * Renders the WebAssembly tree
   */
  render(): string;
  /**
   * Renders the specified node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  renderNode(node: WaNode, indent?: number): string;
  /**
   * Renders a Function node
   * @param node Node to render
   * @param indent Rendering indentation depth
   */
  renderFunctionNode(node: Func, indent?: number): string;
  /**
   * Renders an instruction node with its children
   * @param node Function body node
   * @param indent Rendering indentation depth
   */
  renderInstructionNode(node: WaInstruction, indent?: number, parenthesized?: boolean): string;
  /**
   * Renders the body of a function
   * @param func Function body instructions
   */
  renderFunctionBody(func: Func, indent: number): string;
  /**
   * Renders the specified local declaration
   * @param local Local declaration
   */
  renderLocal(local: Local): string;
}
/**
 * This class implements the WAT# compiler
 */

export declare class WatSharpCompiler {
  readonly source: string;
  readonly includeHandler?: (filename: string) => IncludeHandlerResult;
  readonly preprocessorSymbols?: string[];
  readonly options?: CompilerOptions;
  constructor(source: string, includeHandler?: (filename: string) => IncludeHandlerResult, preprocessorSymbols?: string[], options?: CompilerOptions);
  /**
   * Turn on comiler tracing
   */
  trace(): void;
  /**
   * Execute the compilation of the source
   */
  compile(): string | null;
  /**
   * The errors raised during the parse phase
   */
  get errors(): ParserErrorMessage[];
  /**
   * Indicates if there were any errors during the parse phase
   */
  get hasErrors(): boolean;
  /**
   * Gets the declarations of the WAT# program
   */
  get declarations(): Map<string, Declaration>;
  /**
   * Gets the WebAssembly tree with the emitted code
   */
  get waTree(): WaTree | null;
  /**
   * Gets compiler trace messages
   */
  get traceMessages(): CompilerTraceMessage[];
  /**
   * Gets the instructions for the specified function
   * @param name Function name
   */
  getFunctionBodyInstructions(name: string): WaInstruction[] | undefined;
  /**
   * Adds a trace message
   * @param traceFactory Factory function to generate trace message
   */
  addTrace(traceFactory: () => [string, number | undefined, string]): void;
  /**
   * Resolve unresolved declaration dependencies
   */
  resolveDependencies(spec?: TypeSpec): void;
  /**
   * Get the size of a type specification
   * @param typeSpec
   */
  getSizeof(typeSpec: TypeSpec): number;
  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  reportError(errorCode: ErrorCodes, node: Node | TokenLocation, ...options: any[]): void;
}
/**
 * Options to use with the compiler
 */
export interface CompilerOptions {
  generateComments?: boolean;
}
/**
 * Represents a comiler trace message
 */
export interface CompilerTraceMessage {
  source: string;
  point?: number;
  message: string;
}
export declare function getVersion(): string;
export {};