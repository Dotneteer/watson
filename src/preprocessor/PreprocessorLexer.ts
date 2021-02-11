import { InputStream } from "../core/InputStream";
import { isEof, isIdContinuation, isWs, Token, TokenType } from "../core/tokens";

/**
 * This class implements the tokenizer (lexer) of the WA# preprocessor directives
 */
export class PreprocessorLexer {
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

    let phase: LexerPhase = LexerPhase.LineStart;
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

        case LexerPhase.LineStart:
          // --- We start a source code chunk
          tokenType = TokenType.SourceChunk;
          switch (ch) {
            // --- Go on with whitespaces
            case " ":
            case "\t":
            case "\r":
              phase = LexerPhase.InWhiteSpace;
              break;

            // --- We stay in this phase with a new line
            case "\n":
              break;

            // --- May be the beginning of a comment
            case "/":
              phase = LexerPhase.CommentStart;
              break;

            // --- May be the beginning of a preprocessor directive
            case "#":
              phase = LexerPhase.PreprocStart;
              break;

            // --- This line may not be a preprocessor directive
            default:
              phase = LexerPhase.NoPreproc;
              break;
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
              phase = LexerPhase.LineStart;
              break;

            // --- May be the beginning of a comment
            case "/":
              phase = LexerPhase.CommentStart;
              break;

            // --- May be the beginning of a preprocessor directive
            case "#":
              phase = LexerPhase.PreprocStart;
              break;

            default:
              phase = LexerPhase.NoPreproc;
              break;
          }
          break;

        // --- May be the beginning of a comment
        case LexerPhase.CommentStart:
          switch (ch) {
            // --- Starts an end-of-line comment
            case "/":
              phase = LexerPhase.InlineCommentTrail;
              break;
            // --- Starts a block comment
            case "*":
              phase = LexerPhase.BlockCommentTrail1;
              break;
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
          phase =
            ch === "/" ? LexerPhase.NoPreproc : LexerPhase.BlockCommentTrail1;
          break;

        case LexerPhase.InlineCommentTrail:
          if (ch === "\n") {
            phase = LexerPhase.LineStart;
          }
          break;

        // --- May be the start of a preprocessor directive
        case LexerPhase.PreprocStart:
          if (
            (ch >= "a" && ch <= "z") ||
            (ch >= "A" && ch <= "Z") ||
            ch === "_"
          ) {
            phase = LexerPhase.PreprocIdStart;
            tokenType = TokenType.PreprocDirective;
          } else {
            phase = LexerPhase.NoPreproc;
          }
          break;

        case LexerPhase.PreprocIdStart:
          if (!isIdContinuation(ch)) {
            tokenType = TokenType.PreprocDirective;
            return makeToken();
          }

        // --- Whatever comes, it cannot be a preprocessor directive
        case LexerPhase.NoPreproc:
          switch (ch) {
            // --- Maybe a comment
            case "/":
              phase = LexerPhase.CommentStart;
              break;

            // --- A new line, which may contain a directive
            case "\n":
              phase = LexerPhase.LineStart;
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
          startPosition: startPos,
          endPosition: lastEndPos,
          startLine,
          endLine: input.line,
          startColumn,
          endColumn: lastEndColumn,
        },
      };
    }
  }
}

/**
 * Represents the current lexer phase
 */
enum LexerPhase {
  LineStart,
  InWhiteSpace,
  NoPreproc,
  CommentStart,
  BlockCommentTrail1,
  BlockCommentTrail2,
  InlineCommentTrail,
  PreprocStart,
  PreprocIdStart,
}
