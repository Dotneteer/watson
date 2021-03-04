import { SourceChunk } from "../preprocessor/SourceChunk";

/**
 * This class represents an input stream that takes characters from a
 * source code string
 */
export class InputStream {
  // --- The source of the stream
  private readonly _source: string;

  // --- Current source string position
  private _pos = 0;

  // --- File index
  private readonly _fileIndex: number;

  // --- Position offset
  private readonly _posOffset: number;

  // --- Current line number
  private _line: number;

  // --- Current column number
  private _column: number;

  /**
   * Creates a stream that uses the specified source code
   * @param chunkOrSourceCode The input to use with this stream
   */
  constructor(chunkOrSource: string | SourceChunk) {
    if (typeof chunkOrSource === "string") {
      this._fileIndex = 0;
      this._posOffset = 0;
      this._line = 1;
      this._column = 0;
      this._source = chunkOrSource;
    } else {
      this._fileIndex = chunkOrSource.fileIndex;
      this._posOffset = chunkOrSource.pos;
      this._line = chunkOrSource.line;
      this._column = chunkOrSource.col;
      this._source = chunkOrSource.sourceCode;
    }
  }

  /**
   * Gets the source string of this stream
   */
  get source(): string {
    return this._source;
  }

  /**
   * Gets the specified part of the source code
   * @param start Start position
   * @param end End position
   */
  getSourceSpan(start: number, end: number): string {
    return this._source.substring(start, end);
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
    if (this._pos >= this._source.length) {
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
    return ch;
  }
}
