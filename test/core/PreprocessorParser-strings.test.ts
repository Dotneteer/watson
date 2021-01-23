import "mocha";
import * as expect from "expect";

import { PreprocessorParser } from "../../src/core/PreprocessorParser";
import { fail } from "assert";

describe("PreprocessorParser - string literals", () => {
  it("Empty source", () => {
    // --- Arrange
    const source = "";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseStringLiteral();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P015");
    }
  });

  it("Empty string", () => {
    // --- Arrange
    const source = '""';
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const lit = ppParser.parseStringLiteral();

    // --- Assert
    expect(lit).toBe(source);
  });

  const stringCases: string[] = [
    '""',
    '"abc"',
    '"abc,def,1234:#"',
    '"\\bdef"',
    '"\\fdef"',
    '"\\ndef"',
    '"\\rdef"',
    '"\\tdef"',
    '"\\vdef"',
    '"\\0def"',
    '"\\\'def"',
    '"\\\"def"',
    '"\\\\def"',
    '"\\qdef"',
    '"\\x40def"',
    '"abd\\bdef"',
    '"abd\\fdef"',
    '"abd\\ndef"',
    '"abd\\rdef"',
    '"abd\\tdef"',
    '"abd\\vdef"',
    '"abd\\0def"',
    '"abd\\\'def"',
    '"abd\\\"def"',
    '"abd\\\\def"',
    '"abd\\qdef"',
    '"abd\\x40def"',
    '"abd\\b"',
    '"abd\\f"',
    '"abd\\n"',
    '"abd\\r"',
    '"abd\\t"',
    '"abd\\v"',
    '"abd\\0"',
    '"abd\\\'"',
    '"abd\\\""',
    '"abd\\\\"',
    '"abd\\q"',
    '"abd\\x40"',
  ];
  stringCases.forEach((c, idx) => {
    it(`String #${idx + 1}: ${c}`, () => {
      // --- Arrange
      const ppParser = new PreprocessorParser(c);

      // --- Act
      const lit = ppParser.parseStringLiteral();

      // --- Assert
      expect(lit).toBe(c);
    });
  });
});
