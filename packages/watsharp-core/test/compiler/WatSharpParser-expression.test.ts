import "mocha";
import * as expect from "expect";

import { WatSharpParser } from "../../src/compiler/WatSharpParser";
import {
  BinaryExpression,
  BuiltInFunctionInvocationExpression,
  ConditionalExpression,
  FunctionInvocationExpression,
  Identifier,
  ItemAccessExpression,
  Literal,
  LiteralSource,
  MemberAccessExpression,
  SizeOfExpression,
  TypeCastExpression,
  UnaryExpression,
} from "../../src/compiler/source-tree";

describe("WatSharpParser - expressions", () => {
  const binaryCases = [
    { src: "0b0", exp: 0 },
    { src: "0b0_0", exp: 0 },
    { src: "0b1_0", exp: 2 },
    { src: "0b011100110", exp: 230 },
    { src: "0b0111_0011_0", exp: 230 },
    {
      src:
        "0b11111111_11111111_11111111_11111111_11111111_11111111_11111111_11111111",
      exp: BigInt("0xffffffffffffffff"),
    },
  ];
  binaryCases.forEach((c) => {
    it(`Binary literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("Literal");
      expect(expr.value).toBe(c.exp);
      const literal = expr as Literal;
      if (typeof c.exp === "number") {
        expect(literal.source).toBe(LiteralSource.Int);
      } else {
        expect(literal.source).toBe(LiteralSource.BigInt);
      }
    });
  });

  const decimalCases = [
    { src: "0", exp: 0 },
    { src: "1", exp: 1 },
    { src: "2", exp: 2 },
    { src: "3", exp: 3 },
    { src: "4", exp: 4 },
    { src: "5", exp: 5 },
    { src: "6", exp: 6 },
    { src: "7", exp: 7 },
    { src: "8", exp: 8 },
    { src: "9", exp: 9 },
    { src: "0123", exp: 123 },
    { src: "0_123", exp: 123 },
    { src: "123_456_678_912_345", exp: 123456678912345 },
    { src: "999999_123_456_678_912_345", exp: BigInt("999999123456678912345") },
  ];
  decimalCases.forEach((c) => {
    it(`Decimal literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("Literal");
      expect(expr.value).toBe(c.exp);
      const literal = expr as Literal;
      if (typeof c.exp === "number") {
        expect(literal.source).toBe(LiteralSource.Int);
      } else {
        expect(literal.source).toBe(LiteralSource.BigInt);
      }
    });
  });

  const hexadecimalCases = [
    { src: "0x0", exp: 0x0 },
    { src: "0x0_0", exp: 0x0 },
    { src: "0x1_0", exp: 0x10 },
    { src: "0x12ac34", exp: 0x12ac34 },
    { src: "0x12_ac34", exp: 0x12ac34 },
    {
      src: "0xffffffffffffffff",
      exp: BigInt("0xffffffffffffffff"),
    },
  ];
  hexadecimalCases.forEach((c) => {
    it(`Binary literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("Literal");
      expect(expr.value).toBe(c.exp);
      const literal = expr as Literal;
      if (typeof c.exp === "number") {
        expect(literal.source).toBe(LiteralSource.Int);
      } else {
        expect(literal.source).toBe(LiteralSource.BigInt);
      }
    });
  });

  const realCases = [
    { src: "0.0", exp: 0.0 },
    { src: "1.0", exp: 1.0 },
    { src: "2.1", exp: 2.1 },
    { src: "3.12", exp: 3.12 },
    { src: "4.123", exp: 4.123 },
    { src: "5.1234", exp: 5.1234 },
    { src: "6.12345", exp: 6.12345 },
    { src: "7.123_456", exp: 7.123456 },
    { src: "8.12", exp: 8.12 },
    { src: "9.12", exp: 9.12 },
    { src: "01.0", exp: 1.0 },
    { src: "1_.0", exp: 1.0 },
    { src: "543_210.012_345_6", exp: 543210.0123456 },

    { src: "0e0", exp: 0 },
    { src: "1e0", exp: 1 },
    { src: "2e0", exp: 2 },
    { src: "3e0", exp: 3 },
    { src: "4e0", exp: 4 },
    { src: "5e0", exp: 5 },
    { src: "6e0", exp: 6 },
    { src: "7e0", exp: 7 },
    { src: "8e0", exp: 8 },
    { src: "9e0", exp: 9 },
    { src: "123e0", exp: 123 },
    { src: "23_4e0", exp: 234 },
    { src: "123e13", exp: 123e13 },
    { src: "123e+13", exp: 123e13 },
    { src: "123e-13", exp: 123e-13 },
    { src: "123.456e13", exp: 123.456e13 },
    { src: "123.45_6e+13", exp: 123.456e13 },
    { src: "123.4_56e-13", exp: 123.456e-13 },

    { src: ".0", exp: 0.0 },
    { src: ".12_34", exp: 0.1234 },
    { src: ".456e13", exp: 0.456e13 },
    { src: ".45_6e+13", exp: 0.456e13 },
    { src: ".4_56e-13", exp: 0.456e-13 },
  ];
  realCases.forEach((c) => {
    it(`Real literal: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("Literal");
      expect(expr.value).toBe(c.exp);
      const literal = expr as Literal;
      expect(literal.source).toBe(LiteralSource.Real);
    });
  });

  const unarySamples = [
    { source: "+0", op: "+", value: 0 },
    { source: "+12345", op: "+", value: 12345 },
    { source: "+99999", op: "+", value: 99999 },
    { source: "+0.0", op: "+", value: 0 },
    { source: "+3.14", op: "+", value: 3.14 },
    { source: "+0.25", op: "+", value: 0.25 },
    { source: "+3.14E2", op: "+", value: 3.14e2 },
    { source: "+3.14E+2", op: "+", value: 3.14e2 },
    { source: "+3.14e-2", op: "+", value: 3.14e-2 },
    { source: "+1e8", op: "+", value: 1e8 },
    { source: "+2e+8", op: "+", value: 2e8 },
    { source: "+3e-8", op: "+", value: 3e-8 },
    { source: "+3e-188888", op: "+", value: 0 },
    { source: "-0", op: "-", value: 0 },
    { source: "-12345", op: "-", value: 12345 },
    { source: "-99999", op: "-", value: 99999 },
    { source: "-0.0", op: "-", value: 0 },
    { source: "-3.14", op: "-", value: 3.14 },
    { source: "-0.25", op: "-", value: 0.25 },
    { source: "-3.14E2", op: "-", value: 3.14e2 },
    { source: "-3.14E+2", op: "-", value: 3.14e2 },
    { source: "-3.14e-2", op: "-", value: 3.14e-2 },
    { source: "-1e8", op: "-", value: 1e8 },
    { source: "-2e+8", op: "-", value: 2e8 },
    { source: "-3e-8", op: "-", value: 3e-8 },
    { source: "-3e-188888", op: "-", value: 0 },
    { source: "~0", op: "~", value: 0 },
    { source: "~0xaa55", op: "~", value: 0xaa55 },
    { source: "!0", op: "!", value: 0 },
    { source: "!0xaa55", op: "!", value: 0xaa55 },
    { source: "&0", op: "&", value: 0 },
    { source: "&0xaa55", op: "&", value: 0xaa55 },
  ];
  unarySamples.forEach((c) => {
    it(`Unary: ${c.source}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.source);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("UnaryExpression");
      const unary = expr as UnaryExpression;
      expect(unary.operator).toBe(c.op);
      expect(unary.operand.type).toBe("Literal");
      expect(unary.operand.value).toBe(c.value);
    });
  });

  const idCases = ["thisId", "otherId", "id_123"];
  idCases.forEach((c) => {
    it(`Identifier: ${c}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("Identifier");
      const id = expr as Identifier;
      expect(id.name).toBe(c);
    });
  });

  const parenthesizedCases = [
    { src: "(a)", expr: "Identifier" },
    { src: "(a+b)", expr: "BinaryExpression" },
    { src: "(+b)", expr: "UnaryExpression" },
    { src: "(a[4])", expr: "ItemAccess" },
    { src: "(a.b)", expr: "MemberAccess" },
  ];
  parenthesizedCases.forEach((c) => {
    it(`member access: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe(c.expr);
    });
  });

  const memberCases = [
    { src: "a.b", obj: "Identifier", id: "b" },
    { src: "a.b.c", obj: "MemberAccess", id: "c" },
    { src: "(a+b).c", obj: "BinaryExpression", id: "c" },
    { src: "a[4].c", obj: "ItemAccess", id: "c" },
  ];
  memberCases.forEach((c) => {
    it(`member access: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("MemberAccess");
      const ma = expr as MemberAccessExpression;
      expect(ma.object.type).toBe(c.obj);
      expect(ma.member).toBe(c.id);
    });
  });

  const indexCases = [
    { src: "a[b]", arr: "Identifier", idx: "Identifier" },
    { src: "a[3]", arr: "Identifier", idx: "Literal" },
    { src: "a.b[3]", arr: "MemberAccess", idx: "Literal" },
    { src: "a.b[c][3]", arr: "ItemAccess", idx: "Literal" },
  ];
  indexCases.forEach((c) => {
    it(`item access: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("ItemAccess");
      const ma = expr as ItemAccessExpression;
      expect(ma.array.type).toBe(c.arr);
      expect(ma.index.type).toBe(c.idx);
    });
  });

  const multCases = [
    { src: "a*b", l: "Identifier", r: "Identifier" },
    { src: "a*3", l: "Identifier", r: "Literal" },
    { src: "a.b*3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]*3", l: "ItemAccess", r: "Literal" },
    { src: "(a+b)*c", l: "BinaryExpression", r: "Identifier" },
    { src: "a*(b+c)", l: "Identifier", r: "BinaryExpression" },
  ];
  multCases.forEach((c) => {
    it(`multExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("*");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const divCases = [
    { src: "a/b", l: "Identifier", r: "Identifier" },
    { src: "a/3", l: "Identifier", r: "Literal" },
    { src: "a.b/3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]/3", l: "ItemAccess", r: "Literal" },
    { src: "(a+b)/c", l: "BinaryExpression", r: "Identifier" },
    { src: "a/(b+c)", l: "Identifier", r: "BinaryExpression" },
  ];
  divCases.forEach((c) => {
    it(`multExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("/");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const remCases = [
    { src: "a%b", l: "Identifier", r: "Identifier" },
    { src: "a%3", l: "Identifier", r: "Literal" },
    { src: "a.b%3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]%3", l: "ItemAccess", r: "Literal" },
    { src: "(a+b)%c", l: "BinaryExpression", r: "Identifier" },
    { src: "a%(b+c)", l: "Identifier", r: "BinaryExpression" },
  ];
  remCases.forEach((c) => {
    it(`multExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("%");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const addCases = [
    { src: "a+b", l: "Identifier", r: "Identifier" },
    { src: "a+3", l: "Identifier", r: "Literal" },
    { src: "a.b+3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]+3", l: "ItemAccess", r: "Literal" },
    { src: "(a>>b)+c", l: "BinaryExpression", r: "Identifier" },
    { src: "a+(b>>c)", l: "Identifier", r: "BinaryExpression" },
  ];
  addCases.forEach((c) => {
    it(`addExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("+");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const subCases = [
    { src: "a-b", l: "Identifier", r: "Identifier" },
    { src: "a-3", l: "Identifier", r: "Literal" },
    { src: "a.b-3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]-3", l: "ItemAccess", r: "Literal" },
    { src: "(a>>b)-c", l: "BinaryExpression", r: "Identifier" },
    { src: "a-(b>>c)", l: "Identifier", r: "BinaryExpression" },
  ];
  subCases.forEach((c) => {
    it(`addExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("-");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const shiftLCases = [
    { src: "a<<b", l: "Identifier", r: "Identifier" },
    { src: "a<<3", l: "Identifier", r: "Literal" },
    { src: "a.b<<3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]<<3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)<<c", l: "BinaryExpression", r: "Identifier" },
    { src: "a<<(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  shiftLCases.forEach((c) => {
    it(`shiftExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("<<");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const shiftRCases = [
    { src: "a>>b", l: "Identifier", r: "Identifier" },
    { src: "a>>3", l: "Identifier", r: "Literal" },
    { src: "a.b>>3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]>>3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)>>c", l: "BinaryExpression", r: "Identifier" },
    { src: "a>>(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  shiftRCases.forEach((c) => {
    it(`shiftExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe(">>");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const signedShiftRCases = [
    { src: "a>>>b", l: "Identifier", r: "Identifier" },
    { src: "a>>>3", l: "Identifier", r: "Literal" },
    { src: "a.b>>>3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]>>>3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)>>>c", l: "BinaryExpression", r: "Identifier" },
    { src: "a>>>(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  signedShiftRCases.forEach((c) => {
    it(`shiftExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe(">>>");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const ltCases = [
    { src: "a<b", l: "Identifier", r: "Identifier" },
    { src: "a<3", l: "Identifier", r: "Literal" },
    { src: "a.b<3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]<3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)<c", l: "BinaryExpression", r: "Identifier" },
    { src: "a<(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  ltCases.forEach((c) => {
    it(`relExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("<");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const leCases = [
    { src: "a<=b", l: "Identifier", r: "Identifier" },
    { src: "a<=3", l: "Identifier", r: "Literal" },
    { src: "a.b<=3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]<=3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)<=c", l: "BinaryExpression", r: "Identifier" },
    { src: "a<=(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  leCases.forEach((c) => {
    it(`relExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("<=");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const gtCases = [
    { src: "a>b", l: "Identifier", r: "Identifier" },
    { src: "a>3", l: "Identifier", r: "Literal" },
    { src: "a.b>3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]>3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)>c", l: "BinaryExpression", r: "Identifier" },
    { src: "a>(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  gtCases.forEach((c) => {
    it(`relExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe(">");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const geCases = [
    { src: "a>=b", l: "Identifier", r: "Identifier" },
    { src: "a>=3", l: "Identifier", r: "Literal" },
    { src: "a.b>=3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]>=3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)>=c", l: "BinaryExpression", r: "Identifier" },
    { src: "a>=(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  geCases.forEach((c) => {
    it(`relExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe(">=");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const eqCases = [
    { src: "a==b", l: "Identifier", r: "Identifier" },
    { src: "a==3", l: "Identifier", r: "Literal" },
    { src: "a.b==3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]==3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)==c", l: "BinaryExpression", r: "Identifier" },
    { src: "a==(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  eqCases.forEach((c) => {
    it(`equExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("==");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const neCases = [
    { src: "a!=b", l: "Identifier", r: "Identifier" },
    { src: "a!=3", l: "Identifier", r: "Literal" },
    { src: "a.b!=3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]!=3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)!=c", l: "BinaryExpression", r: "Identifier" },
    { src: "a!=(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  neCases.forEach((c) => {
    it(`equExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("!=");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const andCases = [
    { src: "a&b", l: "Identifier", r: "Identifier" },
    { src: "a&3", l: "Identifier", r: "Literal" },
    { src: "a.b&3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]&3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)&c", l: "BinaryExpression", r: "Identifier" },
    { src: "a&(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  andCases.forEach((c) => {
    it(`andExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("&");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const xorCases = [
    { src: "a^b", l: "Identifier", r: "Identifier" },
    { src: "a^3", l: "Identifier", r: "Literal" },
    { src: "a.b^3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]^3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)^c", l: "BinaryExpression", r: "Identifier" },
    { src: "a^(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  xorCases.forEach((c) => {
    it(`andExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("^");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const orCases = [
    { src: "a|b", l: "Identifier", r: "Identifier" },
    { src: "a|3", l: "Identifier", r: "Literal" },
    { src: "a.b|3", l: "MemberAccess", r: "Literal" },
    { src: "a.b[c]|3", l: "ItemAccess", r: "Literal" },
    { src: "(a|b)|c", l: "BinaryExpression", r: "Identifier" },
    { src: "a|(b|c)", l: "Identifier", r: "BinaryExpression" },
  ];
  orCases.forEach((c) => {
    it(`orExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BinaryExpression");
      const binExpr = expr as BinaryExpression;
      expect(binExpr.operator).toBe("|");
      expect(binExpr.left.type).toBe(c.l);
      expect(binExpr.right.type).toBe(c.r);
    });
  });

  const condCases = [
    { src: "3 ? a : b", c: "Literal", l: "Identifier", r: "Identifier" },
    { src: "b ? a : 3", c: "Identifier", l: "Identifier", r: "Literal" },
    {
      src: "c < d ? a.b : 3",
      c: "BinaryExpression",
      l: "MemberAccess",
      r: "Literal",
    },
    {
      src: "c < d ? a.b[c] : 3",
      c: "BinaryExpression",
      l: "ItemAccess",
      r: "Literal",
    },
    {
      src: "+4 ? a|b : c",
      c: "UnaryExpression",
      l: "BinaryExpression",
      r: "Identifier",
    },
    {
      src: "b[3] ? a : (b|c)",
      c: "ItemAccess",
      l: "Identifier",
      r: "BinaryExpression",
    },
  ];
  condCases.forEach((c) => {
    it(`condExpr: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("ConditionalExpression");
      const binExpr = expr as ConditionalExpression;
      expect(binExpr.condition.type).toBe(c.c);
      expect(binExpr.consequent.type).toBe(c.l);
      expect(binExpr.alternate.type).toBe(c.r);
    });
  });

  const sizeofCases = [
    { src: "sizeof(u32)", spec: "Intrinsic" },
    { src: "sizeof(myStruct)", spec: "NamedType" },
    { src: "sizeof(*i64)", spec: "Pointer" },
    { src: "sizeof(*i64[2])", spec: "Array" },
    { src: "sizeof(struct{u8 l})", spec: "Struct" },
  ];
  sizeofCases.forEach((c) => {
    it(`sizeof: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("SizeOfExpression");
      const sizeof = expr as SizeOfExpression;
      expect(sizeof.spec.type).toBe(c.spec);
    });
  });

  const typeCastCases = [
    { src: "i8(12)", name: "i8", arg: "Literal" },
    { src: "i8(a)", name: "i8", arg: "Identifier" },
    { src: "sbyte(12)", name: "i8", arg: "Literal" },
    { src: "sbyte(a)", name: "i8", arg: "Identifier" },
    { src: "u8(12)", name: "u8", arg: "Literal" },
    { src: "u8(a)", name: "u8", arg: "Identifier" },
    { src: "byte(12)", name: "u8", arg: "Literal" },
    { src: "byte(a)", name: "u8", arg: "Identifier" },
    { src: "i16(12)", name: "i16", arg: "Literal" },
    { src: "i16(a)", name: "i16", arg: "Identifier" },
    { src: "short(12)", name: "i16", arg: "Literal" },
    { src: "short(a)", name: "i16", arg: "Identifier" },
    { src: "u16(12)", name: "u16", arg: "Literal" },
    { src: "u16(a)", name: "u16", arg: "Identifier" },
    { src: "ushort(12)", name: "u16", arg: "Literal" },
    { src: "ushort(a)", name: "u16", arg: "Identifier" },
    { src: "i32(12)", name: "i32", arg: "Literal" },
    { src: "i32(a)", name: "i32", arg: "Identifier" },
    { src: "int(12)", name: "i32", arg: "Literal" },
    { src: "int(a)", name: "i32", arg: "Identifier" },
    { src: "u32(12)", name: "u32", arg: "Literal" },
    { src: "u32(a)", name: "u32", arg: "Identifier" },
    { src: "uint(12)", name: "u32", arg: "Literal" },
    { src: "uint(a)", name: "u32", arg: "Identifier" },
    { src: "i64(12)", name: "i64", arg: "Literal" },
    { src: "i64(a)", name: "i64", arg: "Identifier" },
    { src: "long(12)", name: "i64", arg: "Literal" },
    { src: "long(a)", name: "i64", arg: "Identifier" },
    { src: "u64(12)", name: "u64", arg: "Literal" },
    { src: "u64(a)", name: "u64", arg: "Identifier" },
    { src: "ulong(12)", name: "u64", arg: "Literal" },
    { src: "ulong(a)", name: "u64", arg: "Identifier" },
    { src: "f32(12)", name: "f32", arg: "Literal" },
    { src: "f32(a)", name: "f32", arg: "Identifier" },
    { src: "float(12)", name: "f32", arg: "Literal" },
    { src: "float(a)", name: "f32", arg: "Identifier" },
    { src: "f64(12)", name: "f64", arg: "Literal" },
    { src: "f64(a)", name: "f64", arg: "Identifier" },
    { src: "double(12)", name: "f64", arg: "Literal" },
    { src: "double(a)", name: "f64", arg: "Identifier" },
  ];
  typeCastCases.forEach((c) => {
    it(`type cast: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("TypeCast");
      const cast = expr as TypeCastExpression;
      expect(cast.name).toBe(c.name);
      expect(cast.operand.type).toBe(c.arg);
    });
  });

  it("Function invocation #1", () => {
    // --- Arrange
    const source = "myFunc()";
    const wParser = new WatSharpParser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr.type).toBe("FunctionInvocation");
    const func = expr as FunctionInvocationExpression;
    expect(func.name).toBe("myFunc");
    expect(func.dispatcher).toBeUndefined();
    expect(func.arguments.length).toBe(0);
  });

  it("Function invocation #2", () => {
    // --- Arrange
    const source = "myFunc(123)";
    const wParser = new WatSharpParser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr.type).toBe("FunctionInvocation");
    const func = expr as FunctionInvocationExpression;
    expect(func.name).toBe("myFunc");
    expect(func.dispatcher).toBeUndefined();
    expect(func.arguments.length).toBe(1);
    let arg = func.arguments[0];
    expect(arg.type).toBe("Literal");
  });

  it("Function invocation #3", () => {
    // --- Arrange
    const source = "myFunc(123, b)";
    const wParser = new WatSharpParser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr.type).toBe("FunctionInvocation");
    const func = expr as FunctionInvocationExpression;
    expect(func.name).toBe("myFunc");
    expect(func.dispatcher).toBeUndefined();
    expect(func.arguments.length).toBe(2);
    expect(func.arguments[0].type).toBe("Literal");
    expect(func.arguments[1].type).toBe("Identifier");
  });

  it("Function invocation #4", () => {
    // --- Arrange
    const source = "myFunc()[123]";
    const wParser = new WatSharpParser(source);

    // --- Act
    const expr = wParser.parseExpr();

    // --- Assert
    expect(expr.type).toBe("FunctionInvocation");
    const func = expr as FunctionInvocationExpression;
    expect(func.name).toBe("myFunc");
    expect(func.dispatcher).toBeDefined();
    expect(func.dispatcher.type).toBe("Literal");
    expect(func.arguments.length).toBe(0);
  });


  const builtInFunc1Cases = [
    { src: "abs(12)", name: "abs" },
    { src: "clz(12)", name: "clz" },
    { src: "ctz(12)", name: "ctz" },
    { src: "popcnt(12)", name: "popcnt" },
    { src: "ceil(12)", name: "ceil" },
    { src: "floor(12)", name: "floor" },
    { src: "trunc(12)", name: "trunc" },
    { src: "nearest(12)", name: "nearest" },
    { src: "sqrt(12)", name: "sqrt" },
    { src: "min(12)", name: "min" },
    { src: "max(12)", name: "max" },
  ];
  builtInFunc1Cases.forEach((c) => {
    it(`built-in function: ${c.src}`, () => {
      // --- Arrange
      const wParser = new WatSharpParser(c.src);

      // --- Act
      const expr = wParser.parseExpr();

      // --- Assert
      expect(expr.type).toBe("BuiltInFunctionInvocation");
      const cast = expr as BuiltInFunctionInvocationExpression;
      expect(cast.name).toBe(c.name);
      expect(cast.arguments.length).toBe(1);
      expect(cast.arguments[0].type).toBe("Literal");
    });
  });
});
