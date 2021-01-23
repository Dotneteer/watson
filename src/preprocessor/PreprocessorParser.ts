import {
  ErrorCodes,
  errorMessages,
  ParserError,
  ParserErrorMessage,
} from "../core/errors";
import { InputStream } from "../core/InputStream";
import {
  PPBinaryExpression,
  PPEvaluationContext,
  PPExpression,
  PPIdentifier,
  PPNotExpression,
} from "./preprocessor-expression";
import { convertPPStringLiteralToRawString } from "./preprocessor-string";
import { PreprocessorExpressionLexer } from "./PreprocessorExpressionLexer";
import { PreprocessorLexer } from "./PreprocessorLexer";
import { PreprocessorStringLiteralLexer } from "./PreprocessorStringLiteralLexer";
import { SourceChunk } from "./SourceChunk";
import { Token, TokenType } from "../core/tokens";

/**
 * This class implements the WA# preprocessor
 */
export class PreprocessorParser implements PPEvaluationContext {
  // --- Use this input stream
  private readonly _inputStream: InputStream;

  // --- Use these lexers
  private readonly _lexer: PreprocessorLexer;
  private readonly _exprLexer: PreprocessorExpressionLexer;
  private readonly _stringLexer: PreprocessorStringLiteralLexer;

  // --- Keep track of error messages
  private readonly _parseErrors: ParserErrorMessage[] = [];

  // --- Preprocessor symbols already defined
  private _preprocessorSymbols: Record<string, boolean> = {};

  // --- Stack of #if .. #elseif .. #else .. #endif constructs
  private readonly _ifStatusStack: IfStatus[] = [];

