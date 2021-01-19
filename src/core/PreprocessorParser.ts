import {
  ErrorCodes,
  errorMessages,
  ParserError,
  ParserErrorMessage,
} from "./errors";
import { InputStream } from "./InputStream";
import {
  PPBinaryExpression,
  PPEvaluationContext,
  PPExpression,
  PPIdentifier,
  PPNotExpression,
} from "./preprocessor-expression";
import { PreprocessorExpressionLexer } from "./PreprocessorExpressionLexer";
import { PreprocessorLexer } from "./PreprocessorLexer";
import { SourceChunk } from "./SourceChunk";
import { Token, TokenType } from "./tokens";

/**
 * This class implements the WA# preprocessor
 */
export class PreprocessorParser implements PPEvaluationContext {
  // --- Use this input stream
  private readonly _inputStream: InputStream;

  // --- Use these lexers
  private readonly _lexer: PreprocessorLexer;
  private readonly _exprLexer: PreprocessorExpressionLexer;

  // --- Keep track of error messages
  private readonly _parseErrors: ParserErrorMessage[] = [];

  // --- Preprocessor symbols already defined
  private readonly _preprocessorSymbols: Record<string, boolean> = {};

  // --- Stack of #if .. #elseif .. #else .. #endif constructs
  private readonly _ifStatusStack: IfStatus[] = [];

  /**
   * Instantiates a parser for the preprocessor
   * @param source Source code to parse
   * @param fileIndex File index information
   */
  constructor(public readonly source: string, public readonly fileIndex = 0) {
    this._inputStream = new InputStream({
      fileIndex,
      sourceCode: source,
      pos: 0,
      line: 1,
      col: 0,
    });
    this._lexer = new PreprocessorLexer(this._inputStream);
    this._exprLexer = new PreprocessorExpressionLexer(this._inputStream);
  }

  /**
   * Tests if the specified symbol is defined in the context
   * @param symbolId Symbol identifier
   */
  idSymbolDefined(symbolId: string): boolean {
    return this._preprocessorSymbols[symbolId];
  }

  /**
   * Gets the container of defined preprocessor symbols
   */
  get preprocessorSymbols(): Record<string, boolean> {
    return this._preprocessorSymbols;
  }

  /**
   * The errors raised during the parse phase
   */
  get errors(): ParserErrorMessage[] {
    return this._parseErrors;
  }

  /**
   * Indicates if there were any errors during the parse phase
   */
  get hasErrors(): boolean {
    return this._parseErrors.length > 0;
  }

  /**
   * Preprocesses the source code and retrives the source code chunks
   * found
   */
  preprocessSource(): SourceChunk[] | null {
    const sourceChunks: SourceChunk[] = [];
    let token: Token;
    while ((token = this._lexer.get()).type !== TokenType.Eof) {
      // --- Obtain the next chunk of source code
      if (token.type === TokenType.SourceChunk) {
        const loc = token.location;
        sourceChunks.push({
          sourceCode: token.text,
          fileIndex: loc.fileIndex,
          pos: loc.startPos,
          line: loc.startLine,
          col: loc.startColumn,
        });
      } else if (token.type === TokenType.PreprocDirective) {
        // --- The lexer found a directive
        const ppPos = token.text.lastIndexOf("#");
        if (ppPos < 0) {
          // --- Cannot extract directive name, it must be an error
          this.reportError("P002");
          return null;
        }

        // --- Add the source code chunk
        if (ppPos > 0) {
          const loc = token.location;
          sourceChunks.push({
            sourceCode: token.text.substr(0, ppPos),
            fileIndex: loc.fileIndex,
            pos: loc.startPos,
            line: loc.startLine,
            col: loc.startColumn,
          });
        }

        // --- Parse the directive found
        this.parseDirective(token.text.substr(ppPos));
      } else {
        // --- Any other token type must be an error
        this.reportError("P001", token, TokenType[token.type]);
        return null;
      }
    }
    return sourceChunks;
  }

  /**
   * Parses an expresion from the input stream
   */
  parseExpression(): PPExpression | null {
    const token = this._exprLexer.peek();
    if (token.type === TokenType.Eof) {
      this.reportError("P007");
      return null;
    }
    return this.parseOrExpression();
  }

  /**
   * Parses and evaluares the expression
   */
  evalExpression(): boolean {
    const parser = this;
    const expr = this.parseExpression();
    return evalInner(expr);

    function evalInner(expr: PPExpression): boolean {
      switch (expr.type) {
        case "Id":
          return !!parser._preprocessorSymbols[expr.name];
        case "NotExpr":
          return !evalInner(expr.operand);
        case "BinaryExpr":
          const left = evalInner(expr.leftOperand);
          const right = evalInner(expr.rightOperand);
          switch (expr.operator) {
            case "^":
              return left !== right;
            case "|":
              return left || right;
            case "&":
              return left && right;
          }
      }
    }
  }

  // ==========================================================================
  // Helpers

  /**
   * Parse a preprocessor directive
   * @param directive
   */
  private parseDirective(directive: string): void {
    switch (directive) {
      case "#define":
        this.processDefine();
        break;

      case "#undef":
        this.processUndef();
        break;

      case "#if":
        break;

      case "#elseif":
        break;

      case "#else":
        break;

      case "#endif":
        break;

      case "#include":
        break;

      default:
        this.reportError("P003", null, directive);
        return null;
    }
  }

  /**
   * Processes the #define directive
   */
  private processDefine(): void {
    const idToken = this._exprLexer.get();
    if (idToken.type !== TokenType.PPIdentifier) {
      this.reportError("P004");
      return;
    }
    this._preprocessorSymbols[idToken.text] = true;
    this.expectEnd();
  }

