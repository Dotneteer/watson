import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  ConstDeclaration,
  GlobalDeclaration,
  TypeDeclaration,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - declarations", () => {
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
    it(`const with ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        const ${c.src} shortConst = 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("shortConst");
      expect(decl).toBeDefined();
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.underlyingType).toBe(c.exp);
      expect(constDecl.expr.type).toBe("BinaryExpression");
    });

    it(`const with ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        const ${c.src} = 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W004");
    });

    it(`const with ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        const ${c.src} myConst 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W007");
    });

    it(`const with ${c.src} #4`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        const ${c.src} myConst = 123 * 456
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W006");
    });
  });

  instrinsicTypes.forEach((c) => {
    it(`global with ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        global ${c.src} myGlobal = 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myGlobal");
      expect(decl).toBeDefined();
      const globalDecl = decl as GlobalDeclaration;
      expect(globalDecl.underlyingType).toBe(c.exp);
      expect(globalDecl.initExpr.type).toBe("BinaryExpression");
    });

    it(`global with ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        global ${c.src} myGlobal;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myGlobal");
      expect(decl).toBeDefined();
      const globalDecl = decl as GlobalDeclaration;
      expect(globalDecl.underlyingType).toBe(c.exp);
      expect(globalDecl.initExpr).toBeUndefined();
    });

    it(`global with ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        global ${c.src} myGlobal 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(2);
      expect(wParser.errors[0].code).toBe("W006");
    });

    it(`global with ${c.src} #4`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        global ${c.src} = 123 * 456;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W004");
    });
  });

  instrinsicTypes.forEach((c) => {
    it(`type with ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        type myType = ${c.src};
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myType");
      expect(decl).toBeDefined();
      const typeDecl = decl as TypeDeclaration;
      expect(typeDecl.spec.type).toBe("Intrinsic");
    });

    it(`type with ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        type myType ${c.src};
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W007");
    });

    it(`type with ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        type myType = ;
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W008");
    });

  });
});
