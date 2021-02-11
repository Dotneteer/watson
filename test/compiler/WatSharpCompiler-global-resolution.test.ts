import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { ConstDeclaration, GlobalDeclaration, TypeDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - global resolution", () => {
  it("NaN/f64", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f64 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(NaN);
  });

  it("NaN/f32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f32 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(NaN);
  });

  it("NaN/i32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a = NaN;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(NaN);
  });

  it("Infinity/f64", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f64 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(Infinity);
  });

  it("Infinity/f32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f32 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(Infinity);
  });

  it("Infinity/i32", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a = Infinity;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("GlobalDeclaration");
    expect(decl.resolved).toBe(true);
    const globalDecl = decl as GlobalDeclaration;
    expect(globalDecl.resolved).toBe(true);
    expect(globalDecl.initExpr.value).toBe(Infinity);
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
      global ${c.src} a = ${c.val};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("GlobalDeclaration");
      expect(decl.resolved).toBe(true);
      const globalDecl = decl as GlobalDeclaration;
      expect(globalDecl.resolved).toBe(true);
      expect(globalDecl.initExpr.value).toBe(c.val);
    });

    it(`Intrinsic type with cast ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      global ${c.src} a = ${c.src}(${c.val});
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("GlobalDeclaration");
      expect(decl.resolved).toBe(true);
      const globalDecl = decl as GlobalDeclaration;
      expect(globalDecl.resolved).toBe(true);
      expect(globalDecl.initExpr.value).toBe(c.exp);
    });
  });

  it("Error with member access", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 a = b.c;
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
      global u8 a = b[3];
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
      global u8 a = b(3, c);
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
      global u8 a = &123;
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
      global u8 a = *123;
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
      global u8 a = ~1.2;
      `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W106");
  });

  it("circular reference #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    global i32 a = b + 1;
    const i32 b = a + 1;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W103");
  });

  it("const expected #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    type a = u8[b];
    global i32 b = sizeof(a);
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W108");
  });

  it("circular reference #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    global i32 a = b + 1;
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
    global i32 a = b + 1;
    const i32 b = 3 * sizeof(c);
    type c = *(u8[a]);
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W108");
  });
});
