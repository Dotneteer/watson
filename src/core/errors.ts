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
  "P001" | "P002" | "P003" | "P004" | "P005" | "P006" | "P007" | "P008";

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
};
