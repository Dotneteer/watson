import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import { ConstDeclaration, GlobalDeclaration, TypeDeclaration, VariableDeclaration } from "../../src/compiler/source-tree";

describe("WatSharpCompiler - variable resolution", () => {
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
    it(`Intrinsic type, no address ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      ${c.src} a;
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("VariableDeclaration");
      expect(decl.resolved).toBe(true);
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.resolved).toBe(true);
      expect(varDecl.address).toBe(0);
    });

    it(`Intrinsic type with address ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      i32 b;
      ${c.src} a { b };
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("VariableDeclaration");
      expect(decl.resolved).toBe(true);
      const varDecl = decl as VariableDeclaration;
      expect(varDecl.resolved).toBe(true);
      expect(varDecl.addressAlias.name).toBe("b");
    });
  });

  it("Multiple variables #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    u8 a;
    u16 b;
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(0);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(1);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(3);
  });

  it("Multiple variables #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    *u8 a;
    u64 b;
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(0);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(4);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(12);
  });

  it("Multiple variables #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    u8[6] a;
    *u64[3] b;
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(0);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(6);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(18);
  });

  it("Multiple variables #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    struct { u8 l, i16 h} [6] a;
    u64[3] b;
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(0);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(18);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(42);
  });

  it("Multiple variables #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    i32 ref;
    struct { u8 l, i16 h} [6] a {ref};
    u64[3] b;
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(0);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(18);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(42);
  });

  it("Multiple variables #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    i32 ref;
    struct { u8 l, i16 h} [6] a;
    u64[3] b {a};
    u64 c;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    let varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(4);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(4);

    decl = wComp.declarations.get("c");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("VariableDeclaration");
    expect(decl.resolved).toBe(true);
    varDecl = decl as VariableDeclaration;
    expect(varDecl.resolved).toBe(true);
    expect(varDecl.address).toBe(28);
  });

});
