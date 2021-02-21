import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit address", () => {
  it("addressOf - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      void test() {
        local i32 a = &b;
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

  it("addressOf - #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      u16 c;
      void test() {
        local i32 a = &c;
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
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16 d;
      void test() {
        local i32 a = &d;
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
    expect(instrs[0].message).toBe("i32.const 10");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16 d;
      void test() {
        local i32 a = &(d.l);
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
    expect(instrs[0].message).toBe("i32.const 10");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16 d;
      void test() {
        local i32 a = &(d.h);
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
    expect(instrs[0].message).toBe("i32.const 11");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16[4] d;
      void test() {
        local i32 a = &(d[0]);
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
    expect(instrs[0].message).toBe("i32.const 10");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16[4] d;
      void test() {
        local i32 a = &(d[2]);
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
    expect(instrs[0].message).toBe("i32.const 14");
    expect(instrs[1].message).toBe("set_local $loc_a");
  });

  it("addressOf - #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16[4] d;
      void test() {
        local i8 idx = 3;
        local i32 a = &(d[idx]);
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
    expect(instrs[0].message).toBe("i32.const 3");
    expect(instrs[1].message).toBe("set_local $loc_idx");
    expect(instrs[2].message).toBe("i32.const 10");
    expect(instrs[3].message).toBe("get_local $loc_idx");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("set_local $loc_a");
  });

  it("addressOf - #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16[4] d;
      void test() {
        local i32 a = &(d[2].h);
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

  it("addressOf - #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      u64 b;
      u16 c;
      reg16[4] d;
      void test() {
        local i8 idx = 3;
        local i32 a = &(d[idx].h);
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
    expect(instrs[0].message).toBe("i32.const 3");
    expect(instrs[1].message).toBe("set_local $loc_idx");
    expect(instrs[2].message).toBe("i32.const 10");
    expect(instrs[3].message).toBe("get_local $loc_idx");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.const 1");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("set_local $loc_a");
  });
});
