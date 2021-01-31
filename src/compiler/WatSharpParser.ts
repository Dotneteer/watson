import { WatSharpLexer } from "./WatSharpLexer";
import {
  IncludeHandlerResult,
  PreprocessorParser,
} from "../preprocessor/PreprocessorParser";
import { SourceChunk } from "../preprocessor/SourceChunk";
import {
  ErrorCodes,
  errorMessages,
  ParserError,
  ParserErrorMessage,
} from "../core/errors";
import { Token, TokenType } from "../core/tokens";
import { getTokenTraits, TokenTraits } from "./token-traits";
import {
  ArrayType,
  BinaryExpression,
  BuiltInFunctionInvocationExpression,
  ConditionalExpression,
  ConstDeclaration,
  Declaration,
  Expression,
  FunctionInvocationExpression,
  GlobalDeclaration,
  Identifier,
  IntrinsicType,
  ItemAccessExpression,
  Literal,
  MemberAccessExpression,
  PointerType,
  SizeOfExpression,
  StructField,
  StructType,
  TypeCastExpression,
  TypeDeclaration,
  TypeSpec,
  UnaryExpression,
  UnresolvedType,
} from "./source-tree";
import { MultiChunkInputStream } from "../core/MultiChunkInputStream";

export class WatSharpParser {
  // --- Use this preprocessor

  // --- Use this preprocessor
  private readonly _preprocessor: PreprocessorParser;

  // --- Keep track of error messages
  private _parseErrors: ParserErrorMessage[] = [];

  // --- Source chunks to parse
  private _sourceChunks: SourceChunk[] | null = null;

  // --- Use this lexer
  private _lexer: WatSharpLexer | null = null;

  // --- Declarations parsed
  private readonly _declarations = new Map<string, Declaration>();