  /**
   * Instantiates a parser for the preprocessor
   * @param source Source code to parse
   * @param fileIndex File index information
   * @param includeHandler Optional handler managin include files
   */
  constructor(
    public readonly source: string,
    public readonly fileIndex = 0,
    public readonly includeHandler?: (filename: string) => IncludeHandlerResult
  ) {
    this._inputStream = new InputStream({
      fileIndex,
      sourceCode: source,
      pos: 0,
      line: 1,
      col: 0,
    });
    this._lexer = new PreprocessorLexer(this._inputStream);
    this._exprLexer = new PreprocessorExpressionLexer(this._inputStream);
    this._stringLexer = new PreprocessorStringLiteralLexer(this._inputStream);
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
        const trimmedText = token.text.trim();
        if (trimmedText.length > 0) {
          const loc = token.location;
          sourceChunks.push({
            sourceCode: trimmedText,
            fileIndex: loc.fileIndex,
            pos: loc.startPos,
            line: loc.startLine,
            col: loc.startColumn,
          });
        }
      } else if (token.type === TokenType.PreprocDirective) {
        this.parseDirective(sourceChunks, token);
      } else {
        // --- Any other token type must be an error
        this.reportError("P001", token, TokenType[token.type]);
        return null;
      }
    }
    if (this._ifStatusStack.length > 0) {
      this.reportError("P014");
    }
    return sourceChunks;
  }

  /**
   * Parses an expression from the input stream
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
   * Parses a string literal from the input stream
   */
  parseStringLiteral(): string | null {
    const token = this._stringLexer.peek();
    this._stringLexer.reset();
    if (token.type !== TokenType.PPStringLiteral) {
      this.reportError("P015");
      return null;
    }
    return token.text;
  }

  /**
   * Parses and evaluares the expression
   */
  evalExpression(): boolean {
    const parser = this;
    const expr = this.parseExpression();
    this._exprLexer.reset();
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
  private parseDirective(sourceChunks: SourceChunk[], token: Token): void {
    // --- The lexer found a directive
    const ppPos = token.text.lastIndexOf("#");
    if (ppPos < 0) {
      // --- Cannot extract directive name, it must be an error
      this.reportError("P002");
      return;
    }

    // --- By default, add source chunks
    let addSourceChunk = true;

    // --- Parse the directive found
    const directive = token.text.substr(ppPos);
    switch (directive) {
      case "#define":
        addSourceChunk = this.processDefine();
        break;

      case "#undef":
        addSourceChunk = this.processUndef();
        break;

      case "#if":
        addSourceChunk = this.processIf();
        break;

      case "#elseif":
        addSourceChunk = this.processElseIf();
        break;

      case "#else":
        addSourceChunk = this.processElse();
        break;

      case "#endif":
        addSourceChunk = this.processEndIf();
        break;

      case "#include":
        this.processInclude(sourceChunks, token);
        addSourceChunk = false;
        break;

      default:
        this.reportError("P003", null, directive);
        return null;
    }

    if (addSourceChunk) {
      if (ppPos > 0) {
        const trimmedText = token.text.substr(0, ppPos).trim();
        if (trimmedText.length > 0) {
          const loc = token.location;
          sourceChunks.push({
            sourceCode: trimmedText,
            fileIndex: loc.fileIndex,
            pos: loc.startPos,
            line: loc.startLine,
            col: loc.startColumn,
          });
        }
      }
    }
  }

  /**
   * Processes the #define directive
   */
  private processDefine(): boolean {
    const idToken = this._exprLexer.get();
    if (idToken.type !== TokenType.PPIdentifier) {
      this.reportError("P004");
      return;
    }
    this.expectEnd();

    // --- Should skip this directive?
    const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];
    if (ifStatus && (ifStatus.skip || !ifStatus.satisfied) ) {
      return false;
    }

    // --- Define the symbol
    this._preprocessorSymbols[idToken.text] = true;

    // --- Ensure that a previously satisifed condition branch is injected
    if (ifStatus?.satisfied) {
      ifStatus.skip = true;
      if (ifStatus.injected) {
        return false;
      } else {
        ifStatus.injected = true;
      }
    }

    // --- Add the chunk
    return true;
  }

  /**
   * Processes the #under directive
   */
  private processUndef(): boolean {
    const idToken = this._exprLexer.get();
    if (idToken.type !== TokenType.PPIdentifier) {
      this.reportError("P004");
      return;
    }
    this.expectEnd();

    // --- Should skip this directive?
    const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];
    if (ifStatus && (ifStatus.skip || !ifStatus.satisfied) ) {
      return false;
    }

    // --- Define the symbol
    delete this._preprocessorSymbols[idToken.text];

    // --- Ensure that a previously satisifed condition branch is injected
    if (ifStatus?.satisfied) {
      ifStatus.skip = true;
      if (ifStatus.injected) {
        return false;
      } else {
        ifStatus.injected = true;
      }
    }

    // --- Add the chunk
    return true;
  }

  /**
   * Processes the #if directive
   */
  private processIf(): boolean {
    if (this._ifStatusStack.length === 0) {
      const satisfied = this.evalExpression();
      this._ifStatusStack.push({
        satisfied,
        elseReached: false,
        injected: false,
        skip: false,
      });
      return true;
    } else {
      const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];
      const satisfied = this.evalExpression();
      const skip = ifStatus.skip || !ifStatus.satisfied;
      this._ifStatusStack.push({
        satisfied: skip ? false : satisfied,
        elseReached: false,
        injected: false,
        skip,
      });
      return !skip;
    }
  }

  /**
   * Processes the #elseif directive
   */
  private processElseIf(): boolean {
    // --- Check if #elseif is valid here
    if (this._ifStatusStack.length === 0) {
      this.reportError("P009");
      return;
    }
    const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];
    if (ifStatus.elseReached) {
      this.reportError("P010");
      return;
    }

    // --- Evaluate the new condition
    const satisfied = this.evalExpression();

    // --- Should skip this branch?
    if (ifStatus.skip) {
      return false;
    }

    // --- Ensure that a previously satisifed condition branch is injected
    if (ifStatus.satisfied) {
      ifStatus.skip = true;
      if (ifStatus.injected) {
        return false;
      } else {
        ifStatus.injected = true;
        return true;
      }
    }

    // --- Store the result of evaluation
    ifStatus.satisfied = satisfied;

    // --- Do not inject the source chunk before the #elseif
    return false;
  }

  /**
   * Processes the #else directive
   */
  private processElse(): boolean {
    // --- Check if #else is valid here
    if (this._ifStatusStack.length === 0) {
      this.reportError("P011");
      return;
    }
    const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];
    if (ifStatus.elseReached) {
      this.reportError("P012");
      return;
    }

    // --- Should skip this branch?
    if (ifStatus.skip) {
      return false;
    }

    // --- Ensure that a previously satisifed condition branch is injected
    if (ifStatus.satisfied) {
      ifStatus.skip = true;
      if (ifStatus.injected) {
        return false;
      } else {
        ifStatus.injected = true;
        return true;
      }
    }

    // --- The #else branch satisfies the condition
    ifStatus.satisfied = true;

    // --- Do not inject the source chunk before the #else
    return false;
  }

  /**
   * Processes the #endif directive
   */
  private processEndIf(): boolean {
    // --- Check if #endif is valid here
    if (this._ifStatusStack.length === 0) {
      this.reportError("P013");
      return;
    }

    // --- Remove the #if frame
    const ifStatus = this._ifStatusStack.pop();

    // --- Ensure that a previously satisfied condition branch is injected
    return ifStatus.satisfied && !ifStatus.injected;
  }

  /**
   * Processes the include directive
   */
  private processInclude(sourceChunks: SourceChunk[], token: Token): void {
    const ppString = this.parseStringLiteral();
    this.expectEnd();

    // --- Check if this include should be processed
    const ifStatus = this._ifStatusStack[this._ifStatusStack.length - 1];

    // --- Should skip this branch?
    if (ifStatus && (ifStatus.skip || !ifStatus.satisfied)) {
      return;
    }

    // --- Ensure that the webchunk before #include is processed
    const ppPos = token.text.lastIndexOf("#");
    if (ppPos < 0) {
      // --- Cannot extract directive name, it must be an error
      this.reportError("P002");
      return;
    }
    if (ppPos > 0) {
      const trimmedText = token.text.substr(0, ppPos).trim();
      if (trimmedText.length > 0) {
        const loc = token.location;
        sourceChunks.push({
          sourceCode: trimmedText,
          fileIndex: loc.fileIndex,
          pos: loc.startPos,
          line: loc.startLine,
          col: loc.startColumn,
        });
      }
    }

    // --- Process the include file
    const filename = convertPPStringLiteralToRawString(ppString);
    if (this.includeHandler) {
      let sourceInfo: IncludeHandlerResult | undefined;
      try {
        sourceInfo = this.includeHandler(filename);
      } catch (err) {
        this.reportError("P016", null, err.toString());
      }
      const includeParser = new PreprocessorParser(
        sourceInfo.source,
        sourceInfo.fileIndex,
        this.includeHandler
      );
      includeParser._preprocessorSymbols = this._preprocessorSymbols;
      const chunks = includeParser.preprocessSource();
      sourceChunks.push(...chunks);
    }
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
 * Result of an include handler
 */
export interface IncludeHandlerResult {
  /**
   * Include source to process
   */
  source: string;

  /**
   * File index information to store
   */
  fileIndex: number;
}

/**
 * Represents the status of an #if preprocessor directive
 */
interface IfStatus {
  /**
   * Is any of the conditions already satisfied?
   */
  satisfied: boolean;

  /**
   * Has the preprocessor already reached #else?
   */
  elseReached: boolean;

  /**
   * Has the satisfying branch injected?
   */
  injected: boolean;

  /**
   * An outer condition is unsatisfied, skip evaluation
   */
  skip: boolean;
}
