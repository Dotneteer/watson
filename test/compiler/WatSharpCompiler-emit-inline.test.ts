import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit inline call", () => {
  it("inline call #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc() {
        return 0;
      }
      
      void test() {
        local i32 a = myFunc();
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return val;
      }
      
      void test() {
        local i32 a = myFunc(12);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 12");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return val;
      }
      
      void test() {
        local i32 b;
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_local $loc$b");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 b;

      inline i32 myFunc(i32 val) {
        return val;
      }
      
      void test() {
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return 3+val;
      }
      
      void test() {
        local i32 a = myFunc(12);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 15");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return 3+val;
      }
      
      void test() {
        local i32 b;
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 3");
    expect(instrs[1].message).toBe("get_local $loc$b");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("inline call #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 b;

      inline i32 myFunc(i32 val) {
        return 3+val;
      }
      
      void test() {
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 3");
    expect(instrs[1].message).toBe("get_global $b");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("inline call #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return val+3;
      }
      
      void test() {
        local i32 a = myFunc(12);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 15");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      inline i32 myFunc(i32 val) {
        return val+3;
      }
      
      void test() {
        local i32 b;
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_local $loc$b");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("inline call #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global i32 b;

      inline i32 myFunc(i32 val) {
        return val+3;
      }
      
      void test() {
        local i32 a = myFunc(b);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_global $b");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("inline call #11", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16 bc;

      inline void setB(u8 val) {
        bc.h = val;
      }
      
      void test() {
        setB(123);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 1");
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("inline call #12", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16 bc;

      inline void setC(u8 val) {
        bc.l = val;
      }
      
      void test() {
        setC(123);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("i32.store8");
  });

  it("inline call #13", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16 bc;
      u16 BC {bc};

      inline void setBC(u16 val) {
        BC = val;
      }
      
      void test() {
        setBC(123456);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 57920");
    expect(instrs[2].message).toBe("i32.store16");
  });

  it("inline call #14", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 pc;

      inline void incPC() {
        pc += 1;
      }
      
      void test() {
        incPC();
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_global $pc");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("i32.const 65535");
    expect(instrs[4].message).toBe("i32.and");
    expect(instrs[5].message).toBe("set_global $pc");
  });

  it("inline call #15", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 pc;

      inline u16 incPC() {
        pc += 1;
        return pc;
      }
      
      void test() {
        local u16 a = incPC();
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_global $pc");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("i32.const 65535");
    expect(instrs[4].message).toBe("i32.and");
    expect(instrs[5].message).toBe("set_global $pc");
    expect(instrs[6].message).toBe("get_global $pc");
    expect(instrs[7].message).toBe("set_local $loc$a");
  });

  it("inline call #16", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 pc;

      inline i32 add(i32 a, i32 b) {
        return a+b;
      }
      
      void test() {
        local i32 a = add(2, 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 5");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

  it("inline call #17", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 pc;

      inline i32 add(i32 a, i32 b) {
        return a+pc+b;
      }
      
      void test() {
        local i32 a = add(2, 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("i32.const 2");
    expect(instrs[1].message).toBe("get_global $pc");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("i32.const 3");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("set_local $loc$a");
  });

  it("inline call #18", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      global u16 pc;

      inline i32 add(i32 a, i32 b) {
        return a+b+pc;
      }
      
      void test() {
        local i32 b;
        local i32 a = add(b, 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_local $loc$b");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("get_global $pc");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("set_local $loc$a");
  });

  it("inline call #19", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16 bc;

      inline void setC(u8 val) {
        bc.l = val;
      }
      
      void test() {
        local u16 a;
        setC(a);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 255");
    expect(instrs[2].message).toBe("i32.and");
    expect(instrs[3].message).toBe("set_local $0$par$val");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("get_local $0$par$val");
    expect(instrs[6].message).toBe("i32.store8");
  });

  it("inline call #20", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16 bc;

      inline void setC(u8 val) {
        bc.l = val;
      }
      
      void test() {
        local u8 a;
        setC(a);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.store8");
  });
});
