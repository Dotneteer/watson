import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit unary", () => {
  it("unary + #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = +(12 + 3);
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
    expect(instrs[0].message).toBe("i32.const 15");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("unary + #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 b = 123;
      void test() {
        local i32 a = +b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("unary + #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u8 c;
      void test() {
        local i32 a = +c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W143");
  });

  it("unary - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = -(12 + 3);
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
    expect(instrs[0].message).toBe("i32.const -15");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("unary - #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 b = 123;
      void test() {
        local i32 a = -b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const -1");
    expect(instrs[2].message).toBe("i32.mul");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("unary - #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u8 c;
      void test() {
        local i32 a = -c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W143");
  });

  it("logical NOT - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = !(12 + 3);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("logical NOT - #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = !(12 - 12);
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
    expect(instrs[0].message).toBe("i32.const 1");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("logical NOT - #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 b = 123;
      void test() {
        local i32 a = !b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.eqz");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("logical NOT - #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i64 b = 123;
      void test() {
        local i32 a = !b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i64.eqz");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("logical NOT #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u8 c;
      void test() {
        local i32 a = !c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W143");
  });

  it("logical NOT #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 c;
      void test() {
        local i32 a = !c;
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

  it("logical NOT #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 c;
      void test() {
        local i32 a = !c;
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

  it("bitwise NOT - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = ~(12 + 3);
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
    expect(instrs[0].message).toBe("i32.const -16");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i8 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 255");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 255");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i16 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 65535");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 65535");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 4294967295");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u32 b = 123;
      void test() {
        local i32 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 4294967295");
    expect(instrs[2].message).toBe("i32.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i64 b = 123;
      void test() {
        local i64 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i64.const 18446744073709551615");
    expect(instrs[2].message).toBe("i64.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT - #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u64 b = 123;
      void test() {
        local i64 a = ~b;
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
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i64.const 18446744073709551615");
    expect(instrs[2].message).toBe("i64.xor");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("bitwise NOT #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u8 c;
      void test() {
        local i32 a = ~c;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W143");
  });

  it("bitwise NOT #11", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 c;
      void test() {
        local i32 a = ~c;
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

  it("bitwise NOT #12", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 c;
      void test() {
        local i32 a = ~c;
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
});
