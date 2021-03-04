import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { DataDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - global resolution", () => {
  const instrinsicCases = [
    { src: "i8", val: 300, exp: 44 },
    { src: "sbyte", val: 500, exp: -12 },
    { src: "u8", val: 300, exp: 44 },
    { src: "byte", val: 500, exp: 244 },
    { src: "i16", val: 100_000, exp: -31072 },
    { src: "short", val: 80_000, exp: 14464 },
    { src: "u16", val: 100_000, exp: 34464 },
    { src: "ushort", val: 80_000, exp: 14464 },
    { src: "i32", val: BigInt("123456781234567812345678"), exp: 1706422094 },
    { src: "int", val: BigInt("12345678123456781234567"), exp: -258854521 },
    { src: "u32", val: BigInt("123456781234567812345678"), exp: 1706422094 },
    { src: "uint", val: BigInt("12345678123456781234567"), exp: 4036112775 },
    {
      src: "i64",
      val: BigInt("123456781234567812345678"),
      exp: BigInt("-7276850770216620210"),
    },
    {
      src: "long",
      val: BigInt("1234567812345678123456789"),
      exp: BigInt("1018468592672004373"),
    },
    {
      src: "u64",
      val: BigInt("123456781234567812345678"),
      exp: BigInt("11169893303492931406"),
    },
    {
      src: "ulong",
      val: BigInt("12345678123456781234567"),
      exp: BigInt("4806338145091203463"),
    },
  ];
  instrinsicCases.forEach((c) => {
    it(`Integral type ${c.src} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      data ${c.src} a [${c.val}];
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("DataDeclaration");
      expect(decl.resolved).toBe(true);
      const dataDecl = decl as DataDeclaration;
      expect(dataDecl.resolved).toBe(true);
      for (const expr of dataDecl.exprs) {
        expect(expr.value).toBe(c.val);
      }
    });

    it(`Integral type ${c.src} #2`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      data ${c.src} a [${c.val}, ${c.val}];
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("DataDeclaration");
      expect(decl.resolved).toBe(true);
      const dataDecl = decl as DataDeclaration;
      expect(dataDecl.resolved).toBe(true);
      for (const expr of dataDecl.exprs) {
        expect(expr.value).toBe(c.val);
      }
    });

    it(`No type ${c.src} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      data a [${c.val}, ${c.val}];
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("DataDeclaration");
      expect(decl.resolved).toBe(true);
      const dataDecl = decl as DataDeclaration;
      expect(dataDecl.resolved).toBe(true);
      for (const expr of dataDecl.exprs) {
        expect(expr.value).toBe(c.val);
      }
    });
  });

  const floatCases = ["f32", "f64", "float", "double"];
  floatCases.forEach((c) => {
    it(`Floating-point type ${c} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      data ${c} a [123, 123];
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W013");
    });
  });
});
