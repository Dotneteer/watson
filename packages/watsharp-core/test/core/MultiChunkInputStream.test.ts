import "mocha";
import * as expect from "expect";

import { MultiChunkInputStream } from "../../src/core/MultiChunkInputStream";
import { SourceChunk } from "../../src/preprocessor/SourceChunk";

describe("MultiChunkMultiChunkInputStream", () => {
  it("Builds from string", () => {
    // --- Act
    const is = new MultiChunkInputStream("hello");

    // --- Assert
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
  });

  it("Peek #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
  });

  it("Peek #2", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(2);
    expect(is.line).toBe(1);
    expect(is.column).toBe(2);
  });

  it("Peek #3", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(5);
    expect(is.line).toBe(1);
    expect(is.column).toBe(5);
  });

  it("Peek with new line #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(2);
    expect(is.line).toBe(1);
    expect(is.column).toBe(2);
  });

  it("Get #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(1);
    expect(is.line).toBe(1);
    expect(is.column).toBe(1);
  });

  it("Get #2", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(3);
    expect(is.line).toBe(1);
    expect(is.column).toBe(3);
  });

  it("Get #3", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("hello");
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(5);
    expect(is.line).toBe(1);
    expect(is.column).toBe(5);
  });

  it("Get with new line #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream("he\nllo");
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(3);
    expect(is.line).toBe(2);
    expect(is.column).toBe(0);
  });

  it("Builds from SourceChunk", () => {
    // --- Act
    const is = new MultiChunkInputStream(createSource());

    // --- Assert
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
  });

  it("Peek (SourceChunk) #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(0);
    expect(is.line).toBe(1);
    expect(is.column).toBe(0);
  });

  it("Peek (SourceChunk) #2", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.fileIndex).toBe(1);
    expect(is.position).toBe(1000);
    expect(is.line).toBe(10);
    expect(is.column).toBe(100);
  });

  it("Peek (SourceChunk) #3", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.fileIndex).toBe(1);
    expect(is.position).toBe(1003);
    expect(is.line).toBe(10);
    expect(is.column).toBe(103);
  });

  it("Peek (SourceChunk) with new line #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSourceWithNewLine());
    is.get();
    is.get();

    // --- Act
    const ch = is.peek();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(2);
    expect(is.line).toBe(1);
    expect(is.column).toBe(2);
  });

  it("Get (SourceChunk) #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("h");
    expect(is.fileIndex).toBe(0);
    expect(is.position).toBe(1);
    expect(is.line).toBe(1);
    expect(is.column).toBe(1);
  });

  it("Get (SourceChunk) #2", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("l");
    expect(is.fileIndex).toBe(1);
    expect(is.position).toBe(1001);
    expect(is.line).toBe(10);
    expect(is.column).toBe(101);
  });

  it("Get (SourceChunk) #3", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSource());
    is.get();
    is.get();
    is.get();
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe(null);
    expect(is.fileIndex).toBe(1);
    expect(is.position).toBe(1003);
    expect(is.line).toBe(10);
    expect(is.column).toBe(103);
  });

  it("Get (SourceChunk) with new line #1", () => {
    // --- Arrange
    const is = new MultiChunkInputStream(createSourceWithNewLine());
    is.get();
    is.get();

    // --- Act
    const ch = is.get();

    // --- Assert
    expect(ch).toBe("\n");
    expect(is.fileIndex).toBe(1);
    expect(is.position).toBe(1000);
    expect(is.line).toBe(10);
    expect(is.column).toBe(100);
  });
});

function createSource(): SourceChunk[] {
  return <SourceChunk[]>[
    {
      sourceCode: "he",
      fileIndex: 0,
      pos: 0,
      line: 1,
      col: 0,
    },
    {
      sourceCode: "llo",
      fileIndex: 1,
      pos: 1000,
      line: 10,
      col: 100,
    },
  ];
}

function createSourceWithNewLine(): SourceChunk[] {
  return <SourceChunk[]>[
    {
      sourceCode: "he\n",
      fileIndex: 0,
      pos: 0,
      line: 1,
      col: 0,
    },
    {
      sourceCode: "llo",
      fileIndex: 1,
      pos: 1000,
      line: 10,
      col: 100,
    },
  ];
}
