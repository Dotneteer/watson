import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  ConstDeclaration,
  DataDeclaration,
  GlobalDeclaration,
  ImportedFunctionDeclaration,
  TableDeclaration,
  TypeDeclaration,
  VariableDeclaration,
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

  it("table #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1 };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myTable");
    expect(decl).toBeDefined();
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.ids.length).toBe(1);
    expect(tableDecl.ids[0]).toBe("myId1");
  });

  it("table #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1, myId2 };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myTable");
    expect(decl).toBeDefined();
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.ids.length).toBe(2);
    expect(tableDecl.ids[0]).toBe("myId1");
    expect(tableDecl.ids[1]).toBe("myId2");
  });

  it("table #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1, myId2, myId3 };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myTable");
    expect(decl).toBeDefined();
    const tableDecl = decl as TableDeclaration;
    expect(tableDecl.ids.length).toBe(3);
    expect(tableDecl.ids[0]).toBe("myId1");
    expect(tableDecl.ids[1]).toBe("myId2");
    expect(tableDecl.ids[2]).toBe("myId3");
  });

  it("table issue #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    table { };
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("table issue #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("table issue #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W009");
  });

  it("table issue #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1, };
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("table issue #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1, myId2 ;
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W010");
  });

  it("table issue #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      table myTable { myId1, myId2 }
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W006");
  });

  const integralTypes = [
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
  ];
  integralTypes.forEach((c) => {
    it(`data ${c.src} #1`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        data ${c.src} myData [ 0x00 ];
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myData");
      expect(decl).toBeDefined();
      const dataDecl = decl as DataDeclaration;
      expect(dataDecl.underlyingType).toBe(c.exp);
      expect(dataDecl.exprs.length).toBe(1);
    });

    it(`data ${c.src} #2`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(`
        data ${c.src} myData [ 0x00, 123 ];
        `);

      // --- Act
      wParser.parseProgram();

      // --- Assert
      expect(wParser.hasErrors).toBe(false);
      const decl = wParser.declarations.get("myData");
      expect(decl).toBeDefined();
      const dataDecl = decl as DataDeclaration;
      expect(dataDecl.underlyingType).toBe(c.exp);
      expect(dataDecl.exprs.length).toBe(2);
    });
  });

  it("data #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      data myData [ 0x00 ];
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myData");
    expect(decl).toBeDefined();
    const dataDecl = decl as DataDeclaration;
    expect(dataDecl.underlyingType).toBeUndefined();
    expect(dataDecl.exprs.length).toBe(1);
  });

  it("data #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
      data myData [ 0x00, 123 ];
      `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(false);
    const decl = wParser.declarations.get("myData");
    expect(decl).toBeDefined();
    const dataDecl = decl as DataDeclaration;
    expect(dataDecl.underlyingType).toBeUndefined();
    expect(dataDecl.exprs.length).toBe(2);
  });

  it("data issue #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data f32 myData [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W013");
  });

  it("data issue #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data float myData [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W013");
  });

  it("data issue #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data f64 myData [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W013");
  });

  it("data issue #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data double myData [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W013");
  });

  it("data issue #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("data issue #6", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte [ 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W004");
  });

  it("data issue #7", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte myData 0x00 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W011");
  });

  it("data issue #8", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte myData [ u8 ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W016");
  });

  it("data issue #9", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte myData [ 12, ];
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W002");
  });

  it("data issue #10", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte myData [ 12, 3;
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W012");
  });

  it("data issue #11", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    data byte myData [ 12, 3 ]
    `);

    // --- Act
    wParser.parseProgram();

    // --- Assert
    expect(wParser.hasErrors).toBe(true);
    expect(wParser.errors.length).toBe(1);
    expect(wParser.errors[0].code).toBe("W006");
  });

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
      expect(varDecl.spec.type).toBe("UnresolvedType");
      expect(varDecl.expr.type).toBe("BinaryExpression");
    });
  });

  const pointerCases = [
    { src: "*i8", type: "Intrinsic" },
    { src: "*i32", type: "Intrinsic" },
    { src: "*f64", type: "Intrinsic" },
    { src: "*myType", type: "UnresolvedType" },
    { src: "**f64", type: "Pointer" },
    { src: "*(i8)", type: "Intrinsic" },
    { src: "*(i32)", type: "Intrinsic" },
    { src: "*(f64)", type: "Intrinsic" },
    { src: "*(myType)", type: "UnresolvedType" },
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
    { src: "myType[2]", type: "UnresolvedType" },
    { src: "(*i8)[2]", type: "Pointer" },
    { src: "(myType)[2]", type: "UnresolvedType" },
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