  /**
   * Processes the #under directive
   */
  private processUndef(): void {
    const idToken = this._exprLexer.get();
    if (idToken.type !== TokenType.PPIdentifier) {
      this.reportError("P004");
      return;
    }
    delete this._preprocessorSymbols[idToken.text];
    this.expectEnd();
  }

  /**
   * Checks if a preprocessor
   */
  private expectEnd(): void {
    const completionToken = this._exprLexer.get();
    if (
      completionToken.type !== TokenType.Eof &&
      completionToken.type != TokenType.NewLine
    ) {
      this.reportError("P005");
    }
  }

  /**
   * Parses a binary OR expression
   * orExpr
   *   : xorExpr ( "|" xorExpr )?
   */
  private parseOrExpression(): PPExpression | null {
    let leftExpr = this.parseXorExpression();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.OrOp)) {
      const rightExpr = this.parseXorExpression();
      if (!rightExpr) {
        this.reportError("P007");
        return null;
      }
      leftExpr = <PPBinaryExpression>{
        type: "BinaryExpr",
        operator: "|",
        leftOperand: leftExpr,
        rightOperand: rightExpr,
      };
    }
    return leftExpr;
  }

  /**
   * Evaluates a binary XOR expression
   * xorExpr
   *   : andExpr ( "^" andExpr )?
   */
  private parseXorExpression(): PPExpression | null {
    let leftExpr = this.parseAndExpression();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.XorOp)) {
      const rightExpr = this.parseAndExpression();
      if (!rightExpr) {
        this.reportError("P007");
        return null;
      }
      leftExpr = <PPBinaryExpression>{
        type: "BinaryExpr",
        operator: "^",
        leftOperand: leftExpr,
        rightOperand: rightExpr,
      };
    }
    return leftExpr;
  }

  /**
   * Evaluates a binary AND expression
   * andExpr
   *   : primaryExpr ( "&" primaryExpr )?
   */
  private parseAndExpression(): PPExpression | null {
    let leftExpr = this.parsePrimaryExpression();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.AndOp)) {
      const rightExpr = this.parsePrimaryExpression();
      if (!rightExpr) {
        this.reportError("P007");
        return null;
      }
      leftExpr = <PPBinaryExpression>{
        type: "BinaryExpr",
        operator: "&",
        leftOperand: leftExpr,
        rightOperand: rightExpr,
      };
    }
    return leftExpr;
  }

  /**
   * Evaluates a primary expression
   */
  private parsePrimaryExpression(): PPExpression | null {
    let next = this._exprLexer.peek();

    // --- Test for parenthesized expression
    if (next.type === TokenType.LParent) {
      return this.parseParenthesizedExpression();
    }

    // --- Test for NOT expression
    if (next.type === TokenType.NotOp) {
      this._exprLexer.get();
      const expr = this.parseExpression();
      return <PPNotExpression>{
        type: "NotExpr",
        operand: expr,
      };
    }

    // --- Test for identifier
    if (next.type !== TokenType.PPIdentifier) {
      this.reportError("P004");
      return null;
    }

    // --- Rip off the identifier
    this._exprLexer.get();
    return <PPIdentifier>{
      type: "Id",
      name: next.text,
    };
  }

  /**
   * Evaluates a parenthesized expression
   * parenthesizedExpr
   *   : "(" expr ")"
   *   ;
   */
  private parseParenthesizedExpression(): PPExpression | null {
    if (this.skipToken(TokenType.LParent)) {
      const expr = this.parseExpression();
      if (!expr) {
        return null;
      }
      this.expectToken(TokenType.RParent, "P008");
      return expr;
    }
    return null;
  }

  /**
   * Tests the type of the next token
   * @param type Expected token type
   */
  private expectToken(
    type: TokenType,
    errorCode?: ErrorCodes,
    allowEof?: boolean
  ) {
    const next = this._exprLexer.peek();
    if (next.type === type || (allowEof && next.type === TokenType.Eof)) {
      // --- Skip the expected token
      this._exprLexer.get();
      return;
    }
    this.reportError(errorCode ?? "P006", next, next.text);
  }

  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  private skipToken(type: TokenType): Token | null {
    const next = this._exprLexer.peek();
    if (next.type === type) {
      this._exprLexer.get();
      return next;
    }
    return null;
  }

  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  private skipTokens(...types: TokenType[]): Token | null {
    const next = this._exprLexer.peek();
    for (const type of types) {
      if (next.type === type) {
        this._exprLexer.get();
        return next;
      }
    }
    return null;
  }

  /**
   * Reports the specified error
   * @param errorCode Error code
   * @param token Token that represents the error's position
   * @param options Error message options
   */
  private reportError(
    errorCode: ErrorCodes,
    token?: Token,
    ...options: any[]
  ): void {
    let errorText: string = errorMessages[errorCode] ?? "Unkonwn error";
    if (options) {
      options.forEach(
        (o, idx) =>
          (errorText = replace(errorText, `{${idx}}`, options[idx].toString()))
      );
    }
    if (!token) {
      token = this._lexer.peek();
    }
    this._parseErrors.push({
      code: errorCode,
      text: errorText,
      line: token.location.startLine,
      column: token.location.startColumn,
      position: token.location.startPos,
    });
    throw new ParserError(errorText, errorCode);

    function replace(
      input: string,
      placeholder: string,
      replacement: string
    ): string {
      do {
        input = input.replace(placeholder, replacement);
      } while (input.includes(placeholder));
      return input;
    }
  }
}

/**
 * Represents the status of an #if preprocessor directive
 */
interface IfStatus {
  /**
   * Is any of the conditions already satisfied?
   */
  satisifed: boolean;

  /**
   * Has the preprocessor already reached #else?
   */
  elseReached: boolean;
}
