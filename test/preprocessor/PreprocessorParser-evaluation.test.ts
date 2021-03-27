import "mocha";
import * as expect from "expect";

import { PreprocessorParser } from "../../src/preprocessor/PreprocessorParser";
import {
  PPBinaryExpression,
  PPIdentifier,
} from "../../src/preprocessor/preprocessor-expression";

describe("PreprocessorParser - evaluate expressions", () => {
  it("Symbol #1", () => {
    // --- Arrange
    const source = "MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessorSymbols.MY_SYMBOL = true;
    const val = ppParser.evalExpression();

    // --- Assert
    expect(val).toBe(true);
  });

  it("Symbol #2", () => {
    // --- Arrange
    const source = "MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    ppParser.preprocessorSymbols.MY_SYMBOL = false;
    const val = ppParser.evalExpression();

    // --- Assert
    expect(val).toBe(false);
  });

  it("Symbol #3", () => {
    // --- Arrange
    const source = "MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const val = ppParser.evalExpression();

    // --- Assert
    expect(val).toBe(false);
  });

  const or2Cases = [
    { s1: false, s2: false, exp: false },
    { s1: false, s2: true, exp: true },
    { s1: true, s2: false, exp: true },
    { s1: true, s2: true, exp: true },
  ];

  or2Cases.forEach((c) => {
    it(`OR expression (${c.s1}, ${c.s2}) #1`, () => {
      // --- Arrange
      const source = "S1 | S2";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const or3Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: true },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  or3Cases.forEach((c) => {
    it(`OR expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 | S2 | S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  or3Cases.forEach((c) => {
    it(`OR expression (${c.s1}, ${c.s2}, ${c.s3}) #3`, () => {
      // --- Arrange
      const source = "(S1 | S2) | S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  or3Cases.forEach((c) => {
    it(`OR expression (${c.s1}, ${c.s2}, ${c.s3}) #4`, () => {
      // --- Arrange
      const source = "S1 | (S2 | S3)";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xor2Cases = [
    { s1: false, s2: false, exp: false },
    { s1: false, s2: true, exp: true },
    { s1: true, s2: false, exp: true },
    { s1: true, s2: true, exp: false },
  ];

  xor2Cases.forEach((c) => {
    it(`XOR expression (${c.s1}, ${c.s2}) #1`, () => {
      // --- Arrange
      const source = "S1 ^ S2";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xor3Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: true },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: false },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: false },
    { s1: true, s2: false, s3: true, exp: false },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  xor3Cases.forEach((c) => {
    it(`XOR expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 ^ S2 ^ S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  xor3Cases.forEach((c) => {
    it(`XOR expression (${c.s1}, ${c.s2}, ${c.s3}) #3`, () => {
      // --- Arrange
      const source = "(S1 ^ S2) ^ S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  xor3Cases.forEach((c) => {
    it(`XOR expression (${c.s1}, ${c.s2}, ${c.s3}) #4`, () => {
      // --- Arrange
      const source = "S1 ^ (S2 ^ S3)";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const and2Cases = [
    { s1: false, s2: false, exp: false },
    { s1: false, s2: true, exp: false },
    { s1: true, s2: false, exp: false },
    { s1: true, s2: true, exp: true },
  ];

  and2Cases.forEach((c) => {
    it(`AND expression (${c.s1}, ${c.s2}) #1`, () => {
      // --- Arrange
      const source = "S1 & S2";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const and3Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: false },
    { s1: true, s2: false, s3: false, exp: false },
    { s1: true, s2: true, s3: false, exp: false },
    { s1: false, s2: false, s3: true, exp: false },
    { s1: false, s2: true, s3: true, exp: false },
    { s1: true, s2: false, s3: true, exp: false },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  and3Cases.forEach((c) => {
    it(`AND expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 & S2 & S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  and3Cases.forEach((c) => {
    it(`AND expression (${c.s1}, ${c.s2}, ${c.s3}) #3`, () => {
      // --- Arrange
      const source = "(S1 & S2) & S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  and3Cases.forEach((c) => {
    it(`AND expression (${c.s1}, ${c.s2}, ${c.s3}) #4`, () => {
      // --- Arrange
      const source = "S1 & (S2 & S3)";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  it("XOR expression #1", () => {
    // --- Arrange
    const source = "S1 ^ S2";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("XOR expression #2", () => {
    // --- Arrange
    const source = "S1 ^ S2 ^ S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("^");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("XOR expression #3", () => {
    // --- Arrange
    const source = "(S1 ^ S2) ^ S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("^");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("XOR expression #4", () => {
    // --- Arrange
    const source = "S1 ^ (S2 ^ S3)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.rightOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("^");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier;
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  const orXor1Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: true },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: false },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  orXor1Cases.forEach((c) => {
    it(`OR/XOR expression (${c.s1}, ${c.s2}, ${c.s3}) #1`, () => {
      // --- Arrange
      const source = "S1 ^ S2 | S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const orXor2Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: true },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: false },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  orXor2Cases.forEach((c) => {
    it(`OR/XOR expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 | S2 ^ S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const orAnd1Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: false },
    { s1: true, s2: false, s3: false, exp: false },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  orAnd1Cases.forEach((c) => {
    it(`OR/AND expression (${c.s1}, ${c.s2}, ${c.s3}) #1`, () => {
      // --- Arrange
      const source = "S1 & S2 | S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const orAnd2Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: false },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: false },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: true },
  ];

  orAnd2Cases.forEach((c) => {
    it(`OR/AND expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 | S2 & S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xorAnd1Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: false },
    { s1: true, s2: false, s3: false, exp: false },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: true },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: false },
  ];

  xorAnd1Cases.forEach((c) => {
    it(`XOR/AND expression (${c.s1}, ${c.s2}, ${c.s3}) #1`, () => {
      // --- Arrange
      const source = "S1 & S2 ^ S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xorAnd2Cases = [
    { s1: false, s2: false, s3: false, exp: false },
    { s1: false, s2: true, s3: false, exp: false },
    { s1: true, s2: false, s3: false, exp: true },
    { s1: true, s2: true, s3: false, exp: true },
    { s1: false, s2: false, s3: true, exp: false },
    { s1: false, s2: true, s3: true, exp: true },
    { s1: true, s2: false, s3: true, exp: true },
    { s1: true, s2: true, s3: true, exp: false },
  ];

  xorAnd2Cases.forEach((c) => {
    it(`XOR/AND expression (${c.s1}, ${c.s2}, ${c.s3}) #2`, () => {
      // --- Arrange
      const source = "S1 ^ S2 & S3";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      ppParser.preprocessorSymbols.S3 = c.s3;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const orNot1Cases = [
    { s1: false, s2: false, exp: true },
    { s1: false, s2: true, exp: false },
    { s1: true, s2: false, exp: true },
    { s1: true, s2: true, exp: true },
  ];

  orNot1Cases.forEach((c) => {
    it(`OR/NOT expression (${c.s1}, ${c.s2}) #1`, () => {
      // --- Arrange
      const source = "S1 | !S2";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const orNot2Cases = [
    { s1: false, s2: false, exp: true },
    { s1: false, s2: true, exp: false },
    { s1: true, s2: false, exp: false },
    { s1: true, s2: true, exp: false },
  ];

  orNot2Cases.forEach((c) => {
    it(`OR/NOT expression (${c.s1}, ${c.s2}) #2`, () => {
      // --- Arrange
      const source = "!(S1 | S2)";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xorNot1Cases = [
    { s1: false, s2: false, exp: true },
    { s1: false, s2: true, exp: false },
    { s1: true, s2: false, exp: false },
    { s1: true, s2: true, exp: true },
  ];

  xorNot1Cases.forEach((c) => {
    it(`XOR/NOT expression (${c.s1}, ${c.s2}) #1`, () => {
      // --- Arrange
      const source = "S1 ^ !S2";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });

  const xorNot2Cases = [
    { s1: false, s2: false, exp: true },
    { s1: false, s2: true, exp: false },
    { s1: true, s2: false, exp: false },
    { s1: true, s2: true, exp: true },
  ];

  xorNot2Cases.forEach((c) => {
    it(`XOR/NOT expression (${c.s1}, ${c.s2}) #2`, () => {
      // --- Arrange
      const source = "!(S1 ^ S2)";
      const ppParser = new PreprocessorParser(source);

      // --- Act
      ppParser.preprocessorSymbols.S1 = c.s1;
      ppParser.preprocessorSymbols.S2 = c.s2;
      const val = ppParser.evalExpression();

      // --- Assert
      expect(val).toBe(c.exp);
    });
  });
});
