/**
 * This enumeration defines the token types
 */
export enum TokenType {
  Eof = -1,
  Ws = -2,
  InlineComment = -3,
  EolComment = -4,
  Unknown = 0,

  // --- Only the preprocessor uses these tokens
  SourceChunk,
  PreprocDirective,
  PPIdentifier,
  NewLine,

  // --- Both the preprocessor and WA# uses these tokens
  LParent,
  RParent,
  OrOp,
  XorOp,
  AndOp,
  NotOp,

  // --- WA#-specific tokens
}

/**
 * Represents a generic token
 */
export interface Token {
  /**
   * The raw text of the token
   */
  readonly text: string;

  /**
   * The type of the token
   */
  readonly type: TokenType;

  /**
   * The location of the token
   */
  readonly location: TokenLocation;
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
  readonly startPos: number;

  /**
   * End position (exclusive) in the source stream
   */
  readonly endPos: number;

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
 * Tests if a token id EOF
 * @param t Token instance
 */
export function isEof(t: Token): boolean {
  return t.type === TokenType.Eof;
}

/**
 * Tests if a token is whitespace
 * @param t Token instance
 */
export function isWs(t: Token): boolean {
  return t.type <= TokenType.Ws;
}

/**
 * Tests if a character is an identifier continuation character
 * @param ch Character to test
 */
export function isIdContinuation(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    (ch >= "0" && ch <= "9") ||
    ch === "_" ||
    ch === "."
  );
}

/**
 * Tests if a character is a binary digit
 * @param ch Character to test
 */
export function isBinaryDigit(ch: string): boolean {
  return ch === "0" || ch === "1" || ch === "_";
}
