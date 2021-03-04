import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit conditional", () => {
  it("conditional #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      i32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 8");
    expect(instrs[3].message).toBe("i32.load");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("i32.load");
    expect(instrs[6].message).toBe("select");
    expect(instrs[7].message).toBe("set_local $loc$a");
  });

  it("conditional #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      i32 c;
      i32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 12");
    expect(instrs[3].message).toBe("i32.load");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("i64.load");
    expect(instrs[6].message).toBe("i32.wrap/i64");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("set_local $loc$a");
  });

  it("conditional #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i64 c;
      i32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i32.wrap/i64");
    expect(instrs[3].message).toBe("i32.const 12");
    expect(instrs[4].message).toBe("i32.load");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("set_local $loc$a");
  });

  it("conditional #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      i32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i32.wrap/i64");
    expect(instrs[3].message).toBe("i32.const 12");
    expect(instrs[4].message).toBe("i32.load");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("set_local $loc$a");
  });

  it("conditional #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      i64 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i64.extend_s/i32");
    expect(instrs[3].message).toBe("i32.const 8");
    expect(instrs[4].message).toBe("i64.load");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("i32.wrap/i64");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("conditional #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      i64 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f64.promote/f32");
    expect(instrs[3].message).toBe("i32.const 8");
    expect(instrs[4].message).toBe("i64.load");
    expect(instrs[5].message).toBe("f64.convert_u/i64");
    expect(instrs[6].message).toBe("i32.const 0");
    expect(instrs[7].message).toBe("i32.load");
    expect(instrs[8].message).toBe("select");
    expect(instrs[9].message).toBe("i32.trunc_s/f64");
    expect(instrs[10].message).toBe("set_local $loc$a");
  });

  it("conditional #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f64 c;
      i64 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("i32.const 12");
    expect(instrs[3].message).toBe("i64.load");
    expect(instrs[4].message).toBe("f64.convert_u/i64");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("i32.trunc_s/f64");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("conditional #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f64 c;
      f32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("i32.const 12");
    expect(instrs[3].message).toBe("f32.load");
    expect(instrs[4].message).toBe("f64.promote/f32");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("i32.trunc_s/f64");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("conditional #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      f32 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_u/i32");
    expect(instrs[3].message).toBe("i32.const 8");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("f64.promote/f32");
    expect(instrs[6].message).toBe("i32.const 0");
    expect(instrs[7].message).toBe("i32.load");
    expect(instrs[8].message).toBe("select");
    expect(instrs[9].message).toBe("i32.trunc_s/f64");
    expect(instrs[10].message).toBe("set_local $loc$a");
  });

  it("conditional #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      f64 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_u/i32");
    expect(instrs[3].message).toBe("i32.const 8");
    expect(instrs[4].message).toBe("f64.load");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("i32.trunc_s/f64");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("conditional #11", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      f64 d;
      void test() {
        local i32 a = b ? c : d;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f64.promote/f32");
    expect(instrs[3].message).toBe("i32.const 8");
    expect(instrs[4].message).toBe("f64.load");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("select");
    expect(instrs[8].message).toBe("i32.trunc_s/f64");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });
});
