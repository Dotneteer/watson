import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - expressions", () => {
  const simplificationCases = [
    { src: "13 * (12 + a)", exp: "((a+12)*13)" },
    { src: "12 + a", exp: "(a+12)" },
    { src: "0 + a", exp: "a" },
    { src: "a + 0", exp: "a" },
    { src: "0 + (a*b)", exp: "(a*b)" },
    { src: "(a*b) + 0", exp: "(a*b)" },
    { src: "a - 0", exp: "a" },
    { src: "0 - a", exp: "-(a)" },
    { src: "a*b - 0", exp: "(a*b)" },
    { src: "0 - a*b", exp: "-((a*b))" },
    { src: "0 | a", exp: "a" },
    { src: "a | 0", exp: "a" },
    { src: "0 | a*b", exp: "(a*b)" },
    { src: "a*b | 0", exp: "(a*b)" },
    { src: "0 ^ a", exp: "a" },
    { src: "a ^ 0", exp: "a" },
    { src: "0 ^ a*b", exp: "(a*b)" },
    { src: "a*b ^ 0", exp: "(a*b)" },
    { src: "a * 1", exp: "a" },
    { src: "1 * a", exp: "a" },
    { src: "a*b * 1", exp: "(a*b)" },
    { src: "1 * (a*b)", exp: "(a*b)" },
    { src: "a * 1 * b", exp: "(a*b)" },
    { src: "a / 1", exp: "a" },
    { src: "a % 1", exp: "0" },
    { src: "a*b / 1", exp: "(a*b)" },
    { src: "a % 1", exp: "0" },
    { src: "(a+b) % 1", exp: "0" },
    { src: "a >> 0", exp: "a" },
    { src: "a*b >> 0", exp: "(a*b)" },
    { src: "a >>> 0", exp: "a" },
    { src: "a*b >>> 0", exp: "(a*b)" },
    { src: "a << 0", exp: "a" },
    { src: "a*b << 0", exp: "(a*b)" },
    { src: "a & 0", exp: "0" },
    { src: "(a+b) & 0", exp: "0" },
    { src: "0 & a", exp: "0" },
    { src: "0 & (a+b) & 0", exp: "0" },
  ];
  simplificationCases.forEach((c, index) => {
    it(`Simplify #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      global i32 a;
      global i32 b;
      void test() {
        local u32 dummy = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp);
    });
  });

  const binaryCases = [
    { src: "123+456", exp: 579 },
    {
      src: "123456789123456789123456789+111",
      type: "i64",
      exp: BigInt("-944716198279094396"),
    },
    {
      src: "123456789123456789123456789+111",
      exp: BigInt("-944716198279094396"),
    },
    { src: "123-456", exp: -333 },
    {
      src: "123456789123456789123456789-111",
      exp: BigInt("-944716198279094618"),
    },
    {
      src: "123456789123456789123456789-111",
      exp: BigInt("-944716198279094618"),
    },
    {
      src: "123456789123456789123456789-123456789123456789123456788",
      exp: BigInt(1),
    },
    { src: "123*456", exp: 56088 },
    {
      src: "123456789123456789123456*111",
      exp: BigInt("4801970425597761152"),
    },
    {
      src: "123456789123456789123456*111",
      exp: BigInt("4801970425597761152"),
    },
    {
      src: "123456789123456789123456789*123456789123456789123456788",
      exp: BigInt("-5379637002994698076"),
    },
    {
      src: "1234567891234567891234567/123",
      exp: BigInt("2108551012311979713"),
    },
    { src: "123/456", exp: 0.26973684210526316 },
    { src: "456/123", exp: 3.707317073170732 },
    { src: "123/0", exp: Infinity },
    { src: "456%123", exp: 87 },
    { src: "1234567891234567891234567%123", exp: 76 },
    { src: "456 << 12", exp: 1867776 },
    {
      src: "1234567891234567891234567 >> 3",
      exp: BigInt("-4474516333122415136"),
    },
    { src: "1234567891234567891234567 >>> 3", exp: 503316480 },
    {
      src: "1234567891234567891234567 & 1234567891234567891234666",
      exp: BigInt("1097357482439782146"),
    },
    { src: "1234567891234567891234567 & 4534", exp: 262 },
    {
      src: "1234567891234567891234567 | 1234567891234567891234666",
      exp: BigInt("1097357482439782255"),
    },
    {
      src: "1234567891234567891234567 | 4534",
      exp: BigInt("1097357482439786423"),
    },
    { src: "1234567891234567891234567 ^ 1234567891234567891234666", exp: 109 },
    {
      src: "1234567891234567891234567 ^ 4534",
      exp: BigInt("1097357482439786161"),
    },
    { src: "1234567891234567891234567 == 1234567891234567891234567", exp: 1 },
    { src: "1234567891234567891234567 != 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 == 234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 != 234567891234567891234567", exp: 1 },
    { src: "1234567891234567891234567 < 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 < 1234567891234567891234568", exp: 1 },
    { src: "1234567891234567891234567 <= 1234567891234567891234567", exp: 1 },
    { src: "1234567891234567891234567 <= 234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 > 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 > 1234567891234567891234566", exp: 1 },
    { src: "1234567891234567891234567 >= 1234567891234567891234567", exp: 1 },
    { src: "234567891234567891234567 >= 1234567891234567891234567", exp: 0 },
  ];
  binaryCases.forEach((c, index) => {
    it(`Process binary #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void test() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const unaryCases = [
    { src: "+123", exp: 123 },
    { src: "+123.456", exp: 123.456 },
    { src: "+123.75", exp: 123.75 },
    { src: "+NaN", exp: NaN },
    { src: "+Infinity", exp: Infinity },
    { src: "+123.75555", exp: 123.75555 },
    { src: "+123456789123456789123456789", exp: BigInt("-944716198279094507") },
    {
      src: "+123456789123456789123456789",
      type: "i64",
      exp: BigInt("-944716198279094507"),
    },
    { src: "-123", exp: -123 },
    { src: "-123.456", exp: -123.456 },
    { src: "-123.75", exp: -123.75 },
    { src: "-123.75555", exp: -123.75555 },
    { src: "-NaN", exp: NaN },
    { src: "-Infinity", exp: -Infinity },
    { src: "-123456789123456789123456789", exp: BigInt("944716198279094507") },
    {
      src: "-123456789123456789123456789",
      type: "i64",
      exp: BigInt("944716198279094507"),
    },
    { src: "~0xff", exp: -256 },
    { src: "~0xaa55aa55", exp: 0x55aa55aa },
    { src: "~0x55aa55aa55aa55aa", exp: BigInt("-6172840429334713771") },
    { src: "~0x55aa55aa55aa55aa", exp: BigInt("-6172840429334713771") },
    {
      src: "~0x55aa55aa55aa55aa55aa55aa",
      exp: BigInt("-6172840429334713771"),
    },
  ];
  unaryCases.forEach((c, index) => {
    it(`Process unary #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const builtinFuncCases = [
    { src: "abs(-123)", exp: 123 },
    { src: "abs(123)", exp: 123 },
    { src: "abs(-123.25)", exp: 123.25 },
    { src: "abs(123.25)", exp: 123.25 },
    {
      src: "abs(-123456789012345678)",
      exp: BigInt("123456789012345678"),
    },
    { src: "ceil(123)", exp: 123 },
    { src: "ceil(123.25)", exp: 124 },
    { src: "ceil(-123.25)", exp: -123 },
    { src: "ceil(123.99)", exp: 124 },
    { src: "ceil(-123.99)", exp: -123 },
    { src: "floor(123)", exp: 123 },
    { src: "floor(123.25)", exp: 123 },
    { src: "floor(-123.25)", exp: -124 },
    { src: "floor(123.99)", exp: 123 },
    { src: "floor(-123.99)", exp: -124 },
    {
      src: "nearest(123456789123456789)",
      exp: BigInt("123456789123456789"),
    },
    { src: "nearest(123.25)", exp: 123 },
    { src: "nearest(-123.25)", exp: -123 },
    { src: "nearest(123.99)", exp: 124 },
    { src: "nearest(-123.99)", exp: -124 },
    { src: "trunc(123)", exp: 123 },
    { src: "trunc(123.25)", exp: 123 },
    { src: "trunc(-123.25)", exp: -123 },
    { src: "trunc(123.99)", exp: 123 },
    { src: "trunc(-123.99)", exp: -123 },
    {
      src: "trunc(123456789123456789)",
      exp: BigInt("123456789123456789"),
    },
    { src: "sqrt(123.25)", exp: 11.10180165558726 },
    { src: "sqrt(1024.24)", exp: 32.00374978029918 },
    { src: "sqrt(1.0)", exp: 1 },
    { src: "sqrt(123456789123456789)", exp: BigInt("351364183") },
    { src: "min(1, 2, 3, 4)", exp: 1 },
    { src: "min(1, -2, 3, 4)", exp: -2 },
    { src: "min(-2)", exp: -2 },
    {
      src: "min(1, -123456789123456789, 3, 4)",
      exp: BigInt("-123456789123456789"),
    },
    { src: "max(1, 2, 3, 4)", exp: 4 },
    { src: "max(1, 5, 3, 4)", exp: 5 },
    { src: "max(5)", exp: 5 },
    {
      src: "max(1, 123456789123456789, 3, 4)",
      exp: BigInt("123456789123456789"),
    },
  ];
  builtinFuncCases.forEach((c, index) => {
    it(`Process built-in function #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const typecastCases = [
    { type: "i8", src: "253", exp: -3 },
    { type: "i8", src: "253.6", exp: -3 },
    { type: "u8", src: "253", exp: 253 },
    { type: "u8", src: "253.6", exp: 253 },
    { type: "u8", src: "-3", exp: 253 },
    { type: "i16", src: "34000", exp: -31536 },
    { type: "i16", src: "34000.75", exp: -31536 },
    { type: "u16", src: "34000", exp: 34000 },
    { type: "u16", src: "-31536", exp: 34000 },
    { type: "u16", src: "-31536.75", exp: 34000 },
    { type: "i32", src: "2214592511", exp: -2080374785 },
    { type: "i32", src: "2214592511.6", exp: -2080374785 },
    { type: "u32", src: "2214592511", exp: 2214592511 },
    { type: "u32", src: "-2080374785", exp: 2214592511 },
    { type: "u32", src: "-2080374785.6", exp: 2214592511 },
    {
      type: "u64",
      src: "-7566047373982433281",
      exp: BigInt("10880696699727118335"),
    },
    {
      type: "u64",
      src: "10880696699727118335",
      exp: BigInt("10880696699727118335"),
    },
    {
      type: "i64",
      src: "10880696699727118335",
      exp: BigInt("-7566047373982433281"),
    },
    { type: "f32", src: "253", exp: 253 },
    { type: "f32", src: "2214592511", exp: 2214592512 },
    {
      type: "f64",
      src: "-7566047373982433281",
      exp: BigInt("-7566047373982433281"),
    },
  ];
  typecastCases.forEach((c, index) => {
    it(`Process type cast #${index + 1}, ${c.type}(${c.src})`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = ${c.type}(${c.src});
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const conditionalCases = [
    { src: "1 ? 2 : 3", exp: 2 },
    {
      src: "1 ? 23456789123456789123 : 3",
      exp: BigInt("5010045049747237507"),
    },
    { src: "0 ? 2 : 3", exp: 3 },
    {
      src: "0 ? 3: 23456789123456789123",
      exp: BigInt("5010045049747237507"),
    },
  ];
  conditionalCases.forEach((c, index) => {
    it(`Process conditional #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const sizeofCases = [
    { type: "i8", exp: 1 },
    { type: "struct { u8 l, u32 b }", exp: 5 },
    { type: "*u8[3]", exp: 12 },
  ]
  sizeofCases.forEach((c, index) => {
    it(`Process unary #${index + 1}, ${c.type}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = sizeof(${c.type});
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const constCases = [
    { src: "3 * cVal", exp: 6 },
    { src: "otherVal * cVal + 5", exp: 11 },
  ];
  constCases.forEach((c, index) => {
    it(`Process constants #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const i32 cVal = 2;
      const i32 otherVal = 3;
      void a() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp.toString());
    });
  });

  const idCases = [
    { src: "a * cVal", exp: "(a*2)" },
    { src: "2 + a", exp: "(a+2)" },
    { src: "2 + a + 3", exp: "(a+5)" },
    { src: "(a-2) + 3", exp: "(a--1)" },
    { src: "a + 2 - 3", exp: "(a+-1)" },
    { src: "a - 2 - 3", exp: "(a-5)" },
  ]
  idCases.forEach((c, index) => {
    it(`Process ids #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const i32 cVal = 2;
      void test() {
        local i32 a;
        local u32 b = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp);
    });
  });
});
