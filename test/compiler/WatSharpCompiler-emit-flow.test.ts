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

  it("if #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3)
          a = 4;
        else
          a = 5;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 5");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("end");
  });

  it("if #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        } else {
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 5");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("end");
  });

  it("if #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("end");
  });

  it("if #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3)
          a = 4;
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("end");
  });

  it("if #5", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
          a = 5;
        } else {
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 5");
    expect(instrs[7].message).toBe("set_local $loc$a");
    expect(instrs[8].message).toBe("else");
    expect(instrs[9].message).toBe("i32.const 5");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("end");
  });

  it("if #6", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
        } else {
          a = 4;
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("else");
    expect(instrs[7].message).toBe("i32.const 4");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("i32.const 5");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("end");
  });

  it("if #7", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        if (a == 3) {
          a = 4;
          a = 5;
        } else {
          a = 4;
          a = 5;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 3");
    expect(instrs[2].message).toBe("i32.eq");
    expect(instrs[3].message).toBe("if");
    expect(instrs[4].message).toBe("i32.const 4");
    expect(instrs[5].message).toBe("set_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 5");
    expect(instrs[7].message).toBe("set_local $loc$a");
    expect(instrs[8].message).toBe("else");
    expect(instrs[9].message).toBe("i32.const 4");
    expect(instrs[10].message).toBe("set_local $loc$a");
    expect(instrs[11].message).toBe("i32.const 5");
    expect(instrs[12].message).toBe("set_local $loc$a");
    expect(instrs[13].message).toBe("end");
  });

  it("while #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        while (a < 3) {
          a += 1;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("loop $loop$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.lt_s");
    expect(instrs[4].message).toBe("if");
    expect(instrs[5].message).toBe("get_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 1");
    expect(instrs[7].message).toBe("i32.add");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("br $loop$1");
    expect(instrs[10].message).toBe("end");
    expect(instrs[11].message).toBe("end");
  });

  it("while #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        while (a < 3) {
          break;
          a += 1;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("block $break$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.lt_s");
    expect(instrs[4].message).toBe("br_if $break$1");
    expect(instrs[5].message).toBe("end");
  });

  it("while #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        while (a < 3) {
          a += 1;
          break;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("block $break$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.lt_s");
    expect(instrs[4].message).toBe("if");
    expect(instrs[5].message).toBe("get_local $loc$a");
    expect(instrs[6].message).toBe("i32.const 1");
    expect(instrs[7].message).toBe("i32.add");
    expect(instrs[8].message).toBe("set_local $loc$a");
    expect(instrs[9].message).toBe("br $break$1");
    expect(instrs[10].message).toBe("end");
    expect(instrs[11].message).toBe("end");
  });

  it("while #4", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        while (a < 3) {
          continue;
          a += 1;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    console.log(JSON.stringify(instrs, null, 2));
    expect(instrs[0].message).toBe("loop $loop$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.lt_s");
    expect(instrs[4].message).toBe("br_if $loop$1");
    expect(instrs[5].message).toBe("end");
  });

  it("do..while #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        do {
          a += 1;
        } while (a < 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("loop $loop$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $loc$a");
    expect(instrs[5].message).toBe("i32.const 3");
    expect(instrs[6].message).toBe("i32.lt_s");
    expect(instrs[7].message).toBe("br_if $loop$1");
    expect(instrs[8].message).toBe("end");
  });

  it("do..while #2", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        do {
          break;
          a += 1;
        } while (a < 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs.length).toBe(0);
  });

  it("do..while #3", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        do {
          a += 1;
          break;
        } while (a < 3);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("get_local $loc$a");
    expect(instrs[1].message).toBe("i32.const 1");
    expect(instrs[2].message).toBe("i32.add");
    expect(instrs[3].message).toBe("set_local $loc$a");
  });

  it("nested while #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 l1 = 0;
        while (l1 < 10) {
          local i32 l2 = 0;
          while (l2 < 10) {
            l2 += 1;
          }
          l1 += 1;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("i32.const 0");
    expect(instrs[1].message).toBe("set_local $loc$l1");
    expect(instrs[2].message).toBe("loop $loop$1");
    expect(instrs[3].message).toBe("get_local $loc$l1");
    expect(instrs[4].message).toBe("i32.const 10");
    expect(instrs[5].message).toBe("i32.lt_s");
    expect(instrs[6].message).toBe("if");
    expect(instrs[7].message).toBe("i32.const 0");
    expect(instrs[8].message).toBe("set_local $loc$l2");
    expect(instrs[9].message).toBe("loop $loop$2");
    expect(instrs[10].message).toBe("get_local $loc$l2");
    expect(instrs[11].message).toBe("i32.const 10");
    expect(instrs[12].message).toBe("i32.lt_s");
    expect(instrs[13].message).toBe("if");
    expect(instrs[14].message).toBe("get_local $loc$l2");
    expect(instrs[15].message).toBe("i32.const 1");
    expect(instrs[16].message).toBe("i32.add");
    expect(instrs[17].message).toBe("set_local $loc$l2");
    expect(instrs[18].message).toBe("br $loop$2");
    expect(instrs[19].message).toBe("end");
    expect(instrs[20].message).toBe("end");
    expect(instrs[21].message).toBe("get_local $loc$l1");
    expect(instrs[22].message).toBe("i32.const 1");
    expect(instrs[23].message).toBe("i32.add");
    expect(instrs[24].message).toBe("set_local $loc$l1");
    expect(instrs[25].message).toBe("br $loop$1");
    expect(instrs[26].message).toBe("end");
    expect(instrs[27].message).toBe("end");
  });


  it("while regression #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        while (a < 3 & a > 0) {
          a += 1;
        }
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("loop $loop$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 3");
    expect(instrs[3].message).toBe("i32.lt_s");
    expect(instrs[4].message).toBe("get_local $loc$a");
    expect(instrs[5].message).toBe("i32.const 0");
    expect(instrs[6].message).toBe("i32.gt_s");
    expect(instrs[7].message).toBe("i32.and");
    expect(instrs[8].message).toBe("if");
    expect(instrs[9].message).toBe("get_local $loc$a");
    expect(instrs[10].message).toBe("i32.const 1");
    expect(instrs[11].message).toBe("i32.add");
    expect(instrs[12].message).toBe("set_local $loc$a");
    expect(instrs[13].message).toBe("br $loop$1");
    expect(instrs[14].message).toBe("end");
    expect(instrs[15].message).toBe("end");
  });

  it("do..while regression #1", () => {
    // --- Arrange
    const wComp = new WatSharpCompiler(`
      void test() {
        local i32 a;
        do {
          a += 1;
        } while (a < 3 & a > 0);
      }
      `);

    // --- Act
    wComp.trace();
    wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);
    const instrs = wComp.traceMessages.filter((t) => t.source === "inject");
    expect(instrs[0].message).toBe("loop $loop$1");
    expect(instrs[1].message).toBe("get_local $loc$a");
    expect(instrs[2].message).toBe("i32.const 1");
    expect(instrs[3].message).toBe("i32.add");
    expect(instrs[4].message).toBe("tee_local $loc$a");
    expect(instrs[5].message).toBe("i32.const 3");
    expect(instrs[6].message).toBe("i32.lt_s");
    expect(instrs[7].message).toBe("get_local $loc$a");
    expect(instrs[8].message).toBe("i32.const 0");
    expect(instrs[9].message).toBe("i32.gt_s");
    expect(instrs[10].message).toBe("i32.and");
    expect(instrs[11].message).toBe("br_if $loop$1");
    expect(instrs[12].message).toBe("end");
  });
});
