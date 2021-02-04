/**
 * This type represents the discriminated union of all WAT# source tree
 * node types
 */
export type Node = TypeSpec | Expression | Declaration | FunctionParameter;

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

// ============================================================================
// Types

/**
 * Discriminated unions of type specifications
 */
export type TypeSpec =
  | IntrinsicType
  | PointerType
  | ArrayType
  | StructType
  | StructField
  | UnresolvedType;

/**
 * Type identifiers for intrinsic types
 */
export type Intrinsics =
  | "i8"
  | "u8"
  | "i16"
  | "u16"
  | "i32"
  | "u32"
  | "i64"
  | "u64"
  | "f32"
  | "u32";

export interface TypeSpecBase extends BaseNode {}

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
}

/**
 * Unresolved type specification
 */
export interface UnresolvedType extends TypeSpecBase {
  type: "UnresolvedType";
  name: string;
}

// ============================================================================
// Expressions

/**
 * All syntax nodes that represent an expression
 */
export type Expression =
  | UnaryExpression
  | BinaryExpression
  | ConditionalExpression
  | SizeOfExpression
  | BuiltInFunctionInvocationExpression
  | TypeCastExpression
  | FunctionInvocationExpression
  | UnresolvedInvocationExpression
  | MemberAccessExpression
  | ItemAccessExpression
  | Identifier
  | Literal;

/**
 * Common base node for all expression syntax nodes
 */
export interface ExpressionBase extends BaseNode {
  /**
   * Indicates if the expression is a constant expression
   */
  constant?: boolean;

  /**
   * The value of the expression. If defined, the expression has
   * been evaluated; otherwise, not
   */
  value?: number | BigInt;
}

/**
 * Symbols that can be unary operators
 */
export type UnaryOpSymbols = "+" | "-" | "~" | "!" | "&" | "*";

/**
 * Symbols that can be unary operators
 */
export type BinaryOpSymbols =
  | "*"
  | "/"
  | "%"
  | "+"
  | "-"
  | "<<"
  | ">>"
  | ">>>"
  | "<"
  | "<="
  | ">"
  | ">="
  | "=="
  | "!="
  | "&"
  | "|"
  | "^";

/**
 * Built-in function names
 */
export type BuiltInFunctionNames =
  | "clz"
  | "ctz"
  | "popcnt"
  | "abs"
  | "neg"
  | "ceil"
  | "floor"
  | "trunc"
  | "nearest"
  | "sqrt"
  | "min"
  | "max"
  | "copysign";

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
}

/**
 * Represents an unresolved invocation-like expression
 */
export interface UnresolvedInvocationExpression extends ExpressionBase {
  type: "UnresolvedInvocation";
  name: string;
  arguments: Expression[];
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
  value: number | BigInt;
}

// ============================================================================
// Declarations

export type Declaration =
  | ConstDeclaration
  | GlobalDeclaration
  | TypeDeclaration
  | TableDeclaration
  | DataDeclaration
  | VariableDeclaration
  | ImportedFunctionDeclaration
  | FunctionDeclaration;

/**
 * Represents the base information for all declaration
 */
export interface DeclarationBase extends BaseNode {
  name: string;
  order?: number;
}

/**
 * Constant declaration
 */
export interface ConstDeclaration extends DeclarationBase {
  type: "ConstDeclaration";
  underlyingType: Intrinsics;
  expr: Expression;
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
  expr: Expression;
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
  resultType?: IntrinsicType;
  params: FunctionParameter[];
  isExport?: boolean;
  isInline?: boolean;
}

/**
 * Describes a structure field
 */
export interface FunctionParameter extends BaseNode {
  type: "FunctionParameter";
  name: string;
  spec: TypeSpec;
}
