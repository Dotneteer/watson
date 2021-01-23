import { InputStream } from "./InputStream";
import {
  isEof,
  isHexadecimalDigit,
  isIdContinuation,
  isRestrictedInString,
  isWs,
  Token,
  TokenType,
} from "./tokens";

/**
 * This class implements the tokenizer (lexer) of the WA# string literal handler
 */
export class PreprocessorStringLiteralLexer {
  // --- Already fetched tokens
  private _ahead: Token[] = [];

  // --- Prefetched character (from the next token)
  private _prefetched: string | null = null;

  // --- Prefetched character position (from the next token)
  private _prefetchedPos: number | null = null;

  // --- Prefetched character column (from the next token)
  private _prefetchedColumn: number | null = null;

  /**
   * Initializes the tokenizer with the input stream
   * @param input Input source code stream
   */
  constructor(public readonly input: InputStream) {}

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
   * Fethces the next token and advances the stream position
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
      if (isEof(token) || ws || (!ws && !isWs(token))) {
        return token;
      }
    }
  }

  /**
   * Resets the parser; drops read-ahead tokens.
   */
  reset(): void {
    this._ahead = [];
  }

  /**
   * Fetches the next token from the input stream
   */
  private fetch(): Token {
    const lexer = this;
    const input = this.input;
    const startPos = this._prefetchedPos || input.position;
    const startLine = input.line;
    const startColumn = this._prefetchedColumn || input.column;
    let text = "";
    let tokenType = TokenType.Eof;
    let lastEndPos = input.position;
    let lastEndColumn = input.column;
    let ch: string | null = null;

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
        // We are at the beginning of a new line

        case LexerPhase.Start:
          // --- We start a source code chunk
          tokenType = TokenType.SourceChunk;
          switch (ch) {
            // --- Go on with whitespaces
            case " ":
            case "\t":
            case "\r":
              phase = LexerPhase.InWhiteSpace;
              break;

            // --- The start of a string literal
            case '"':
              phase = LexerPhase.String;
              break;

            // --- End of the expression
            case "\n":
              return completeToken(TokenType.NewLine);
          }
          break;

        // --- Collect all whitespace characters
        case LexerPhase.InWhiteSpace:
          switch (ch) {
            case " ":
            case "\t":
            case "\r":
              break;

            // --- We stay in this phase with a new line
            case "\n":
              phase = LexerPhase.Start;
              break;

            // --- The start of a string literal
            case '"':
              phase = LexerPhase.String;
              break;

            // --- It cannot be a string literal
            default:
              return makeToken();
          }
          break;

        // --- Next character of the string
        case LexerPhase.String:
          if (ch === '"') {
            return completeToken(TokenType.PPStringLiteral);
          } else if (isRestrictedInString(ch)) {
            return completeToken(TokenType.Unknown);
          } else if (ch === "\\") {
            phase = LexerPhase.StringBackSlash;
            tokenType = TokenType.Unknown;
          }
          break;

        // Start of string character escape
        case LexerPhase.StringBackSlash:
          switch (ch) {
            case "b":
            case "f":
            case "n":
            case "r":
            case "t":
            case "v":
            case "0":
            case "'":
            case '"':
            case "\\":
              phase = LexerPhase.String;
              break;
            default:
              if (ch === "x") {
                phase = LexerPhase.StringHexa1;
              } else {
                phase = LexerPhase.String;
              }
          }
          break;

        // First hexadecimal digit of string character escape
        case LexerPhase.StringHexa1:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.StringHexa2;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

        // Second hexadecimal digit of character escape
        case LexerPhase.StringHexa2:
          if (isHexadecimalDigit(ch)) {
            phase = LexerPhase.String;
          } else {
            return completeToken(TokenType.Unknown);
          }
          break;

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
      return {
        text,
        type: tokenType,
        location: {
          fileIndex: input.fileIndex,
          startPos,
          endPos: lastEndPos,
          startLine,
          endLine: input.line,
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
 * Represents the current lexer phase
 */
enum LexerPhase {
  Start,
  InWhiteSpace,
  String,
  StringBackSlash,
  StringHexa1,
  StringHexa2,
}
