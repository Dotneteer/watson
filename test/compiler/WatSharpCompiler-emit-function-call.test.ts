import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit function call", () => {
  it("function call #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc() {
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
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc_a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    // myFunc
    expect(instrs[0].message).toBe("i32.const 0");

    // test
    expect(instrs[1].message).toBe("call $myFunc");
    expect(instrs[2].message).toBe("set_local $loc_a");
  });

  it("function call #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc(i8 val) {
        return val;
      }
      
      void test() {
        local i32 a = myFunc(123);
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

    // myFunc
    expect(instrs[0].message).toBe("get_local $par_val");

    // test
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("call $myFunc");
    expect(instrs[3].message).toBe("set_local $loc_a");
  });

  it("function call #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      f32 myFunc(i8 val, f32 other) {
        return val + other;
      }
      
      void test() {
        local i32 a = myFunc(123, 12.25);
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

    // myFunc
    expect(instrs[0].message).toBe("get_local $par_val");
    expect(instrs[1].message).toBe("f64.convert_u/i32");
    expect(instrs[2].message).toBe("get_local $par_other");
    expect(instrs[3].message).toBe("f64.promote/f32");
    expect(instrs[4].message).toBe("f64.add");
    expect(instrs[5].message).toBe("f32.demote/f64");

    // test
    expect(instrs[6].message).toBe("i32.const 123");
    expect(instrs[7].message).toBe("f64.const 12.25");
    expect(instrs[8].message).toBe("f32.demote/f64");
    expect(instrs[9].message).toBe("call $myFunc");
    expect(instrs[10].message).toBe("i32.trunc_s/f32");
    expect(instrs[11].message).toBe("set_local $loc_a");
  });

  it("function call #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void myFunc() {
      }
      
      void test() {
        local i32 a = myFunc();
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W141");
  });
});
