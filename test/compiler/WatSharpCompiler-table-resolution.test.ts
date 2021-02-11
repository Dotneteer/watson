import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { TableDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - table resolution", () => {
  it("Single item #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      table a { func1 } ;
      void func1() {};
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
  });

  it("Single item #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func1() {};
      table a { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
  });

  it("Single item #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func2() {};
      table a { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W101");
  });

  it("Single item #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      table a { func1 };
      const u8 func1 = 113;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W109");
  });

  it("Multiple items #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      table a { func1, func2 } ;
      void func1() {};
      void func2() {};
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
  });

  it("Multiple items #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    void func1() {};
    void func2() {};
    table a { func1, func2 } ;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
  });

  it("Multiple items #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func2() {};
      void func1() {};
      table a { func1, func3 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W101");
  });

  it("Multiple items #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    void func2() {};
    void func1() {};
    table a { func1, func3, func4 };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(2);
    expect(wComp.errors[0].code).toBe("W101");
    expect(wComp.errors[1].code).toBe("W101");
  });

  it("Multiple items #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 func2 = 123;
    void func1() {};
    table a { func1, func2 };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W109");
  });

  it("Multiple items #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 func2 = 123;
    const i32 func3 = 123;
    void func1() {};
    table a { func1, func2, func3 };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(2);
    expect(wComp.errors[0].code).toBe("W109");
    expect(wComp.errors[1].code).toBe("W109");
  });

  it("Multiple tables #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    void func1() {};
    void func2() {};
    table a { func1, func2 };
    table b { func1 };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    let tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(2);
  });

  it("Multiple tables #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    void func1() {};
    void func2() {};
    table a { func1, func2 };
    table b { func1 };
    table c { func1, func2 };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    let tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(0);
    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(2);
    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TableDeclaration");
    expect(decl.resolved).toBe(true);
    tableDecl = decl as TableDeclaration;
    expect(tableDecl.resolved).toBe(true);
    expect(tableDecl.entryIndex).toBe(3);
  });
});
