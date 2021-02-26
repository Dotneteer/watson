import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit local/global asgn", () => {
  it("local/i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i8 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 70");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i8 a;
        a = -42;
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
    expect(instrs[0].message).toBe("i32.const -42");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i8 a;
        a = 123;
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
    expect(instrs[0].message).toBe("i32.const 123");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u8 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 70");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u8 a;
        a = -42;
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
    expect(instrs[0].message).toBe("i32.const 214");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u8 a;
        a = 254;
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
    expect(instrs[0].message).toBe("i32.const 254");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a;
        a = -412;
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
    expect(instrs[0].message).toBe("i32.const -412");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a;
        a = 40000;
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
    expect(instrs[0].message).toBe("i32.const -25536");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a;
        a = 40000;
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
    expect(instrs[0].message).toBe("i32.const 40000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a;
        a = -400;
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
    expect(instrs[0].message).toBe("i32.const 65136");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        a = -100000;
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
    expect(instrs[0].message).toBe("i32.const -100000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        a = 17_179_900_000_000;
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
    expect(instrs[0].message).toBe("i32.const 30816000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u32 a;
        a = 326;
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
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u32 a;
        a = -100000;
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
    expect(instrs[0].message).toBe("i32.const -100000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u32 a;
        a = 17_179_900_000_000;
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
    expect(instrs[0].message).toBe("i32.const 30816000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i64 a;
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i64 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i64 a;
        a = -400_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -400000000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/i64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i64 a;
        a = 123456789123456789123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -7268961881239842432");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u64 a;
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 326");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u64 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u64 a;
        a = -400_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -400000000");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/u64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u64 a;
        a = 123456789123456789123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -7268961881239842432");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f32 a;
        a = 123.456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("f32.const 123.456");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("local/f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f64 a;
        a = 123.456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("f64.const 123.456");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("global/i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i8 a;
      void test() {
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 70");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i8 a;
      void test() {
        a = -42;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -42");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i8 a;
      void test() {
        a = 123;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 123");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 a;
      void test() {
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 70");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 a;
      void test() {
        a = -42;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 214");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u8 a;
      void test() {
        a = 254;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 254");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i16 a;
      void test() {
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i16 a;
      void test() {
        a = -412;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -412");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i16 a;
      void test() {
        a = 40000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -25536");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 a;
      void test() {
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 a;
      void test() {
        a = 40000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 40000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 a;
      void test() {
        a = -400;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 65136");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 326");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = -100000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -100000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = 17_179_900_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 30816000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = 100000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 100000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = -100000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -100000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 a;
      void test() {
        a = 17_179_900_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 30816000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i64 a;
      void test() {
        a = 100000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 100000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i64 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i64 a;
      void test() {
        a = -400_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -400000000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/i64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i64 a;
      void test() {
        a = 123456789123456789123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -7268961881239842432");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u64 a;
      void test() {
        a = 100000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 100000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u62 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u64 a;
      void test() {
        a = -400_000_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -400000000");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/u64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u64 a;
      void test() {
        a = 123456789123456789123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const -7268961881239842432");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f32 a;
      void test() {
        a = 12.25;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("f32.const 12.25");
    expect(instrs[1].message).toBe("set_global $a");
  });

  it("global/f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global f64 a;
      void test() {
        a = 12.25;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("f64.const 12.25");
    expect(instrs[1].message).toBe("set_global $a");
  });

  const asgnCases = [
    { op: "+=", instr: "i32.add" },
    { op: "-=", instr: "i32.sub" },
    { op: "*=", instr: "i32.mul" },
    { op: "/=", instr: "i32.div_s" },
    { op: "%=", instr: "i32.rem_s" },
    { op: "&=", instr: "i32.and" },
    { op: "|=", instr: "i32.or" },
    { op: "^=", instr: "i32.xor" },
    { op: "<<=", instr: "i32.shl" },
    { op: ">>=", instr: "i32.shr_s" },
    { op: ">>>=", instr: "i32.shr_u" },
  ];
  asgnCases.forEach((c) => {
    it(`local ${c.op} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        void test() {
          local i32 a;
          a ${c.op} 326;
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
      expect(instrs[0].message).toBe("get_local $loc$a");
      expect(instrs[1].message).toBe("i32.const 326");
      expect(instrs[2].message).toBe(c.instr);
      expect(instrs[3].message).toBe("set_local $loc$a");
    });
  });

  asgnCases.forEach((c) => {
    it(`global ${c.op} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        global i32 a;
        void test() {
          a ${c.op} 326;
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
      expect(instrs[0].message).toBe("get_global $a");
      expect(instrs[1].message).toBe("i32.const 326");
      expect(instrs[2].message).toBe(c.instr);
      expect(instrs[3].message).toBe("set_global $a");
    });
  });
});
