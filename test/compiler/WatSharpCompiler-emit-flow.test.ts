import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit control flow", () => {
  it("block #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i8 a;
      void test() {
        {
          a = 1;
          a = 2;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.store8");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.store8");
  });

  it("if #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3)
          a = 4;
        else
          a = 5;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 5");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("end");
  });

  it("if #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        } else {
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 5");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("end");
  });

  it("if #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("end");
  });

  it("if #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3)
          a = 4;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("end");
  });

  it("if #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
          a = 5;
        } else {
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 5");
    expect(instrs[7].message).toBe("set_local $loc$a");
    expect(instrs[8].message).toBe("else");
    expect(instrs[9].message).toBe("i32.const 5");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("end");
  });

  it("if #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        } else {
          a = 4;
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 4");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("i32.const 5");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("end");
  });

  it("if #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
          a = 5;
        } else {
          a = 4;
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 5");
    expect(instrs[7].message).toBe("set_local $loc$a");
    expect(instrs[8].message).toBe("else");
    expect(instrs[9].message).toBe("i32.const 4");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("i32.const 5");
    expect(instrs[12].message).toBe("set_local $loc$a");
    expect(instrs[13].message).toBe("end");
  });
});
