import "mocha";
import * as expect from "expect";

import { InputStream } from "../../src/core/InputStream";
import { WatSharpLexer } from "../../src/compiler/WatSharpLexer";
import { TokenType } from "../../src/core/tokens";

describe("WatSharpLexer - keywords", () => {
  const keywordCases = [
    { src: "i8", exp: TokenType.I8 },
    { src: "sbyte", exp: TokenType.I8 },
    { src: "u8", exp: TokenType.U8 },
    { src: "byte", exp: TokenType.U8 },
    { src: "i16", exp: TokenType.I16 },
    { src: "short", exp: TokenType.I16 },
    { src: "u16", exp: TokenType.U16 },
    { src: "ushort", exp: TokenType.U16 },
    { src: "i32", exp: TokenType.I32 },
    { src: "int", exp: TokenType.I32 },
    { src: "u32", exp: TokenType.U32 },
    { src: "uint", exp: TokenType.U32 },
    { src: "i64", exp: TokenType.I64 },
    { src: "long", exp: TokenType.I64 },
    { src: "u64", exp: TokenType.U64 },
    { src: "ulong", exp: TokenType.U64 },
    { src: "f32", exp: TokenType.F32 },
    { src: "float", exp: TokenType.F32 },
    { src: "f64", exp: TokenType.F64 },
    { src: "double", exp: TokenType.F64 },
  ];
  keywordCases.forEach((c) => {
    it(`Token ${c.src} #1`, () => {
      const source = c.src;
      const wLexer = new WatSharpLexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(source);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPos).toBe(0);
      expect(next.location.endPos).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(0);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #2`, () => {
      const source = ` \t \r ${c.src}`;
      const wLexer = new WatSharpLexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPos).toBe(5);
      expect(next.location.endPos).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(5);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #3`, () => {
      const source = ` /* c */ ${c.src}`;
      const wLexer = new WatSharpLexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPos).toBe(9);
      expect(next.location.endPos).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(9);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #4`, () => {
      const source = `${c.src} \t \r `;
      const wLexer = new WatSharpLexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPos).toBe(0);
      expect(next.location.endPos).toBe(c.src.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(0);
      expect(next.location.endColumn).toBe(c.src.length);
    });

    it(`Token ${c.src} #5`, () => {
      const source = `${c.src} // c`;
      const wLexer = new WatSharpLexer(new InputStream(source));

      // --- Act
      const next = wLexer.get();
      const trail1 = wLexer.get(true);
      const trail2 = wLexer.get(true);
      const trail3 = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPos).toBe(0);
      expect(next.location.endPos).toBe(c.src.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(0);
      expect(next.location.endColumn).toBe(c.src.length);
      expect(trail1.type).toBe(TokenType.Ws);
      expect(trail2.type).toBe(TokenType.EolComment);
      expect(trail3.type).toBe(TokenType.Eof);
    });
  });
});
