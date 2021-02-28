/**
 * This type represents the discriminated union of all WAT# source tree
 * node types
 */
export type Node =
  | TypeSpec
  | Expression
  | Declaration
  | FunctionParameter
  | Statement;

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
  | VoidType
  | IntrinsicType
  | PointerType
  | ArrayType
  | StructType
  | StructField
  | NamedType;

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
  | "f64";

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

// ============================================================================
// Expressions

/**
 * All syntax nodes that represent an expression
 */
export type Expression =
  | DereferenceExpression
  | UnaryExpression
  | BinaryExpression
  | ConditionalExpression
  | SizeOfExpression
  | BuiltInFunctionInvocationExpression
  | TypeCastExpression
  | FunctionInvocationExpression
  | MemberAccessExpression
  | ItemAccessExpression
  | Identifier
  | Literal;

/**
 * These expressions reference indirect access
 */
export type IndirectAccessExpression =
  | DereferenceExpression
  | MemberAccessExpression
  | ItemAccessExpression;

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
export type UnaryOpSymbols = "+" | "-" | "~" | "!" | "&";

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
  | "ceil"
  | "floor"
  | "trunc"
  | "nearest"
  | "sqrt"
  | "min"
  | "max"
  | "neg"
  | "copysign";

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

/**
 * Type of source literal
 */
export enum LiteralSource {
  Int,
  BigInt,
  Real,
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

// ============================================================================
// Statements

/**
 * Discriminated unions of WAT# statements
 */
export type Statement =
  | Assignment
  | LocalVariable
  | LocalFunctionInvocation
  | IfStatement
  | WhileStatement
  | DoStatement
  | BreakStatement
  | ContinueStatement
  | ReturnStatement;

/**
 * Symbols that can be unary operators
 */
export type AssignmentSymbols =
  | "="
  | "*="
  | "/="
  | "%="
  | "+="
  | "-="
  | "<<="
  | ">>="
  | ">>>="
  | "&="
  | "|="
  | "^=";

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
 * Hash object for the size of intrinsic types
 */
export const instrisicSizes: Record<Intrinsics, number> = {
  i8: 1,
  u8: 1,
  i16: 2,
  u16: 2,
  i32: 4,
  u32: 4,
  i64: 8,
  u64: 8,
  f32: 4,
  f64: 8,
};
