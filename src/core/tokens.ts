/**
 * This enumeration defines the token types
 */
export enum TokenType {
  Eof = -1,
  Ws = -2,
  BlockComment = -3,
  EolComment = -4,
  Unknown = 0,

  // --- Only the preprocessor uses these tokens
  SourceChunk,
  PreprocDirective,
  PPIdentifier,
  PPStringLiteral,
  NewLine,
  OrOp,
  XorOp,
  AndOp,
  NotOp,

  // --- Both the preprocessor and WA# uses these tokens
  LParent,
  RParent,

  // --- WA#-specific tokens
  Identifier,

  Divide,
  DivideAsgn,
  Asterisk,
  MultiplyAsgn,
  Plus,
  AddAsgn,
  Minus,
  SubtrackAsgn,
  Xor,
  XorAsgn,
  Or,
  OrAsgn,
  Ampersand,
  AndAsgn,

  Semicolon,
  Comma,
  Colon,
  LSquare,
  RSquare,
  QuestionMark,
  Remainder,
  BinaryNot,
  LBrace,
  RBrace,
  Asgn,
  Equal,
  Not,
  NotEqual,
  LessThan,
  LessThanOrEqual,
  ShiftLeft,
  GreaterThan,
  GreaterThanOrEqual,
  ShiftRight,
  SignedShiftRight,
  Dot,
  Sizeof,

  I8,
  U8,
  I16,
  U16,
  I32,
  U32,
  I64,
  U64,
  F32,
  F64,
  Void,

  DecimalLiteral,
  HexadecimalLiteral,
  BinaryLiteral,
  RealLiteral,
  StringLiteral,
  Infinity,
  NaN,

  Inline,
  Export, 
  Type,
  Struct,
  Table,
  Data,
  Import,

  Clz, 
  Ctz,
  PopCnt,
  Abs,
  Neg,
  Ceil,
  Floor,
  Trunc,
  Nearest,
  Sqrt,
  Min,
  Max,
  CopySign,

  Const,
  Global,
  
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
 * Tests if a character is an identifier start character
 * @param ch Character to test
 */
export function isIdStart(ch: string): boolean {
  return (
    (ch >= "a" && ch <= "z") ||
    (ch >= "A" && ch <= "Z") ||
    ch === "_" ||
    ch === "$"
  );
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
    ch === "$"
  );
}

/**
 * Tests if a character is a binary digit
 * @param ch Character to test
 */
export function isBinaryDigit(ch: string): boolean {
  return ch === "0" || ch === "1";
}

/**
 * Tests if a character is a decimal digit
 * @param ch Character to test
 */
export function isDecimalDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

/**
 * Tests if a character is a hexadecimal digit
 * @param ch Character to test
 */
export function isHexadecimalDigit(ch: string): boolean {
  return (
    (ch >= "0" && ch <= "9") ||
    (ch >= "A" && ch <= "F") ||
    (ch >= "a" && ch <= "f")
  );
}

/**
 * Tests if a character is restricted in a string
 * @param ch Character to test
 */
export function isRestrictedInString(ch: string): boolean {
  return (
    ch === "\r" ||
    ch === "\n" ||
    ch === "\u0085" ||
    ch === "\u2028" ||
    ch === "\u2029"
  );
}
