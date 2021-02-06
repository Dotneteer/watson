import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  VariableDeclaration,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - variable declarations", () => {
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
    it(`var decl ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar = 123 * 456;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("Intrinsic");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });

    it(`var decl ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("Intrinsic");
      expect(varDecl.expr).toBeUndefined();
    });

    it(`var decl ${c.src} #3`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} ;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W004");
    });

    it(`var decl ${c.src} #4`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar = ;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W002");
    });

    it(`var decl ${c.src} #5`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar 123
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(true);
      expect(wParser.errors.length).toBe(1);
      expect(wParser.errors[0].code).toBe("W018");
    });
  });

  const namedCases = ["myType", "otherType", "something_1234"];
  namedCases.forEach((c) => {
    it(`var decl/named ${c} `, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c} myVar = 123 * 456;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("NamedType");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });
  });

  const pointerCases = [
    { src: "*i8", type: "Intrinsic" },
    { src: "*i32", type: "Intrinsic" },
    { src: "*f64", type: "Intrinsic" },
    { src: "*myType", type: "NamedType" },
    { src: "**f64", type: "Pointer" },
    { src: "*(i8)", type: "Intrinsic" },
    { src: "*(i32)", type: "Intrinsic" },
    { src: "*(f64)", type: "Intrinsic" },
    { src: "*(myType)", type: "NamedType" },
    { src: "*(*f64)", type: "Pointer" },
    { src: "*(i8[2])", type: "Array" },
    { src: "*(i32[2])", type: "Array" },
    { src: "*(f64[2])", type: "Array" },
    { src: "*(*f64[2])", type: "Array" },
    { src: "*(*(f64[2]))", type: "Pointer" },
    { src: "* struct { u8 l }", type: "Struct" },
  ];
  pointerCases.forEach((c) => {
    it(`var decl/pointer ${c.src} `, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar = 123 * 456;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("Pointer");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });
  });

  const arrayCases = [
    { src: "i8[2]", type: "Intrinsic" },
    { src: "i32[2]", type: "Intrinsic" },
    { src: "f64[2]", type: "Intrinsic" },
    { src: "myType[2]", type: "NamedType" },
    { src: "(*i8)[2]", type: "Pointer" },
    { src: "(myType)[2]", type: "NamedType" },
    { src: "f64[2][3]", type: "Array" },
    { src: "(myType[2])[3]", type: "Array" },
    { src: "(*myType[2])[3]", type: "Array" },
    { src: "struct { u8 l }[5]", type: "Struct" },
  ];
  arrayCases.forEach((c) => {
    it(`var decl/array cases ${c.src} `, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c.src} myVar = 123 * 456;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("Array");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });
  });

  const structCases = [
    "struct { u8 l}",
    "struct { u8 l, u8 h}",
    "struct { u8 l, struct { u8 h } h}",
  ];
  structCases.forEach((c) => {
    it(`var decl/struct cases ${c} `, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
      ${c} myVar = 123 * 456;
      `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myVar");
      expect(decl).toBeDefined();
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.spec.type).toBe("Struct");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });
  });
});
