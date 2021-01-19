/**
 * A chunk of the entire source code
 */
export interface SourceChunk {
  /**
   * An index, whuch identifies the source code file that contains
   * this chunk
   */
  fileIndex: number;

  /**
   * Starting source position within the file
   */
  pos: number;

  /**
   * Staring line number within the file
   */
  line: number;

  /**
   * Starting column number within the file
   */
  col: number;

  /**
   * The entire source code within the chunk
   */
  sourceCode: string;
}