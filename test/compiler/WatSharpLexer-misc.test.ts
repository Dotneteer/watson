import "mocha";
import * as expect from "expect";

import { MultiChunkInputStream } from "../../src/core/MultiChunkInputStream";
import { WatSharpLexer } from "../../src/compiler/WatSharpLexer";
import { TokenType } from "../../src/core/tokens";

describe("WatSharpLexer - miscellaneous", () => {
  it("Empty", () => {
    // --- Arrange
    const source = "";
    const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

    // --- Act
    const next = wLexer.get();

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

  const miscCases = [
    { src: ";", exp: TokenType.Semicolon },
    { src: "/", exp: TokenType.Divide },
    { src: "/=", exp: TokenType.DivideAsgn },
    { src: "*", exp: TokenType.Asterisk },
    { src: "*=", exp: TokenType.MultiplyAsgn },
    { src: "%", exp: TokenType.Remainder },
    { src: "%=", exp: TokenType.RemainderAsgn },
    { src: "+", exp: TokenType.Plus },
    { src: "+=", exp: TokenType.AddAsgn },
    { src: "-", exp: TokenType.Minus },
    { src: "-=", exp: TokenType.SubtractAsgn },
    { src: "^", exp: TokenType.Xor },
    { src: "^=", exp: TokenType.XorAsgn },
    { src: "|", exp: TokenType.Or },
    { src: "|=", exp: TokenType.OrAsgn },
    { src: "&", exp: TokenType.Ampersand },
    { src: "&=", exp: TokenType.AndAsgn },
    { src: ":=", exp: TokenType.CopyAsgn },
    { src: ",", exp: TokenType.Comma },
    { src: "(", exp: TokenType.LParent },
    { src: ")", exp: TokenType.RParent },
    { src: ":", exp: TokenType.Colon },
    { src: "[", exp: TokenType.LSquare },
    { src: "]", exp: TokenType.RSquare },
    { src: "?", exp: TokenType.QuestionMark },
    { src: "{", exp: TokenType.LBrace },
    { src: "}", exp: TokenType.RBrace },
    { src: "=", exp: TokenType.Asgn },
    { src: "==", exp: TokenType.Equal },
    { src: "!", exp: TokenType.Not },
    { src: "!=", exp: TokenType.NotEqual },
    { src: "<", exp: TokenType.LessThan },
    { src: "<=", exp: TokenType.LessThanOrEqual },
    { src: "<<", exp: TokenType.ShiftLeft },
    { src: "<<=", exp: TokenType.ShiftLeftAsgn },
    { src: ">", exp: TokenType.GreaterThan },
    { src: ">=", exp: TokenType.GreaterThanOrEqual },
    { src: ">>", exp: TokenType.SignedShiftRight },
    { src: ">>=", exp: TokenType.SignedShiftRightAsgn },
    { src: ">>>", exp: TokenType.ShiftRight },
    { src: ">>>=", exp: TokenType.ShiftRightAsgn },
    { src: ".", exp: TokenType.Dot },
    { src: "thisId", exp: TokenType.Identifier },
  ];
  miscCases.forEach((c) => {
    it(`Token ${c.src} #1`, () => {
      const source = c.src;
      const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(source);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPosition).toBe(0);
      expect(next.location.endPosition).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(0);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #2`, () => {
      const source = ` \t \r ${c.src}`;
      const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPosition).toBe(5);
      expect(next.location.endPosition).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(5);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #3`, () => {
      const source = ` /* c */ ${c.src}`;
      const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPosition).toBe(9);
      expect(next.location.endPosition).toBe(source.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(9);
      expect(next.location.endColumn).toBe(source.length);
    });

    it(`Token ${c.src} #4`, () => {
      const source = `${c.src} \t \r `;
      const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

      // --- Act
      const next = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPosition).toBe(0);
      expect(next.location.endPosition).toBe(c.src.length);
      expect(next.location.startLine).toBe(1);
      expect(next.location.endLine).toBe(1);
      expect(next.location.startColumn).toBe(0);
      expect(next.location.endColumn).toBe(c.src.length);
    });

    it(`Token ${c.src} #5`, () => {
      const source = `${c.src} // c`;
      const wLexer = new WatSharpLexer(new MultiChunkInputStream(source));

      // --- Act
      const next = wLexer.get();
      const trail1 = wLexer.get(true);
      const trail2 = wLexer.get(true);
      const trail3 = wLexer.get();

      // --- Assert
      expect(next.type).toBe(c.exp);
      expect(next.text).toBe(c.src);
      expect(next.location.fileIndex).toBe(0);
      expect(next.location.startPosition).toBe(0);
      expect(next.location.endPosition).toBe(c.src.length);
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
