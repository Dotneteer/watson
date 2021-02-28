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
    const locals = wComp.traceMessages.filter((t) => t.source === "local");
    expect(locals[0].message).toBe("(local $loc$a i32)");
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject" && t.point === 1);
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("set_local $loc$a");
  });

});
