import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit indirect", () => {
  it("indirect #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      reg16 b;
      void test() {
        local i32 a = b.l;
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
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("indirect #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      reg16 b;
      void test() {
        local i32 a = b.h;
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
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("indirect #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      reg16[10] b;
      void test() {
        local i32 a = b[3].h;
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
    expect(instrs[0].message).toBe("i32.const 7");
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("indirect #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      reg16[10] b;
      void test() {
        local i32 idx;
        local i32 a = b[idx].h;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_idx i32)");
    expect(locals[1].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("get_local $loc_idx");
    expect(instrs[2].message).toBe("i32.const 2");
    expect(instrs[3].message).toBe("i32.mul");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.const 1");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.load8_u");
    expect(instrs[8].message).toBe("set_local $loc_a");
  });

  it("indirect #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      reg16[2] c;
      reg16[10] b;
      void test() {
        local i32 idx;
        local i32 a = b[idx].h;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_idx i32)");
    expect(locals[1].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("get_local $loc_idx");
    expect(instrs[2].message).toBe("i32.const 2");
    expect(instrs[3].message).toBe("i32.mul");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.const 1");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.load8_u");
    expect(instrs[8].message).toBe("set_local $loc_a");
  });

  it("indirect #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8[3] h
      };
      reg16[2] c;
      reg16[10] b;
      void test() {
        local i32 idx;
        local i32 a = b[idx].h[2];
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_idx i32)");
    expect(locals[1].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("get_local $loc_idx");
    expect(instrs[2].message).toBe("i32.const 4");
    expect(instrs[3].message).toBe("i32.mul");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.const 3");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.load8_u");
    expect(instrs[8].message).toBe("set_local $loc_a");
  });

  it("dereference #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u64 b;
      void test() {
        local i64 a = *b;
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i64.load");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("dereference #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      **u64 b;
      void test() {
        local i64 a = **b;
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i64.load");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("dereference #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u64[3] b;
      void test() {
        local i64 a = *(b[2]);
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
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i64.load");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });


});
