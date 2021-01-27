import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/wa-ast/WaTree";
import {
  branch,
  branchIf,
  branchTable,
  call,
  callIndirect,
  constVal,
  drop,
  globalGet,
  globalSet,
  localGet,
  localSet,
  localTee,
  nop,
  ret,
  select,
  unreachable,
} from "../../src/wa-ast/FunctionBuilder";
import { WaType } from "../../src/wa-ast/wa-nodes";

describe("WaTree - render instructions #1", () => {
  it("i32.const #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.i32, 100);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.const 100");
  });

  it("i32.const #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.i32, -100);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i32.const -100");
  });

  it("i64.const #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.i64, BigInt("987654321987654321"));

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.const 987654321987654321");
  });

  it("i64.const #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.i64, BigInt("-987654321987654321"));

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("i64.const -987654321987654321");
  });

  it("f32.const #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.f32, 123456.789e12);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.const 123456789000000000");
  });

  it("f32.const #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.f32, -123456.789e12);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f32.const -123456789000000000");
  });

  it("f64.const #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.f64, 123456.789e200);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.const 1.23456789e+205");
  });

  it("f64.const #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = constVal(WaType.f64, -123456.789e200);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("f64.const -1.23456789e+205");
  });

  it("unreachable", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = unreachable();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("unreachable");
  });

  it("nop", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = nop();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("nop");
  });

  it("branch", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = branch("$myBranch");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("br $myBranch");
  });

  it("branch_if", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = branchIf("$myBranch");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("br_if $myBranch");
  });

  it("br_table #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = branchTable(["$0"], "$def");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("br_table $0 $def");
  });

  it("br_table #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = branchTable(["$0", "$1"], "$def");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("br_table $0 $1 $def");
  });

  it("br_table #3", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = branchTable([], "$def");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("br_table $def");
  });

  it("return", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ret();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("return");
  });

  it("call", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = call("$myFunc");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("call $myFunc");
  });

  it("call_indirect", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = callIndirect("$myFunc", "$myType");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("call_indirect $myFunc $myType");
  });

  it("drop", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = drop();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("drop");
  });

  it("select", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = select();

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("select");
  });

  it("local_get", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = localGet("$myVar");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("local_get $myVar");
  });

  it("local_set", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = localSet("$myVar");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("local_set $myVar");
  });

  it("local_tee", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = localTee("$myVar");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("local_tee $myVar");
  });

  it("global_get", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = globalGet("$myVar");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("global_get $myVar");
  });

  it("global_set", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = globalSet("$myVar");

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe("global_set $myVar");
  });
});
