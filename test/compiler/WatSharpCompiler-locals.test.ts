import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - expressions", () => {
  it("local i64-->f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local f32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a f32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("f32.convert_u/i64")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i64-->f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local f64 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a f64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("f64.convert_u/i64")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i64-->i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i64-->u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i64-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u8 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("(i32.and\n  (i32.const 255)\n)")
    expect(instrs[3].message).toBe("set_local $loc_a")
  });

  it("local i64-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i8 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("(i32.and\n  (i32.const 255)\n)")
    expect(instrs[3].message).toBe("(i32.shl\n  (i32.const 24)\n)")
    expect(instrs[4].message).toBe("(i32.shr_s\n  (i32.const 24)\n)")
    expect(instrs[5].message).toBe("set_local $loc_a")
  });

  it("local i64-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u16 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("(i32.and\n  (i32.const 65535)\n)")
    expect(instrs[3].message).toBe("set_local $loc_a")
  });

  it("local i64-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i16 a = 123456789123456789;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i64.const 123456789123456789")
    expect(instrs[1].message).toBe("i32.wrap/i64")
    expect(instrs[2].message).toBe("(i32.and\n  (i32.const 65535)\n)")
    expect(instrs[3].message).toBe("(i32.shl\n  (i32.const 16)\n)")
    expect(instrs[4].message).toBe("(i32.shr_s\n  (i32.const 16)\n)")
    expect(instrs[5].message).toBe("set_local $loc_a")
  });

  it("local i32-->f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local f32 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a f32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("f32.convert_u/i32")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i32-->f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local f64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a f64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("f64.convert_u/i32")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i32-->i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("i64.extend_s/i32")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i32-->u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u64 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i64)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("i64.extend_u/i32")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i32-->i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i16 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 65535)\n)")
    expect(instrs[2].message).toBe("(i32.shl\n  (i32.const 16)\n)")
    expect(instrs[3].message).toBe("(i32.shr_s\n  (i32.const 16)\n)")
    expect(instrs[4].message).toBe("set_local $loc_a")
  });

  it("local i32-->u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u16 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 65535)\n)")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

  it("local i32-->i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local i8 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 255)\n)")
    expect(instrs[2].message).toBe("(i32.shl\n  (i32.const 24)\n)")
    expect(instrs[3].message).toBe("(i32.shr_s\n  (i32.const 24)\n)")
    expect(instrs[4].message).toBe("set_local $loc_a")
  });

  it("local i32-->u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void a() {
        local u8 a = 12345;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)")
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 12345")
    expect(instrs[1].message).toBe("(i32.and\n  (i32.const 255)\n)")
    expect(instrs[2].message).toBe("set_local $loc_a")
  });

});
