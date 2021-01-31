import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import { ArrayType, IntrinsicType, PointerType, StructType, UnresolvedType } from "../../src/compiler/source-tree";

describe("WatSharpParser - type specifications", () => {
  const instrinsicCases = [
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
  instrinsicCases.forEach((c) => {
    it(`Intrinsic type: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const typeSpec = wParser.parseTypeSpecification();

      // --- Assert
      expect(typeSpec.type).toBe("Intrinsic");
      const intrinsic = typeSpec as IntrinsicType;
      expect(intrinsic.underlying).toBe(c.exp);
    });
  });

  const namedCases = ["myType", "otherType", "something_1234"];
  namedCases.forEach((c) => {
    it(`Named type: ${c}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c);

      // --- Act
      const typeSpec = wParser.parseTypeSpecification();

      // --- Assert
      expect(typeSpec.type).toBe("UnresolvedType");
      const unresolved = typeSpec as UnresolvedType;
      expect(unresolved.name).toBe(c);
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
    it(`Pointer type: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const typeSpec = wParser.parseTypeSpecification();

      // --- Assert
      expect(typeSpec.type).toBe("Pointer");
      const pointer = typeSpec as PointerType;
      expect(pointer.spec.type).toBe(c.type);
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
    it(`Array type: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const typeSpec = wParser.parseTypeSpecification();

      // --- Assert
      expect(typeSpec.type).toBe("Array");
      const pointer = typeSpec as ArrayType;
      expect(pointer.spec.type).toBe(c.type);
    });
  });

  it("Simple struct #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      u8 l
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(1);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Intrinsic");
  });

  it("Simple struct #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      myType l
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(1);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("UnresolvedType");
  });

  it("Simple struct #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      *f64 l
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(1);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Pointer");
  });

  it("Simple struct #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      f64[2] l
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(1);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Array");
  });

  it("Simple struct #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      struct {
        u8 l
      } l
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(1);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Struct");
  });

  it("Compound struct #1", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      u8 l,
      u8 h
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(2);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Intrinsic");
    field = struct.fields[1];
    expect(field.id).toBe("h");
    expect(field.spec.type).toBe("Intrinsic");
  });

  it("Compound struct #2", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      myType l,
      myType h
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(2);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("UnresolvedType");
    field = struct.fields[1];
    expect(field.id).toBe("h");
    expect(field.spec.type).toBe("UnresolvedType");
  });

  it("Compound struct #3", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      *f64 l,
      *f64 h
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(2);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Pointer");
    field = struct.fields[1];
    expect(field.id).toBe("h");
    expect(field.spec.type).toBe("Pointer");
  });

  it("Compound struct #4", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      f64[2] l,
      f64[2] h
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(2);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Array");
    field = struct.fields[1];
    expect(field.id).toBe("h");
    expect(field.spec.type).toBe("Array");
  });

  it("Compound struct #5", () => {
    // --- Arrange
    const wParser = new WatSharpParser(`
    struct {
      struct {
        u8 l
      } l,
      struct {
        u8 l
      }[5] la
    }
    `);

    // --- Act
    const typeSpec = wParser.parseTypeSpecification();

    // --- Assert
    expect(typeSpec.type).toBe("Struct");
    const struct = typeSpec as StructType
    expect(struct.fields.length).toBe(2);
    let field = struct.fields[0];
    expect(field.id).toBe("l");
    expect(field.spec.type).toBe("Struct");
    field = struct.fields[1];
    expect(field.id).toBe("la");
    expect(field.spec.type).toBe("Array");
  });

});
