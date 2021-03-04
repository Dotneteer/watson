import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/wa-ast/WaTree";
import { load, memGrow, memSize, store } from "../../src/wa-ast/FunctionBuilder";
import { WaBitSpec, WaType } from "../../src/wa-ast/wa-nodes";
import { fail } from "assert";

describe("WaTree - render instructions #2", () => {
  const memLoadCases = [
    {
      type: WaType.i32,
      bits: undefined,
      offs: 0,
      align: 0,
      s: false,
      exp: "i32.load",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 12,
      align: 0,
      s: false,
      exp: "i32.load offset=12",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 12,
      align: 3,
      s: false,
      exp: "i32.load offset=12 align=3",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 0,
      align: 3,
      s: false,
      exp: "i32.load align=3",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      s: false,
      exp: "i32.load8_u",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      s: true,
      exp: "i32.load8_s",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      s: false,
      exp: "i32.load16_u",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      s: true,
      exp: "i32.load16_s",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 0,
      align: 0,
      s: false,
      exp: "i64.load",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 12,
      align: 0,
      s: false,
      exp: "i64.load offset=12",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 12,
      align: 3,
      s: false,
      exp: "i64.load offset=12 align=3",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 0,
      align: 3,
      s: false,
      exp: "i64.load align=3",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      s: false,
      exp: "i64.load8_u",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      s: true,
      exp: "i64.load8_s",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      s: false,
      exp: "i64.load16_u",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      s: true,
      exp: "i64.load16_s",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit32,
      offs: 0,
      align: 0,
      s: false,
      exp: "i64.load32_u",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit32,
      offs: 0,
      align: 0,
      s: true,
      exp: "i64.load32_s",
    },
    {
      type: WaType.f32,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      s: false,
      exp: "f32.load",
    },
    {
      type: WaType.f32,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      s: true,
      exp: "f32.load",
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      s: false,
      exp: "f64.load",
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      s: true,
      exp: "f64.load",
    },
  ];
  memLoadCases.forEach((c) => {
    it(`load: ${c.type}, ${c.bits ?? "-"}, ${c.offs}, ${c.align}, ${
      c.s
    }`, () => {
      // --- Arrange
      const tree = new WaTree();
      const instr = load(c.type, c.bits, c.offs, c.align, c.s);

      // --- Act
      const text = tree.renderInstructionNode(instr);

      // --- Assert
      expect(text).toBe(c.exp);
    });
  });

  const memStoreCases = [
    {
      type: WaType.i32,
      bits: undefined,
      offs: 0,
      align: 0,
      exp: "i32.store",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 12,
      align: 0,
      exp: "i32.store offset=12",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 12,
      align: 3,
      exp: "i32.store offset=12 align=3",
    },
    {
      type: WaType.i32,
      bits: undefined,
      offs: 0,
      align: 3,
      exp: "i32.store align=3",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      exp: "i32.store8",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      exp: "i32.store8",
    },
    {
      type: WaType.i32,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      exp: "i32.store16",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 0,
      align: 0,
      exp: "i64.store",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 12,
      align: 0,
      exp: "i64.store offset=12",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 12,
      align: 3,
      exp: "i64.store offset=12 align=3",
    },
    {
      type: WaType.i64,
      bits: undefined,
      offs: 0,
      align: 3,
      exp: "i64.store align=3",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit8,
      offs: 0,
      align: 0,
      exp: "i64.store8",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit16,
      offs: 0,
      align: 0,
      exp: "i64.store16",
    },
    {
      type: WaType.i64,
      bits: WaBitSpec.Bit32,
      offs: 0,
      align: 0,
      exp: "i64.store32",
    },
    {
      type: WaType.f32,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      exp: "f32.store",
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.None,
      offs: 0,
      align: 0,
      exp: "f64.store",
    },
  ];
  memStoreCases.forEach((c) => {
    it(`store: ${c.type}, ${c.bits ?? "-"}, ${c.offs}, ${c.align}`, () => {
      // --- Arrange
      const tree = new WaTree();
      const instr = store(c.type, c.bits, c.offs, c.align);

      // --- Act
      const text = tree.renderInstructionNode(instr);

      // --- Assert
      expect(text).toBe(c.exp);
    });
  });

  const memErrorCases = [
    {
      type: WaType.f32,
      bits: WaBitSpec.Bit8,
    },
    {
      type: WaType.f32,
      bits: WaBitSpec.Bit16,
    },
    {
      type: WaType.f32,
      bits: WaBitSpec.Bit32,
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.Bit8,
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.Bit16,
    },
    {
      type: WaType.f64,
      bits: WaBitSpec.Bit32,
    },
  ];
  memErrorCases.forEach((c) => {
    it(`load with error: ${c.type}, ${c.bits ?? "-"}`, () => {
      try {
        // --- Act
        load(c.type, c.bits);
      } catch (err) {
        return;
      }
      fail("Error expected");
    });
  });
  memErrorCases.forEach((c) => {
    it(`store with error: ${c.type}, ${c.bits ?? "-"}`, () => {
      try {
        // --- Act
        store(c.type, c.bits);
      } catch (err) {
        return;
      }
      fail("Error expected");
    });
  });

  it("memory.size", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = memSize();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("memory.size");
  });

  it("memory.grow", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = memGrow();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("memory.grow");
  });
});
