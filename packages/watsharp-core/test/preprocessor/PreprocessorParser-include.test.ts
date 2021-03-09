import "mocha";
import * as expect from "expect";

import {
  PreprocessorParser,
  IncludeHandlerResult,
} from "../../src/preprocessor/PreprocessorParser";
import { fail } from "assert";

describe("PreprocessorParser - include", () => {
  it("Invalid filename", () => {
    // --- Arrange
    const source = `
    #include "dummy"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    try {
      // --- Act
      const chunks = ppParser.preprocessSource();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P016");
      expect(ppParser.errors[0].text).toBe(
        "#include error: Error: Cannot read file dummy"
      );
    }
  });

  it("Single #include #1", () => {
    // --- Arrange
    const source = `
    #include "a.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("1;");
    expect(chunks[0].fileIndex).toBe(1);
  });

  it("Single #include #2", () => {
    // --- Arrange
    const source = `
    before;
    #include "a.wats"
    after;
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("Single #include #3", () => {
    // --- Arrange
    const source = `
    before;
    #include "a.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
  });

  it("Single #include #4", () => {
    // --- Arrange
    const source = `
    #include "a.wats"
    after;
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode).toBe("1;");
    expect(chunks[0].fileIndex).toBe(1);
    expect(chunks[1].sourceCode).toBe("after;");
    expect(chunks[1].fileIndex).toBe(0);
  });

  it("Multiple #include #1", () => {
    // --- Arrange
    const source = `
    #include "a.wats"
    #include "b.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode).toBe("1;");
    expect(chunks[0].fileIndex).toBe(1);
    expect(chunks[1].sourceCode).toBe("2;");
    expect(chunks[1].fileIndex).toBe(2);
  });

  it("Multiple #include #2", () => {
    // --- Arrange
    const source = `
    before;
    #include "a.wats"
    #include "b.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("2;");
    expect(chunks[2].fileIndex).toBe(2);
  });

  it("Multiple #include #3", () => {
    // --- Arrange
    const source = `
    before;
    #include "a.wats"
    middle;
    #include "b.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(4);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("middle;");
    expect(chunks[2].fileIndex).toBe(0);
    expect(chunks[3].sourceCode).toBe("2;");
    expect(chunks[3].fileIndex).toBe(2);
  });

  it("Multiple #include #4", () => {
    // --- Arrange
    const source = `
    before;
    #include "a.wats"
    middle;
    #include "b.wats"
    after;
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(5);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("middle;");
    expect(chunks[2].fileIndex).toBe(0);
    expect(chunks[3].sourceCode).toBe("2;");
    expect(chunks[3].fileIndex).toBe(2);
    expect(chunks[4].sourceCode).toBe("after;");
    expect(chunks[4].fileIndex).toBe(0);
  });

  it("#include in #if #1", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(0);
  });

  it("#include in #if #2", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #3", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(0);
  });

  it("#include in #if #4", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #5", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before2;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("2;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after2;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #6", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #7", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #else
      before3;
      #include "c.wats"
      after3;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before3;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("3;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after3;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #8", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #else
      before3;
      #include "c.wats"
      after3;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #9", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #else
      before3;
      #include "c.wats"
      after3;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before2;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("2;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after2;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#include in #if #10", () => {
    // --- Arrange
    const source = `
    #if S1
      before;
      #include "a.wats"
      after;
    #elseif S2
      before2;
      #include "b.wats"
      after2;
    #else
      before3;
      #include "c.wats"
      after3;
    #endif
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode).toBe("before;");
    expect(chunks[0].fileIndex).toBe(0);
    expect(chunks[1].sourceCode).toBe("1;");
    expect(chunks[1].fileIndex).toBe(1);
    expect(chunks[2].sourceCode).toBe("after;");
    expect(chunks[2].fileIndex).toBe(0);
  });

  it("#if in #include #1", () => {
    // --- Arrange
    const source = `
    #include "d.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("6;");
    expect(chunks[0].fileIndex).toBe(1);
  });

  it("#if in #include #2", () => {
    // --- Arrange
    const source = `
    #include "d.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = false;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("4;");
    expect(chunks[0].fileIndex).toBe(1);
  });

  it("#if in #include #3", () => {
    // --- Arrange
    const source = `
    #include "d.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = false;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("5;");
    expect(chunks[0].fileIndex).toBe(1);
  });

  it("#if in #include #4", () => {
    // --- Arrange
    const source = `
    #include "d.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    ppParser.preprocessorSymbols.S1 = true;
    ppParser.preprocessorSymbols.S2 = true;
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("4;");
    expect(chunks[0].fileIndex).toBe(1);
  });

  it("nested #include #1", () => {
    // --- Arrange
    const source = `
    #include "main.wats"
    `;
    const ppParser = new PreprocessorParser(source, 0, includeHandler);
    resetFileIndex();

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(4);
    expect(chunks[0].sourceCode).toBe("main;");
    expect(chunks[0].fileIndex).toBe(1);
    expect(chunks[1].sourceCode).toBe("inc1;");
    expect(chunks[1].fileIndex).toBe(2);
    expect(chunks[2].sourceCode).toBe("inc3;");
    expect(chunks[2].fileIndex).toBe(3);
    expect(chunks[3].sourceCode).toBe("inc2;");
    expect(chunks[3].fileIndex).toBe(4);
  });
});

const includeFiles: Record<string, string> = {
  "a.wats": `
    1;
  `,
  "b.wats": `
    2;
  `,
  "c.wats": `
    3;
  `,
  "d.wats": `
    #if S1
    4;
    #elseif S2
    5;
    #else
    6;
    #endif
  `,
  "inc1.wats": `
    inc1;
    #include "inc3.wats"
  `,
  "inc2.wats": `
    inc2;
    #include "inc3.wats"
  `,
  "inc3.wats": `
  #if !_inc3
    inc3;
    #define _inc3
  #endif
  `,
  "main.wats": `
    main;
    #include "inc1.wats"
    #include "inc2.wats"
  `,
};

let fileIndex: number = 0;

function resetFileIndex(): void {
  fileIndex = 0;
}

/**
 * Emulate include file loading
 * @param filename File name to load
 */
function includeHandler(baseFileIndex: number, filename: string): IncludeHandlerResult {
  const source = includeFiles[filename];
  if (source === undefined) {
    throw new Error(`Cannot read file ${filename}`);
  }
  fileIndex++;
  return {
    source,
    fileIndex,
  };
}
