import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit binary", () => {
  it("binary + #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary + #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 b;
      u16 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load8_s\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load16_u\n  (i32.const 1)\n)");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary + #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.add");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary + #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i64 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.add");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary + #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      i32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i64.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 8)\n)");
    expect(instrs[2].message).toBe("i64.extend_s/i32");
    expect(instrs[3].message).toBe("i64.add");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary + #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      i32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i64.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 8)\n)");
    expect(instrs[2].message).toBe("i64.extend_s/i32");
    expect(instrs[3].message).toBe("i64.add");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary + #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      i32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(f32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("f64.promote/f32");
    expect(instrs[2].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("f64.convert_u/i32");
    expect(instrs[4].message).toBe("f64.add");
    expect(instrs[5].message).toBe("i32.trunc_s/f64");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("binary + #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(f64.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 8)\n)");
    expect(instrs[2].message).toBe("f64.convert_u/i32");
    expect(instrs[3].message).toBe("f64.add");
    expect(instrs[4].message).toBe("i32.trunc_s/f64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary + #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      f32 c;
      void test() {
        local i32 a = b + c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i64.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("f64.convert_u/i64");
    expect(instrs[2].message).toBe("(f32.load\n  (i32.const 8)\n)");
    expect(instrs[3].message).toBe("f64.promote/f32");
    expect(instrs[4].message).toBe("f64.add");
    expect(instrs[5].message).toBe("i32.trunc_s/f64");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("binary - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b - c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.sub");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary * #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b * c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.mul");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary / #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.div_u");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary / #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u32 c;
      void test() {
        local i32 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.div_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary / #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      i32 c;
      void test() {
        local i32 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.div_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary / #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.div_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary / #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      i32 c;
      void test() {
        local i32 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(f32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("f64.promote/f32");
    expect(instrs[2].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("f64.convert_u/i32");
    expect(instrs[4].message).toBe("f64.div");
    expect(instrs[5].message).toBe("i32.trunc_s/f64");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("binary / #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f64 c;
      void test() {
        local f64 a = b / c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a f64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("f64.convert_u/i32");
    expect(instrs[2].message).toBe("(f64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("f64.div");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("binary % #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b % c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.rem_u");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary % #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      u32 c;
      void test() {
        local i64 a = b % c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i64.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 8)\n)");
    expect(instrs[2].message).toBe("i64.extend_s/i32");
    expect(instrs[3].message).toBe("i64.rem_s");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("binary % #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      i64 c;
      void test() {
        local i64 a = b % c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.rem_s");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("binary % #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b % c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary % #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b % c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary & #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b & c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.and");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary & #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b & c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary & #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b & c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary | #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b | c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.or");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary | #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b | c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary | #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b | c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary ^ #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b ^ c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary ^ #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b ^ c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary ^ #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b ^ c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary >> #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b >> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.shr_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary >> #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b >> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary >> #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b >> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary >>> #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u32 c;
      void test() {
        local i32 a = b >>> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.shr_u");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary >>> #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      f64 c;
      void test() {
        local i64 a = b >>> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary >>> #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      i32 c;
      void test() {
        local i64 a = b >>> c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W145");
  });

  it("binary == #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b == c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary == #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b == c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.eq");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary != #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b != c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.ne");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary != #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b != c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.ne");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary < #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b < c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.lt_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary < #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b < c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.lt_s");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary < #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u64 c;
      void test() {
        local i32 a = b < c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.lt_u");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary <= #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b <= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.le_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary <= #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b <= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.le_s");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary <= #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u64 c;
      void test() {
        local i32 a = b <= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.le_u");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary > #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b > c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.gt_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary > #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b > c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.gt_s");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary > #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u64 c;
      void test() {
        local i32 a = b > c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.gt_u");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary >= #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      i32 c;
      void test() {
        local i32 a = b >= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("(i32.load\n  (i32.const 4)\n)");
    expect(instrs[2].message).toBe("i32.ge_s");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("binary >= #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      u64 c;
      void test() {
        local i32 a = b >= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.ge_s");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("binary >= #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      u64 c;
      void test() {
        local i32 a = b >= c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("i64.extend_s/i32");
    expect(instrs[2].message).toBe("(i64.load\n  (i32.const 4)\n)");
    expect(instrs[3].message).toBe("i64.ge_u");
    expect(instrs[4].message).toBe("i32.wrap/i64");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

});
