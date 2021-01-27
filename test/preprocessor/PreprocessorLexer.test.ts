import "mocha";
import * as expect from "expect";

import { InputStream } from "../../src/core/InputStream";
import { PreprocessorLexer } from "../../src/preprocessor/PreprocessorLexer";
import { TokenType } from "../../src/core/tokens";

describe("PreprocessorLexer", () => {
  it("Empty code", () => {
    // --- Arrange
    const source = "";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.Eof);
  });

  it("Code: no comment, no PP", () => {
    // --- Arrange
    const source = "this is some code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: eol comment, no PP #1", () => {
    // --- Arrange
    const source = "this is some // code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: eol comment, no PP #2", () => {
    // --- Arrange
    const source = "this is some // #define code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #1", () => {
    // --- Arrange
    const source = "this is some /* comment */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #2", () => {
    // --- Arrange
    const source = "this is some /* commen* t */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #3", () => {
    // --- Arrange
    const source = "this is some /* comment // */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #4", () => {
    // --- Arrange
    const source = "this is some /* comment #if */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #5", () => {
    // --- Arrange
    const source = "this is some /* commen* #if t */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #6", () => {
    // --- Arrange
    const source = "this is some /* comment // #if */ code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #7", () => {
    // --- Arrange
    const source = "this is some /* comment */ #if code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #8", () => {
    // --- Arrange
    const source = "this is some /* commen* t */ #if code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #9", () => {
    // --- Arrange
    const source = "this is some /* comment // */ #if code";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #10", () => {
    // --- Arrange
    const source = `
    this is some /* comment 
    #if */ code`;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #11", () => {
    // --- Arrange
    const source = `
    this is some /* com
    men* #if t */ code`;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: block comment, no PP #12", () => {
    // --- Arrange
    const source = `
    this is some /* comment 
    // #if */ code
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.SourceChunk);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(4);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: PP #1", () => {
    // --- Arrange
    const source = "#if";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: PP #2", () => {
    // --- Arrange
    const source = "  #if";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source);
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length);
  });

  it("Code: PP #3", () => {
    // --- Arrange
    const source = "#if ";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 1));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 1);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 1);
  });

  it("Code: PP #4", () => {
    // --- Arrange
    const source = "  #if ";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 1));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 1);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 1);
  });

  it("Code: PP #5", () => {
    // --- Arrange
    const source = "  #if ID";
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 3));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 3);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(1);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 3);
  });

  it("Code: PP #6", () => {
    // --- Arrange
    const source = `
    
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #7", () => {
    // --- Arrange
    const source = `
    // comment
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #8", () => {
    // --- Arrange
    const source = `
    something // comment
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #9", () => {
    // --- Arrange
    const source = `
    /* comment */
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #10", () => {
    // --- Arrange
    const source = `
    /* com
     * m
     * ent */
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(5);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #11", () => {
    // --- Arrange
    const source = `
    something /* comment */
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(3);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #12", () => {
    // --- Arrange
    const source = `
    something /* comment */
    other // comment
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(4);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

  it("Code: PP #13", () => {
    // --- Arrange
    const source = `
    something /* comment */
    other // comment
    /*
     * comment
     */ others
    #if ID
    `;
    const ppLexer = new PreprocessorLexer(new InputStream(source));

    // --- Act
    const next = ppLexer.get();

    // --- Assert
    expect(next.type).toBe(TokenType.PreprocDirective);
    expect(next.text).toBe(source.substring(0, source.length - 8));
    expect(next.location.fileIndex).toBe(0);
    expect(next.location.startPos).toBe(0);
    expect(next.location.endPos).toBe(source.length - 8);
    expect(next.location.startLine).toBe(1);
    expect(next.location.endLine).toBe(7);
    expect(next.location.startColumn).toBe(0);
    expect(next.location.endColumn).toBe(source.length - 8);
  });

});