  constructor(
    public readonly source: string,
    public readonly includeHandler?: (filename: string) => IncludeHandlerResult,
    preprocessorSymbols?: string[],
    preprocess = true
  ) {
    // --- Prepare the preprocessor
    this._preprocessor = new PreprocessorParser(
      source,
      0,
      includeHandler ?? this.handleIncludeFiles
    );
    if (preprocessorSymbols) {
      preprocessorSymbols.forEach(
        (s) => (this._preprocessor.preprocessorSymbols[s] = true)
      );
    }

    // --- Carry out preprocessing, if declared so
    if (preprocess) {
      this.preprocessFiles();
    }
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
   * Gets the declarations of the WAT# program
   */
  get declarations(): Map<string, Declaration> {
    return this._declarations;
  }

  /**
   * Preprocesses the source files
   */
  preprocessFiles(): void {
    try {
      this._sourceChunks = this._preprocessor.preprocessSource();
    } catch (err) {
      this._parseErrors = this._preprocessor.errors.slice(0);
      throw err;
    }

    // --- Prepare the lexer
    this._lexer = new WatSharpLexer(
      new MultiChunkInputStream(this._sourceChunks)
    );
  }

  /**
   * Parse the entire WAT# program
   */
  parseProgram(): void {
    while (this._lexer.peek().type !== TokenType.Eof) {
      try {
        this.parseDeclaration();
      } catch {
        const lastErr = this._parseErrors[this._parseErrors.length - 1];
        // --- Skip the remaining part of the declaration
        if (lastErr?.code !== "W006") {
          let token: Token;
          while (
            (token = this._lexer.get()).type !== TokenType.Eof &&
            token.type !== TokenType.Semicolon &&
            token.type !== TokenType.RBrace
          );
        }
      }
    }
  }

  // ==========================================================================
  // Declarations

  /**
   * declaration
   *   : constDeclaration
   *   ;
   */
  private parseDeclaration(): void {
    const next = this._lexer.peek();
    switch (next.type) {
      case TokenType.Eof:
        return;

      case TokenType.Const:
        this.parseConstDeclaration();
        return;

      case TokenType.Global:
        this.parseGlobalDeclaration();
        return;

      case TokenType.Type:
        this.parseTypeDeclaration();
        return;

      default:
        this.reportError("W003", next, next.text);
        return;
    }
  }

  /**
   * constDeclaration
   *   : "const" intrinsicType identifier "=" expr ";"
   *   ;
   */
  private parseConstDeclaration(): void {
    const keyword = this._lexer.get();
    const { start, traits } = this.getParsePoint();
    if (!traits.intrinsicType) {
      this.reportError("W005", start, start.text);
      return;
    }
    this._lexer.get();
    const id = this.expectToken(TokenType.Identifier, "W004");
    this.expectToken(TokenType.Asgn, "W007");
    const expr = this.parseExpr();
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<ConstDeclaration>(
      "ConstDeclaration",
      {
        name: id.text,
        underlyingType: TokenType[start.type].toLowerCase(),
        expr,
      },
      keyword,
      semicolon
    );
  }

  /**
   * globalDeclaration
   *   : "global" intrinsicType identifier ("=" expr)? ";"
   *   ;
   */
  private parseGlobalDeclaration(): void {
    const keyword = this._lexer.get();
    const { start, traits } = this.getParsePoint();
    if (!traits.intrinsicType) {
      this.reportError("W005", start, start.text);
      return;
    }
    this._lexer.get();
    const id = this.expectToken(TokenType.Identifier, "W004");
    let initExpr: Expression | undefined;
    if (this._lexer.peek().type === TokenType.Asgn) {
      this._lexer.get();
      initExpr = this.parseExpr();
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<GlobalDeclaration>(
      "GlobalDeclaration",
      {
        name: id.text,
        underlyingType: TokenType[start.type].toLowerCase(),
        initExpr,
      },
      keyword,
      semicolon
    );
  }

  /**
   * typeDeclaration
   *  : "type" identifier "=" typeSpecification ";"
   *  ;
   */
  private parseTypeDeclaration(): void {
    const keyword = this._lexer.get();
    const id = this.expectToken(TokenType.Identifier, "W004");
    this.expectToken(TokenType.Asgn, "W007");
    const spec = this.parseTypeSpecification();
    if (spec === null) {
      this.reportError("W008");
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<TypeDeclaration>(
      "TypeDeclaration",
      {
        name: id.text,
        spec,
      },
      keyword,
      semicolon
    );
  }

  /**
   * Adds a new declaration to the existing ones
   * @param type Declaration type
   * @param stump Declaration to add
   * @param startToken: Start token
   * @param endToken: End token
   */
  private addDeclaration<T extends Declaration>(
    type: Declaration["type"],
    stump: any,
    startToken: Token,
    endToken: Token
  ): T {
    const updatedDecl = Object.assign({}, stump, <Declaration>{
      type,
      startPosition: startToken.location.startPos,
      endPosition: endToken.location.endPos,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.startColumn,
      order: this._declarations.size,
    });
    this._declarations.set(stump.name, updatedDecl);
    return updatedDecl;
  }

  // ==========================================================================
  // Expression parsing

  /**
   * expr
   *   : parExpr
   *   | brackExpr
   *   | conditionalExpr
   *   ;
   */
  parseExpr(): Expression | null {
    const traits = this.getParsePoint().traits;
    if (traits.expressionStart) {
      return this.parseCondExpr();
    }
    return null;
  }

  /**
   * conditionalExpr
   *   : orExpr ( "?" expr ":" expr )?
   *   ;
   */
  private parseCondExpr(): Expression | null {
    const startToken = this._lexer.peek();
    const condExpr = this.parseOrExpr();
    if (!condExpr) {
      return null;
    }

    if (!this.skipToken(TokenType.QuestionMark)) {
      return condExpr;
    }

    const trueExpr = this.getExpression();
    this.expectToken(TokenType.Colon);
    const falseExpr = this.getExpression();
    const endToken = this._lexer.peek();

    return this.createExpressionNode<ConditionalExpression>(
      "ConditionalExpression",
      {
        condition: condExpr,
        consequent: trueExpr,
        alternate: falseExpr,
      },
      startToken,
      endToken
    );
  }

  /**
   * orExpr
   *   : xorExpr ( "|" xorExpr )?
   *   ;
   */
  private parseOrExpr(): Expression | null {
    let leftExpr = this.parseXorExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.Or)) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseXorExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: "|",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * xorExpr
   *   : andExpr ( "^" andExpr )?
   *   ;
   */
  private parseXorExpr(): Expression | null {
    let leftExpr = this.parseAndExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.Xor)) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseAndExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: "^",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * andExpr
   *   : equExpr ( "&" equExpr )?
   *   ;
   */
  private parseAndExpr(): Expression | null {
    let leftExpr = this.parseEquExpr();
    if (!leftExpr) {
      return null;
    }

    while (this.skipToken(TokenType.Ampersand)) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseEquExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: "&",
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * equExpr
   *   : relExpr ( ( "==" | "!=" ) relExpr )?
   *   ;
   */
  private parseEquExpr(): Expression | null {
    let leftExpr = this.parseRelExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while ((opType = this.skipTokens(TokenType.Equal, TokenType.NotEqual))) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseRelExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          type: "BinaryExpression",
          operator: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * relExpr
   *   : shiftExpr ( ( "<" | "<=" | ">" | ">=" ) shiftExpr )?
   *   ;
   */
  private parseRelExpr(): Expression | null {
    let leftExpr = this.parseShiftExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.LessThan,
        TokenType.LessThanOrEqual,
        TokenType.GreaterThan,
        TokenType.GreaterThanOrEqual
      ))
    ) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseShiftExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * shiftExpr
   *   : addExpr ( ( "<<" | ">>" ) addExpr )?
   *   ;
   */
  private parseShiftExpr(): Expression | null {
    let leftExpr = this.parseAddExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.ShiftLeft,
        TokenType.ShiftRight,
        TokenType.SignedShiftRight
      ))
    ) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseAddExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * addExpr
   *   : multExpr ( ( "+" | "-" ) multExpr )?
   *   ;
   */
  private parseAddExpr(): Expression | null {
    let leftExpr = this.parseMultExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while ((opType = this.skipTokens(TokenType.Plus, TokenType.Minus))) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseMultExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * multExpr
   *   : memberOrIxdexExpr ( ( "*" | "/" | "%") memberOrIndexExpr )?
   *   ;
   */
  private parseMultExpr(): Expression | null {
    let leftExpr = this.parseMemberOrIndexExpr();
    if (!leftExpr) {
      return null;
    }

    let opType: Token | null;
    while (
      (opType = this.skipTokens(
        TokenType.Asterisk,
        TokenType.Divide,
        TokenType.Remainder
      ))
    ) {
      const startToken = this._lexer.peek();
      const rightExpr = this.parseMemberOrIndexExpr();
      if (!rightExpr) {
        this.reportError("W002");
        return null;
      }
      const endToken = this._lexer.peek();
      leftExpr = this.createExpressionNode<BinaryExpression>(
        "BinaryExpression",
        {
          operator: opType.text,
          left: leftExpr,
          right: rightExpr,
        },
        startToken,
        endToken
      );
    }
    return leftExpr;
  }

  /**
   * memberOrIndexExpression
   *   : memberExpression
   *   | indexExpression
   *   ;
   *
   * memberExpression
   *   : primaryExpression "." expr
   *   ;
   *
   * indexExpression
   *   : primaryExpression "[" expr "]"
   *   ;
   */
  private parseMemberOrIndexExpr(): Expression | null {
    let operand = this.parseUnaryExpr();
    if (!operand) {
      return null;
    }
    do {
      const next = this._lexer.peek();
      if (next.type === TokenType.Dot) {
        // --- Process member access
        this._lexer.get();
        const idToken = this._lexer.peek();
        if (idToken.type !== TokenType.Identifier) {
          this.reportError("W004");
          return null;
        }
        this._lexer.get();
        operand = this.createExpressionNode<MemberAccessExpression>(
          "MemberAccess",
          {
            object: operand,
            member: idToken.text,
          },
          next,
          idToken
        );
      } else if (next.type === TokenType.LSquare) {
        // --- Process index access
        this._lexer.get();
        const indexExpr = this.parseExpr();
        this.expectToken(TokenType.RSquare);
        operand = this.createExpressionNode<ItemAccessExpression>(
          "ItemAccess",
          {
            array: operand,
            index: indexExpr,
          },
          next,
          this._lexer.peek()
        );
      } else {
        break;
      }
    } while (true);
    return operand;
  }

  /**
   * unaryExpr
   *   : ( | "+" | "-" | "~" | "!" | "&" | "*" ) unaryExpr
   *   ;
   */
  private parseUnaryExpr(): Expression | null {
    const { start, traits } = this.getParsePoint();
    if (!traits.unaryOp) {
      return this.parsePrimaryExpr();
    }
    this._lexer.get();
    const unaryOperand = this.parsePrimaryExpr();
    if (!unaryOperand) {
      return null;
    }
    return this.createExpressionNode<UnaryExpression>(
      "UnaryExpression",
      {
        operator: start.text,
        operand: unaryOperand,
      },
      start,
      start
    );
  }

  /**
   * primaryExpr
   *   : "sizeof" "(" typeSpec ")"
   *   | funcInvocation
   *   | literal
   *   | identifier
   *   | unaryExpr
   *   | "(" expr ")"
   *   ;
   */
  private parsePrimaryExpr(): Expression | null {
    const { start, traits } = this.getParsePoint();
    if (traits.intrinsicType) {
      return this.parseTypeCastExpression();
    }
    if (traits.builtInFunc) {
      this._lexer.get();
      const args = this.parseFunctionArgs();
      if (!args) {
        return null;
      }
      return this.createExpressionNode<BuiltInFunctionInvocationExpression>(
        "BuiltInFunctionInvocation",
        {
          name: start.text,
          arguments: args,
        },
        start,
        start
      );
    }

    switch (start.type) {
      case TokenType.Sizeof:
        this._lexer.get();
        this.expectToken(TokenType.LParent);
        const typeSpec = this.parseTypeSpecification();
        this.expectToken(TokenType.RParent);
        return this.createExpressionNode<SizeOfExpression>(
          "SizeOfExpression",
          {
            spec: typeSpec,
          },
          start,
          start
        );

      case TokenType.LParent:
        this._lexer.get();
        const parenthesizedExpr = this.parseExpr();
        if (!parenthesizedExpr) {
          return null;
        }
        this.expectToken(TokenType.RParent);
        return parenthesizedExpr;

      case TokenType.Identifier:
        const idToken = this._lexer.get();
        if (this._lexer.peek().type === TokenType.LParent) {
          const args = this.parseFunctionArgs();
          if (!args) {
            return null;
          }
          return this.createExpressionNode<FunctionInvocationExpression>(
            "FunctionInvocation",
            {
              name: idToken.text,
              arguments: args,
            },
            idToken,
            idToken
          );
        }
        return this.createExpressionNode<Identifier>(
          "Identifier",
          {
            name: idToken.text,
          },
          idToken,
          idToken
        );

      case TokenType.BinaryLiteral:
        this._lexer.get();
        return this.parseBinaryLiteral(start);

      case TokenType.DecimalLiteral:
        this._lexer.get();
        return this.parseDecimalLiteral(start);

      case TokenType.HexadecimalLiteral:
        this._lexer.get();
        return this.parseHexadecimalLiteral(start);

      case TokenType.RealLiteral:
        this._lexer.get();
        return this.parseRealLiteral(start);

      case TokenType.Plus:
      case TokenType.Minus:
      case TokenType.BinaryNot:
      case TokenType.Not:
      case TokenType.Ampersand:
      case TokenType.Asterisk:
        return this.parseUnaryExpr();
    }
    return null;
  }

  /**
   * typeCastExpr
   *   : intrinsicType "(" expr ")"
   */
  private parseTypeCastExpression(): Expression | null {
    const start = this._lexer.get();
    this.expectToken(TokenType.LParent);
    const expr = this.parseExpr();
    if (!expr) {
      this.reportError("W002");
      return null;
    }
    this.expectToken(TokenType.RParent);
    return this.createExpressionNode<TypeCastExpression>(
      "TypeCast",
      {
        name: TokenType[start.type].toLowerCase(),
        operand: expr,
      },
      start,
      start
    );
  }

  /**
   * functionArgsExpr
   *   : "(" expr? ("," expr)* )"
   *   ;
   */
  private parseFunctionArgs(): Expression[] | null {
    const args: Expression[] = [];
    this.expectToken(TokenType.LParent);
    do {
      const { traits } = this.getParsePoint();
      if (!traits.expressionStart) {
        break;
      }
      const expr = this.parseExpr();
      if (!expr) {
        this.reportError("W002");
        return null;
      }
      args.push(expr);
      if (!this.skipToken(TokenType.Comma)) {
        break;
      }
    } while (true);
    this.expectToken(TokenType.RParent);
    return args;
  }

  /**
   * Parses a binary literal
   * @param token Literal token
   */
  private parseBinaryLiteral(token: Token): Literal {
    let value: number | BigInt;
    const bigValue = BigInt(token.text.replace(/_/g, ""));
    if (
      bigValue < Number.MIN_SAFE_INTEGER ||
      bigValue > Number.MAX_SAFE_INTEGER
    ) {
      value = bigValue;
    } else {
      value = parseInt(token.text.substr(2).replace(/_/g, ""), 2);
    }
    return this.createExpressionNode<Literal>(
      "Literal",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Parses a decimal literal
   * @param token Literal token
   */
  private parseDecimalLiteral(token: Token): Literal {
    let value: number | BigInt;
    const bigValue = BigInt(token.text.replace(/_/g, ""));
    if (
      bigValue < Number.MIN_SAFE_INTEGER ||
      bigValue > Number.MAX_SAFE_INTEGER
    ) {
      value = bigValue;
    } else {
      value = parseInt(token.text.replace(/_/g, ""), 10);
    }
    return this.createExpressionNode<Literal>(
      "Literal",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Parses a hexadecimal literal
   * @param token Literal token
   */
  private parseHexadecimalLiteral(token: Token): Literal {
    let value: number | BigInt;
    const bigValue = BigInt(token.text.replace(/_/g, ""));
    if (
      bigValue < Number.MIN_SAFE_INTEGER ||
      bigValue > Number.MAX_SAFE_INTEGER
    ) {
      value = bigValue;
    } else {
      value = parseInt(token.text.substr(2).replace(/_/g, ""), 16);
    }
    return this.createExpressionNode<Literal>(
      "Literal",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Parses a real literal
   * @param token Literal token
   */
  private parseRealLiteral(token: Token): Literal {
    let value = parseFloat(token.text.replace(/_/g, ""));
    return this.createExpressionNode<Literal>(
      "Literal",
      {
        value,
      },
      token,
      token
    );
  }

  /**
   * Gets an expression
   * @param optional Is the expression optional?
   * @param leadingComma Test for leading comma?
   */
  private getExpression(
    optional: boolean = false,
    leadingComma: boolean = false
  ): Expression | null {
    if (leadingComma) {
      if (!this.skipToken(TokenType.Comma)) {
        if (!optional) {
          this.reportError("W001");
        }
        return null;
      } else {
        // --- We have a comma, so the expression in not optional
        optional = false;
      }
    }
    const expr = this.parseExpr();
    if (expr) {
      return expr;
    }
    if (!optional) {
      this.reportError("W002");
    }
    return null;
  }

  // ==========================================================================
  // Type specification parsing

  /**
   * typeSpecification
   *   : primaryTypeSpecification ("[" expr "]")*
   *   ;
   */
  parseTypeSpecification(): TypeSpec | null {
    let typeSpec = this.parsePrimaryTypeSpec();
    if (!typeSpec) {
      return null;
    }
    do {
      const next = this._lexer.peek();
      if (next.type !== TokenType.LSquare) {
        break;
      }
      this._lexer.get();
      const size = this.parseExpr();
      this.expectToken(TokenType.RSquare);
      typeSpec = this.createTypeSpecNode<ArrayType>(
        "Array",
        {
          spec: typeSpec,
          size,
        },
        next,
        next
      );
    } while (true);
    return typeSpec;
  }

  /**
   * primaryTypeSpecification
   *   : instrinsicType
   *   | identifier
   *   | "*" primaryTypeSpecification
   *   | "(" typeSpecification ")"
   *   | structType
   *   ;
   */
  private parsePrimaryTypeSpec(): TypeSpec | null {
    const { start, traits } = this.getParsePoint();
    if (traits.intrinsicType) {
      this._lexer.get();
      return this.createTypeSpecNode<IntrinsicType>(
        "Intrinsic",
        {
          underlying: TokenType[start.type].toLowerCase(),
        },
        start,
        start
      );
    }
    switch (start.type) {
      case TokenType.Identifier:
        this._lexer.get();
        return this.createTypeSpecNode<UnresolvedType>(
          "UnresolvedType",
          {
            name: start.text,
          },
          start,
          start
        );

      case TokenType.Asterisk:
        this._lexer.get();
        return this.createTypeSpecNode<PointerType>(
          "Pointer",
          {
            spec: this.parsePrimaryTypeSpec(),
          },
          start,
          start
        );

      case TokenType.LParent:
        this._lexer.get();
        const typeSpec = this.parseTypeSpecification();
        this.expectToken(TokenType.RParent);
        return typeSpec;

      case TokenType.Struct:
        return this.parseStructType();
    }
    return null;
  }

  /**
   * structType
   *   : "struct" "{" fieldDef ("," fieldDef)* "}"
   *   ;
   
   * fieldDef
   *   : typeSpecification identifier
   *   ;
   */
  private parseStructType(): TypeSpec | null {
    const start = this._lexer.get();
    this.expectToken(TokenType.LBrace);
    const struct = this.createTypeSpecNode<StructType>(
      "Struct",
      {
        fields: [],
      },
      start,
      start
    );
    while (true) {
      // --- Get field type
      const fieldSpec = this.parseTypeSpecification();
      const id = this._lexer.peek();
      if (id.type !== TokenType.Identifier) {
        this.reportError("W004");
        return null;
      }
      this._lexer.get();
      struct.fields.push(
        this.createTypeSpecNode<StructField>(
          "StructField",
          {
            id: id.text,
            spec: fieldSpec,
          },
          id,
          id
        )
      );
      if (!this.skipToken(TokenType.Comma)) {
        break;
      }
    }
    this.expectToken(TokenType.RBrace);
    return struct;
  }

  // ==========================================================================
  // Default include file handling

  /**
   * This method handles the include files with the preprocessor
   * @param filename
   */
  private handleIncludeFiles(filename: string): IncludeHandlerResult {
    return <IncludeHandlerResult>{
      fileIndex: 0,
      source: "",
    };
  }

  // ==========================================================================
  // Helpers

  /**
   * Gets the current parse point
   */
  private getParsePoint(): ParsePoint {
    const start = this._lexer.peek();
    const traits = getTokenTraits(start.type);
    return { start, traits };
  }

  /**
   * Tests the type of the next token
   * @param type Expected token type
   */
  private expectToken(
    type: TokenType,
    errorCode?: ErrorCodes,
    allowEof?: boolean
  ): Token | null {
    const next = this._lexer.peek();
    if (next.type === type || (allowEof && next.type === TokenType.Eof)) {
      // --- Skip the expected token
      return this._lexer.get();
    }
    this.reportError(errorCode ?? "W003", next, next.text);
    return null;
  }

  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  private skipToken(type: TokenType): Token | null {
    const next = this._lexer.peek();
    if (next.type === type) {
      this._lexer.get();
      return next;
    }
    return null;
  }

  /**
   * Skips the next token if the type is the specified one
   * @param type Token type to check
   */
  private skipTokens(...types: TokenType[]): Token | null {
    const next = this._lexer.peek();
    for (const type of types) {
      if (next.type === type) {
        this._lexer.get();
        return next;
      }
    }
    return null;
  }

  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   */
  private createExpressionNode<T extends Expression>(
    type: Expression["type"],
    stump: any,
    startToken: Token,
    endToken: Token
  ): T {
    const startPosition = startToken.location.startPos;
    const endPosition = endToken.location.startPos;
    return Object.assign({}, stump, <Expression>{
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.startColumn,
    });
  }

  /**
   * Creates an expression node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   */
  private createTypeSpecNode<T extends TypeSpec>(
    type: TypeSpec["type"],
    stump: any,
    startToken: Token,
    endToken: Token
  ): T {
    const startPosition = startToken.location.startPos;
    const endPosition = endToken.location.startPos;
    return Object.assign({}, stump, <TypeSpec>{
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.startColumn,
    });
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
 * This interface represents the parsing point that can be passed to parsing methods
 */
interface ParsePoint {
  /**
   * Start token at that point
   */
  start: Token;

  /**
   * Traist of the start token
   */
  traits: TokenTraits;
}
