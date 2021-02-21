import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { ConstDeclaration, TypeDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - const resolution", () => {
  it("NaN/f64", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const f64 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.expr.value).toBe(NaN);
    expect(constDecl.value).toBe(NaN);
  });

  it("NaN/f32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const f32 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.expr.value).toBe(NaN);
    expect(constDecl.value).toBe(NaN);
  });

  it("NaN/i32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const i32 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Infinity/f64", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const f64 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.expr.value).toBe(Infinity);
    expect(constDecl.value).toBe(Infinity);
  });

  it("Infinity/f32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const f32 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.expr.value).toBe(Infinity);
    expect(constDecl.value).toBe(Infinity);
  });

  it("Infinity/i32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const i32 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

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
    { src: "f32", val: 123.45678912345e-3, exp: 0.12345679104328156 },
    { src: "float", val: 123.45678912345e-3, exp: 0.12345679104328156 },
    { src: "f64", val: 123.45678912345e-23, exp: 1.2345678912345e-21 },
    { src: "double", val: 123.45678912345e-23, exp: 1.2345678912345e-21 },
  ];
  instrinsicCases.forEach((c) => {
    it(`Intrinsic type ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.src} a = ${c.val};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.expr.value).toBe(c.val);
      expect(constDecl.value).toBe(c.exp);
    });

    it(`Intrinsic type with cast ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.src} a = ${c.src}(${c.val});
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.expr.value).toBe(c.exp);
      expect(constDecl.value).toBe(c.exp);
    });
  });

  const conditionalCases = [
    { src: "1 ? 2 : 3", type: "f32", exp: 2 },
    { src: "0 ? 2 : 3", type: "f32", exp: 3 },
    { src: "1 < 2 ? 2 : 3", exp: 2 },
    { src: "1 > 2 ? 2 : 3", exp: 3 },
    { src: "123456789123456789 < 223456789123456789 ? 2 : 3", exp: 2 },
    { src: "123456789123456789 > 223456789123456789 ? 2 : 3", exp: 3 },
  ];
  conditionalCases.forEach((c) => {
    it(`Conditional operation ${c.src}/${c.type ?? "i32"}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.type ?? "i32"} a = ${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.value).toBe(c.exp);
    });
  });

  const unaryCases = [
    { src: "+123", exp: 123 },
    { src: "+123.456", exp: 123 },
    { src: "+123.75", type: "f32", exp: 123.75 },
    { src: "+NaN", type: "f32", exp: NaN },
    { src: "+Infinity", type: "f32", exp: Infinity },
    { src: "+123.75555", type: "f64", exp: 123.75555 },
    { src: "+123456789123456789123456789", exp: 2080661269 },
    {
      src: "+123456789123456789123456789",
      type: "i64",
      exp: BigInt("-944716198279094507"),
    },
    { src: "-123", exp: -123 },
    { src: "-123.456", exp: -123 },
    { src: "-123.75", type: "f32", exp: -123.75 },
    { src: "-123.75555", type: "f64", exp: -123.75555 },
    { src: "-NaN", type: "f32", exp: NaN },
    { src: "-Infinity", type: "f32", exp: -Infinity },
    { src: "-123456789123456789123456789", exp: -2080661269 },
    {
      src: "-123456789123456789123456789",
      type: "i64",
      exp: BigInt("944716198279094507"),
    },
    { src: "~0xff", exp: -256 },
    { src: "~0xff", type: "u16", exp: 0xff00 },
    { src: "~0xaa55aa55", exp: 0x55aa55aa },
    { src: "~0x55aa55aa55aa55aa", exp: -1437226411 },
    { src: "~0x55aa55aa55aa55aa", type: "u32", exp: 0xaa55aa55 },
    {
      src: "~0x55aa55aa55aa55aa55aa55aa",
      type: "u64",
      exp: BigInt("0xaa55aa55aa55aa55"),
    },
    {
      src: "~0x55aa55aa55aa55aa55aa55aa",
      type: "i64",
      exp: BigInt("-6172840429334713771"),
    },
  ];
  unaryCases.forEach((c) => {
    it(`Unary operation ${c.src}/${c.type ?? "i32"}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.type ?? "i32"} a = ${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.value).toBe(c.exp);
    });
  });

  const binaryCases = [
    { src: "123+456", exp: 579 },
    { src: "123+456", type: "i8", exp: 67 },
    {
      src: "123456789123456789123456789+111",
      type: "i64",
      exp: BigInt("-944716198279094396"),
    },
    {
      src: "123456789123456789123456789+111",
      type: "u64",
      exp: BigInt("17502027875430457220"),
    },
    { src: "123-456", exp: -333 },
    {
      src: "123456789123456789123456789-111",
      type: "i64",
      exp: BigInt("-944716198279094618"),
    },
    {
      src: "123456789123456789123456789-111",
      type: "u64",
      exp: BigInt("17502027875430456998"),
    },
    {
      src: "123456789123456789123456789-123456789123456789123456788",
      type: "i64",
      exp: BigInt(1),
    },
    { src: "123*456", exp: 56088 },
    {
      src: "123456789123456789123456*111",
      type: "i64",
      exp: BigInt("4801970425597761152"),
    },
    {
      src: "123456789123456789123456*111",
      type: "u64",
      exp: BigInt("4801970425597761152"),
    },
    {
      src: "123456789123456789123456789*123456789123456789123456788",
      type: "i64",
      exp: BigInt("-5379637002994698076"),
    },
    { src: "123/456", exp: 0 },
    { src: "456/123", exp: 3 },
    { src: "1234567891234567891234567/123", exp: 1604671169 },
    { src: "123/456", type: "f64", exp: 0.26973684210526316 },
    { src: "456/123", type: "f32", exp: 3.7073171138763428 },
    { src: "123/0", type: "f64", exp: Infinity },
    { src: "-123/0", type: "f64", exp: -Infinity },
    { src: "456%123", exp: 87 },
    { src: "1234567891234567891234567%123", exp: 76 },
    { src: "456 << 12", exp: 1867776 },
    { src: "456 << 12", type: "i16", exp: -32768 },
    { src: "-456 >> 2", exp: -114 },
    { src: "-456 >> 2", type: "i16", exp: -114 },
    { src: "1234567891234567891234567 >> 3", exp: 512628192 },
    { src: "1234567891234567891234567 >> 3", type: "u16", exp: 5600 },
    { src: "-456 >>> 2", exp: 1073741710 },
    { src: "-456 >>> 2", type: "i16", exp: -114 },
    { src: "1234567891234567891234567 >>> 3", exp: 503316480 },
    { src: "1234567891234567891234567 >>> 3", type: "u16", exp: 0 },
    { src: "-456 & 113", exp: 48 },
    { src: "-456 & 1234567", type: "i16", exp: -10752 },
    {
      src: "1234567891234567891234567 & 1234567891234567891234666",
      exp: -193941758,
    },
    { src: "1234567891234567891234567 & 4534", type: "u16", exp: 262 },
    { src: "-456 | 113", exp: -391 },
    { src: "-456 | 1234567", type: "i16", exp: -321 },
    {
      src: "1234567891234567891234567 | 1234567891234567891234666",
      exp: -193941649,
    },
    { src: "1234567891234567891234567 | 4534", type: "u16", exp: 49079 },
    { src: "-456 ^ 113", exp: -439 },
    { src: "-456 ^ 1234567", type: "i16", exp: 10431 },
    { src: "1234567891234567891234567 ^ 1234567891234567891234666", exp: 109 },
    { src: "1234567891234567891234567 ^ 4534", type: "u16", exp: 48817 },
    { src: "-456 == -456", exp: 1 },
    { src: "-456 != -456", type: "i16", exp: 0 },
    { src: "-456 == 123", exp: 0 },
    { src: "-456 != 123", type: "i16", exp: 1 },
    { src: "1234567891234567891234567 == 1234567891234567891234567", exp: 1 },
    { src: "1234567891234567891234567 != 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 == 234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 != 234567891234567891234567", exp: 1 },
    { src: "-456 < -456", exp: 0 },
    { src: "-456 < -455", exp: 1 },
    { src: "1234567891234567891234567 < 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 < 1234567891234567891234568", exp: 1 },
    { src: "-456 <= -456", exp: 1 },
    { src: "-456 <= -457", exp: 0 },
    { src: "1234567891234567891234567 <= 1234567891234567891234567", exp: 1 },
    { src: "1234567891234567891234567 <= 234567891234567891234567", exp: 0 },
    { src: "-456 > -456", exp: 0 },
    { src: "-456 > -457", exp: 1 },
    { src: "1234567891234567891234567 > 1234567891234567891234567", exp: 0 },
    { src: "1234567891234567891234567 > 1234567891234567891234566", exp: 1 },
    { src: "-456 >= -456", exp: 1 },
    { src: "-456 >= -455", exp: 0 },
    { src: "1234567891234567891234567 >= 1234567891234567891234567", exp: 1 },
    { src: "234567891234567891234567 >= 1234567891234567891234567", exp: 0 },
  ];
  binaryCases.forEach((c) => {
    it(`Binary operation ${c.src}/${c.type ?? "i32"}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.type ?? "i32"} a = ${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.value).toBe(c.exp);
    });
  });

  const builtinFuncCases = [
    { src: "abs(-123)", type: "i32", exp: 123 },
    { src: "abs(123)", type: "i32", exp: 123 },
    { src: "abs(-123.25)", type: "f32", exp: 123.25 },
    { src: "abs(123.25)", type: "i32", exp: 123 },
    {
      src: "abs(-123456789012345678)",
      type: "i64",
      exp: BigInt("123456789012345678"),
    },
    {
      src: "abs(123456789012345678)",
      type: "i64",
      exp: BigInt("123456789012345678"),
    },
    { src: "ceil(123)", type: "i32", exp: 123 },
    { src: "ceil(123.25)", type: "f32", exp: 124 },
    { src: "ceil(-123.25)", type: "f32", exp: -123 },
    { src: "ceil(123.99)", type: "f32", exp: 124 },
    { src: "ceil(-123.99)", type: "f32", exp: -123 },
    { src: "floor(123)", type: "i32", exp: 123 },
    { src: "floor(123.25)", type: "f32", exp: 123 },
    { src: "floor(-123.25)", type: "f32", exp: -124 },
    { src: "floor(123.99)", type: "f32", exp: 123 },
    { src: "floor(-123.99)", type: "f32", exp: -124 },
    {
      src: "nearest(123456789123456789)",
      type: "i64",
      exp: BigInt("123456789123456789"),
    },
    { src: "nearest(123.25)", exp: 123 },
    { src: "nearest(-123.25)", exp: -123 },
    { src: "nearest(123.99)", exp: 124 },
    { src: "nearest(-123.99)", type: "f32", exp: -124 },
    { src: "trunc(123)", type: "i32", exp: 123 },
    { src: "trunc(123.25)", type: "f32", exp: 123 },
    { src: "trunc(-123.25)", type: "f32", exp: -123 },
    { src: "trunc(123.99)", type: "f32", exp: 123 },
    { src: "trunc(-123.99)", type: "f32", exp: -123 },
    {
      src: "trunc(123456789123456789)",
      type: "i64",
      exp: BigInt("123456789123456789"),
    },
    { src: "sqrt(123.25)", type: "f32", exp: 11.101801872253418 },
    { src: "sqrt(1024.24)", type: "f32", exp: 32.00374984741211 },
    { src: "sqrt(1.0)", type: "f32", exp: 1 },
    { src: "sqrt(123456789123456789)", type: "i64", exp: BigInt("351364183") },
    { src: "min(1, 2, 3, 4)", type: "f32", exp: 1 },
    { src: "min(1, -2, 3, 4)", type: "f32", exp: -2 },
    { src: "min(-2)", type: "f32", exp: -2 },
    {
      src: "min(1, -123456789123456789, 3, 4)",
      type: "i64",
      exp: BigInt("-123456789123456789"),
    },
    { src: "max(1, 2, 3, 4)", type: "f32", exp: 4 },
    { src: "max(1, 5, 3, 4)", type: "f32", exp: 5 },
    { src: "max(5)", type: "f32", exp: 5 },
    {
      src: "max(1, 123456789123456789, 3, 4)",
      type: "i64",
      exp: BigInt("123456789123456789"),
    },
  ];
  builtinFuncCases.forEach((c) => {
    it(`Built-in function call ${c.src}/${c.type ?? "i32"}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const ${c.type ?? "i32"} a = ${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.value).toBe(c.exp);
    });
  });

  const argNumIssues = [
    "abs()",
    "abs(1, 1)",
    "clz()",
    "clz(1, 1)",
    "ctz()",
    "ctz(1, 1)",
    "popcnt()",
    "popcnt(1, 1)",
    "ceil()",
    "ceil(1, 1)",
    "floor()",
    "floor(1, 1)",
    "trunc()",
    "trunc(1, 1)",
    "nearest()",
    "nearest(1, 1)",
    "sqrt()",
    "sqrt(1, 1)",
    "min()",
    "max()",
  ];
  argNumIssues.forEach((c) => {
    it(`Wrong number of arguments in ${c}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const i32 a = ${c};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W107");
    });
  });

  it("Error with member access", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = b.c;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W104");
  });

  it("Error with item access", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = b[3];
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W104");
  });

  it("Error with function invocation", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = b(3, c);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W104");
  });

  it("Error with unary &", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = &123;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W105");
  });

  it("Error with unary ~", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = ~1.2;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W106");
  });

  it("Error with clz", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = clz(0);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Error with ctz", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = ctz(0);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Error with neg", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = neg(0);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Error with copysign", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = copysign(0);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Error with sqrt #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = sqrt(-1);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  it("Error with sqrt #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = sqrt(-123456789123456789);
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W107");
  });

  const sizeofCases = [
    { src: "i8", exp: 1 },
    { src: "sbyte", exp: 1 },
    { src: "u8", exp: 1 },
    { src: "byte", exp: 1 },
    { src: "i16", exp: 2 },
    { src: "short", exp: 2 },
    { src: "u16", exp: 2 },
    { src: "ushort", exp: 2 },
    { src: "i32", exp: 4 },
    { src: "int", exp: 4 },
    { src: "u32", exp: 4 },
    { src: "uint", exp: 4 },
    { src: "i64", exp: 8 },
    { src: "long", exp: 8 },
    { src: "u64", exp: 8 },
    { src: "ulong", exp: 8 },
    { src: "f32", exp: 4 },
    { src: "float", exp: 4 },
    { src: "f64", exp: 8 },
    { src: "double", exp: 8 },
    { src: "*i8", exp: 4 },
    { src: "*u16", exp: 4 },
    { src: "*i32", exp: 4 },
    { src: "*u64", exp: 4 },
    { src: "*f32", exp: 4 },
    { src: "*f64", exp: 4 },
    { src: "struct {u8 l, u16 o}", exp: 3 },
  ];
  sizeofCases.forEach((c) => {
    it(`sizeof ${c.src} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      const i32 a = sizeof(${c.src});
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("ConstDeclaration");
      expect(decl.resolved).toBe(true);
      const constDecl = decl as ConstDeclaration;
      expect(constDecl.value).toBe(c.exp);
    });
  });

  it("sizeof with name #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(b);
    type b = u8;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(1);
  });

  it("sizeof with name #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(*b);
    type b = u8;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(4);
  });

  it("sizeof with array #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(u8[7]);
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(7);
  });

  it("sizeof with array #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(u8[b]);
    const i32 b = 7;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(7);
  });

  it("sizeof with array #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof((*u8)[b]);
    const i32 b = 3 + 4;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(28);
  });

  it("sizeof with array #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(*u8[b]);
    const i32 b = 3 + 4;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(28);
  });

  it("sizeof with array #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = sizeof(*(u8[b]));
    const i32 b = 3 + 4;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    const constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(4);
  });

  it("circular reference #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = b + 1;
    const i32 b = a + 1;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W103");
  });

  it("circular reference #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    type a = u8[b];
    const i32 b = sizeof(a);
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W103");
  });

  it("circular reference #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = b + 1;
    const i32 b = sizeof(c);
    type c = *u8[a];
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W103");
  });

  it("latent circular reference #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    const i32 a = b + 1;
    const i32 b = 3 * sizeof(c);
    type c = *(u8[a]);
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    const typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.sizeof).toBe(4);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    let constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(12);

    decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("ConstDeclaration");
    expect(decl.resolved).toBe(true);
    constDecl = decl as ConstDeclaration;
    expect(constDecl.value).toBe(13);
  });
});
