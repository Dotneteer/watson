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

  // --- WAT# errors

  | "W001"
  | "W002"
  | "W003"
  | "W004"
  | "W005"
  | "W006"
  | "W007"
  | "W008";

/**
 * Error message type description
 */
type ErrorText = Record<string, string>;

/**
 * The error messages of error codes
 */
export const errorMessages: ErrorText = {
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

  W001: "A comma expected",
  W002: "An expression expected",
  W003: "Unexpected token: {0}",
  W004: "An identifier expected",
  W005: "An intrinsic type specifier expected but {0} received.",
  W006: "Missing semicolon closing the declaration",
  W007: "Expected '=', but received '{0}'",
  W008: "Type specification expected",
};
