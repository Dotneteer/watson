import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit typecast", () => {
  it("typecast #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = i8(b) + 3;
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
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 255)\n)");
    expect(instrs[2].message).toBe("(i32.shl\n  (i32.const 24)\n)");
    expect(instrs[3].message).toBe("(i32.shr_s\n  (i32.const 24)\n)");
    expect(instrs[4].message).toBe("i32.const 3");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("typecast #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = u8(b) + 3;
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
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 255)\n)");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("typecast #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = i16(b) + 3;
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
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 65535)\n)");
    expect(instrs[2].message).toBe("(i32.shl\n  (i32.const 16)\n)");
    expect(instrs[3].message).toBe("(i32.shr_s\n  (i32.const 16)\n)");
    expect(instrs[4].message).toBe("i32.const 3");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("typecast #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = u16(b) + 3;
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
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 65535)\n)");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("set_local $loc_a");
  });

  it("typecast #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = i32(b) + 3;
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
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("typecast #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = u32(b) + 3;
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
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("typecast #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i64 a = i64(b) + 3;
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
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i64.extend_s/i32");
    expect(instrs[4].message).toBe("i64.add");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("typecast #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local u64 a = u64(b) + 3;
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
    expect(instrs[1].message).toBe("i64.extend_u/i32");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i64.extend_s/i32");
    expect(instrs[4].message).toBe("i64.add");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

  it("typecast #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local f64 a = f32(b) + 3;
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
    expect(instrs[1].message).toBe("f32.convert_u/i32");
    expect(instrs[2].message).toBe("f64.promote/f32");
    expect(instrs[3].message).toBe("i32.const 3");
    expect(instrs[4].message).toBe("f64.convert_u/i32");
    expect(instrs[5].message).toBe("f64.add");
    expect(instrs[6].message).toBe("set_local $loc_a");
  });

  it("typecast #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local f64 a = f64(b) + 3;
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
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("(i32.load\n  (i32.const 0)\n)");
    expect(instrs[1].message).toBe("f64.convert_u/i32");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("f64.convert_u/i32");
    expect(instrs[4].message).toBe("f64.add");
    expect(instrs[5].message).toBe("set_local $loc_a");
  });

});
