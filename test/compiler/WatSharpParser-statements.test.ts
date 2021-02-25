import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  DoStatement,
  FunctionDeclaration,
  IfStatement,
  LocalFunctionInvocation,
  LocalVariable,
  ReturnStatement,
  WhileStatement,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - statements", () => {
  it("Local function declaration #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall();
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
    expect(body[0].type).toBe("LocalFunctionInvocation");
    const call = body[0] as LocalFunctionInvocation;
    expect(call.invoked.name).toBe("myCall");
    expect(call.invoked.arguments.length).toBe(0);
  });

  it("Local function declaration #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall(a);
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
    expect(body[0].type).toBe("LocalFunctionInvocation");
    const call = body[0] as LocalFunctionInvocation;
    expect(call.invoked.name).toBe("myCall");
    expect(call.invoked.arguments.length).toBe(1);
  });

  it("Local function declaration #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall(12, abc*4);
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
    expect(body[0].type).toBe("LocalFunctionInvocation");
    const call = body[0] as LocalFunctionInvocation;
    expect(call.invoked.name).toBe("myCall");
    expect(call.invoked.arguments.length).toBe(2);
  });

  it("Local function declaration #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall(
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W003");
  });

  it("Local function declaration #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall(while);
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W003");
  });

  it("Local function declaration #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      myCall()
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W006");
  });

  it("if #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
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
    expect(body[0].type).toBe("If");
    const ifStmt = body[0] as IfStatement;
    expect(ifStmt.test.type).toBe("BinaryExpression");
    expect(ifStmt.consequent.length).toBe(1);
    expect(ifStmt.alternate).toBeUndefined();
  });

  it("if #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else myCall();
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
    expect(body[0].type).toBe("If");
    const ifStmt = body[0] as IfStatement;
    expect(ifStmt.test.type).toBe("BinaryExpression");
    expect(ifStmt.consequent.length).toBe(1);
    expect(ifStmt.alternate.length).toBe(1);
  });

  it("if #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        myCall();
        return;
      }
      else myCall();
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
    expect(body[0].type).toBe("If");
    const ifStmt = body[0] as IfStatement;
    expect(ifStmt.test.type).toBe("BinaryExpression");
    expect(ifStmt.consequent.length).toBe(2);
    expect(ifStmt.alternate.length).toBe(1);
  });

  it("if #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        myCall();
        return 321;
      } else {
        myCall();
        return 123;
      }
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
    expect(body[0].type).toBe("If");
    const ifStmt = body[0] as IfStatement;
    expect(ifStmt.test.type).toBe("BinaryExpression");
    expect(ifStmt.consequent.length).toBe(2);
    expect(ifStmt.alternate.length).toBe(2);
  });

  it("if #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        myCall();
        return 1;
      }
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
    expect(body[0].type).toBe("If");
    const ifStmt = body[0] as IfStatement;
    expect(ifStmt.test.type).toBe("BinaryExpression");
    expect(ifStmt.consequent.length).toBe(2);
    expect(ifStmt.alternate).toBeUndefined();
  });

  it("if #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if 3>2 myCall();
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W016");
  });

  it("if #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3>2 myCall();
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W017");
  });

  it("do #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do ;
      while (3 > 2);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(0);
    expect(doStmt.test.type).toBe("BinaryExpression");
  });

  it("do #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do myCall();
      while (3 > 2);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.test.type).toBe("BinaryExpression");
  });

  it("do #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do {
        myCall();
      }
      while (3 > 2);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.test.type).toBe("BinaryExpression");
  });

  it("do #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do {
        myCall();
        break;
      }
      while (3 > 2);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(2);
    expect(doStmt.test.type).toBe("BinaryExpression");
  });

  it("do #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do {
        myCall();
        continue;
      }
      while (3 > 2);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(2);
    expect(doStmt.test.type).toBe("BinaryExpression");
  });

  it("do #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do ;
      while 3 > 2);
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W016");
  });

  it("do #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do ;
      while (3 > 2;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W017");
  });

  it("do #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do ;
      while (3 > 2)
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W006");
  });

  it("while #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2);
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(0);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) myCall();
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(1);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
      }
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(1);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
        break;
      }
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(2);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
        break;
        {
          myCall();
        }
      }
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(3);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
        break;
        {
          myCall();
          continue;
        }
      }
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(4);
    expect(whileStmt.test.type).toBe("BinaryExpression");
  });

  it("while #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while 3 > 2);
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W016");
  });

  it("while #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (do);
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W002");
  });

  it("while #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W017");
  });

  it("while #10", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2)
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W023");
  });

  it("nested loop #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
        do {
          myCall();
        }
        while (3 > 2);
      }
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
    expect(body[0].type).toBe("While");
    const whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(2);
    expect(whileStmt.loopBody[1].type).toBe("Do");
    const doStmt = whileStmt.loopBody[1] as DoStatement;
    expect(doStmt.loopBody.length).toBe(1);
  });

  it("nested loop #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (3 > 2) {
        myCall();
        while (0) {
          myCall();
          myCall();
          break;
        }
      }
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
    expect(body[0].type).toBe("While");
    let whileStmt = body[0] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(2);
    expect(whileStmt.loopBody[1].type).toBe("While");
    whileStmt = whileStmt.loopBody[1] as WhileStatement;
    expect(whileStmt.loopBody.length).toBe(3);
  });

  it("break #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do break;
      while (1);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.loopBody[0].type).toBe("Break");
  });

  it("break #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (1) {
        break;
      }
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
    expect(body[0].type).toBe("While");
    const doStmt = body[0] as WhileStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.loopBody[0].type).toBe("Break");
  });

  it("break #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      break;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) break;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        break;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        myCall();
        break;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else break;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else {
        break;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("break #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else {
        myCall();
        break;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W110");
  });

  it("continue #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      do continue;
      while (1);
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
    expect(body[0].type).toBe("Do");
    const doStmt = body[0] as DoStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.loopBody[0].type).toBe("Continue");
  });

  it("continue #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      while (1) {
        continue;
      }
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
    expect(body[0].type).toBe("While");
    const doStmt = body[0] as WhileStatement;
    expect(doStmt.loopBody.length).toBe(1);
    expect(doStmt.loopBody[0].type).toBe("Continue");
  });

  it("continue #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      continue;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) continue;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        continue;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) {
        myCall();
        continue;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else continue;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else {
        continue;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("continue #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      if (3 > 2) myCall();
      else {
        myCall();
        continue;
      }
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W111");
  });

  it("return #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    void a() {
      return;
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
    expect(body[0].type).toBe("Return");
    const retStmt = body[0] as ReturnStatement;
    expect(retStmt.expr).toBeUndefined();
  });

  it("return #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      return 12345;
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
    expect(body[0].type).toBe("Return");
    const retStmt = body[0] as ReturnStatement;
    expect(retStmt.expr.type).toBe("Literal");
  });


  it("local variable #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local u8 myVar;
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
    expect(body[0].type).toBe("LocalVariable");
    const local = body[0] as LocalVariable;
    expect(local.name).toBe("myVar");
    expect(local.spec.type).toBe("Intrinsic");
    expect(local.initExpr).toBeUndefined();
  });

  it("local variable #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local *u8 myVar;
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
    expect(body[0].type).toBe("LocalVariable");
    const local = body[0] as LocalVariable;
    expect(local.name).toBe("myVar");
    expect(local.spec.type).toBe("Pointer");
    expect(local.initExpr).toBeUndefined();
  });

  it("local variable #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local u8 myVar = 123;
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
    expect(body[0].type).toBe("LocalVariable");
    const local = body[0] as LocalVariable;
    expect(local.name).toBe("myVar");
    expect(local.spec.type).toBe("Intrinsic");
    expect(local.initExpr.type).toBe("Literal");
  });

  it("local variable #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local *u8 myVar = 123;
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
    expect(body[0].type).toBe("LocalVariable");
    const local = body[0] as LocalVariable;
    expect(local.name).toBe("myVar");
    expect(local.spec.type).toBe("Pointer");
    expect(local.initExpr.type).toBe("Literal");
  });

  it("local variable #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local do = 123;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W008");
  });

  it("local variable #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    ushort a() {
      local u8 = 123;
    }
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(3);
    expect(wParser.errors[0].code).toBe("W004");
  });
});
