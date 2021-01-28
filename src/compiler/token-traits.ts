import { TokenType } from "../core/tokens";

/**
 * Contains traits of a particular token type
 */
export interface TokenTraits {
  /**
   * This token represents an intrinsic type
   */
  intrinsicType?: boolean;
}

/**
 * This map contains the traits of token types
 */
const tokenTraits = new Map<TokenType, TokenTraits>();

// ----------------------------------------------------------------------------
// F

tokenTraits.set(TokenType.F32, { intrinsicType: true });
tokenTraits.set(TokenType.F64, { intrinsicType: true });
// ----------------------------------------------------------------------------
// I

tokenTraits.set(TokenType.I8, { intrinsicType: true });
tokenTraits.set(TokenType.I16, { intrinsicType: true });
tokenTraits.set(TokenType.I32, { intrinsicType: true });
tokenTraits.set(TokenType.I64, { intrinsicType: true });

// ----------------------------------------------------------------------------
// U

tokenTraits.set(TokenType.U8, { intrinsicType: true });
tokenTraits.set(TokenType.U16, { intrinsicType: true });
tokenTraits.set(TokenType.U32, { intrinsicType: true });
tokenTraits.set(TokenType.U64, { intrinsicType: true });
