import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit locals", () => {
  it("local i64-->f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("f32.convert_u/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i64-->f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f64 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("f64.convert_u/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i64-->i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i64-->u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i64-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u8 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local i64-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i8 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 24")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 24")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local i64-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local i64-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 16")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 16")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local i32-->f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f32 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("f32.convert_u/i32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i32-->f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("f64.convert_u/i32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i32-->i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("i64.extend_s/i32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i32-->u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("i64.extend_u/i32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i32-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i32-->i16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i16 a = 123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const -7616")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i32-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i32-->u16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u16 a = 123456;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 57920")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i32-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i8 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 57")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i32-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local u8 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 57")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("local i64-->*u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local *u32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local i64-->*struct #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local *struct { u8 l} a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local f32 a = 12345.678;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("f64.const 12345.678")
    expect(instrs[1].message).toBe("f32.demote/f64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local i64 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i64.trunc_s/f64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local u64 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i64.trunc_u/f64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local i32 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_s/f64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local u32 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f64")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f64-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local i16 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f64")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 16")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 16")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local f64-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local u16 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f64")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local f64-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local i8 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f64")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 24")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 24")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local f64-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f64 par) {
        local u8 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f64")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local f32-->f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local f64 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a f64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("f64.promote/f32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f32-->i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local i64 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i64.trunc_s/f32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f32-->u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local u64 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i64.trunc_u/f32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f32-->i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local i32 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_s/f32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f32-->u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local u32 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f32")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("local f32-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local i16 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f32")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 16")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 16")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local f32-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local u16 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f32")
    expect(instrs[2].message).toBe("i32.const 65535")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local f32-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local i8 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f32")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 24")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 24")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("local f32-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local u8 a = par;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$par")
    expect(instrs[1].message).toBe("i32.trunc_u/f32")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("set_local $loc$a")
  });

  it("local get #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test(f32 par) {
        local i32 dummy;
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$dummy i32)")
    expect(locals[1].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$dummy")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("global get #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_global $dummy")
    expect(instrs[1].message).toBe("set_local $loc$a")
  });

  it("var get f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("f64.load")
    expect(instrs[2].message).toBe("i32.trunc_s/f64")
    expect(instrs[3].message).toBe("set_local $loc$a")
  });

  it("var get f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("f32.load")
    expect(instrs[2].message).toBe("i32.trunc_s/f32")
    expect(instrs[3].message).toBe("set_local $loc$a")
  });

  it("var get i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i64.load")
    expect(instrs[2].message).toBe("i32.wrap/i64")
    expect(instrs[3].message).toBe("set_local $loc$a")
  });

  it("var get u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i64.load")
    expect(instrs[2].message).toBe("i32.wrap/i64")
    expect(instrs[3].message).toBe("set_local $loc$a")
  });

  it("var get i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load16_s")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get i16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 dummy;
      void test(f32 par) {
        local i16 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load16_s")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get i16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 dummy;
      void test(f32 par) {
        local i8 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load16_s")
    expect(instrs[2].message).toBe("i32.const 255")
    expect(instrs[3].message).toBe("i32.and")
    expect(instrs[4].message).toBe("i32.const 24")
    expect(instrs[5].message).toBe("i32.shl")
    expect(instrs[6].message).toBe("i32.const 24")
    expect(instrs[7].message).toBe("i32.shr_s")
    expect(instrs[8].message).toBe("set_local $loc$a")
  });

  it("var get u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load16_u")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load8_s")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });

  it("var get u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u8 dummy;
      void test(f32 par) {
        local i32 a = dummy;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 0")
    expect(instrs[1].message).toBe("i32.load8_u")
    expect(instrs[2].message).toBe("set_local $loc$a")
  });
});
