/**
 * The common root class of all parser error objects
 */
export class ParserError extends Error {
  /**
   * Instantiates a custom parser error object
   * @param message Error message
   * @param code Optional code to identify the message
   */
  constructor(message: string, public code?: string) {
    super(message);

    // --- Set the prototype explicitly.
    Object.setPrototypeOf(this, ParserError.prototype);
  }
}

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

export type ErrorCodes =
  // --- Preprocessor errors
  | "P001"
  | "P002"
  | "P003"
  | "P004"
  | "P005"
  | "P006"
  | "P007"
  | "P008"
  | "P009"
  | "P010"
  | "P011"
  | "P012"
  | "P013"
  | "P014"
  | "P015"
  | "P016"

  // --- WAT# syntax errors
  | "W001"
  | "W002"
  | "W003"
  | "W004"
  | "W005"
  | "W006"
  | "W007"
  | "W008"
  | "W009"
  | "W010"
  | "W011"
  | "W012"
  | "W013"
  | "W014"
  | "W015"
  | "W016"
  | "W017"
  | "W018"
  | "W019"
  | "W020"
  | "W021"
  | "W022"
  | "W023"
  | "W024"
  | "W025"

  // --- WAT# semantic errors
  | "W100"
  | "W101"
  | "W102"
  | "W103"
  | "W104"
  | "W105"
  | "W106"
  | "W107"
  | "W108"
  | "W109"
  | "W110"
  | "W111"
  | "W112"

  // --- WAT# Compiler issues
  | "W140"
  | "W141"
  | "W142"
  | "W143"
  | "W144"
  | "W145"
  | "W146"
  | "W147"
  | "W148"
  | "W149"
  | "W150"
  | "W151"
  | "W152"
  | "W153"
  | "W154"
  | "W155"
  | "W156"
  | "W157"
  | "W158"
  | "W159"
  | "W160"
  | "W161"
  | "W162"
  | "W163"
  | "W164"
  | "W165"
  | "W166"
  | "W167"
  | "W168";


/**
 * Error message type description
 */
type ErrorText = Record<string, string>;

/**
 * The error messages of error codes
 */
export const errorMessages: ErrorText = {
  // --- Preprocessor errors
  P001: "Unknown source code token found during preprocessing: {0}",
  P002: "Cannot find preprocessor directive",
  P003: "Unknown preprocessor directive: {0}",
  P004: "Symbol identifier expected",
  P005: "Invalid preprocessor directive completion",
  P006: "Unexpected token: {0}",
  P007: "An expression expected",
  P008: "Missing ')'",
  P009: "Cannot use #elseif without a correspondig #if",
  P010: "Cannot use #elseif after #else",
  P011: "Cannot use #else without a correspondig #if",
  P012: "The current #if already has an #else",
  P013: "Cannot use #endif without a correspondig #if",
  P014: "Missing #endif",
  P015: "String literal expected",
  P016: "#include error: {0}",

  // --- WAT# syntax issues
  W001: "A comma expected",
  W002: "An expression expected",
  W003: "Unexpected token: {0}",
  W004: "An identifier expected",
  W005: "An intrinsic type specifier expected but {0} received.",
  W006: "Missing semicolon closing the declaration",
  W007: "Expected '='",
  W008: "Type specification expected",
  W009: "'{' expected",
  W010: "'}' expected",
  W011: "'[' expected",
  W012: "']' expected",
  W013: "Data declaration accepts only integral types",
  W014: "Import function declaration must have a result type or 'void'",
  W015: "Import functions can have only intrinsic result and parameter types",
  W016: "'(' expected",
  W017: "')' expected",
  W018: "Unexpected token in variable/function declaration",
  W019: "Function parameters can be intrinsic types or pointers only",
  W020: "Function result types can be intrinsic types, pointers, or 'void'",
  W021: "Missing function parameter name",
  W022: "'while' expected",
  W023: "A statement expected",
  W024: "An assignment operator expected",
  W025: "'*' or an identifier expected",

  // --- WAT# semantic issues
  W100: "Duplicated declaration identifier: '{0}'",
  W101: "Unknown declaration: '{0}'",
  W102: "'{0}' is not a type declaration",
  W103: "Cannot resolve '{0}' because of circular declaration reference",
  W104: "Invalid construct in constant expressions",
  W105: "The '&' and '*' operators cannot be used in constant expressions",
  W106: "The '~' operators cannot be used with a float value",
  W107: "Error when evaluating an expression: {0}",
  W108: "'{0}' is not a const declaration",
  W109: "A table can hold only function identifiers",
  W110: "The break statement can only be used in a loop",
  W111: "The continue statement can only be used in a loop",
  W112: "Invalid left value",

  // --- WAT# Compiler issues
  W140: "Local parameter/variable '{0}' has already been declared",
  W141: "Cannot cast the right side of the assignment to the target type",
  W142: "Cannot resolve name '{0}' to a local or a global variable declaration",
  W143: "Only variables with intrinsic and pointer types can be used",
  W144: "The {0} operator works only with instrinsic types",
  W145: "The {0} operator works only with integer types",
  W146: "Only variables have addresses, globals and locals do not",
  W147: "The left operand of the member access operator must be a struct",
  W148: "Unknown struct member: {0}",
  W149: "The item access operator can be used only with arrays",
  W150: "The {0} built-in function works only with floating-point types",
  W151: "The {0} built-in function works only with integer types",
  W152: "Non-pointer expressions cannot be dereferenced",
  W153: "Cannot resolve name '{0}' to a function declaration",
  W154: "The function has {0} argument(s) but it is called with {1}",
  W155: "Cannot convert floating-point arguments to integer function parameters implicitly",
  W156: "A function with void result type should return no value",
  W157: "A function with non-void result type should return a value",
  W158: "Function signature of '{0}' does not match table signature",
  W159: "A table function invocation requires a dispatcher expression",
  W160: "Only a table function invocation can have a dispatcher expression",
  W161: "Left values can be only intrinsic types or pointers",
  W162: "You can use only variable names for aliases",
  W163: "Variable {0} has not got an address yet, it cannot be an alias",
  W164: "Pointer operations allow only '+' and '-' operators",
  W165: "Pointer operations reguire an integer right operand",
  W166: "Copy assignment needs works only with array and struct types",
  W167: "Copy assignment requires an integer expression on its right side",
  W168: "Copy assignment does not support copying more than 256 bytes",
};
