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
  W019: "Function parameters can be intrinsic types of pointers only",
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
};
