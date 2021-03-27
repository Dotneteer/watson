import "mocha";
import * as expect from "expect";
import { WaTree } from "../../src/wa-ast/WaTree";
import {
  block,
  comment,
  constVal,
  ifBlock,
  loop,
} from "../../src/wa-ast/FunctionBuilder";
import { WaType } from "../../src/wa-ast/wa-nodes";

describe("WaTree - render instructions #5", () => {
  it("block #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block("$myBlock", []);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock
end`);
  });

  it("block #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block("$myBlock", [], WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock (result i32)
end`);
  });

  it("block #3", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block("$myBlock", [constVal(WaType.i64, 100)]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock
  i64.const 100
end`);
  });

  it("block #4", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block("$myBlock", [
      constVal(WaType.i64, 100),
      constVal(WaType.i32, 200),
    ]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock
  i64.const 100
  i32.const 200
end`);
  });

  it("block #5", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block("$myBlock", [constVal(WaType.i64, 100)], WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock (result f32)
  i64.const 100
end`);
  });

  it("block #6", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block(
      "$myBlock",
      [constVal(WaType.i64, 100), constVal(WaType.i32, 200)],
      WaType.f64
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock (result f64)
  i64.const 100
  i32.const 200
end`);
  });

  it("block #7", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = block(
      "$myBlock",
      [
        constVal(WaType.i64, 100),
        constVal(WaType.i32, 200),
        block("$other", [constVal(WaType.f32, 1.02)]),
      ],
      WaType.f64
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`block $myBlock (result f64)
  i64.const 100
  i32.const 200
  block $other
    f32.const 1.02
  end
end`);
  });

  it("loop #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop("$myLoop", []);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop
end`);
  });

  it("loop #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop("$myLoop", [], WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop (result i32)
end`);
  });

  it("loop #3", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop("$myLoop", [constVal(WaType.i64, 100)]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop
  i64.const 100
end`);
  });

  it("loop #4", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop("$myLoop", [
      constVal(WaType.i64, 100),
      constVal(WaType.i32, 200),
    ]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop
  i64.const 100
  i32.const 200
end`);
  });

  it("loop #5", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop("$myLoop", [constVal(WaType.i64, 100)], WaType.f32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop (result f32)
  i64.const 100
end`);
  });

  it("loop #6", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop(
      "$myLoop",
      [constVal(WaType.i64, 100), constVal(WaType.i32, 200)],
      WaType.f64
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop (result f64)
  i64.const 100
  i32.const 200
end`);
  });

  it("loop #7", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = loop(
      "$myLoop",
      [
        constVal(WaType.i64, 100),
        constVal(WaType.i32, 200),
        block("$other", [constVal(WaType.f32, 1.02)]),
      ],
      WaType.f64
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`loop $myLoop (result f64)
  i64.const 100
  i32.const 200
  block $other
    f32.const 1.02
  end
end`);
  });

  it("if #1", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
end`);
  });

  it("if #2", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([], undefined, WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if (result i32)
end`);
  });

  it("if #3", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([], [], WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if (result i32)
else
end`);
  });

  it("if #4", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([constVal(WaType.f64, 2.0)]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
  f64.const 2
end`);
  });

  it("if #5", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([constVal(WaType.f64, 2.0)], undefined, WaType.i32);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if (result i32)
  f64.const 2
end`);
  });

  it("if #6", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([
      constVal(WaType.f64, 2.0),
      constVal(WaType.i64, 100),
    ]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
  f64.const 2
  i64.const 100
end`);
  });

  it("if #7", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock(
      [constVal(WaType.f64, 2.0), constVal(WaType.i64, 100)],
      [constVal(WaType.i32, 200)]
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
  f64.const 2
  i64.const 100
else
  i32.const 200
end`);
  });

  it("if #8", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock(
      [constVal(WaType.f64, 2.0), constVal(WaType.i64, 100)],
      [constVal(WaType.i32, 200), constVal(WaType.f32, 3.02)]
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
  f64.const 2
  i64.const 100
else
  i32.const 200
  f32.const 3.02
end`);
  });

  it("if #9", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock(
      [constVal(WaType.f64, 2.0), constVal(WaType.i64, 100)],
      [constVal(WaType.i32, 200), constVal(WaType.f32, 3.02)],
      WaType.i32
    );

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if (result i32)
  f64.const 2
  i64.const 100
else
  i32.const 200
  f32.const 3.02
end`);
  });

  it("if #10", () => {
    // --- Arrange
    const tree = new WaTree();
    const instr = ifBlock([
      comment("Consequent"),
      constVal(WaType.f64, 2.0),
      constVal(WaType.i64, 100),
    ]);

    // --- Act
    const text = tree.renderInstructionNode(instr);

    // --- Assert
    expect(text).toBe(`if
  ;; Consequent
  f64.const 2
  i64.const 100
end`);
  });

  it("Comment #1", () => {
    // --- Arrange
    const tree = new WaTree();

    // --- Act
    tree.comment("This is a comment");
    const text = tree.render();

    // --- Assert
    expect(text).toBe(`(module
  (memory (export "memory") 10)
  ;; This is a comment
)`);
  });

  it("Comment #2", () => {
    // --- Arrange
    const tree = new WaTree();

    // --- Act
    tree.comment("This is a comment", true);
    const text = tree.render();

    // --- Assert
    expect(text).toBe(`(module
  (memory (export "memory") 10)
  (; This is a comment ;)
)`);
  });

  it("Data #1", () => {
    // --- Arrange
    const tree = new WaTree();

    // --- Act
    tree.data(123, [1, 2, 3, 20, 12345]);
    const text = tree.render();

    // --- Assert
    expect(text).toBe(`(module
  (memory (export "memory") 10)
  (data (i32.const 123) "\\01\\02\\03\\14\\39")
)`);
  });

});
