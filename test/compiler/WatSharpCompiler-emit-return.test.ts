import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit return", () => {
  it("return #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc() {
        return 0;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
  });

  it("return #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc(i32 inp) {
        return inp + 123;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$inp");
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("i32.add");
  });

  it("return #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc() {
        return 0;
        myFunc();
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
  });

  it("return #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc(i32 inp) {
        return inp + 123;
        myFunc(2);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $par$inp");
    expect(instrs[1].message).toBe("i32.const 123");
    expect(instrs[2].message).toBe("i32.add");
  });

  it("return #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 myFunc(i32 inp) {
        return;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W157");
  });

  it("return #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void myFunc(i32 inp) {
        return 12;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(true);
    expect(wComp.errors.length).toBe(1);
    expect(wComp.errors[0].code).toBe("W156");
  });

});
