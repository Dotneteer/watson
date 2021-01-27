import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/waast/WaTree";
import {
  add,
  and,
  clz,
  ctz,
  div,
  mul,
  or,
  rem,
  rotl,
  rotr,
  shl,
  shr,
  sub,
  xor,
} from "../../src/waast/FunctionBuilder";
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

  it("i32.div signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.div_s");
  });

  it("i32.div unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.div_u");
  });

  it("i64.div signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.div_s");
  });

  it("i64.div unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.div_u");
  });

  it("f32.div", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.div");
  });

  it("f64.div", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = div(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.div");
  });

  it("i32.rem signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.rem_s");
  });

  it("i32.rem unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.rem_u");
  });

  it("i64.rem signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.rem_s");
  });

  it("i64.rem unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.rem_u");
  });

  it("f32.rem", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.rem");
  });

  it("f64.rem", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rem(WaType.f64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.rem");
  });

  it("i32.and", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = and(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.and");
  });

  it("i64.and", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = and(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.and");
  });

  it("f32.and", () => {
    try {
      // --- Act
      and(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.and", () => {
    try {
      // --- Act
      and(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.xor", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = xor(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.xor");
  });

  it("i64.xor", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = xor(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.xor");
  });

  it("f32.xor", () => {
    try {
      // --- Act
      xor(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.xor", () => {
    try {
      // --- Act
      xor(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.or", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = or(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.or");
  });

  it("i64.or", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = or(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.or");
  });

  it("f32.or", () => {
    try {
      // --- Act
      or(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.or", () => {
    try {
      // --- Act
      or(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.shl", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shl(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.shl");
  });

  it("i64.shl", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shl(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.shl");
  });

  it("f32.shl", () => {
    try {
      // --- Act
      shl(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.shl", () => {
    try {
      // --- Act
      shl(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.shr signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shr(WaType.i32, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.shr_s");
  });

  it("i32.shr unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shr(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.shr_u");
  });

  it("i64.shr signed", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shr(WaType.i64, true);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.shr_s");
  });

  it("i64.shr unsigned", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = shr(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.shr_u");
  });

  it("f32.shr", () => {
    try {
      // --- Act
      shr(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.shr", () => {
    try {
      // --- Act
      shr(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.rotl", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rotl(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.rotl");
  });

  it("i64.rotl", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rotl(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.rotl");
  });

  it("f32.rotl", () => {
    try {
      // --- Act
      rotl(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.rotl", () => {
    try {
      // --- Act
      rotl(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("i32.rotr", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rotr(WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.rotr");
  });

  it("i64.rotr", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = rotr(WaType.i64);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.rotr");
  });

  it("f32.rotr", () => {
    try {
      // --- Act
      rotr(WaType.f32);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });

  it("f64.rotr", () => {
    try {
      // --- Act
      rotr(WaType.f64);
    } catch (err) {
      return;
    }
    fail("Error expected");
  });
});
