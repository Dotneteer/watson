import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/waast/WaTree";
import {
  abs,
  ceil,
  clz,
  convert32,
  convert64,
  copysign,
  demote64,
  eq,
  eqz,
  extend32,
  floor,
  ge,
  gt,
  le,
  lt,
  max,
  min,
  ne,
  nearest,
  neg,
  promote32,
  reinterpretF32,
  reinterpretF64,
  reinterpretI32,
  reinterpretI64,
  sqrt,
  trunc,
  trunc32,
  trunc64,
  wrap64,
} from "../../src/waast/FunctionBuilder";
import { WaType } from "../../src/waast/wa-nodes";
import { fail } from "assert";

describe("WaTree - render instructions #4", () => {
  it("i32.eqz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = eqz(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.eqz");
  });

  it("i64.eqz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = eqz(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.eqz");
  });

  it("f32.eqz", () => {
    try {
      // --- Act
      eqz(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.eqz", () => {
    try {
      // --- Act
      eqz(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.eq", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = eq(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.eq");
  });

  it("i64.eq", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = eq(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.eq");
  });

  it("f32.eq", () => {
    try {
      // --- Act
      eq(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.eq", () => {
    try {
      // --- Act
      eq(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.ne", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ne(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.ne");
  });

  it("i64.ne", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ne(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.ne");
  });

  it("f32.ne", () => {
    try {
      // --- Act
      ne(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.ne", () => {
    try {
      // --- Act
      ne(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.le signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.le_s");
  });

  it("i32.le unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.le_u");
  });

  it("i64.le signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.le_s");
  });

  it("i64.le unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.le_u");
  });

  it("f32.le", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.le");
  });

  it("f64.le", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = le(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.le");
  });

  it("i32.lt signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.lt_s");
  });

  it("i32.lt unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.lt_u");
  });

  it("i64.lt signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.lt_s");
  });

  it("i64.lt unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.lt_u");
  });

  it("f32.lt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.lt");
  });

  it("f64.lt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = lt(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.lt");
  });

  it("i32.ge signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.ge_s");
  });

  it("i32.ge unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.ge_u");
  });

  it("i64.ge signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.ge_s");
  });

  it("i64.ge unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.ge_u");
  });

  it("f32.ge", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.ge");
  });

  it("f64.ge", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ge(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.ge");
  });

  it("i32.gt signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.gt_s");
  });

  it("i32.gt unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.gt_u");
  });

  it("i64.gt signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.gt_s");
  });

  it("i64.gt unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.gt_u");
  });

  it("f32.gt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.gt");
  });

  it("f64.gt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = gt(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.gt");
  });

  it("i32.wrap_i64", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = wrap64();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.wrap_i64");
  });

  it("i64.extend_s/i32", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = extend32(true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.extend_s/i32");
  });

  it("i64.extend_u/i32", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = extend32();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.extend_u/i32");
  });

  it("Trunc32/f32 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc32(WaType.f32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.trunc_s/f32");
  });

  it("Trunc32/f32 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc32(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.trunc_u/f32");
  });

  it("Trunc32/f64 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc32(WaType.f64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.trunc_s/f64");
  });

  it("Trunc32/f64 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc32(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.trunc_u/f64");
  });

  it("Trunc32/i32", () => {
    try {
      // --- Act
      trunc32(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Trunc32/i64", () => {
    try {
      // --- Act
      trunc32(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Trunc64/f32 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc64(WaType.f32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.trunc_s/f32");
  });

  it("Trunc64/f32 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc64(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.trunc_u/f32");
  });

  it("Trunc64/f64 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc64(WaType.f64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.trunc_s/f64");
  });

  it("Trunc64/f64 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc64(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.trunc_u/f64");
  });

  it("Trunc64/i32", () => {
    try {
      // --- Act
      trunc64(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Trunc64/i64", () => {
    try {
      // --- Act
      trunc64(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Convert32/i32 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert32(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.convert_s/i32");
  });

  it("Convert32/i32 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert32(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.convert_u/i32");
  });

  it("Convert32/i64 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert32(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.convert_s/i64");
  });

  it("Convert32/i64 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert32(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.convert_u/i64");
  });

  it("Convert32/f32", () => {
    try {
      // --- Act
      convert32(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Convert32/f64", () => {
    try {
      // --- Act
      convert32(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Convert64/i32 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert64(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.convert_s/i32");
  });

  it("Convert64/i32 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert64(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.convert_u/i32");
  });

  it("Convert64/i64 signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert64(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.convert_s/i64");
  });

  it("Convert64/i64 unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = convert64(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.convert_u/i64");
  });

  it("Convert64/f32", () => {
    try {
      // --- Act
      convert64(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Convert64/f64", () => {
    try {
      // --- Act
      convert64(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("Demote64", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = demote64();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.demote/f64");
  });

  it("Promote32", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = promote32();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.promote/f32");
  });

  it("ReinterpretF32", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = reinterpretF32();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.reinterpret/f32");
  });

  it("ReinterpretF64", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = reinterpretF64();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.reinterpret/f64");
  });

  it("ReinterpretI32", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = reinterpretI32();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.reinterpret/i32");
  });

  it("ReinterpretI64", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = reinterpretI64();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.reinterpret/i64");
  });

  it("f32.abs", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = abs(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.abs");
  });

  it("f64.abs", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = abs(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.abs");
  });

  it("i32.abs", () => {
    try {
      // --- Act
      abs(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.abs", () => {
    try {
      // --- Act
      abs(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.neg", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = neg(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.neg");
  });

  it("f64.neg", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = neg(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.neg");
  });

  it("i32.neg", () => {
    try {
      // --- Act
      neg(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.neg", () => {
    try {
      // --- Act
      neg(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.ceil", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ceil(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.ceil");
  });

  it("f64.ceil", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ceil(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.ceil");
  });

  it("i32.ceil", () => {
    try {
      // --- Act
      ceil(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.ceil", () => {
    try {
      // --- Act
      ceil(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.floor", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = floor(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.floor");
  });

  it("f64.floor", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = floor(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.floor");
  });

  it("i32.floor", () => {
    try {
      // --- Act
      floor(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.floor", () => {
    try {
      // --- Act
      floor(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.trunc", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.trunc");
  });

  it("f64.trunc", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = trunc(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.trunc");
  });

  it("i32.trunc", () => {
    try {
      // --- Act
      trunc(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.trunc", () => {
    try {
      // --- Act
      trunc(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.nearest", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = nearest(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.nearest");
  });

  it("f64.nearest", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = nearest(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.nearest");
  });

  it("i32.nearest", () => {
    try {
      // --- Act
      nearest(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.nearest", () => {
    try {
      // --- Act
      nearest(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.sqrt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sqrt(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.sqrt");
  });

  it("f64.sqrt", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sqrt(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.sqrt");
  });

  it("i32.sqrt", () => {
    try {
      // --- Act
      sqrt(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.sqrt", () => {
    try {
      // --- Act
      sqrt(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.min", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = min(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.min");
  });

  it("f64.min", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = min(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.min");
  });

  it("i32.min", () => {
    try {
      // --- Act
      min(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.min", () => {
    try {
      // --- Act
      min(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.max", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = max(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.max");
  });

  it("f64.max", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = max(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.max");
  });

  it("i32.max", () => {
    try {
      // --- Act
      max(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.max", () => {
    try {
      // --- Act
      max(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f32.copysign", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = copysign(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.copysign");
  });

  it("f64.copysign", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = copysign(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.copysign");
  });

  it("i32.copysign", () => {
    try {
      // --- Act
      copysign(WaType.i32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i64.copysign", () => {
    try {
      // --- Act
      copysign(WaType.i64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

});
