import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/waast/WaTree";
import { add, clz, ctz, mul, sub } from "../../src/waast/FunctionBuilder";
import { WaType } from "../../src/waast/wa-nodes";
import { fail } from "assert";

describe("WaTree - render instructions #3", () => {
  it("i32.clz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = clz(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.clz");
  });

  it("i64.clz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = clz(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.clz");
  });

  it("f32.clz", () => {
    try {
      // --- Act
      clz(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.clz", () => {
    try {
      // --- Act
      clz(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.ctz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ctz(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.ctz");
  });

  it("i64.ctz", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ctz(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.ctz");
  });

  it("f32.ctz", () => {
    try {
      // --- Act
      ctz(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.ctz", () => {
    try {
      // --- Act
      ctz(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.add", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = add(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.add");
  });

  it("i64.add", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = add(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.add");
  });

  it("f32.add", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = add(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.add");
  });

  it("f64.add", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = add(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.add");
  });

  it("i32.sub", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sub(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.sub");
  });

  it("i64.sub", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sub(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.sub");
  });

  it("f32.sub", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sub(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.sub");
  });

  it("f64.sub", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = sub(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.sub");
  });

  it("i32.mul", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = mul(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.mul");
  });

  it("i64.mul", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = mul(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.mul");
  });

  it("f32.mul", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = mul(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.mul");
  });

  it("f64.mul", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = mul(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.mul");
  });

});
