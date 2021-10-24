import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

const intTypes = ["i8", "u8", "i16", "u16", "i32", "u32", "i64", "u64"];
const floatTypes = ["f32", "f64"];

describe("WatSharpCompiler - emit built-in function", () => {
  it("abs i64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      void test() {
        local i64 a = abs(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $tloc$i64 i64)");
    expect(locals[1].message).toBe("(local $loc$a i64)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("tee_local $tloc$i64");
    expect(instrs[3].message).toBe("i64.const 0");
    expect(instrs[4].message).toBe("i64.lt_s");
    expect(instrs[5].message).toBe("if (result i64)");
    expect(instrs[6].message).toBe("get_local $tloc$i64");
    expect(instrs[7].message).toBe("i64.const -1");
    expect(instrs[8].message).toBe("i64.mul");
    expect(instrs[9].message).toBe("else");
    expect(instrs[10].message).toBe("get_local $tloc$i64");
    expect(instrs[11].message).toBe("end");
    expect(instrs[12].message).toBe("set_local $loc$a");
  });

  it("abs i32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = abs(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $tloc$i32 i32)");
    expect(locals[1].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("tee_local $tloc$i32");
    expect(instrs[3].message).toBe("i32.const 0");
    expect(instrs[4].message).toBe("i32.lt_s");
    expect(instrs[5].message).toBe("if (result i32)");
    expect(instrs[6].message).toBe("get_local $tloc$i32");
    expect(instrs[7].message).toBe("i32.const -1");
    expect(instrs[8].message).toBe("i32.mul");
    expect(instrs[9].message).toBe("else");
    expect(instrs[10].message).toBe("get_local $tloc$i32");
    expect(instrs[11].message).toBe("end");
    expect(instrs[12].message).toBe("set_local $loc$a");
  });

  it("abs i16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 b;
      void test() {
        local i32 a = abs(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $tloc$i32 i32)");
    expect(locals[1].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_s");
    expect(instrs[2].message).toBe("tee_local $tloc$i32");
    expect(instrs[3].message).toBe("i32.const 0");
    expect(instrs[4].message).toBe("i32.lt_s");
    expect(instrs[5].message).toBe("if (result i32)");
    expect(instrs[6].message).toBe("get_local $tloc$i32");
    expect(instrs[7].message).toBe("i32.const -1");
    expect(instrs[8].message).toBe("i32.mul");
    expect(instrs[9].message).toBe("else");
    expect(instrs[10].message).toBe("get_local $tloc$i32");
    expect(instrs[11].message).toBe("end");
    expect(instrs[12].message).toBe("set_local $loc$a");
  });

  it("abs i8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 b;
      void test() {
        local i32 a = abs(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $tloc$i32 i32)");
    expect(locals[1].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_s");
    expect(instrs[2].message).toBe("tee_local $tloc$i32");
    expect(instrs[3].message).toBe("i32.const 0");
    expect(instrs[4].message).toBe("i32.lt_s");
    expect(instrs[5].message).toBe("if (result i32)");
    expect(instrs[6].message).toBe("get_local $tloc$i32");
    expect(instrs[7].message).toBe("i32.const -1");
    expect(instrs[8].message).toBe("i32.mul");
    expect(instrs[9].message).toBe("else");
    expect(instrs[10].message).toBe("get_local $tloc$i32");
    expect(instrs[11].message).toBe("end");
    expect(instrs[12].message).toBe("set_local $loc$a");
  });

  it("abs u64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      void test() {
        local i64 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("abs u32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      void test() {
        local u32 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("abs u16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16 b;
      void test() {
        local u32 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_u");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("abs u8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u8 b;
      void test() {
        local u32 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("abs f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.abs");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("abs f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = abs(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.abs");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ceil f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = ceil(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.ceil");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ceil f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = ceil(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.ceil");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`ceil ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = ceil(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("clz i64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      void test() {
        local i64 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz i32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz i16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_s");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz i8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_s");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz u64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      void test() {
        local i64 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz u32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz u16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_u");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("clz u8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u8 b;
      void test() {
        local i32 a = clz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("i32.clz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  floatTypes.forEach((c) => {
    it(`clz ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = clz(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W151");
    });
  });

  it("copysign f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = copysign(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.copysign");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("copysign f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = copysign(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.copysign");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`copysign ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = copysign(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("ctz i64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      void test() {
        local i64 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz i32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz i16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_s");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz i8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_s");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz u64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      void test() {
        local i64 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz u32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz u16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_u");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("ctz u8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u8 b;
      void test() {
        local i32 a = ctz(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("i32.ctz");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  floatTypes.forEach((c) => {
    it(`ctz ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = ctz(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W151");
    });
  });

  it("floor f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = floor(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.floor");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("floor f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = floor(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.floor");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`floor ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = floor(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("nearest f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = nearest(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.nearest");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("nearest f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = nearest(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.nearest");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`nearest ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = nearest(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("neg f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = neg(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.neg");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("neg f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = neg(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.neg");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`neg ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = neg(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("popcnt i64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i64 b;
      void test() {
        local i64 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt i32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt i16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i16 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_s");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt i8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i8 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_s");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt u64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u64 b;
      void test() {
        local i64 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i64.load");
    expect(instrs[2].message).toBe("i64.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt u32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u32 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt u16 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load16_u");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("popcnt u8 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u8 b;
      void test() {
        local i32 a = popcnt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load8_u");
    expect(instrs[2].message).toBe("i32.popcnt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  floatTypes.forEach((c) => {
    it(`popcnt ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = popcnt(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W151");
    });
  });

  it("sqrt f64 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = sqrt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("f64.sqrt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("sqrt f32 - #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = sqrt(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("f32.sqrt");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  intTypes.forEach((c) => {
    it(`sqrt ${c} - #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        ${c} b;
        void test() {
          local ${c} a = sqrt(b);
        }
        `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(true);
      expect(wComp.errors.length).toBe(1);
      expect(wComp.errors[0].code).toBe("W150");
    });
  });

  it("min(i32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local f32 a = min(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("min(f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = min(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("min(f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = min(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("min(i32, f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      void test() {
        local f32 a = min(b, c);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("f32.min");
    expect(instrs[6].message).toBe("set_local $loc$a");
  });

  it("min(i32, f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f64 c;
      void test() {
        local f64 a = min(b, c);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f64.load");
    expect(instrs[5].message).toBe("f64.min");
    expect(instrs[6].message).toBe("set_local $loc$a");
  });

  it("min(i32, f32, f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      f32 d;
      void test() {
        local f32 a = min(b, c, d);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("i32.const 8");
    expect(instrs[6].message).toBe("f32.load");
    expect(instrs[7].message).toBe("f32.min");
    expect(instrs[8].message).toBe("f32.min");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("min(i32, f32, f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      void test() {
        local f64 a = min(b, c, 1.25);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("f64.promote/f32");
    expect(instrs[6].message).toBe("f64.const 1.25");
    expect(instrs[7].message).toBe("f64.min");
    expect(instrs[8].message).toBe("f64.min");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("max(i32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      void test() {
        local f32 a = max(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("max(f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 b;
      void test() {
        local f32 a = max(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f32.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("max(f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f64 b;
      void test() {
        local f64 a = max(b);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("f64.load");
    expect(instrs[2].message).toBe("set_local $loc$a");
  });

  it("max(i32, f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      void test() {
        local f32 a = max(b, c);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("f32.max");
    expect(instrs[6].message).toBe("set_local $loc$a");
  });

  it("max(i32, f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f64 c;
      void test() {
        local f64 a = max(b, c);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f64.load");
    expect(instrs[5].message).toBe("f64.max");
    expect(instrs[6].message).toBe("set_local $loc$a");
  });

  it("max(i32, f32, f32)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      f32 d;
      void test() {
        local f32 a = max(b, c, d);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f32.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("i32.const 8");
    expect(instrs[6].message).toBe("f32.load");
    expect(instrs[7].message).toBe("f32.max");
    expect(instrs[8].message).toBe("f32.max");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });

  it("max(i32, f32, f64)", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 b;
      f32 c;
      void test() {
        local f64 a = max(b, c, 1.25);
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
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("f64.convert_s/i32");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("f32.load");
    expect(instrs[5].message).toBe("f64.promote/f32");
    expect(instrs[6].message).toBe("f64.const 1.25");
    expect(instrs[7].message).toBe("f64.max");
    expect(instrs[8].message).toBe("f64.max");
    expect(instrs[9].message).toBe("set_local $loc$a");
  });
});
