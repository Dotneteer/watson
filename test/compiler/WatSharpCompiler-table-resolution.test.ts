import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { TableDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - table resolution", () => {
  it("Single item #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      table void a() { func1 } ;
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
      table void a() { func1 };
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
      table void a() { func1 };
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
      table void a() { func1 };
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
      table void a() { func1, func2 } ;
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
    table void a() { func1, func2 } ;
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
      table void a() { func1, func3 };
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
    table void a() { func1, func3, func4 };
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
    table void a() { func1, func2 };
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
    table void a() { func1, func2, func3 };
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
    table void a() { func1, func2 };
    table void b() { func1 };
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
    table void a() { func1, func2 };
    table void b() { func1 };
    table void c() { func1, func2 };
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

  it("Signature ok #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1() {};
      table i32 a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1() {};
      i32 func2() {};
      table i32 a() { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *i32 func1() {};
      *i32 func2() {};
      table *i32 a() { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u8 func1() {};
      *i32 func2() {};
      table *i16 a() { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func1(u8 a) {};
      void func2(u8 a) {};
      table void a(u8 a) { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func1(u8 a, f64 b) {};
      void func2(u8 a, f64 b) {};
      table void a(u8 a, f64 c) { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature ok #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func1(u8 a, *f64 b) {};
      void func2(u8 a, *f32 b) {};
      table void a(u8 a, *i8 c) { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
  });

  it("Signature issue #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1() {};
      table void a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void func1() {};
      table i32 a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 func1() {};
      table i32 a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *i32 func1() {};
      table i32 a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1(u8 p) {};
      table i32 a() { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1() {};
      table i32 a(u8 p) { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1(i32 p) {};
      table i32 a(*i32 p) { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1(*i32 p) {};
      table i32 a(i32 p) { func1 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });

  it("Signature issue #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 func1(*i32 p) {};
      i32 func2(i32 p) {};
      table i32 a(i32 p) { func1, func2 };
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W158");
  });
});
