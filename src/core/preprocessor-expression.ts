/**
 * Represents a context in which preprocessor expressions can be evaluated
 */
export interface PPEvaluationContext {
  /**
   * Tests if the specified symbol is defined in the context
   * @param symbolId Symbol identifier
   */
  idSymbolDefined(symbolId: string): boolean;
}

/**
 * The available preprocessor expression node types
 */
export type PPExpression = PPIdentifier | PPNotExpression | PPBinaryExpression;

/**
 * Base class of all preprocessor node expressions
 */
export interface PPExpressionBase {
  type: PPExpression["type"];
}

/**
 * Preprocessor identifier
 */
export interface PPIdentifier extends PPExpressionBase {
  type: "Id";
  name: string;
}

/**
 * Logical not ("!")
 */
export interface PPNotExpression extends PPExpressionBase {
  type: "NotExpr";
  operand: PPExpression;
}

/**
 * Binary expression ("^", "|", or "&")
 */
export interface PPBinaryExpression extends PPExpressionBase {
  type: "BinaryExpr";
  operator: "^" | "|" | "&";
  leftOperand: PPExpression;
  rightOperand: PPExpression;
}
