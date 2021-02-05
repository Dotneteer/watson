import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  FunctionDeclaration,
  ImportedFunctionDeclaration,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - function declarations", () => {
  const instrinsicTypes = [
    { src: "i8", exp: "i8" },
    { src: "sbyte", exp: "i8" },
    { src: "u8", exp: "u8" },
    { src: "byte", exp: "u8" },
    { src: "i16", exp: "i16" },
    { src: "short", exp: "i16" },
    { src: "u16", exp: "u16" },
    { src: "ushort", exp: "u16" },
    { src: "i32", exp: "i32" },
    { src: "int", exp: "i32" },
    { src: "u32", exp: "u32" },
    { src: "uint", exp: "u32" },
    { src: "i64", exp: "i64" },
    { src: "long", exp: "i64" },
    { src: "u64", exp: "u64" },
    { src: "ulong", exp: "u64" },
    { src: "f32", exp: "f32" },
    { src: "float", exp: "f32" },
    { src: "f64", exp: "f64" },
    { src: "double", exp: "f64" },
  ];
  instrinsicTypes.forEach((c) => {
    it(`imported func ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      import ${c.src} myFunc "imports" "myFunc" ();
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const importedFuncDecl = decl as ImportedFunctionDeclaration;
      expect(importedFuncDecl.resultType.type).toBe("Intrinsic");
      expect(importedFuncDecl.name1).toBe('"imports"');
      expect(importedFuncDecl.name2).toBe('"myFunc"');
      expect(importedFuncDecl.parSpecs.length).toBe(0);
    });

    it(`imported func ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      import ${c.src} myFunc "imports" "myFunc" (float);
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const importedFuncDecl = decl as ImportedFunctionDeclaration;
      expect(importedFuncDecl.resultType.type).toBe("Intrinsic");
      expect(importedFuncDecl.name1).toBe('"imports"');
      expect(importedFuncDecl.name2).toBe('"myFunc"');
      expect(importedFuncDecl.parSpecs.length).toBe(1);
    });

    it(`imported func ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      import ${c.src} myFunc "imports" "myFunc" (float, i32);
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const importedFuncDecl = decl as ImportedFunctionDeclaration;
      expect(importedFuncDecl.resultType.type).toBe("Intrinsic");
      expect(importedFuncDecl.name1).toBe('"imports"');
      expect(importedFuncDecl.name2).toBe('"myFunc"');
      expect(importedFuncDecl.parSpecs.length).toBe(2);
    });
  });

  it("imported func void #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import void myFunc "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myFunc");
    expect(decl).toBeDefined();
    const importedFuncDecl = decl as ImportedFunctionDeclaration;
    expect(importedFuncDecl.resultType).toBeUndefined();
    expect(importedFuncDecl.name1).toBe('"imports"');
    expect(importedFuncDecl.name2).toBe('"myFunc"');
    expect(importedFuncDecl.parSpecs.length).toBe(0);
  });

  it("imported func void #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import void myFunc "imports" "myFunc" (u8);
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myFunc");
    expect(decl).toBeDefined();
    const importedFuncDecl = decl as ImportedFunctionDeclaration;
    expect(importedFuncDecl.resultType).toBeUndefined();
    expect(importedFuncDecl.name1).toBe('"imports"');
    expect(importedFuncDecl.name2).toBe('"myFunc"');
    expect(importedFuncDecl.parSpecs.length).toBe(1);
  });

  it("imported func void #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import void myFunc "imports" "myFunc" (u8, double);
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myFunc");
    expect(decl).toBeDefined();
    const importedFuncDecl = decl as ImportedFunctionDeclaration;
    expect(importedFuncDecl.resultType).toBeUndefined();
    expect(importedFuncDecl.name1).toBe('"imports"');
    expect(importedFuncDecl.name2).toBe('"myFunc"');
    expect(importedFuncDecl.parSpecs.length).toBe(2);
  });

  it("imported func issue #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import *u8 myFunc "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W015");
  });

  it("imported func issue #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8[2] myFunc "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W015");
  });

  it("imported func issue #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import myType myFunc "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W015");
  });

  it("imported func issue #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import struct { u8 l } myFunc "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W015");
  });

  it("imported func issue #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8 "imports" "myFunc" ();
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("imported func issue #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8 myFunc "imports" "myFunc" );
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W016");
  });

  it("imported func issue #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8 myFunc "imports" "myFunc" (;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W014");
  });

  it("imported func issue #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8 myFunc "imports" "myFunc" ()
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W006");
  });

  it("imported func issue #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    import u8 myFunc "imports" "myFunc" (*u8);
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W015");
  });

  instrinsicTypes.forEach((c) => {
    it(`func ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(0);
    });

    it(`func *${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      *${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(0);
    });

    it(`func ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myFunc(u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
    });

    it(`func *${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      *${c.src} myFunc(u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
    });

    it(`func ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myFunc(*u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Pointer");
    });

    it(`func *${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      *${c.src} myFunc(*u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Pointer");
    });

    it(`func ${c.src} #4`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myFunc(u8 par1, f32 par2){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(2);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.params[1].name).toBe("par2");
      expect(funcDecl.params[1].spec.type).toBe("Intrinsic");
    });

    it(`func *${c.src} #4`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      *${c.src} myFunc(u8 par1, f32 par2){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(2);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.params[1].name).toBe("par2");
      expect(funcDecl.params[1].spec.type).toBe("Intrinsic");
    });

    it(`func ${c.src} #5`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myFunc(u8 par1, *f32 par2){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(2);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.params[1].name).toBe("par2");
      expect(funcDecl.params[1].spec.type).toBe("Pointer");
    });

    it(`func *${c.src} #5`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      *${c.src} myFunc(u8 par1, *f32 par2){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(2);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.params[1].name).toBe("par2");
      expect(funcDecl.params[1].spec.type).toBe("Pointer");
    });
  });

  instrinsicTypes.forEach((c) => {
    it(`exported func ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      export ${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(0);
      expect(funcDecl.isExport).toBe(true);
    });

    it(`exported func ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      export *${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(0);
      expect(funcDecl.isExport).toBe(true);
    });

    it(`exported func ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      export ${c.src} myFunc(u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.isExport).toBe(true);
    });

    it(`inline func ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      inline ${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(0);
      expect(funcDecl.isInline).toBe(true);
    });

    it(`inline func ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      inline *${c.src} myFunc(){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Pointer");
      expect(funcDecl.params.length).toBe(0);
      expect(funcDecl.isInline).toBe(true);
    });

    it(`inline func ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      inline ${c.src} myFunc(u8 par1){};
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myFunc");
      expect(decl).toBeDefined();
      const funcDecl = decl as FunctionDeclaration;
      expect(funcDecl.resultType.type).toBe("Intrinsic");
      expect(funcDecl.params.length).toBe(1);
      expect(funcDecl.params[0].name).toBe("par1");
      expect(funcDecl.params[0].spec.type).toBe("Intrinsic");
      expect(funcDecl.isInline).toBe(true);
    });
  });

  it("exported void func", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    export void myFunc(){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myFunc");
    expect(decl).toBeDefined();
    const funcDecl = decl as FunctionDeclaration;
    expect(funcDecl.resultType).toBeUndefined();
    expect(funcDecl.params.length).toBe(0);
    expect(funcDecl.isExport).toBe(true);
  });

  it("inline void func", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    inline void myFunc(){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myFunc");
    expect(decl).toBeDefined();
    const funcDecl = decl as FunctionDeclaration;
    expect(funcDecl.resultType).toBeUndefined();
    expect(funcDecl.params.length).toBe(0);
    expect(funcDecl.isInline).toBe(true);
  });

  it("function issue #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8[2] myFunc(){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W020");
  });

  it("function issue #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 (){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("function issue #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W018");
  });

  it("function issue #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc({};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W017");
  });

  it("function issue #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc()};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W009");
  });

  it("function issue #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc(){;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W010");
  });

  it("function issue #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc(u8[2] i){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W019");
  });

  it("function issue #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    u8 myFunc(u8){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W021");
  });

  it("function issue #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    export inline u8 myFunc(){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W008");
  });

  it("function issue #10", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    inline export u8 myFunc(){};
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W008");
  });

});
