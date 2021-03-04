import { SourceChunk } from "../preprocessor/SourceChunk";

/**
 * Implements an input stream that uses multiple source code chunks
 */
export class MultiChunkInputStream {
  // --- The input chunks
  private readonly _chunks: SourceChunk[];

  // --- The current chunk to read from
  private _nextChunkIndex = 0;

  // --- The text of the current chunk
  private _source: string;

  // --- Current source string position
  private _pos = 0;

  // --- The current file index
  private _fileIndex = 0;

  // --- Position offset
  private _posOffset = 0;

  // --- Current line number
  private _line = 0;

  // --- Current column number
  private _column = 0;

  /**
   * Creates a stream that uses the specified source code chunks
   * @param chunks Chunks to use
   */
  constructor(chunks: string | SourceChunk[]) {
    if (typeof chunks === "string") {
      chunks = <SourceChunk[]>[
        {
          sourceCode: chunks,
          fileIndex: 0,
          pos: 0,
          line: 1,
          col: 0,
        },
      ];
    }
    this._chunks = chunks;
    this._nextChunkIndex = 0;
    this._source = "";
    this.moveToNext();
  }

  /**
   * Gets the file index of the stream
   */
  get fileIndex(): number {
    return this._fileIndex;
  }

  /**
   * Gets the current position in the stream. Starts from 0.
   */
  get position(): number {
    return this._pos + this._posOffset;
  }

  /**
   * Gets the current line number. Starts from 1.
   */
  get line(): number {
    return this._line;
  }

  /**
   * Gets the current column number. Starts from0.
   */
  get column(): number {
    return this._column;
  }

  /**
   * Peeks the next character in the stream
   * @returns null, if EOF; otherwise the current source code character
   */
  peek(): string | null {
    return this._pos > this._source.length - 1 ? null : this._source[this._pos];
  }

  /**
   * Gets the next character from the stream
   */
  get(): string | null {
    // --- Check for EOF
    if (this.moveToNext()) {
      return null;
    }

    // --- Get the char, and keep track of position
    const ch = this._source[this._pos++];
    if (ch === "\n") {
      this._line++;
      this._column = 0;
    } else {
      this._column++;
    }

    this.moveToNext();
    return ch;
  }

  /**
   * Moves to the next chunk
   * @returns True, if end-of-chunks; otherwise, false
   */
  private moveToNext(): boolean {
    if (this._pos >= this._source.length) {
      // --- Move to the next chunk
      if (this._nextChunkIndex >= this._chunks.length) {
        // --- No more chunks
        return true;
      }

      // --- Load the next chunk
      const chunk = this._chunks[this._nextChunkIndex++];
      this._source = chunk.sourceCode;
      this._fileIndex = chunk.fileIndex;
      this._pos = 0;
      this._posOffset = chunk.pos;
      this._line = chunk.line;
      this._column = chunk.col;
    }
    return false;
  }
}
