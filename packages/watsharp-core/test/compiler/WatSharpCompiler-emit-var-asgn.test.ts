import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit var assignment", () => {
  it("var/bool #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      bool a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/bool #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      bool a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/bool #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      bool a;
      void test() {
        a = 0;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/i8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/i8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const -42");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/i8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/u8 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/u8 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 214");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/u8 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u8 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 254");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/i16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/i16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const -400");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/i16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const -25536");
    expect(instrs[2].message).toBe("i32.store16");
  });

it("var/u16 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/u16 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 65124");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/u16 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u16 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 40000");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/i32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i32 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/i32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i32 a;
      void test() {
        a = -40000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const -40000");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/i32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i32 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 30816000");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/u32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u32 a;
      void test() {
        a = 100_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 100000");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/u32 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u32 a;
      void test() {
        a = -400_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const -400000");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/u32 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u32 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 30816000");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/i64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i64 a;
      void test() {
        a = 100_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const 100000");
    expect(instrs[2].message).toBe("i64.store");
  });

  it("var/i64 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i64 a;
      void test() {
        a = -400_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const -400000");
    expect(instrs[2].message).toBe("i64.store");
  });

  it("var/i64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i64 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const -7268961881239842432");
    expect(instrs[2].message).toBe("i64.store");
  });

  it("var/u64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u64 a;
      void test() {
        a = 100_000;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const 100000");
    expect(instrs[2].message).toBe("i64.store");
  });

  it("var/u64 #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u64 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const -400000000");
    expect(instrs[2].message).toBe("i64.store");
  });

  it("var/u64 #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      u64 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i64.const -7268961881239842432");
    expect(instrs[2].message).toBe("i64.store");
  });
  
  it("var/f32 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      f32 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f32.const 12.25");
    expect(instrs[2].message).toBe("f32.store");
  });

  it("var/f64 #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      f64 a;
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
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("f64.const 12.25");
    expect(instrs[2].message).toBe("f64.store");
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
    it(`var ${c.op} #1`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
        i32 dummy;
        i32 a;
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
      expect(instrs[0].message).toBe("i32.const 4");
      expect(instrs[1].message).toBe("i32.const 4");
      expect(instrs[2].message).toBe("i32.load");
      expect(instrs[3].message).toBe("i32.const 326");
      expect(instrs[4].message).toBe(c.instr);
      expect(instrs[5].message).toBe("i32.store");
    });
  });

  it("var/member #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16 a;
      void test() {
        a.l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/member #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16 a;
      void test() {
        a.h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 5");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/member #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r32 = struct {
        u16 l,
        u16 h
      };
      r32 a;
      void test() {
        a.l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/member #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r32 = struct {
        u16 l,
        u16 h
      };
      r32 a;
      void test() {
        a.h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 6");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("var/member #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r64 = struct {
        u32 l,
        u32 h
      };
      r64 a;
      void test() {
        a.l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/member #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r64 = struct {
        u32 l,
        u32 h
      };
      r64 a;
      void test() {
        a.h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.const 326");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("var/item #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16[4] a;
      void test() {
        a[2].l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/item #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16[4] a;
      void test() {
        a[2].h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 9");
    expect(instrs[1].message).toBe("i32.const 70");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("var/item #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16[4] a;
      void test() {
        a[dummy].l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 2");
    expect(instrs[4].message).toBe("i32.mul");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("i32.const 70");
    expect(instrs[7].message).toBe("i32.store8");
  });

  it("var/item #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16[4] a;
      void test() {
        a[dummy].h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 2");
    expect(instrs[4].message).toBe("i32.mul");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("i32.const 1");
    expect(instrs[7].message).toBe("i32.add");
    expect(instrs[8].message).toBe("i32.const 70");
    expect(instrs[9].message).toBe("i32.store8");
  });

  it("var/item #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      r16[4] a;
      void test() {
        a[dummy].h += 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    expect(wComp.hasErrors).toBe(false);
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $tloc$asgni32 i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 2");
    expect(instrs[4].message).toBe("i32.mul");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("i32.const 1");
    expect(instrs[7].message).toBe("i32.add");
    expect(instrs[8].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[9].message).toBe("get_local $tloc$asgni32");
    expect(instrs[10].message).toBe("i32.load8_u");
    expect(instrs[11].message).toBe("i32.const 326");
    expect(instrs[12].message).toBe("i32.add");
    expect(instrs[13].message).toBe("i32.store8");
  });

  it("var/pointer #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      *r16 a;
      void test() {
        (*a).l = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 70");
    expect(instrs[3].message).toBe("i32.store8");
  });

  it("var/pointer #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      *r16 a;
      void test() {
        (*a).h = 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("i32.const 70");
    expect(instrs[5].message).toBe("i32.store8");
  });

  it("var/pointer #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      type r16 = struct {
        u8 l,
        u8 h
      };
      *r16 a;
      void test() {
        (*a).h *= 326;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 4");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load8_u");
    expect(instrs[7].message).toBe("i32.const 326");
    expect(instrs[8].message).toBe("i32.mul");
    expect(instrs[9].message).toBe("i32.store8");
  });
});
