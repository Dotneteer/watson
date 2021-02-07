import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { ConstDeclaration } from "../../src/compiler/source-tree";

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

  it("Error with unary *", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      const u8 a = *123;
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
});
