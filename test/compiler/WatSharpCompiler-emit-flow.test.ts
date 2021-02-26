import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - emit control flow", () => {
  it("block #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      i32 dummy;
      i8 a;
      void test() {
        {
          a = 1;
          a = 2;
        }
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
    expect(instrs[3].message).toBe("i32.const 4");
    expect(instrs[4].message).toBe("i32.const 2");
    expect(instrs[5].message).toBe("i32.store8");
  });
});
