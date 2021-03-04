import "mocha";
import * as expect from "expect";

import { InputStream } from "../../src/core/InputStream";
import { SourceChunk } from "../../src/preprocessor/SourceChunk";

describe("InputStream", () => {
  it("Builds from string", () => {
    // --- Act
    const is = new InputStream("hello");

    // --- Assert
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
    expect(is.source).toBe("hello");
  });

  it("Builds from chunk", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };

    // --- Act
    const is = new InputStream(chunk);

    // --- Assert
    expect(is.position).toBe(16);
    expect(is.line).toBe(2);
    expect(is.column).toBe(3);
    expect(is.source).toBe("hello");
  });

  it("Peek #1", () => {
    // --- Arrange
    const is = new InputStream("hello");

    // --- Act
    const ch = is.peek();
    
    // --- Assert
    expect(ch).toBe("h");
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
  });

  it("Peek #2", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.position).toBe(16);
    expect(is.line).toBe(2);
    expect(is.column).toBe(3);
  });

  it("Peek #3", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();
    
    // --- Assert
    expect(ch).toBe("l");
    expect(is.position).toBe(2);
    expect(is.line).toBe(1);
    expect(is.column).toBe(2);
  });

  it("Peek #4", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.position).toBe(18);
    expect(is.line).toBe(2);
    expect(is.column).toBe(5);
  });

  it("Peek #5", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();
    
    // --- Assert
    expect(ch).toBe(null);
    expect(is.position).toBe(5);
    expect(is.line).toBe(1);
    expect(is.column).toBe(5);
  });

  it("Peek #6", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.position).toBe(21);
    expect(is.line).toBe(2);
    expect(is.column).toBe(8);
  });

  it("Peek with new line #1", () => {
    // --- Arrange
    const is = new InputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();
    
    // --- Assert
    expect(ch).toBe("\n");
    expect(is.position).toBe(2);
    expect(is.line).toBe(1);
    expect(is.column).toBe(2);
  });

  it("Peek with new line #2", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "he\nllo",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.position).toBe(18);
    expect(is.line).toBe(2);
    expect(is.column).toBe(5);
  });

  it("Get #1", () => {
    // --- Arrange
    const is = new InputStream("hello");

    // --- Act
    const ch = is.get();
    
    // --- Assert
    expect(ch).toBe("h");
    expect(is.position).toBe(1);
    expect(is.line).toBe(1);
    expect(is.column).toBe(1);
  });

  it("Get #2", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.position).toBe(17);
    expect(is.line).toBe(2);
    expect(is.column).toBe(4);
  });

  it("Get #3", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();
    
    // --- Assert
    expect(ch).toBe("l");
    expect(is.position).toBe(3);
    expect(is.line).toBe(1);
    expect(is.column).toBe(3);
  });

  it("Get #4", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.position).toBe(19);
    expect(is.line).toBe(2);
    expect(is.column).toBe(6);
  });

  it("Get #5", () => {
    // --- Arrange
    const is = new InputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.get();
    
    // --- Assert
    expect(ch).toBe(null);
    expect(is.position).toBe(5);
    expect(is.line).toBe(1);
    expect(is.column).toBe(5);
  });

  it("Get #6", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "hello",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.position).toBe(21);
    expect(is.line).toBe(2);
    expect(is.column).toBe(8);
  });

  it("Get with new line #1", () => {
    // --- Arrange
    const is = new InputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();
    
    // --- Assert
    expect(ch).toBe("\n");
    expect(is.position).toBe(3);
    expect(is.line).toBe(2);
    expect(is.column).toBe(0);
  });

  it("Get with new line #2", () => {
    // --- Arrange
    const chunk: SourceChunk = {
      fileIndex: 0,
      pos: 16,
      line: 2,
      col: 3,
      sourceCode: "he\nllo",
    };
    const is = new InputStream(chunk);
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.position).toBe(19);
    expect(is.line).toBe(3);
    expect(is.column).toBe(0);
  });
});
