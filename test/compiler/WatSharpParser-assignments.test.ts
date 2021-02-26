import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  Assignment, DereferenceExpression, FunctionDeclaration, Identifier, ItemAccessExpression, MemberAccessExpression,
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
      expect(asgn.lval.type).toBe("Identifier");
      const id = asgn.lval as Identifier;
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
      expect(asgn.lval.type).toBe("DereferenceExpression");
      const deref = asgn.lval as DereferenceExpression;
      expect(deref.operand.type).toBe("Identifier")
      const id = deref.operand as Identifier;
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
      expect(asgn.lval.type).toBe("DereferenceExpression");
      let deref = asgn.lval as DereferenceExpression;
      expect(deref.operand.type).toBe("DereferenceExpression");
      deref = deref.operand as DereferenceExpression;
      expect(deref.operand.type).toBe("Identifier")
      const id = deref.operand as Identifier;
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
      expect(asgn.lval.type).toBe("MemberAccess");
      const member = asgn.lval as MemberAccessExpression;
      expect(member.object.type).toBe("Identifier")
      const id = member.object as Identifier;
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
      expect(asgn.lval.type).toBe("MemberAccess");
      let member = asgn.lval as MemberAccessExpression;
      expect(member.object.type).toBe("MemberAccess");
      expect(member.member).toBe("mem2");
      member = member.object as MemberAccessExpression;
      expect(member.member).toBe("mem");
      let id = member.object as Identifier;
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
      expect(asgn.lval.type).toBe("ItemAccess");
      const indexed = asgn.lval as ItemAccessExpression;
      expect(indexed.array.type).toBe("Identifier")
      const id = indexed.array as Identifier;
      expect(id.name).toBe("myVar");
      expect(indexed.index.type).toBe("Literal");
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
      expect(asgn.lval.type).toBe("ItemAccess");
      let indexed = asgn.lval as ItemAccessExpression;
      expect(indexed.array.type).toBe("ItemAccess")
      indexed = indexed.array as ItemAccessExpression;
      expect(indexed.index.type).toBe("Literal");
      expect(indexed.array.type).toBe("Identifier")
      const id = indexed.array as Identifier;
      expect(id.name).toBe("myVar");
      expect(indexed.index.type).toBe("Literal");
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
      expect(asgn.lval.type).toBe("MemberAccess");
      let member  = asgn.lval as MemberAccessExpression;
      expect(member.member).toBe("mem");
      let indexed = member.object as ItemAccessExpression;
      expect(indexed.array.type).toBe("Identifier")
      const id = indexed.array as Identifier;
      expect(id.name).toBe("myVar");
      expect(indexed.index.type).toBe("Literal");
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
      expect(asgn.lval.type).toBe("ItemAccess");
      let indexed = asgn.lval as ItemAccessExpression;
      expect(indexed.index.type).toBe("Literal");
      expect(indexed.array.type).toBe("MemberAccess")
      const member = indexed.array as MemberAccessExpression;
      expect(member.member).toBe("mem");
      expect(member.object.type).toBe("Identifier");
      const id = member.object as Identifier;
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
      expect(asgn.lval.type).toBe("DereferenceExpression");
      let deref  = asgn.lval as DereferenceExpression;
      expect(deref.operand.type).toBe("MemberAccess");
      let member = deref.operand as MemberAccessExpression;
      expect(member.member).toBe("mem");
      let indexed = member.object as ItemAccessExpression;
      expect(indexed.array.type).toBe("Identifier")
      const id = indexed.array as Identifier;
      expect(id.name).toBe("myVar");
      expect(indexed.index.type).toBe("Literal");
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
