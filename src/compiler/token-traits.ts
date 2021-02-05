import { TokenType } from "../core/tokens";

/**
 * Contains traits of a particular token type
 */
export interface TokenTraits {
  /**
   * This token represents an intrinsic type
   */
  intrinsicType?: boolean;

  /**
   * This token can be the start of an expression
   */
  expressionStart?: boolean;

  /**
   * This token represent an unary operation
   */
  unaryOp?: boolean;

  /**
   * This token represents a built-in function
   */
  builtInFunc?: boolean;

  /**
   * This token can be the start of a type specification
   */
  typeStart?: boolean;
}

/**
 * Gets the traits of the specified token type
 * @param type Token type
 */
export function getTokenTraits(type: TokenType): TokenTraits {
  return tokenTraits.get(type) ?? {};
}

/**
 * This map contains the traits of token types
 */
const tokenTraits = new Map<TokenType, TokenTraits>();

// ----------------------------------------------------------------------------
// A

tokenTraits.set(TokenType.Abs, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Ampersand, { expressionStart: true, unaryOp: true });
tokenTraits.set(TokenType.Asterisk, {
  expressionStart: true,
  unaryOp: true,
  typeStart: true,
});

// ----------------------------------------------------------------------------
// B

tokenTraits.set(TokenType.BinaryLiteral, { expressionStart: true });
tokenTraits.set(TokenType.BinaryNot, { expressionStart: true, unaryOp: true });

// ----------------------------------------------------------------------------
// C

tokenTraits.set(TokenType.Ceil, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Clz, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.CopySign, {
  expressionStart: true,
  builtInFunc: true,
});
tokenTraits.set(TokenType.Ctz, { expressionStart: true, builtInFunc: true });

// ----------------------------------------------------------------------------
// D

tokenTraits.set(TokenType.DecimalLiteral, { expressionStart: true });

// ----------------------------------------------------------------------------
// F

tokenTraits.set(TokenType.F32, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.F64, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.Floor, { expressionStart: true, builtInFunc: true, typeStart: true });

// ----------------------------------------------------------------------------
// H

tokenTraits.set(TokenType.HexadecimalLiteral, { expressionStart: true });

// ----------------------------------------------------------------------------
// I

tokenTraits.set(TokenType.I8, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.I16, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.I32, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.I64, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.Identifier, { expressionStart: true, typeStart: true });

// ----------------------------------------------------------------------------
// L

tokenTraits.set(TokenType.LParent, { expressionStart: true, typeStart: true });

// ----------------------------------------------------------------------------
// M

tokenTraits.set(TokenType.Max, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Min, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Minus, { expressionStart: true, unaryOp: true });

// ----------------------------------------------------------------------------
// N

tokenTraits.set(TokenType.Nearest, {
  expressionStart: true,
  builtInFunc: true,
});
tokenTraits.set(TokenType.Neg, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Not, { expressionStart: true, unaryOp: true });

// ----------------------------------------------------------------------------
// P

tokenTraits.set(TokenType.Plus, { expressionStart: true, unaryOp: true });
tokenTraits.set(TokenType.PopCnt, { expressionStart: true, builtInFunc: true });

// ----------------------------------------------------------------------------
// R

tokenTraits.set(TokenType.RealLiteral, { expressionStart: true });

// ----------------------------------------------------------------------------
// S

tokenTraits.set(TokenType.Sizeof, { expressionStart: true });
tokenTraits.set(TokenType.Sqrt, { expressionStart: true, builtInFunc: true });
tokenTraits.set(TokenType.Struct, { typeStart: true });

// ----------------------------------------------------------------------------
// T

tokenTraits.set(TokenType.Trunc, { expressionStart: true, builtInFunc: true });

// ----------------------------------------------------------------------------
// U

tokenTraits.set(TokenType.U8, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.U16, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.U32, { intrinsicType: true, expressionStart: true, typeStart: true });
tokenTraits.set(TokenType.U64, { intrinsicType: true, expressionStart: true, typeStart: true });
