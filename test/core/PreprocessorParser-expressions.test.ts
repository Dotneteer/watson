import "mocha";
import * as expect from "expect";

import { PreprocessorParser } from "../../src/core/PreprocessorParser";
import { fail } from "assert";
import { PPBinaryExpression, PPIdentifier, PPNotExpression } from "../../src/core/preprocessor-expression";

describe("PreprocessorParser - expressions", () => {
  it("Empty source", () => {
    // --- Arrange
    const source = "";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P007");
    }
  });

  it("Symbol #1", () => {
    // --- Arrange
    const source = "MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "Id").toBe(true);
    const id = expr as PPIdentifier;
    expect(id.name).toBe("MY_SYMBOL");
  });

  it("Symbol #2", () => {
    // --- Arrange
    const source = "OTHER_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "Id").toBe(true);
    const id = expr as PPIdentifier;
    expect(id.name).toBe("OTHER_SYMBOL");
  });

  it("Not Symbol", () => {
    // --- Arrange
    const source = "!MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "NotExpr").toBe(true);
    const notExpr = expr as PPNotExpression;
    expect(notExpr.operand.type === "Id").toBe(true);
    const id = notExpr.operand as PPIdentifier;
    expect(id.name).toBe("MY_SYMBOL");
  });

  it("OR expression #1", () => {
    // --- Arrange
    const source = "S1 | S2";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("OR expression #2", () => {
    // --- Arrange
    const source = "S1 | S2 | S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("|");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("OR expression #3", () => {
    // --- Arrange
    const source = "(S1 | S2) | S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("|");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("OR expression #4", () => {
    // --- Arrange
    const source = "S1 | (S2 | S3)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.rightOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("|");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  it("AND expression #1", () => {
    // --- Arrange
    const source = "S1 & S2";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("&");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("AND expression #2", () => {
    // --- Arrange
    const source = "S1 & S2 & S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("&");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("AND expression #3", () => {
    // --- Arrange
    const source = "(S1 & S2) & S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("&");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("AND expression #4", () => {
    // --- Arrange
    const source = "S1 & (S2 & S3)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("&");
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.rightOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
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
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
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
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
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
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  it("OR/XOR expression #1", () => {
    // --- Arrange
    const source = "S1 ^ S2 | S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("^");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("OR/XOR expression #2", () => {
    // --- Arrange
    const source = "S1 | S2 ^ S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.rightOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("^");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  it("OR/AND expression #1", () => {
    // --- Arrange
    const source = "S1 & S2 | S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("OR/AND expression #2", () => {
    // --- Arrange
    const source = "S1 | S2 & S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.rightOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  it("XOR/AND expression #1", () => {
    // --- Arrange
    const source = "S1 & S2 ^ S3";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    expect(binExpr.leftOperand.type === "BinaryExpr").toBe(true);
    let binExpr2 = binExpr.leftOperand as PPBinaryExpression;
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    let id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S1");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S3");
  });

  it("XOR/AND expression #2", () => {
    // --- Arrange
    const source = "S1 ^ S2 & S3";
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
    expect(binExpr2.operator).toBe("&");
    expect(binExpr2.leftOperand.type === "Id").toBe(true);
    id = binExpr2.leftOperand as PPIdentifier
    expect(id.name).toBe("S2");
    expect(binExpr2.rightOperand.type === "Id").toBe(true);
    id = binExpr2.rightOperand as PPIdentifier
    expect(id.name).toBe("S3");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
  });

  it("OR/NOT expression #1", () => {
    // --- Arrange
    const source = "S1 | !S2";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "BinaryExpr").toBe(true);
    const binExpr = expr as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "NotExpr").toBe(true);
    const notExpr = binExpr.rightOperand as PPNotExpression;
    id = notExpr.operand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("OR/NOT expression #2", () => {
    // --- Arrange
    const source = "!(S1 | S2)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "NotExpr").toBe(true);
    const binExpr = (expr as PPNotExpression).operand as PPBinaryExpression;
    expect(binExpr.operator).toBe("|");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("XOR/NOT expression #1", () => {
    // --- Arrange
    const source = "S1 ^ !S2";
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
    expect(binExpr.rightOperand.type === "NotExpr").toBe(true);
    const notExpr = binExpr.rightOperand as PPNotExpression;
    id = notExpr.operand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("XOR/NOT expression #2", () => {
    // --- Arrange
    const source = "!(S1 ^ S2)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "NotExpr").toBe(true);
    const binExpr = (expr as PPNotExpression).operand as PPBinaryExpression;
    expect(binExpr.operator).toBe("^");
    expect(binExpr.leftOperand.type === "Id").toBe(true);
    let id = binExpr.leftOperand as PPIdentifier;
    expect(id.name).toBe("S1");
    expect(binExpr.rightOperand.type === "Id").toBe(true);
    id = binExpr.rightOperand as PPIdentifier;
    expect(id.name).toBe("S2");
  });

  it("Parenthesized #1", () => {
    // --- Arrange
    const source = "(MY_SYMBOL)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "Id").toBe(true);
    const id = expr as PPIdentifier;
    expect(id.name).toBe("MY_SYMBOL");
  });

  it("Parenthesized #2", () => {
    // --- Arrange
    const source = "(!MY_SYMBOL)";
    const ppParser = new PreprocessorParser(source);

    // --- Act
    const expr = ppParser.parseExpression();

    // --- Assert
    expect(expr.type === "NotExpr").toBe(true);
    const notExpr = expr as PPNotExpression;
    expect(notExpr.operand.type === "Id").toBe(true);
    const id = notExpr.operand as PPIdentifier;
    expect(id.name).toBe("MY_SYMBOL");
  });

  it("Missing ) #1", () => {
    // --- Arrange
    const source = "(MY_SYMBOL";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P008");
    }
  });

  it("Missing ) #2", () => {
    // --- Arrange
    const source = "(MY_SYMBOL OTHER";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P008");
    }
  });

  it("Missing ) #3", () => {
    // --- Arrange
    const source = "(MY_SYMBOL\n";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P008");
    }
  });

  it("Missing symbol #1", () => {
    // --- Arrange
    const source = "MY_SYMBOL |";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P004");
    }
  });

  it("Missing symbol #2", () => {
    // --- Arrange
    const source = "MY_SYMBOL | &";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P004");
    }
  });

  it("Missing symbol #3", () => {
    // --- Arrange
    const source = "MY_SYMBOL |\n";
    const ppParser = new PreprocessorParser(source);

    try {
      // --- Act
      ppParser.parseExpression();
      fail("Error expected");
    } catch (err) {
      // --- Assert
      expect(ppParser.errors[0].code).toBe("P004");
    }
  });
});
