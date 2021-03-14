import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit pointer operations", () => {
  it("pointer assignment #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u16 ptr;
      u16[100] dt;

      void test() {
        ptr = &dt;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 4");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("pointer addition #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u16 ptr;
      u16[100] dt;

      void test() {
        ptr = ptr + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer addition #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr = ptr + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer addition #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr = ptr + 3 + 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 10");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer addition #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr = ptr + a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.store");
  });

  it("pointer addition #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr = ptr + a + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.const 6");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("pointer subtraction #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u16 ptr;
      u16[100] dt;

      void test() {
        ptr = ptr - 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer subtraction #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr = ptr - 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer subtraction #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr = ptr - 3 - 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 10");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer subtraction #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr = ptr - a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.sub");
    expect(instrs[7].message).toBe("i32.store");
  });

  it("pointer subtraction #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr = ptr - a - 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.sub");
    expect(instrs[7].message).toBe("i32.const 6");
    expect(instrs[8].message).toBe("i32.sub");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("pointer asgn-addition #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u16 ptr;
      u16[100] dt;

      void test() {
        ptr += 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-addition #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr += 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-addition #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr += 3 + 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 10");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-addition #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr += a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.add");
    expect(instrs[7].message).toBe("i32.store");
  });

  it("pointer asgn-addition #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr += a + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 3");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("i32.const 2");
    expect(instrs[7].message).toBe("i32.mul");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("pointer asgn-subtraction #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      *u16 ptr;
      u16[100] dt;

      void test() {
        ptr -= 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 0");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-subtraction #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr -= 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 6");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-subtraction #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        ptr -= 3 + 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 10");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("pointer asgn-subtraction #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr -= a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.mul");
    expect(instrs[6].message).toBe("i32.sub");
    expect(instrs[7].message).toBe("i32.store");
  });

  it("pointer asgn-subtraction #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;
      *u16 ptr;

      void test() {
        local i32 a;
        ptr -= a + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 200");
    expect(instrs[1].message).toBe("i32.const 200");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("get_local $loc$a");
    expect(instrs[4].message).toBe("i32.const 3");
    expect(instrs[5].message).toBe("i32.add");
    expect(instrs[6].message).toBe("i32.const 2");
    expect(instrs[7].message).toBe("i32.mul");
    expect(instrs[8].message).toBe("i32.sub");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        ptr = &dt;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.const 4");
    expect(instrs[2].message).toBe("i32.store");
  });

  it("compound pointer assignment #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        (*ptr).h = &ptr;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("compound pointer assignment #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        (*ptr).h = ptr + 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("i32.load");
    expect(instrs[6].message).toBe("i32.const 10");
    expect(instrs[7].message).toBe("i32.add");
    expect(instrs[8].message).toBe("i32.store");
  });

  it("compound pointer assignment #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        (*ptr).h = ptr - 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("i32.const 0");
    expect(instrs[5].message).toBe("i32.load");
    expect(instrs[6].message).toBe("i32.const 10");
    expect(instrs[7].message).toBe("i32.sub");
    expect(instrs[8].message).toBe("i32.store");
  });

  it("compound pointer assignment #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        (*ptr).h += 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16 ptr;
      reg16[100] dt;

      void test() {
        (*ptr).h -= 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.sub");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      *reg16[4] ptr;

      void test() {
        ptr[2] += 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.const 8");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("compound pointer assignment #8", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };
      *reg16[4] ptr;

      void test() {
        ptr[2] -= 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.const 8");
    expect(instrs[2].message).toBe("i32.load");
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("i32.sub");
    expect(instrs[5].message).toBe("i32.store");
  });

  it("compound pointer assignment #9", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16[4] ptr;

      void test() {
        (*ptr[2]).h += 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #10", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8 h
      };
      *reg16[4] ptr;

      void test() {
        (*ptr[2]).h -= 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.sub");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #11", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8[8] h
      };
      *reg16[4] ptr;

      void test() {
        (*ptr[2]).h[3] += 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 13");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.add");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("compound pointer assignment #12", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        *u8[8] h
      };
      *reg16[4] ptr;

      void test() {
        (*ptr[2]).h[3] -= 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 8");
    expect(instrs[1].message).toBe("i32.load");
    expect(instrs[2].message).toBe("i32.const 13");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $tloc$asgni32");
    expect(instrs[5].message).toBe("get_local $tloc$asgni32");
    expect(instrs[6].message).toBe("i32.load");
    expect(instrs[7].message).toBe("i32.const 2");
    expect(instrs[8].message).toBe("i32.sub");
    expect(instrs[9].message).toBe("i32.store");
  });

  it("local pointer assignment #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;

      void test() {
        local *u16 ptr;
        ptr = &dt;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("set_local $loc$ptr");
  });

  it("local pointer addition #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;

      void test() {
        local *u16 ptr;
        ptr = ptr + 3;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$ptr");
    expect(instrs[1].message).toBe("i32.const 6");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$ptr");
  });

  it("local pointer addition #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;

      void test() {
        local *u16 ptr;
        ptr = ptr + 3 + 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$ptr");
    expect(instrs[1].message).toBe("i32.const 10");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$ptr");
  });

  it("local pointer addition #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      u16[100] dt;

      void test() {
        local *u16 ptr;
        local i32 a;
        ptr = ptr + a;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$ptr");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 2");
    expect(instrs[3].message).toBe("i32.mul");
    expect(instrs[4].message).toBe("i32.add");
    expect(instrs[5].message).toBe("set_local $loc$ptr");
  });

  it("local dereference assignment #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      void test() {
        local *reg16 ptr;
        (*ptr).h = 2;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$ptr");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("i32.const 2");
    expect(instrs[4].message).toBe("i32.store8");
  });

  it("local dereference assignment #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      type reg16 = struct {
        u8 l,
        u8 h
      };

      reg16[4] regs;

      void test(u32 block) {
        local *reg16 ptr = &(regs[2]);
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
    expect(instrs[1].message).toBe("set_local $loc$ptr");
  });

});
