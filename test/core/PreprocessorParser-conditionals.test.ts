import "mocha";
import * as expect from "expect";

import { PreprocessorParser } from "../../src/preprocessor/PreprocessorParser";
import { fail } from "assert";

describe("PreprocessorParser - conditionals", () => {
  it("#if without #endif", () => {
    // --- Arrange
    const source = `
    #if MY_SYMBOL
    byte myVar;
    `;
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.preprocessSource();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P014");
    }
  });

  it("#elseif without #if", () => {
    // --- Arrange
    const source = `
    byte myVar;
    #elseif MY_SYMBOL
    `;
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.preprocessSource();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P009");
    }
  });

  it("#else without #if", () => {
    // --- Arrange
    const source = `
    byte myVar;
    #else MY_SYMBOL
    `;
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.preprocessSource();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P011");
    }
  });

  it("#endif without #if", () => {
    // --- Arrange
    const source = `
    byte myVar;
    #endif
    `;
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.preprocessSource();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P013");
    }
  });

  it("#if with true condition #1", () => {
    // --- Arrange
    const source = `
    #if MY_SYMBOL
    byte myVar;
    #endif
    `;
    const ppParser = new PreprocessorParser(source);
    ppParser.preprocessorSymbols.MY_SYMBOL = true;

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(chunks.length).toBe(1);
    expect(chunks[0].sourceCode).toBe("byte myVar;");
  });

  it("#if with false condition #1", () => {
    // --- Arrange
    const source = `
    #if MY_SYMBOL
    byte myVar;
    #endif
    `;
    const ppParser = new PreprocessorParser(source);
    ppParser.preprocessorSymbols.MY_SYMBOL = false;

    // --- Act
    const chunks = ppParser.preprocessSource();

    // --- Assert
    expect(chunks.length).toBe(0);
  });

  const eifCases = [
    { s1: false, s2: false, s3: false, exp: <string[]>[] },
    { s1: false, s2: false, s3: true, exp: ["3;"] },
    { s1: false, s2: true, s3: false, exp: ["2;"] },
    { s1: false, s2: true, s3: true, exp: ["2;"] },
    { s1: true, s2: false, s3: false, exp: ["1;"] },
    { s1: true, s2: false, s3: true, exp: ["1;"] },
    { s1: true, s2: true, s3: false, exp: ["1;"] },
    { s1: true, s2: true, s3: true, exp: ["1;"] },
  ];

  eifCases.forEach((c) => {
    it(`#if-#elseif (${c.s1}, ${c.s2}, ${c.s3})`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
      #elseif S2
      2;
      #elseif S3
      3;
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });

  const eifElseCases = [
    { s1: false, s2: false, s3: false, exp: ["4;"] },
    { s1: false, s2: false, s3: true, exp: ["3;"] },
    { s1: false, s2: true, s3: false, exp: ["2;"] },
    { s1: false, s2: true, s3: true, exp: ["2;"] },
    { s1: true, s2: false, s3: false, exp: ["1;"] },
    { s1: true, s2: false, s3: true, exp: ["1;"] },
    { s1: true, s2: true, s3: false, exp: ["1;"] },
    { s1: true, s2: true, s3: true, exp: ["1;"] },
  ];

  eifElseCases.forEach((c) => {
    it(`#if-#elseif-#else (${c.s1}, ${c.s2}, ${c.s3})`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
      #elseif S2
      2;
      #elseif S3
      3;
      #else
      4;
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });

  const nestedEif1Cases = [
    { s1: false, s2: false, s3: false, exp: <string[]>[] },
    { s1: false, s2: false, s3: true, exp: ["4;"] },
    { s1: false, s2: true, s3: false, exp: <string[]>[] },
    { s1: false, s2: true, s3: true, exp: ["4;"] },
    { s1: true, s2: false, s3: false, exp: ["1;", "3;"] },
    { s1: true, s2: false, s3: true, exp: ["1;", "3;"] },
    { s1: true, s2: true, s3: false, exp: ["1;", "2;"] },
    { s1: true, s2: true, s3: true, exp: ["1;", "2;"] },
  ];

  nestedEif1Cases.forEach((c) => {
    it(`Nested #if-#elseif (${c.s1}, ${c.s2}, ${c.s3}) #1`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
        #if S2
        2;
        #else
        3;
        #endif
      #elseif S3
      4;
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });

  const nestedEif2Cases = [
    { s1: false, s2: false, s3: false, exp: ["5;"] },
    { s1: false, s2: false, s3: true, exp: ["4;"] },
    { s1: false, s2: true, s3: false, exp: ["5;"] },
    { s1: false, s2: true, s3: true, exp: ["4;"] },
    { s1: true, s2: false, s3: false, exp: ["1;", "3;"] },
    { s1: true, s2: false, s3: true, exp: ["1;", "3;"] },
    { s1: true, s2: true, s3: false, exp: ["1;", "2;"] },
    { s1: true, s2: true, s3: true, exp: ["1;", "2;"] },
  ];

  nestedEif2Cases.forEach((c) => {
    it(`Nested #if-#elseif (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
        #if S2
        2;
        #else
        3;
        #endif
      #elseif S3
      4;
      #else
      5;
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });

  const nestedEif3Cases = [
    { s1: false, s2: false, s3: false, exp: ["5;"] },
    { s1: false, s2: false, s3: true, exp: ["5;"] },
    { s1: false, s2: true, s3: false, exp: ["2;", "4;"] },
    { s1: false, s2: true, s3: true, exp: ["2;", "3;"] },
    { s1: true, s2: false, s3: false, exp: ["1;"] },
    { s1: true, s2: false, s3: true, exp: ["1;"] },
    { s1: true, s2: true, s3: false, exp: ["1;"] },
    { s1: true, s2: true, s3: true, exp: ["1;"] },
  ];

  nestedEif3Cases.forEach((c) => {
    it(`Nested #if-#elseif (${c.s1}, ${c.s2}, ${c.s3}) #3`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
      #elseif S2
      2;
        #if S3
        3;
        #else
        4;
        #endif
      #else
      5;
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });

  const nestedEif4Cases = [
    { s1: false, s2: false, s3: false, exp: ["4;"] },
    { s1: false, s2: false, s3: true, exp: ["3;"] },
    { s1: false, s2: true, s3: false, exp: ["2;"] },
    { s1: false, s2: true, s3: true, exp: ["2;"] },
    { s1: true, s2: false, s3: false, exp: ["1;"] },
    { s1: true, s2: false, s3: true, exp: ["1;"] },
    { s1: true, s2: true, s3: false, exp: ["1;"] },
    { s1: true, s2: true, s3: true, exp: ["1;"] },
  ];

  nestedEif4Cases.forEach((c) => {
    it(`Nested #if-#elseif (${c.s1}, ${c.s2}, ${c.s3}) #4`, () => {
      // --- Arrange
      const source = `
      #if S1
      1;
      #elseif S2
      2;
      #else
        #if S3
        3;
        #else
        4;
        #endif
      #endif
      `;
      const ppParser = new PreprocessorParser(source);
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;

      // --- Act
      const chunks = ppParser.preprocessSource();

      // --- Assert
      expect(chunks.length).toBe(c.exp.length);
      for (let i = 0; i < c.exp.length; i++) {
        expect(chunks[i].sourceCode).toBe(c.exp[i]);
      }
    });
  });
});
