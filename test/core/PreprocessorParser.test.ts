import "mocha";
import * as expect from "expect";

import { PreprocessorParser } from "../../src/core/PreprocessorParser";

describe("PreprocessorParser", () => {
  it("Empty source", () => {
    // --- Arrange
    const source = "";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(0);
  });

  it("One chunk #1", () => {
    // --- Arrange
    const source = `
    #define DEBUG
    u16 b;
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode.trim()).toBe("");
    expect(chunks[1].sourceCode.trim()).toBe("u16 b;");
  });

  it("One chunk #2", () => {
    // --- Arrange
    const source = `
    u16 b;
    #define DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode.trim()).toBe("u16 b;");
    expect(chunks[1].sourceCode.trim()).toBe("");
  });

  it("Two chunks", () => {
    // --- Arrange
    const source = `
    i8 a = 3;
    #define DEBUG
    u16 b;
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(2);
    expect(chunks[0].sourceCode.trim()).toBe("i8 a = 3;");
    expect(chunks[1].sourceCode.trim()).toBe("u16 b;");
  });

  it("Three chunks", () => {
    // --- Arrange
    const source = `
    i8 a = 3;
    #define DEBUG
    u16 b;
    #undef DEBUG
    i32 c;
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(chunks.length).toBe(3);
    expect(chunks[0].sourceCode.trim()).toBe("i8 a = 3;");
    expect(chunks[1].sourceCode.trim()).toBe("u16 b;");
    expect(chunks[2].sourceCode.trim()).toBe("i32 c;");
  });

  it("#define #1", () => {
    // --- Arrange
    const source = `#define DEBUG`;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBe(true);
  });

  it("#define #2", () => {
    // --- Arrange
    const source = `#define DEBUG`;
    const ppParser = new PreprocessorParser(source);
    ppParser.preprocessorSymbols.OTHER = true;

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBe(true);
    expect(ppParser.preprocessorSymbols.OTHER).toBe(true);
  });

  it("#define #3", () => {
    // --- Arrange
    const source = `

    #define DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBe(true);
  });

  it("#undef #1", () => {
    // --- Arrange
    const source = `#undef DEBUG`;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeFalsy();
  });

  it("#undef #2", () => {
    // --- Arrange
    const source = `#undef DEBUG`;
    const ppParser = new PreprocessorParser(source);
    ppParser.preprocessorSymbols.DEBUG = true;

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeFalsy();
  });

  it("#undef #3", () => {
    // --- Arrange
    const source = `
    
    #undef DEBUG
    `;
    const ppParser = new PreprocessorParser(source);
    ppParser.preprocessorSymbols.DEBUG = true;

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeFalsy();
  });

  it("#define/#undef #1", () => {
    // --- Arrange
    const source = `
    #define DEBUG
    #undef DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeFalsy();
  });

  it("#define/#undef #2", () => {
    // --- Arrange
    const source = `
    #undef DEBUG
    #define DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeTruthy();
  });

  it("#define/#undef #3", () => {
    // --- Arrange
    const source = `
    #define OTHER
    #undef DEBUG
    #define DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeTruthy();
    expect(ppParser.preprocessorSymbols.OTHER).toBeTruthy();
  });

  it("#define/#undef #4", () => {
    // --- Arrange
    const source = `
    #define OTHER
    #undef DEBUG
    #undef OTHER
    #define DEBUG
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeTruthy();
    expect(ppParser.preprocessorSymbols.OTHER).toBeFalsy();
  });

  it("#define/#undef #5", () => {
    // --- Arrange
    const source = `
    #define OTHER
    #define DEBUG
    #undef DEBUG
    #undef OTHER
    `;
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessSource();

    // --- Assert
    expect(ppParser.hasErrors).toBe(false);
    expect(ppParser.preprocessorSymbols.DEBUG).toBeFalsy();
    expect(ppParser.preprocessorSymbols.OTHER).toBeFalsy();
  });
});
