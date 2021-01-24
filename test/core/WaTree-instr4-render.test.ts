import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/waast/WaTree";
import {
  clz,
  eq,
  eqz,
  ge,
  gt,
  le,
  lt,
  ne,
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
});
