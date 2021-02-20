import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";
import {
  IntrinsicType,
  PointerType,
  StructType,
  TypeDeclaration,
  NamedType,
} from "../../src/compiler/source-tree";

describe("WatSharpCompiler - type resolution", () => {
  const instrinsicCases = [
    { src: "i8", size: 1 },
    { src: "sbyte", size: 1 },
    { src: "u8", size: 1 },
    { src: "byte", size: 1 },
    { src: "i16", size: 2 },
    { src: "short", size: 2 },
    { src: "u16", size: 2 },
    { src: "ushort", size: 2 },
    { src: "i32", size: 4 },
    { src: "int", size: 4 },
    { src: "u32", size: 4 },
    { src: "uint", size: 4 },
    { src: "i64", size: 8 },
    { src: "long", size: 8 },
    { src: "u64", size: 8 },
    { src: "ulong", size: 8 },
    { src: "f32", size: 4 },
    { src: "float", size: 4 },
    { src: "f64", size: 8 },
    { src: "double", size: 8 },
  ];
  instrinsicCases.forEach((c) => {
    it(`Intrinsic type ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      type a = ${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("TypeDeclaration");
      expect(decl.resolved).toBe(true);
      const typeDecl = decl as TypeDeclaration;
      expect(typeDecl.spec.type).toBe("Intrinsic");
      const spec = typeDecl.spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(c.size);
    });

    it(`Pointer to intrinsic type ${c.src} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      type a = *${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("TypeDeclaration");
      expect(decl.resolved).toBe(true);
      const typeDecl = decl as TypeDeclaration;
      expect(typeDecl.spec.type).toBe("Pointer");
      const pointer = typeDecl.spec as PointerType;
      expect(pointer.resolved).toBe(true);
      expect(pointer.sizeof).toBe(4);
      expect(pointer.spec.type).toBe("Intrinsic");
      const spec = pointer.spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(c.size);
    });

    it(`Pointer to intrinsic type ${c.src} #2`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      type a = **${c.src};
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("TypeDeclaration");
      expect(decl.resolved).toBe(true);
      const typeDecl = decl as TypeDeclaration;
      expect(typeDecl.spec.type).toBe("Pointer");
      let pointer = typeDecl.spec as PointerType;
      expect(pointer.resolved).toBe(true);
      expect(pointer.sizeof).toBe(4);
      expect(pointer.spec.type).toBe("Pointer");
      pointer = pointer.spec as PointerType;
      expect(pointer.spec.type).toBe("Intrinsic");
      const spec = pointer.spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(c.size);
    });

    it(`Struct with intrinsic type ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      type a = struct {
        u8 a,
        i64 b,
        ${c.src} c
      };
      `);

      // --- Act
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const decl = wComp.declarations.get("a");
      expect(decl).toBeDefined();
      expect(decl.type).toBe("TypeDeclaration");
      expect(decl.resolved).toBe(true);
      const typeDecl = decl as TypeDeclaration;
      expect(typeDecl.spec.type).toBe("Struct");
      const struct = typeDecl.spec as StructType;
      expect(struct.resolved).toBe(true);
      expect(struct.sizeof).toBe(9 + c.size);
      expect(struct.fields[0].spec.type).toBe("Intrinsic");
      expect(struct.fields[0].offset).toBe(0);
      let spec = struct.fields[0].spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(1);
      expect(struct.fields[1].spec.type).toBe("Intrinsic");
      expect(struct.fields[1].offset).toBe(1);
      spec = struct.fields[1].spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(8);
      expect(struct.fields[2].spec.type).toBe("Intrinsic");
      expect(struct.fields[2].offset).toBe(9);
      spec = struct.fields[2].spec as IntrinsicType;
      expect(spec.resolved).toBe(true);
      expect(spec.sizeof).toBe(c.size);
    });
  });

  it("Recursive struct #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    type a = struct {
      byte value,
      *a next
    };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    const typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.type).toBe("Struct");
    const struct = typeDecl.spec as StructType;
    expect(struct.resolved).toBe(true);
    expect(struct.sizeof).toBe(5);

    expect(struct.fields[0].spec.type).toBe("Intrinsic");
    expect(struct.fields[0].offset).toBe(0);
    let spec = struct.fields[0].spec as IntrinsicType;
    expect(spec.resolved).toBe(true);
    expect(spec.sizeof).toBe(1);
    expect(struct.fields[1].spec.type).toBe("Pointer");
    expect(struct.fields[1].offset).toBe(1);
    let ptr = struct.fields[1].spec as PointerType;
    expect(ptr.resolved).toBe(true);
    expect(ptr.sizeof).toBe(4);

    expect(ptr.spec.type).toBe("Struct");
    let nextType = ptr.spec as StructType;
    expect(nextType.resolved).toBe(true);
    expect(wComp.getSizeof(nextType)).toBe(5);
  });

  it("Recursive struct #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    type a = struct {
      byte value,
      b other
    };

    type b = struct {
      short sh
    };
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    let typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.type).toBe("Struct");
    let struct = typeDecl.spec as StructType;
    expect(struct.resolved).toBe(true);
    expect(struct.sizeof).toBe(3);

    expect(struct.fields[0].spec.type).toBe("Intrinsic");
    expect(struct.fields[0].offset).toBe(0);
    let spec = struct.fields[0].spec as IntrinsicType;
    expect(spec.resolved).toBe(true);
    expect(spec.sizeof).toBe(1);
    expect(struct.fields[1].spec.type).toBe("Struct");
    expect(struct.fields[1].offset).toBe(1);
    struct = struct.fields[1].spec as StructType;
    expect(wComp.getSizeof(struct)).toBe(2);

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.type).toBe("Struct");
    struct = typeDecl.spec as StructType;
    expect(struct.resolved).toBe(true);
    expect(struct.sizeof).toBe(2);

    expect(struct.fields[0].spec.type).toBe("Intrinsic");
    spec = struct.fields[0].spec as IntrinsicType;
    expect(spec.resolved).toBe(true);
    expect(spec.sizeof).toBe(2);
  });

  it("Cascade naming #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
    type a = u8;
    type b = a;
    `);

    // --- Act
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    let decl = wComp.declarations.get("a");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    let typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.type).toBe("Intrinsic");

    decl = wComp.declarations.get("b");
    expect(decl).toBeDefined();
    expect(decl.type).toBe("TypeDeclaration");
    expect(decl.resolved).toBe(true);
    typeDecl = decl as TypeDeclaration;
    expect(typeDecl.spec.type).toBe("Intrinsic");
  });

});
