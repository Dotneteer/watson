import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit structure copy", () => {
  it("copy assignment #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[5] ptr
      };

      regs a;
      regs b;

      void test() {
        b := &a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 31");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i64.load");
    expect(instrs[3].message).toBe("i64.store");
    expect(instrs[4].message).toBe("i32.const 31");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i64.load offset=8");
    expect(instrs[7].message).toBe("i64.store offset=8");
    expect(instrs[8].message).toBe("i32.const 31");
    expect(instrs[9].message).toBe("i32.const 0");
    expect(instrs[10].message).toBe("i64.load offset=16");
    expect(instrs[11].message).toBe("i64.store offset=16");
    expect(instrs[12].message).toBe("i32.const 31");
    expect(instrs[13].message).toBe("i32.const 0");
    expect(instrs[14].message).toBe("i32.load offset=24");
    expect(instrs[15].message).toBe("i32.store offset=24");
    expect(instrs[16].message).toBe("i32.const 31");
    expect(instrs[17].message).toBe("i32.const 0");
    expect(instrs[18].message).toBe("i32.load16_u offset=28");
    expect(instrs[19].message).toBe("i32.store16 offset=28");
    expect(instrs[20].message).toBe("i32.const 31");
    expect(instrs[21].message).toBe("i32.const 0");
    expect(instrs[22].message).toBe("i32.load8_u offset=30");
    expect(instrs[23].message).toBe("i32.store8 offset=30");
  });

  it("copy assignment #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[5] ptr
      };

      regs a;
      regs b;

      void test() {
        b := &a + 10;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 10");
    expect(instrs[1].message).toBe("set_local $tloc$rcpyi32");
    expect(instrs[2].message).toBe("i32.const 31");
    expect(instrs[3].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[4].message).toBe("i64.load");
    expect(instrs[5].message).toBe("i64.store");
    expect(instrs[6].message).toBe("i32.const 31");
    expect(instrs[7].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[8].message).toBe("i64.load offset=8");
    expect(instrs[9].message).toBe("i64.store offset=8");
    expect(instrs[10].message).toBe("i32.const 31");
    expect(instrs[11].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[12].message).toBe("i64.load offset=16");
    expect(instrs[13].message).toBe("i64.store offset=16");
    expect(instrs[14].message).toBe("i32.const 31");
    expect(instrs[15].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[16].message).toBe("i32.load offset=24");
    expect(instrs[17].message).toBe("i32.store offset=24");
    expect(instrs[18].message).toBe("i32.const 31");
    expect(instrs[19].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[20].message).toBe("i32.load16_u offset=28");
    expect(instrs[21].message).toBe("i32.store16 offset=28");
    expect(instrs[22].message).toBe("i32.const 31");
    expect(instrs[23].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[24].message).toBe("i32.load8_u offset=30");
    expect(instrs[25].message).toBe("i32.store8 offset=30");
  });

  it("copy assignment #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[5] ptr
      };

      regs a;
      regs b;

      void test() {
        b := a;
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

  it("copy assignment #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[5] ptr
      };

      regs a;
      regs b;

      void test() {
        b := 12.34;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W167");
  });

  it("copy assignment #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = u8[31];

      regs a;
      regs b;

      void test() {
        b := &a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 31");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i64.load");
    expect(instrs[3].message).toBe("i64.store");
    expect(instrs[4].message).toBe("i32.const 31");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i64.load offset=8");
    expect(instrs[7].message).toBe("i64.store offset=8");
    expect(instrs[8].message).toBe("i32.const 31");
    expect(instrs[9].message).toBe("i32.const 0");
    expect(instrs[10].message).toBe("i64.load offset=16");
    expect(instrs[11].message).toBe("i64.store offset=16");
    expect(instrs[12].message).toBe("i32.const 31");
    expect(instrs[13].message).toBe("i32.const 0");
    expect(instrs[14].message).toBe("i32.load offset=24");
    expect(instrs[15].message).toBe("i32.store offset=24");
    expect(instrs[16].message).toBe("i32.const 31");
    expect(instrs[17].message).toBe("i32.const 0");
    expect(instrs[18].message).toBe("i32.load16_u offset=28");
    expect(instrs[19].message).toBe("i32.store16 offset=28");
    expect(instrs[20].message).toBe("i32.const 31");
    expect(instrs[21].message).toBe("i32.const 0");
    expect(instrs[22].message).toBe("i32.load8_u offset=30");
    expect(instrs[23].message).toBe("i32.store8 offset=30");
  });

  it("copy assignment #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = u8[31];

      regs a;
      regs b;

      void test() {
        b := &a + 10;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 10");
    expect(instrs[1].message).toBe("set_local $tloc$rcpyi32");
    expect(instrs[2].message).toBe("i32.const 31");
    expect(instrs[3].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[4].message).toBe("i64.load");
    expect(instrs[5].message).toBe("i64.store");
    expect(instrs[6].message).toBe("i32.const 31");
    expect(instrs[7].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[8].message).toBe("i64.load offset=8");
    expect(instrs[9].message).toBe("i64.store offset=8");
    expect(instrs[10].message).toBe("i32.const 31");
    expect(instrs[11].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[12].message).toBe("i64.load offset=16");
    expect(instrs[13].message).toBe("i64.store offset=16");
    expect(instrs[14].message).toBe("i32.const 31");
    expect(instrs[15].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[16].message).toBe("i32.load offset=24");
    expect(instrs[17].message).toBe("i32.store offset=24");
    expect(instrs[18].message).toBe("i32.const 31");
    expect(instrs[19].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[20].message).toBe("i32.load16_u offset=28");
    expect(instrs[21].message).toBe("i32.store16 offset=28");
    expect(instrs[22].message).toBe("i32.const 31");
    expect(instrs[23].message).toBe("get_local $tloc$rcpyi32");
    expect(instrs[24].message).toBe("i32.load8_u offset=30");
    expect(instrs[25].message).toBe("i32.store8 offset=30");
  });

  it("copy assignment #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[5] ptr
      };

      regs a;
      regs b;
      u16 c;

      void test() {
        c := &a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W166");
  });

  it("copy assignment #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type regs = struct {
        u8 l,
        u8 h,
        u8 q,
        u64 m,
        *u16[500] ptr
      };

      regs a;
      regs b;
      u16 c;

      void test() {
        b := &a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W168");
  });
});
