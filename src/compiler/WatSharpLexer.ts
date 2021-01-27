import {
  isEof,
  isIdContinuation,
  isIdStart,
  isWs,
  Token,
  TokenType,
} from "../core/tokens";
import { InputStream } from "../core/InputStream";

/**
 * This class implements the lexer of WAT#
 */
export class WatSharpLexer {
  // --- Already fetched tokens
  private _ahead: Token[] = [];

  // --- Prefetched character (from the next token)
  private _prefetched: string | null = null;

  // --- Prefetched character position (from the next token)
  private _prefetchedPos: number | null = null;

  // --- Prefetched character column (from the next token)
  private _prefetchedColumn: number | null = null;

  // --- The last end-of-line comment
  private _lastComment: string | null = null;

  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(public readonly input: InputStream) {}

  /**
   * Gets the specified part of the source code
   * @param start Start position
   * @param end End position
   */
  getSourceSpan(start: number, end: number): string {
    return this.input.getSourceSpan(start, end);
  }

  /**
   * Resets the last comment
   */
  resetComment(): void {
    this._lastComment = null;
  }

  /**
   * Gets the last end-of-line comment
   */
  get lastComment(): string | null {
    return this._lastComment;
  }

  /**
   * Fethches the next token without advancing to its position
   * @param ws If true, retrieve whitespaces too
   */
  peek(ws = false): Token {
    return this.ahead(0, ws);
  }

  /**
   *
   * @param n Number of token positions to read ahead
   * @param ws If true, retrieve whitespaces too
   */
  ahead(n = 1, ws = false): Token {
    if (n > 16) {
      throw new Error("Cannot look ahead more than 16 tokens");
    }

    // --- Prefetch missing tokens
    while (this._ahead.length <= n) {
      const token = this.fetch();
      if (token.type === TokenType.EolComment) {
        this._lastComment = token.text;
      }
      if (isEof(token)) {
        return token;
      }
      if (ws || (!ws && !isWs(token))) {
        this._ahead.push(token);
      }
    }
    return this._ahead[n];
  }

  /**
   * Fethces the nex token and advances the stream position
   * @param ws If true, retrieve whitespaces too
   */
  get(ws = false): Token {
    if (this._ahead.length > 0) {
      const token = this._ahead.shift();
      if (!token) {
        throw new Error("Token expected");
      }
      return token;
    }
    while (true) {
      const token = this.fetch();
      if (token.type === TokenType.EolComment) {
        this._lastComment = token.text;
      }
      if (isEof(token) || ws || (!ws && !isWs(token))) {
        return token;
      }
    }
  }

