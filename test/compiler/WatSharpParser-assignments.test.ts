import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  Assignment,
  DereferenceLValue,
  FunctionDeclaration,
  IdentifierLValue,
  IndexedLValue,
  MemberLValue,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - assignments", () => {
  const asgnOps = [
    "=",
    "+=",
    "-=",
    "*=",
    "/=",
    "%=",
    "&=",
    "|=",
    "^=",
    ">>=",
    ">>>=",
    "<<=",
  ];
  asgnOps.forEach((c) => {
    it(`identifier '${c}'`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("IdentifierLValue");
      const id = asgn.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
    });

    it(`dereference '${c}'`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        *myVar ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("DereferenceLValue");
      const deref = asgn.lval as DereferenceLValue;
      expect(deref.lval.type).toBe("IdentifierLValue")
      const id = deref.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
    });

    it(`double dereference '${c}'`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        **myVar ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("DereferenceLValue");
      let deref = asgn.lval as DereferenceLValue;
      expect(deref.lval.type).toBe("DereferenceLValue");
      deref = deref.lval as DereferenceLValue;
      expect(deref.lval.type).toBe("IdentifierLValue")
      const id = deref.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
    });

    it(`member access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar.mem ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("MemberLValue");
      const member = asgn.lval as MemberLValue;
      expect(member.lval.type).toBe("IdentifierLValue")
      const id = member.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(member.member).toBe("mem");
    });

    it(`double member access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar.mem.mem2 ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("MemberLValue");
      let member = asgn.lval as MemberLValue;
      expect(member.lval.type).toBe("MemberLValue");
      expect(member.member).toBe("mem2");
      member = member.lval as MemberLValue;
      expect(member.member).toBe("mem");
      let id = member.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(member.member).toBe("mem");
    });

    it(`indexed access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar[123] ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("IndexedLValue");
      const indexed = asgn.lval as IndexedLValue;
      expect(indexed.lval.type).toBe("IdentifierLValue")
      const id = indexed.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(indexed.indexExpr.type).toBe("Literal");
    });

    it(`double indexed access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar[123][453] ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("IndexedLValue");
      let indexed = asgn.lval as IndexedLValue;
      expect(indexed.lval.type).toBe("IndexedLValue")
      indexed = indexed.lval as IndexedLValue;
      expect(indexed.indexExpr.type).toBe("Literal");
      expect(indexed.lval.type).toBe("IdentifierLValue")
      const id = indexed.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(indexed.indexExpr.type).toBe("Literal");
    });

    it(`indexed/member access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar[123].mem ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("MemberLValue");
      let member  = asgn.lval as MemberLValue;
      expect(member.member).toBe("mem");
      let indexed = member.lval as IndexedLValue;
      expect(indexed.lval.type).toBe("IdentifierLValue")
      const id = indexed.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(indexed.indexExpr.type).toBe("Literal");
    });

    it(`member/indexed access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        myVar.mem[123] ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("IndexedLValue");
      let indexed = asgn.lval as IndexedLValue;
      expect(indexed.indexExpr.type).toBe("Literal");
      expect(indexed.lval.type).toBe("MemberLValue")
      const member = indexed.lval as MemberLValue;
      expect(member.member).toBe("mem");
      expect(member.lval.type).toBe("IdentifierLValue");
      const id = member.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
    });

    it(`defer/indexed/member access '${c}' #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      void a() {
        *myVar[123].mem ${c} 123;
      }
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("a");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      const body = funcDecl.body;
      expect(body.length).toBe(1);
      expect(body[0].type).toBe("Assignment");
      const asgn = body[0] as Assignment;
      expect(asgn.lval.type).toBe("DereferenceLValue");
      let deref  = asgn.lval as DereferenceLValue;
      expect(deref.lval.type).toBe("MemberLValue");
      let member = deref.lval as MemberLValue;
      expect(member.member).toBe("mem");
      let indexed = member.lval as IndexedLValue;
      expect(indexed.lval.type).toBe("IdentifierLValue")
      const id = indexed.lval as IdentifierLValue;
      expect(id.name).toBe("myVar");
      expect(indexed.indexExpr.type).toBe("Literal");
    });
  });

  it("Invalid lvla #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      *123 = 456;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W025");
  });
});
