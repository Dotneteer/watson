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
  DataDeclaration,
  Declaration,
  Expression,
  FunctionDeclaration,
  FunctionInvocationExpression,
  FunctionParameter,
  GlobalDeclaration,
  Identifier,
  ImportedFunctionDeclaration,
  IntrinsicType,
  ItemAccessExpression,
  Literal,
  MemberAccessExpression,
  PointerType,
  SizeOfExpression,
  StructField,
  StructType,
  TableDeclaration,
  TypeCastExpression,
  TypeDeclaration,
  TypeSpec,
  UnaryExpression,
  NamedType,
  VariableDeclaration,
  Statement,
  ReturnStatement,
  BreakStatement,
  ContinueStatement,
  IfStatement,
  DoStatement,
  WhileStatement,
  LocalFunctionInvocation,
  Assignment,
  LocalVariable,
  LeftValue,
  DereferenceLValue,
  IdentifierLValue,
  MemberLValue,
  IndexedLValue,
  LiteralSource,
  DereferenceExpression,
} from "./source-tree";
import { MultiChunkInputStream } from "../core/MultiChunkInputStream";
import { report } from "process";

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
        if (
          lastErr &&
          lastErr.code !== "W006" &&
          !lastErr.code.startsWith("W1")
        ) {
          let token: Token;
          do {
            token = this._lexer.get();
          } while (
            token.type !== TokenType.Eof &&
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
   *   | globalDeclaration
   *   | typeDeclaration
   *   | tableDeclaration
   *   | dataDeclaration
   *   | importedFunctionDeclaration
   *   | functionDeclaration
   *   ;
   */
  private parseDeclaration(): void {
    const { start, traits } = this.getParsePoint();

    if (traits.typeStart) {
      const spec = this.parseTypeSpecification();
      if (!spec) {
        this.reportError("W008");
        return;
      }
      const idToken = this._lexer.peek();
      if (idToken.type !== TokenType.Identifier) {
        this.reportError("W004");
        return;
      }
      this._lexer.get();
      const next = this._lexer.peek();
      if (next.type === TokenType.LBrace || next.type === TokenType.Semicolon) {
        this.parseVariableDeclarationTail(start, idToken.text, spec);
        return;
      } else if (next.type === TokenType.LParent) {
        this.parseFuntionDeclarationTail(start, idToken.text, spec);
        return;
      }
      this.reportError("W018");
      return;
    }

    switch (start.type) {
      case TokenType.Eof:
        return;

      case TokenType.Semicolon:
        this._lexer.get();
        break;

      case TokenType.Const:
        this.parseConstDeclaration();
        return;

      case TokenType.Global:
        this.parseGlobalDeclaration();
        return;

      case TokenType.Type:
        this.parseTypeDeclaration();
        return;

      case TokenType.Table:
        this.parseTableDeclaration();
        return;

      case TokenType.Data:
        this.parseDataDeclaration();
        return;

      case TokenType.Import:
        this.parseImportedFunctionDeclaration();
        return;

      case TokenType.Export:
      case TokenType.Inline:
      case TokenType.Void:
        this.parseFunctionDeclaration();
        return;

      default:
        this.reportError("W003", start, start.text);
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
   * tableDeclaration
   *  : "table" (intrinsicType | "void") identifier "(" functionParam? ("," functionParam)* ")"
   *    "{" identifier ("," identifier)* "}" ";"
   *  ;
   */
  private parseTableDeclaration(): void {
    const keyword = this._lexer.get();
    let resultType: TypeSpec | undefined;

    // --- Table reult type
    const { start, traits } = this.getParsePoint();
    if (traits.typeStart) {
      resultType = this.parseTypeSpecification();
    } else if (start.type === TokenType.Void) {
      this._lexer.get();
    } else {
      this.reportError("W008");
      return;
    }

    // --- Check the result type
    if (
      resultType &&
      resultType.type !== "Intrinsic" &&
      resultType.type !== "Pointer"
    ) {
      this.reportError("W020");
      return;
    }

    const id = this.expectToken(TokenType.Identifier, "W004");
    this.expectToken(TokenType.LParent, "W016");
    const params = this.parseFunctionParameters();
    this.expectToken(TokenType.LBrace, "W009");
    const ids: string[] = [];
    do {
      const idToken = this._lexer.peek();
      if (idToken.type !== TokenType.Identifier) {
        this.reportError("W004");
        return;
      }
      ids.push(idToken.text);
      this._lexer.get();
      if (this._lexer.peek().type !== TokenType.Comma) {
        break;
      }
      this._lexer.get();
    } while (true);
    this.expectToken(TokenType.RBrace, "W010");
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<TableDeclaration>(
      "TableDeclaration",
      {
        name: id.text,
        ids,
        params,
        resultType,
      },
      keyword,
      semicolon
    );
  }

  /**
   * dataDeclaration
   *   : "data" (integralType)? identifier "[" expr? ("," expr)* "]"
   *   ;
   */
  private parseDataDeclaration(): void {
    const keyword = this._lexer.get();
    const { start, traits } = this.getParsePoint();
    let underlyingType: string | undefined;
    if (traits.intrinsicType) {
      // --- Intrinsic type definition found
      if (start.type === TokenType.F32 || start.type === TokenType.F64) {
        this.reportError("W013");
        return;
      }
      underlyingType = TokenType[start.type].toLowerCase();
      this._lexer.get();
    }
    const id = this.expectToken(TokenType.Identifier, "W004");
    this.expectToken(TokenType.LSquare, "W011");
    const exprs: Expression[] = [];
    do {
      const expr = this.parseExpr();
      if (expr) {
        exprs.push(expr);
      } else {
        this.reportError("W002");
        return;
      }
      if (this._lexer.peek().type !== TokenType.Comma) {
        break;
      }
      this._lexer.get();
    } while (true);
    this.expectToken(TokenType.RSquare, "W012");
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<DataDeclaration>(
      "DataDeclaration",
      {
        name: id.text,
        underlyingType,
        exprs,
      },
      keyword,
      semicolon
    );
  }

  /**
   * variableDeclaration
   *   : typeSpecification identifier ( "{" expr "}" )? ";"
   *   ;
   */
  private parseVariableDeclarationTail(
    start: Token,
    name: string,
    spec: TypeSpec
  ): void {
    let addressExpr: Expression | undefined;
    let next = this._lexer.peek();
    if (next.type === TokenType.LBrace) {
      this._lexer.get();
      addressExpr = this.getExpression();
      this.expectToken(TokenType.RBrace);
      next = this._lexer.peek();
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<VariableDeclaration>(
      "VariableDeclaration",
      {
        name,
        spec,
        addressExpr,
      },
      start,
      semicolon
    );
  }

  /**
   * importedFunctionDeclaration
   *   : "import" ("void" | intrinsicType) identifier stringLiteral stringLiteral
   *     "(" intrinsicType? ("," intrinsicType)* ")"
   *   ;
   */
  private parseImportedFunctionDeclaration(): void {
    const keyword = this._lexer.get();
    let resultType: IntrinsicType | undefined;
    if (this._lexer.peek().type === TokenType.Void) {
      this._lexer.get();
    } else {
      const spec = this.parseTypeSpecification();
      if (!spec) {
        this.reportError("W014");
        return;
      }
      if (spec.type !== "Intrinsic") {
        this.reportError("W015");
        return;
      }
      resultType = spec;
    }
    const id = this.expectToken(TokenType.Identifier, "W004");
    const name1Literal = this.expectToken(TokenType.StringLiteral).text;
    const name1 = name1Literal.substr(1, name1Literal.length - 2);
    const name2Literal = this.expectToken(TokenType.StringLiteral).text;
    const name2 = name2Literal.substr(1, name2Literal.length - 2);
    this.expectToken(TokenType.LParent, "W016");
    let parSpecs: IntrinsicType[] = [];
    do {
      if (this._lexer.peek().type === TokenType.RParent) {
        break;
      }
      const parSpec = this.parseTypeSpecification();
      if (!parSpec) {
        this.reportError("W014");
        return;
      }
      if (parSpec.type !== "Intrinsic") {
        this.reportError("W015");
        return;
      }
      parSpecs.push(parSpec);
      if (this._lexer.peek().type !== TokenType.Comma) {
        break;
      }
      this._lexer.get();
    } while (true);
    this.expectToken(TokenType.RParent, "W017");
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.addDeclaration<ImportedFunctionDeclaration>(
      "ImportedFunctionDeclaration",
      {
        name: id.text,
        name1,
        name2,
        resultType,
        parSpecs,
      },
      keyword,
      semicolon
    );
  }

  /**
   * functionDeclaration
   *   : functionModifier? ("void" | intrinsicType) identifier
   *     "(" functionParam? ("," functionParam)* ")"
   *     "{" bodyStatement* "}"
   *   ;
   *
   * functionModifier
   *   : "export"
   *   | "inline"
   *   ;
   *
   * functionParam
   *   : typeSpecification identifier
   *   ;
   */
  private parseFunctionDeclaration(): void {
    let isExport: boolean | undefined;
    let isInline: boolean | undefined;
    let resultType: TypeSpec | undefined;
    const keyword = this._lexer.peek();
    if (keyword.type === TokenType.Void) {
      this._lexer.get();
    } else {
      if (keyword.type === TokenType.Export) {
        isExport = true;
      } else if (keyword.type === TokenType.Inline) {
        isInline = true;
      }
      this._lexer.get();
      const { start, traits } = this.getParsePoint();
      if (traits.typeStart) {
        resultType = this.parseTypeSpecification();
      } else if (start.type === TokenType.Void) {
        this._lexer.get();
      } else {
        this.reportError("W008");
        return;
      }
    }
    const id = this.expectToken(TokenType.Identifier);
    this.parseFuntionDeclarationTail(
      keyword,
      id.text,
      resultType,
      isExport,
      isInline
    );
  }

  /**
   * Parses the tail of a function declaration
   * @param id Function identifier
   * @param resultType Function result type
   */
  private parseFuntionDeclarationTail(
    start: Token,
    name: string,
    resultType: TypeSpec | undefined,
    isExport: boolean = false,
    isInline: boolean = false
  ): void {
    // --- We are before the opening parenthesis
    this.expectToken(TokenType.LParent, "W016");

    // --- Check the result type
    if (
      resultType &&
      resultType.type !== "Intrinsic" &&
      resultType.type !== "Pointer"
    ) {
      this.reportError("W020");
      return;
    }
    const params = this.parseFunctionParameters();
    if (!params) {
      return;
    }
    const body: Statement[] = [];
    this.parseBlockStatement(body, 0);
    this.addDeclaration<FunctionDeclaration>(
      "FunctionDeclaration",
      {
        name,
        resultType,
        params,
        isExport,
        isInline,
        body,
      },
      start,
      start
    );
  }

  /**
   * Parses function parameters
   */
  private parseFunctionParameters(): FunctionParameter[] | null {
    let params: FunctionParameter[] = [];
    do {
      const { start, traits } = this.getParsePoint();
      if (!traits.typeStart) {
        break;
      }
      const paramType = this.parseTypeSpecification();
      if (!paramType) {
        this.reportError("W008");
        return null;
      }
      if (paramType.type !== "Intrinsic" && paramType.type !== "Pointer") {
        this.reportError("W019");
        return null;
      }
      const id = this.expectToken(TokenType.Identifier, "W021");
      params.push({
        type: "FunctionParameter",
        name: id.text,
        spec: paramType,
        startPosition: start.location.startPosition,
        endPosition: id.location.endPosition,
        startLine: start.location.startLine,
        endLine: id.location.endLine,
        startColumn: start.location.startColumn,
        endColumn: id.location.endColumn,
      });
      if (this._lexer.peek().type !== TokenType.Comma) {
        break;
      }
      this._lexer.get();
    } while (true);
    this.expectToken(TokenType.RParent, "W017");
    if (this._lexer.peek().type !== TokenType.LBrace) {
      this.reportError("W009");
      return null;
    }
    return params;
  }

  /**
   * Parses a block statement
   */
  private parseBlockStatement(body: Statement[], loopDepth: number): void {
    this._lexer.get();
    let next: Token;
    while (
      (next = this._lexer.peek()).type !== TokenType.RBrace &&
      next.type !== TokenType.Eof
    ) {
      try {
        this.parseStatement(body, loopDepth);
      } catch (err) {
        const lastError = this._parseErrors[this._parseErrors.length - 1];
        if (
          lastError &&
          lastError.code !== "W006" &&
          !lastError.code.startsWith("W1")
        ) {
          break;
        }
      }
    }
    this.expectToken(TokenType.RBrace, "W010");
  }

  /**
   * bodyStatement :=
   *   | blockStatement
   *   | localVariableDeclaration
   *   | assignment
   *   | localFunctionInvocation
   *   | controlFlowStatement
   *   ;
   */
  private parseStatement(body: Statement[], loopDepth: number): void {
    const next = this._lexer.peek();

    // --- Check for local function invocation
    if (
      next.type === TokenType.Identifier &&
      this._lexer.ahead(1).type === TokenType.LParent
    ) {
      this.parseLocalFunctionInvocation(body);
      return;
    }

    // --- Check for assignement
    if (
      next.type === TokenType.Identifier ||
      next.type === TokenType.Asterisk
    ) {
      this.parseAssignment(body, loopDepth);
      return;
    }

    // --- Check other statements
    switch (next.type) {
      case TokenType.LBrace:
        this.parseBlockStatement(body, loopDepth);
        break;

      case TokenType.Semicolon:
        this._lexer.get();
        return;

      case TokenType.Local:
        this.parseLocalVariable(body);
        return;

      case TokenType.If:
        this.parseIfStatement(body, loopDepth);
        return;

      case TokenType.Do:
        this.parseDoStatement(body, loopDepth + 1);
        return;

      case TokenType.While:
        this.parseWhileStatement(body, loopDepth + 1);
        return;

      case TokenType.Break:
        this.parseBreakStatement(body, loopDepth);
        return;

      case TokenType.Continue:
        this.parseContinueStatement(body, loopDepth);
        return;

      case TokenType.Return:
        this.parseReturnStatement(body);
        return;

      default:
        this.reportError("W023");
        return;
    }
  }

  /**
   * localFunctionInvocation
   *   : identifier "(" expr? ("," expr)* ")" ";"
   *   ;
   */
  private parseLocalFunctionInvocation(body: Statement[]): void {
    const id = this._lexer.get();
    const args = this.parseFunctionArgs();
    if (args === null) {
      return;
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    const funcExpr = this.createExpressionNode<FunctionInvocationExpression>(
      "FunctionInvocation",
      {
        name: id.text,
        arguments: args.args,
        dispatcher: args.dispatcher,
      },
      id,
      id
    );
    this.createStatementNode<LocalFunctionInvocation>(
      body,
      "LocalFunctionInvocation",
      {
        name: id.text,
        invoked: funcExpr,
      },
      id,
      semicolon
    );
  }

  /**
   * localVariableStatement
   *   : "local" (intrinsicType | pointerType) identifier ("=" expr) ";"
   *   ;
   */
  private parseLocalVariable(body: Statement[]): void {
    const start = this._lexer.get();
    const spec = this.parseTypeSpecification();
    if (!spec) {
      this.reportError("W008");
      return;
    }
    const id = this._lexer.peek();
    if (id.type !== TokenType.Identifier) {
      this.reportError("W004");
      return;
    }
    this._lexer.get();
    let initExpr: Expression | undefined;
    if (this._lexer.peek().type === TokenType.Asgn) {
      this._lexer.get();
      initExpr = this.parseExpr();
      if (!initExpr) {
        this.reportError("W002");
      }
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.createStatementNode<LocalVariable>(
      body,
      "LocalVariable",
      {
        name: id.text,
        spec,
        initExpr,
      },
      id,
      semicolon
    );
  }

  /**
   * assignment
   *   : leftValue ( "=" | "+=" | "-=" | "*=" | "/=" | "%=" | "^=" | "&=" | "|="
   *     | "<<=" | ">>=" | ">>>=" )
   *     expr ";"
   *   ;
   */
  private parseAssignment(body: Statement[], loopDepth: number): void {
    const lval = this.parseLeftValue();
    if (!lval) {
      return;
    }
    const { start, traits } = this.getParsePoint();
    if (!traits.assignmentOp) {
      this.reportError("W024");
      return;
    }
    this._lexer.get();
    const expr = this.parseExpr();
    if (!expr) {
      return;
    }
    this.createStatementNode<Assignment>(
      body,
      "Assignment",
      {
        lval,
        asgn: start.text,
        expr,
      },
      start,
      start
    );
  }

  /**
   *
   * leftValue
   *   : "*" leftValue
   *   | addressable
   *   ;
   */
  private parseLeftValue(): LeftValue | null {
    const start = this._lexer.peek();
    if (start.type === TokenType.Asterisk) {
      this._lexer.get();
      const lval = this.parseLeftValue();
      if (!lval) {
        return;
      }
      return this.createLValueNode<DereferenceLValue>(
        "DereferenceLValue",
        {
          lval,
        },
        start,
        start
      );
    } else if (start.type === TokenType.Identifier) {
      return this.parseAddressable();
    }
    this.reportError("W025");
    return null;
  }

  /**
   * addressable
   *   : identifier (("[" expr "]") | ("." addressable))*
   *   ;
   */
  private parseAddressable(): LeftValue | null {
    const start = this._lexer.peek();
    if (start.type !== TokenType.Identifier) {
      this.reportError("W004");
      return null;
    }
    this._lexer.get();
    let lval: LeftValue = this.createLValueNode<IdentifierLValue>(
      "IdentifierLValue",
      {
        name: start.text,
      },
      start,
      start
    );

    do {
      const next = this._lexer.peek();
      if (next.type === TokenType.Dot) {
        // --- Process member Lval
        this._lexer.get();
        const idToken = this._lexer.peek();
        if (idToken.type !== TokenType.Identifier) {
          this.reportError("W004");
          return null;
        }
        this._lexer.get();
        lval = this.createLValueNode<MemberLValue>(
          "MemberLValue",
          {
            member: idToken.text,
            lval,
          },
          next,
          idToken
        );
      } else if (next.type === TokenType.LSquare) {
        // --- Process index access
        this._lexer.get();
        const indexExpr = this.parseExpr();
        this.expectToken(TokenType.RSquare);
        lval = this.createLValueNode<IndexedLValue>(
          "IndexedLValue",
          {
            indexExpr,
            lval,
          },
          next,
          this._lexer.peek()
        );
      } else {
        break;
      }
    } while (true);
    return lval;
  }

  /**
   * ifStatement
   *   : "if" "(" condition ")" statement ("else" statement)?
   *   ;
   */
  private parseIfStatement(body: Statement[], loopDepth: number): void {
    const start = this._lexer.get();
    this.expectToken(TokenType.LParent, "W016");
    const test = this.parseEquExpr();
    if (test === null) {
      this.reportError("W002");
      return;
    }
    this.expectToken(TokenType.RParent, "W017");
    const consequent: Statement[] = [];
    this.parseStatement(consequent, loopDepth);
    let alternate: Statement[] | undefined;
    const next = this._lexer.peek();
    if (next.type === TokenType.Else) {
      this._lexer.get();
      alternate = [];
      this.parseStatement(alternate, loopDepth);
    }
    this.createStatementNode<IfStatement>(
      body,
      "If",
      {
        test,
        consequent,
        alternate,
      },
      start,
      start
    );
  }

  /**
   * doWhileStatement
   *   : "do" statement "while" "(" expr ")" ";"
   *   ;
   */
  private parseDoStatement(body: Statement[], loopDepth: number): void {
    const start = this._lexer.get();
    const loopBody: Statement[] = [];
    this.parseStatement(loopBody, loopDepth);
    this.expectToken(TokenType.While, "W022");
    this.expectToken(TokenType.LParent, "W016");
    const test = this.parseEquExpr();
    if (test === null) {
      this.reportError("W002");
      return;
    }
    this.expectToken(TokenType.RParent, "W017");
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.createStatementNode<DoStatement>(
      body,
      "Do",
      {
        loopBody,
        test,
      },
      start,
      semicolon
    );
  }

  /**
   * whileStatement
   *   : "while" "(" expr ")" statement
   *   ;
   */
  private parseWhileStatement(body: Statement[], loopDepth: number): void {
    const start = this._lexer.get();
    this.expectToken(TokenType.LParent, "W016");
    const test = this.parseEquExpr();
    if (test === null) {
      this.reportError("W002");
      return;
    }
    this.expectToken(TokenType.RParent, "W017");
    const loopBody: Statement[] = [];
    this.parseStatement(loopBody, loopDepth);
    this.createStatementNode<WhileStatement>(
      body,
      "While",
      {
        loopBody,
        test,
      },
      start,
      start
    );
  }

  /**
   * breakStatement
   *   : "break" ";"
   *   ;
   */
  private parseBreakStatement(body: Statement[], loopDepth: number): void {
    const start = this._lexer.get();
    if (loopDepth < 1) {
      this.reportError("W110");
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.createStatementNode<BreakStatement>(
      body,
      "Break",
      {},
      start,
      semicolon
    );
  }

  /**
   * continueStatement
   *   : "continue" ";"
   *   ;
   */
  private parseContinueStatement(body: Statement[], loopDepth: number): void {
    const start = this._lexer.get();
    if (loopDepth < 1) {
      this.reportError("W111");
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.createStatementNode<ContinueStatement>(
      body,
      "Continue",
      {},
      start,
      semicolon
    );
  }

  /**
   * returnStatement
   *   : "return" expr? ";"
   *   ;
   */
  private parseReturnStatement(body: Statement[]): void {
    const start = this._lexer.get();
    const next = this._lexer.peek();
    let expr: Expression | undefined;
    if (next.type !== TokenType.Semicolon) {
      // --- Try to obtain the return expression
      expr = this.parseExpr();
      if (!expr) {
        return;
      }
    }
    const semicolon = this.expectToken(TokenType.Semicolon, "W006");
    this.createStatementNode<ReturnStatement>(
      body,
      "Return",
      {
        expr,
      },
      start,
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
    if (!stump.name) {
      throw new Error("A declaration must have a name.");
    }
    if (this._declarations.has(stump.name)) {
      this.reportError("W100", undefined, stump.name);
    }
    const updatedDecl = Object.assign({}, stump, <Declaration>{
      type,
      startPosition: startToken.location.startPosition,
      endPosition: endToken.location.endPosition,
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
   *   : ( | "+" | "-" | "~" | "!" | "&" ) unaryExpr
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
   * dereferenceExpr
   *   : "*" primaryExpr
   *   ;
   */
  private parseDereferenceExpr(): Expression | null {
    const start = this._lexer.get();
    const operand = this.parsePrimaryExpr();
    if (!operand) {
      this.reportError("W002");
      return null;
    }
    return this.createExpressionNode<DereferenceExpression>(
      "DereferenceExpression",
      {
        operand,
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
          arguments: args.args,
          dispatcher: args.dispatcher,
        },
        start,
        start
      );
    }

    switch (start.type) {
      case TokenType.Sizeof:
        this._lexer.get();
        this.expectToken(TokenType.LParent, "W016");
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
        this.expectToken(TokenType.RParent, "W017");
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
              arguments: args.args,
              dispatcher: args.dispatcher,
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

      case TokenType.Infinity:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "Literal",
          {
            value: Infinity,
          },
          start,
          start
        );

      case TokenType.NaN:
        this._lexer.get();
        return this.createExpressionNode<Literal>(
          "Literal",
          {
            value: NaN,
          },
          start,
          start
        );

      case TokenType.Plus:
      case TokenType.Minus:
      case TokenType.BinaryNot:
      case TokenType.Not:
      case TokenType.Ampersand:
        return this.parseUnaryExpr();

      case TokenType.Asterisk:
        return this.parseDereferenceExpr();
    }
    return null;
  }

  /**
   * typeCastExpr
   *   : intrinsicType "(" expr ")"
   */
  private parseTypeCastExpression(): Expression | null {
    const start = this._lexer.get();
    this.expectToken(TokenType.LParent, "W016");
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
   *   : "(" expr? ("," expr)* ")" ("[" expr "]")?
   *   ;
   */
  private parseFunctionArgs(): FunctionArgs | null {
    const args: Expression[] = [];
    let dispatcher: Expression | undefined;
    this.expectToken(TokenType.LParent, "W016");
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
    const next = this._lexer.peek();
    if (next.type === TokenType.LSquare) {
      // --- Optional dispatcher
      this._lexer.get();
      dispatcher = this.parseExpr();
      if (!dispatcher) {
        return null;
      }
      this.expectToken(TokenType.RSquare, "W012");
    }
    return {
      args,
      dispatcher,
    };
  }

  /**
   * Parses a binary literal
   * @param token Literal token
   */
  private parseBinaryLiteral(token: Token): Literal {
    let value: number | bigint;
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
        source:
          typeof value === "number" ? LiteralSource.Int : LiteralSource.BigInt,
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
    let value: number | bigint;
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
        source:
          typeof value === "bigint"
            ? LiteralSource.BigInt
            : Number.isInteger(value)
            ? LiteralSource.Int
            : LiteralSource.Real,
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
    let value: number | bigint;
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
        source:
          typeof value === "number" ? LiteralSource.Int : LiteralSource.BigInt,
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
        source: LiteralSource.Real,
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
      if (size === null) {
        this.reportError("W002");
      }
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
        return this.createTypeSpecNode<NamedType>(
          "NamedType",
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
    this.expectToken(TokenType.LBrace, "W009");
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
    this.expectToken(TokenType.RBrace, "W010");
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
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.startPosition;
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
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.startPosition;
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
   * Creates a left value node
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   */
  private createLValueNode<T extends LeftValue>(
    type: LeftValue["type"],
    stump: any,
    startToken: Token,
    endToken: Token
  ): T {
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.startPosition;
    return Object.assign({}, stump, <LeftValue>{
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
   * @param body List of statements to add the new statement
   * @param type Expression type
   * @param stump Stump properties
   * @param startToken The token that starts the expression
   * @param endToken The token that ends the expression
   */
  private createStatementNode<T extends Statement>(
    body: Statement[],
    type: Statement["type"],
    stump: any,
    startToken: Token,
    endToken: Token
  ): T {
    const startPosition = startToken.location.startPosition;
    const endPosition = endToken.location.startPosition;
    const newStatement = Object.assign({}, stump, <Statement>{
      type,
      startPosition,
      endPosition,
      startLine: startToken.location.startLine,
      startColumn: startToken.location.startColumn,
      endLine: endToken.location.endLine,
      endColumn: endToken.location.startColumn,
    });
    body.push(newStatement);
    return newStatement;
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
      position: token.location.startPosition,
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

/**
 * Represents function arguments
 */
interface FunctionArgs {
  args: Expression[];
  dispatcher?: Expression;
}