  /**
   * Fetches the next token from the input stream
   */
  private fetch(): Token {
    const lexer = this;
    const input = this.input;
    const startPos = this._prefetchedPos || input.position;
    const line = input.line;
    const startColumn = this._prefetchedColumn || input.column;
    let text = "";
    let tokenType = TokenType.Eof;
    let lastEndPos = input.position;
    let lastEndColumn = input.column;
    let ch: string | null = null;
    let useResolver = false;

    let phase: LexerPhase = LexerPhase.Start;
    while (true) {
      // --- Get the next character
      ch = fetchNextChar();

      // --- In case of EOF, return the current token data
      if (ch === null) {
        return makeToken();
      }

      // --- Set the intial token type to unknown for the other characters
      if (tokenType === TokenType.Eof) {
        tokenType = TokenType.Unknown;
      }

      // --- Follow the lexer state machine
      switch (phase) {
        // ====================================================================
        // Process the first character
        case LexerPhase.Start:
          switch (ch) {
            // --- Go on with whitespaces
            case " ":
            case "\t":
            case "\n":
            case "\r":
              phase = LexerPhase.InWhiteSpace;
              tokenType = TokenType.Ws;
              break;

            // --- Divide DivideAsgn, BlockComment, or EolComment
            case "/":
              phase = LexerPhase.Slash;
              tokenType = TokenType.Divide;
              break;

            // --- Asterisk, MultiplyAsgn
            case "*":
              phase = LexerPhase.Asterisk;
              tokenType = TokenType.Asterisk;
              break;

            // --- Plus, AddAsgn
            case "+":
              phase = LexerPhase.Plus;
              tokenType = TokenType.Plus;
              break;

            // --- Minus, SubtractAsgn
            case "-":
              phase = LexerPhase.Minus;
              tokenType = TokenType.Minus;
              break;

            // --- Xor, XorAsgn
            case "^":
              phase = LexerPhase.Xor;
              tokenType = TokenType.Xor;
              break;

            // --- Or, OrAsgn
            case "|":
              phase = LexerPhase.Or;
              tokenType = TokenType.Or;
              break;

            // --- Ampersand, AndAsgn
            case "&":
              phase = LexerPhase.Ampersand;
              tokenType = TokenType.Ampersand;
              break;

            case ";":
              return completeToken(TokenType.Semicolon);

            case ",":
              return completeToken(TokenType.Comma);

            case "(":
              return completeToken(TokenType.LParent);

            case ")":
              return completeToken(TokenType.RParent);

            case ":":
              return completeToken(TokenType.Colon);

            case "[":
              return completeToken(TokenType.LSquare);

            case "]":
              return completeToken(TokenType.RSquare);

            case "?":
              return completeToken(TokenType.QuestionMark);

            case "%":
              return completeToken(TokenType.Remainder);

            case "~":
              return completeToken(TokenType.BinaryNot);

            case "{":
              return completeToken(TokenType.LBrace);

            case "}":
              return completeToken(TokenType.RBrace);

            // --- Asgn, Equal
            case "=":
              phase = LexerPhase.Equal;
              tokenType = TokenType.Asgn;
              break;

            // --- Not, NotEqual
            case "!":
              phase = LexerPhase.Exclamation;
              tokenType = TokenType.Not;
              break;

            // --- LessThan, LessThanOrEqual, ShiftLeft
            case "<":
              phase = LexerPhase.AngleLeft;
              tokenType = TokenType.LessThan;
              break;

            // --- GreaterThan, GreaterThanOrEqual, ShiftRight, SignedShiftRight
            case ">":
              phase = LexerPhase.AngleRight;
              tokenType = TokenType.GreaterThan;
              break;

            //     // ---".", keyword-like, real number
            //     case ".":
            //       phase = LexerPhase.Dot;
            //       tokenType = TokenType.Dot;
            //       break;

            //     // --- "#" received
            //     case "#":
            //       phase = LexerPhase.DirectiveOrHexLiteral;
            //       break;

            //     // --- "$" received
            //     case "$":
            //       phase = LexerPhase.Dollar;
            //       tokenType = TokenType.CurAddress;
            //       break;

            //     // Start of a numeric literal
            //     case "0":
            //       phase = LexerPhase.LitBodhr;
            //       tokenType = TokenType.DecimalLiteral;
            //       break;

            //     case "1":
            //       phase = LexerPhase.LitBodhr2;
            //       tokenType = TokenType.DecimalLiteral;
            //       break;

            //     case "2":
            //     case "3":
            //     case "4":
            //     case "5":
            //     case "6":
            //     case "7":
            //       phase = LexerPhase.LitOdhr;
            //       tokenType = TokenType.DecimalLiteral;
            //       break;

            //     case "8":
            //     case "9":
            //       phase = LexerPhase.LitDhr;
            //       tokenType = TokenType.DecimalLiteral;
            //       break;

            //     case "'":
            //       phase = LexerPhase.Char;
            //       break;

            //     case '"':
            //       phase = LexerPhase.String;
            //       break;

            default:
              if (isIdStart(ch)) {
                useResolver = true;
                phase = LexerPhase.IdTail;
                tokenType = TokenType.Identifier;
              }
              break;
          }
          break;

        // ====================================================================
        // Process comments

        // --- Looking for the end of whitespace
        case LexerPhase.InWhiteSpace:
          if (ch !== " " && ch !== "\t" && ch !== "\r" && ch !== "\n") {
            return makeToken();
          }
          break;

        // --- Wait for an "*" that may complete a block comment
        case LexerPhase.BlockCommentTrail1:
          if (ch === "*") {
            phase = LexerPhase.BlockCommentTrail2;
          }
          break;

        // --- Wait for a "/" that may complete a block comment
        case LexerPhase.BlockCommentTrail2:
          if (ch === "/") {
            return completeToken(TokenType.BlockComment);
          }
          break;

        case LexerPhase.InlineCommentTrail:
          if (ch === "\n") {
            return completeToken();
          }
          break;

        // ====================================================================
        // Process identifiers

        case LexerPhase.IdTail:
          if (!isIdContinuation(ch)) {
            return makeToken();
          }
          break;

        // ====================================================================
        // Process miscellenous tokens

        case LexerPhase.Slash:
          if (ch === "=") {
            return completeToken(TokenType.DivideAsgn);
          }
          if (ch === "*") {
            phase = LexerPhase.BlockCommentTrail1;
          } else if (ch === "/") {
            phase = LexerPhase.InlineCommentTrail;
            tokenType = TokenType.EolComment;
          } else {
            return makeToken();
          }
          break;

        case LexerPhase.Asterisk:
          return ch === "="
            ? completeToken(TokenType.MultiplyAsgn)
            : makeToken();

        case LexerPhase.Plus:
          return ch === "=" ? completeToken(TokenType.AddAsgn) : makeToken();

        case LexerPhase.Minus:
          return ch === "="
            ? completeToken(TokenType.SubtrackAsgn)
            : makeToken();

        case LexerPhase.Xor:
          return ch === "=" ? completeToken(TokenType.XorAsgn) : makeToken();

        case LexerPhase.Or:
          return ch === "=" ? completeToken(TokenType.OrAsgn) : makeToken();

        case LexerPhase.Ampersand:
          return ch === "=" ? completeToken(TokenType.AndAsgn) : makeToken();

        case LexerPhase.Equal:
          return ch === "=" ? completeToken(TokenType.Equal) : makeToken();

        case LexerPhase.Exclamation:
          return ch === "=" ? completeToken(TokenType.NotEqual) : makeToken();

        case LexerPhase.AngleLeft:
          if (ch === "=") {
            return completeToken(TokenType.LessThanOrEqual);
          }
          if (ch === "<") {
            return completeToken(TokenType.ShiftLeft);
          }
          return makeToken();

        case LexerPhase.AngleRight:
          if (ch === "=") {
            return completeToken(TokenType.GreaterThanOrEqual);
          }
          if (ch !== ">") {
            return makeToken();
          }
          phase = LexerPhase.ShiftRight;
          tokenType = TokenType.ShiftRight;
          break;

        case LexerPhase.ShiftRight:
          return ch === ">"
            ? completeToken(TokenType.SignedShiftRight)
            : makeToken();

        // // --- ".", keyword-like, real-number
        // case LexerPhase.Dot:
        //   if (isIdStart(ch)) {
        //     phase = LexerPhase.IdTail;
        //   } else if (isDecimalDigit(ch)) {
        //     phase = LexerPhase.LitRfrac2;
        //     tokenType = TokenType.RealLiteral;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // // ====================================================================
        // // Identifier and keyword like tokens

        // // --- Wait for the completion of hexadecimal number of preprocessor directive
        // case LexerPhase.DirectiveOrHexLiteral:
        //   if (isLetterOrDigit(ch)) {
        //     if (input.peek() !== null) {
        //       break;
        //     }
        //     appendTokenChar();
        //   }
        //   if (
        //     text.length <= 5 &&
        //     text
        //       .substr(1)
        //       .split("")
        //       .every((c) => isHexadecimalDigit(c))
        //   ) {
        //     tokenType = TokenType.HexadecimalLiteral;
        //   } else {
        //     useResolver = true;
        //   }
        //   return makeToken();

        // // --- Continuation of a "$"
        // case LexerPhase.Dollar:
        //   if (ch === "<") {
        //     phase = LexerPhase.NoneArgTail;
        //     break;
        //   }
        //   if (isLetterOrDigit(ch)) {
        //     if (input.peek() !== null) {
        //       break;
        //     }
        //     appendTokenChar();
        //   }
        //   if (
        //     text.length <= 5 &&
        //     text.length >= 2 &&
        //     text
        //       .substr(1)
        //       .split("")
        //       .every((c) => isHexadecimalDigit(c))
        //   ) {
        //     tokenType = TokenType.HexadecimalLiteral;
        //   } else {
        //     useResolver = true;
        //   }
        //   return makeToken();

        // // --- Wait for the completion od "$<none>$" placeholder
        // case LexerPhase.NoneArgTail:
        //   if (ch === "$") {
        //     useResolver = false;
        //     tokenType =
        //       text === "$<none>" ? TokenType.NoneArg : TokenType.Unknown;
        //     return completeToken();
        //   }
        //   break;

        // case LexerPhase.DefgTail:
        //   if (ch === "\r" || ch === "\n") {
        //     return makeToken();
        //   }
        //   break;

        // // ====================================================================
        // // --- Literals

        // // --- "0" received
        // case LexerPhase.LitBodhr:
        //   if (isHexaMark(ch)) {
        //     phase = LexerPhase.LitHx1;
        //     tokenType = TokenType.Unknown;
        //   } else if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (isOctalSuffix(ch)) {
        //     return completeToken(TokenType.OctalLiteral);
        //   } else if (isBinarySuffix(ch, input.ahead(0))) {
        //     return completeToken(TokenType.BinaryLiteral);
        //   } else if (ch === ".") {
        //     phase = LexerPhase.LitRfrac;
        //     tokenType = TokenType.Unknown;
        //   } else if (ch === "0" || ch === "1") {
        //     phase = LexerPhase.LitBodhr2;
        //   } else if (ch >= "2" && ch <= "7") {
        //     phase = LexerPhase.LitOdhr;
        //   } else if (ch === "8" || ch === "9") {
        //     phase = LexerPhase.LitDhr;
        //   } else if (ch === "e" || ch === "E") {
        //     phase = LexerPhase.LitHr;
        //     tokenType = TokenType.Unknown;
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // // --- "0x" received
        // case LexerPhase.LitHx1:
        //   if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitHx2;
        //     tokenType = TokenType.HexadecimalLiteral;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // // --- Tail of "0x" hexadecimal literal
        // case LexerPhase.LitHx2:
        //   if (!isHexadecimalDigit(ch)) {
        //     return makeToken();
        //   }
        //   break;

        // // Binary, Octal, Decimal, or Hexadecimal
        // case LexerPhase.LitBodhr2:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (isOctalSuffix(ch)) {
        //     return completeToken(TokenType.OctalLiteral);
        //   } else if (isBinarySuffix(ch, input.ahead(0))) {
        //     return completeToken(TokenType.BinaryLiteral);
        //   } else if (ch === ".") {
        //     phase = LexerPhase.LitRfrac;
        //     tokenType = TokenType.Unknown;
        //   } else if (ch === "0" || ch === "1") {
        //   } else if (ch >= "2" && ch <= "7") {
        //     phase = LexerPhase.LitOdhr;
        //   } else if (ch === "8" || ch === "9") {
        //     phase = LexerPhase.LitDhr;
        //   } else if (ch === "e" || ch === "E") {
        //     phase = LexerPhase.LitHr;
        //     tokenType = TokenType.Unknown;
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // case LexerPhase.LitOdhr:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (isOctalSuffix(ch)) {
        //     return completeToken(TokenType.OctalLiteral);
        //   } else if (ch === ".") {
        //     phase = LexerPhase.LitRfrac;
        //     tokenType = TokenType.Unknown;
        //   } else if (ch >= "0" && ch <= "7") {
        //   } else if (ch === "8" || ch === "9") {
        //     phase = LexerPhase.LitDhr;
        //   } else if (ch === "e" || ch === "E") {
        //     phase = LexerPhase.LitHr;
        //     tokenType = TokenType.Unknown;
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // case LexerPhase.LitDhr:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (ch === ".") {
        //     phase = LexerPhase.LitRfrac;
        //     tokenType = TokenType.Unknown;
        //   } else if (ch >= "0" && ch <= "9") {
        //   } else if (ch === "e" || ch === "E") {
        //     phase = LexerPhase.LitHr;
        //     tokenType = TokenType.Unknown;
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // case LexerPhase.LitHr:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (isDecimalDigit(ch)) {
        //     phase = LexerPhase.LitHr2;
        //     tokenType = TokenType.RealLiteral;
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else if (ch === "+" || ch === "-") {
        //     phase = LexerPhase.LitRexps;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // case LexerPhase.LitHr2:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (isDecimalDigit(ch)) {
        //   } else if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.LitH;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // case LexerPhase.LitH:
        //   if (isHexaSuffix(ch)) {
        //     return completeToken(TokenType.HexadecimalLiteral);
        //   } else if (!isHexadecimalDigit(ch)) {
        //     return makeToken();
        //   }
        //   break;

        // // First digit of fractional part
        // case LexerPhase.LitRfrac:
        //   if (!isDecimalDigit(ch)) {
        //     return completeToken(TokenType.Unknown);
        //   }
        //   phase = LexerPhase.LitRfrac2;
        //   tokenType = TokenType.RealLiteral;
        //   break;

        // // Remaining digits of fractional part
        // case LexerPhase.LitRfrac2:
        //   if (ch === "e" || ch === "E") {
        //     phase = LexerPhase.LitRexp;
        //   } else if (!isDecimalDigit(ch)) {
        //     return makeToken();
        //   }
        //   break;

        // // Wait for exponent sign
        // case LexerPhase.LitRexp:
        //   if (ch === "+" || ch === "-") {
        //     tokenType = TokenType.Unknown;
        //     phase = LexerPhase.LitRexps;
        //   } else if (isDecimalDigit(ch)) {
        //     phase = LexerPhase.LitRexp2;
        //   } else {
        //     return makeToken();
        //   }
        //   break;

        // // First digit of exponent
        // case LexerPhase.LitRexps:
        //   if (!isDecimalDigit(ch)) {
        //     return makeToken();
        //   }
        //   phase = LexerPhase.LitRexp2;
        //   tokenType = TokenType.RealLiteral;
        //   break;

        // // Remaining digits of exponent
        // case LexerPhase.LitRexp2:
        //   if (isDecimalDigit(ch)) {
        //     break;
        //   }
        //   return makeToken();

        // // Character data
        // case LexerPhase.Char:
        //   if (isRestrictedInString(ch)) {
        //     return completeToken(TokenType.Unknown);
        //   } else if (ch === "\\") {
        //     phase = LexerPhase.CharBackSlash;
        //     tokenType = TokenType.Unknown;
        //   } else {
        //     phase = LexerPhase.CharTail;
        //   }
        //   break;

        // // Character literal delimiter
        // case LexerPhase.CharTail:
        //   return ch === "'"
        //     ? completeToken(TokenType.CharLiteral)
        //     : completeToken(TokenType.Unknown);

        // // Start of character escape
        // case LexerPhase.CharBackSlash:
        //   switch (ch) {
        //     case "i":
        //     case "p":
        //     case "f":
        //     case "b":
        //     case "I":
        //     case "o":
        //     case "a":
        //     case "t":
        //     case "P":
        //     case "C":
        //     case "'":
        //     case '"':
        //     case "\\":
        //     case "0":
        //       phase = LexerPhase.CharTail;
        //       break;
        //     default:
        //       if (ch === "x") {
        //         phase = LexerPhase.CharHexa1;
        //       } else {
        //         phase = LexerPhase.CharTail;
        //       }
        //   }
        //   break;

        // // First hexadecimal digit of character escape
        // case LexerPhase.CharHexa1:
        //   if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.CharHexa2;
        //   } else {
        //     return completeToken(TokenType.Unknown);
        //   }
        //   break;

        // // Second hexadecimal digit of character escape
        // case LexerPhase.CharHexa2:
        //   if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.CharTail;
        //   } else {
        //     return completeToken(TokenType.Unknown);
        //   }
        //   break;

        // // String data
        // case LexerPhase.String:
        //   if (ch === '"') {
        //     return completeToken(TokenType.StringLiteral);
        //   } else if (isRestrictedInString(ch)) {
        //     return completeToken(TokenType.Unknown);
        //   } else if (ch === "\\") {
        //     phase = LexerPhase.StringBackSlash;
        //     tokenType = TokenType.Unknown;
        //   }
        //   break;

        // // Start of string character escape
        // case LexerPhase.StringBackSlash:
        //   switch (ch) {
        //     case "i":
        //     case "p":
        //     case "f":
        //     case "b":
        //     case "I":
        //     case "o":
        //     case "a":
        //     case "t":
        //     case "P":
        //     case "C":
        //     case "'":
        //     case '"':
        //     case "\\":
        //     case "0":
        //       phase = LexerPhase.String;
        //       break;
        //     default:
        //       if (ch === "x") {
        //         phase = LexerPhase.StringHexa1;
        //       } else {
        //         phase = LexerPhase.String;
        //       }
        //   }
        //   break;

        // // First hexadecimal digit of string character escape
        // case LexerPhase.StringHexa1:
        //   if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.StringHexa2;
        //   } else {
        //     return completeToken(TokenType.Unknown);
        //   }
        //   break;

        // // Second hexadecimal digit of character escape
        // case LexerPhase.StringHexa2:
        //   if (isHexadecimalDigit(ch)) {
        //     phase = LexerPhase.String;
        //   } else {
        //     return completeToken(TokenType.Unknown);
        //   }
        //   break;

        // ====================================================================
        // --- We cannot continue
        default:
          return makeToken();
      }

      // --- Append the char to the current text
      appendTokenChar();

      // --- Go on with parsing the next character
    }

    /**
     * Appends the last character to the token, and manages positions
     */
    function appendTokenChar(): void {
      text += ch;
      lexer._prefetched = null;
      lexer._prefetchedPos = null;
      lexer._prefetchedColumn = null;
      lastEndPos = input.position;
      lastEndColumn = input.position;
    }

    /**
     * Fetches the next character from the input stream
     */
    function fetchNextChar(): string | null {
      let ch: string;
      if (!lexer._prefetched) {
        lexer._prefetchedPos = input.position;
        lexer._prefetchedColumn = input.column;
        lexer._prefetched = input.get();
      }
      return lexer._prefetched;
    }

    /**
     * Packs the specified type of token to send back
     * @param type
     */
    function makeToken(): Token {
      if (useResolver) {
        tokenType =
          resolverHash[text] ??
          (isIdStart(text[0]) && text[text.length - 1] !== "'"
            ? TokenType.Identifier
            : TokenType.Unknown);
      }
      return {
        text,
        type: tokenType,
        location: {
          fileIndex: input.fileIndex,
          startPos,
          endPos: lastEndPos,
          startLine: line,
          endLine: line,
          startColumn,
          endColumn: lastEndColumn,
        },
      };
    }

    /**
     * Add the last character to the token and return it
     */
    function completeToken(suggestedType?: TokenType): Token {
      appendTokenChar();

      // --- Send back the token
      if (suggestedType !== undefined) {
        tokenType = suggestedType;
      }
      return makeToken();
    }
  }
}

/**
 * This enum indicates the current lexer phase
 */
enum LexerPhase {
  // Start getting a token
  Start = 0,

  // Collecting whitespace
  InWhiteSpace,

  InlineCommentTrail,
  BlockCommentTrail1,
  BlockCommentTrail2,

  Slash,
  Asterisk,
  Plus,
  Minus,
  Xor,
  Or,
  Ampersand,
  Equal,
  Exclamation,
  AngleLeft,
  AngleRight,
  ShiftRight,
  IdTail,
}

const resolverHash: Record<string, TokenType> = {
  i8: TokenType.I8,
  sbyte: TokenType.I8,
  u8: TokenType.U8,
  byte: TokenType.U8,
  i16: TokenType.I16,
  short: TokenType.I16,
  u16: TokenType.U16,
  ushort: TokenType.U16,
  i32: TokenType.I32,
  int: TokenType.I32,
  u32: TokenType.U32,
  uint: TokenType.U32,
  i64: TokenType.I64,
  long: TokenType.I64,
  u64: TokenType.U64,
  ulong: TokenType.U64,
  f32: TokenType.F32,
  float: TokenType.F32,
  f64: TokenType.F64,
  double: TokenType.F64,
};
