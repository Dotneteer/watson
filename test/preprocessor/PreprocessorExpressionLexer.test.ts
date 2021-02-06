import "mocha";
import * as expect from "expect";

import { InputStream } from "../../src/core/InputStream";
import { PreprocessorExpressionLexer } from "../../src/preprocessor/PreprocessorExpressionLexer";
import { TokenType } from "../../src/core/tokens";

describe("PreprocessorExpressionLexer", () => {
  it("Empty", () => {
    // --- Arrange
    const source = "";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Eof);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Left parenthesis #1", () => {
    // --- Arrange
    const source = "(";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.LParent);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Left parenthesis #2", () => {
    // --- Arrange
    const source = " \t \r (";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.LParent);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Right parenthesis #1", () => {
    // --- Arrange
    const source = ")";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.RParent);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Right parenthesis #2", () => {
    // --- Arrange
    const source = " \t \r )";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.RParent);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Not operator #1", () => {
    // --- Arrange
    const source = "!";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.NotOp);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Not operator #2", () => {
    // --- Arrange
    const source = " \t \r !";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.NotOp);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Xor operator #1", () => {
    // --- Arrange
    const source = "^";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.XorOp);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Xor operator #2", () => {
    // --- Arrange
    const source = " \t \r ^";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.XorOp);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Or operator #1", () => {
    // --- Arrange
    const source = "|";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.OrOp);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Or operator #2", () => {
    // --- Arrange
    const source = " \t \r |";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.OrOp);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("And operator #1", () => {
    // --- Arrange
    const source = "&";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.AndOp);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("And operator #2", () => {
    // --- Arrange
    const source = " \t \r &";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.AndOp);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("New Line #1", () => {
    // --- Arrange
    const source = "\n";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.NewLine);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(2);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("New Line #2", () => {
    // --- Arrange
    const source = " \t \r \n";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.NewLine);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(2);
    expect(next.location.endLine).toBe(2);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP Identifier #1", () => {
    // --- Arrange
    const source = "_";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP Identifier #2", () => {
    // --- Arrange
    const source = "AnID";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP Identifier #3", () => {
    // --- Arrange
    const source = "ZID8";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP Identifier #4", () => {
    // --- Arrange
    const source = "an_ID";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP Identifier #5", () => {
    // --- Arrange
    const source = "zn_ID_";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(0);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("PP identifier #6", () => {
    // --- Arrange
    const source = " \t \r _ID_";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PPIdentifier);
    expect(next.text).toBe(source.substring(5));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPosition).toBe(5);
    expect(next.location.endPosition).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(5);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Unknown #1", () => {
    // --- Arrange
    const source = "*";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });

  it("Unknown #2", () => {
    // --- Arrange
    const source = "/";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });

  it("Unknown #3", () => {
    // --- Arrange
    const source = "8";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });

  it("Unknown #4", () => {
    // --- Arrange
    const source = " \t \r *";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });

  it("Unknown #5", () => {
    // --- Arrange
    const source = " \t \r /";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });

  it("Unknown #6", () => {
    // --- Arrange
    const source = " \t \r 8";
    const ppLexer = new PreprocessorExpressionLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Unknown);
  });
});