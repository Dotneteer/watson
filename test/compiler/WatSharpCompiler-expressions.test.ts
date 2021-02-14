import "mocha";
import * as expect from "expect";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("WatSharpCompiler - expressions", () => {
  const simplificationCases = [
    { src: "13 * (12 + abc)", exp: "((abc+12)*13)" },
    { src: "12 + abc", exp: "(abc+12)" },
    { src: "0 + a", exp: "a" },
    { src: "a + 0", exp: "a" },
    { src: "a - 0", exp: "a" },
    { src: "0 - a", exp: "-(a)" },
  ];
  simplificationCases.forEach((c, index) => {
    it(`Simplify #${index + 1}, ${c.src}`, () => {
      // --- Arrange
      const wComp = new WatSharpCompiler(`
      void a() {
        local u32 a = ${c.src};
      }
      `);

      // --- Act
      wComp.trace();
      wComp.compile();

      // --- Assert
      expect(wComp.hasErrors).toBe(false);
      const traces = wComp.traceMessages.filter((t) => t.source === "pExpr");
      expect(traces[1].message).toBe(c.exp);
    });
  });
});
