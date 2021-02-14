import { TokenLocation } from "../core/tokens";
import { ErrorCodes } from "../core/errors";
import {
  Node,
  Expression,
  TypeSpec,
  UnaryOpSymbols,
  BinaryOpSymbols,
  BuiltInFunctionNames,
  Identifier,
} from "./source-tree";

/**
 * Resolves the specified expression to a constant value
 * @param expr Expression to resolve
 * @param constResolver Function to resolve nested constant values
 * @param sizeOfResolver Function to resolve "sizeof"
 */
export function resolveConstantExpression(
  expr: Expression,
  constResolver: (id: Identifier) => void,
  sizeOfResolver: (spec: TypeSpec) => number,
  reportError: (
    code: ErrorCodes,
    node: Node | TokenLocation,
    ...options: any[]
  ) => void
): void {
  switch (expr.type) {
    case "FunctionInvocation":
    case "ItemAccess":
    case "MemberAccess":
      // --- You cannot use this constructs in a constant expression
      reportError("W104", expr);
      return;

    case "Literal":
      // --- A literal is resolved during the parse phase
      return;

    case "BuiltInFunctionInvocation":
      let allResolved = true;
      expr.arguments.forEach((arg) => {
        resolveConstantExpression(
          arg,
          constResolver,
          sizeOfResolver,
          reportError
        );
        allResolved = allResolved && arg.value !== undefined;
      });
      if (allResolved) {
        expr.value = applyBuiltInFunction(
          expr.name,
          expr.arguments.map((arg) => arg.value)
        );
      }
      return;

    case "ConditionalExpression":
      // --- Resolve all the three operands
      resolveConstantExpression(
        expr.condition,
        constResolver,
        sizeOfResolver,
        reportError
      );
      resolveConstantExpression(
        expr.consequent,
        constResolver,
        sizeOfResolver,
        reportError
      );
      resolveConstantExpression(
        expr.alternate,
        constResolver,
        sizeOfResolver,
        reportError
      );
      if (
        expr.condition.value !== undefined &&
        expr.consequent.value !== undefined &&
        expr.alternate.value !== undefined
      ) {
        // --- Evaluate if all operands resolved successfully
        expr.value = expr.condition.value
          ? expr.consequent.value
          : expr.alternate.value;
      }
      return;

    case "Identifier":
      constResolver(expr);
      return;

    case "SizeOfExpression":
      const sizeOf = sizeOfResolver(expr.spec);
      if (sizeOf) {
        expr.value = sizeOf;
      }
      return;

    case "TypeCast":
      resolveConstantExpression(
        expr.operand,
        constResolver,
        sizeOfResolver,
        reportError
      );
      if (expr.operand.value !== undefined) {
        expr.value = applyTypeCast(expr.name, expr.operand.value);
      }
      return;

    case "UnaryExpression":
      resolveConstantExpression(
        expr.operand,
        constResolver,
        sizeOfResolver,
        reportError
      );
      if (expr.operand.value !== undefined) {
        if (expr.operator === "&" || expr.operator === "*") {
          reportError("W105", expr);
          return;
        }
        if (expr.operator === "~") {
          const arg = toBits(expr.operand.value);
          if (typeof arg === "number" && isNaN(arg)) {
            reportError("W106", expr);
            return;
          }
        }
        expr.value = applyUnaryOperation(expr.operator, expr.operand.value);
      }
      return;

    case "BinaryExpression":
      resolveConstantExpression(
        expr.left,
        constResolver,
        sizeOfResolver,
        reportError
      );
      resolveConstantExpression(
        expr.right,
        constResolver,
        sizeOfResolver,
        reportError
      );
      if (expr.left.value !== undefined && expr.right.value !== undefined) {
        expr.value = applyBinaryOperation(
          expr.operator,
          expr.left.value,
          expr.right.value
        );
      }
      return;
  }
}

/**
 * Applies a type cast on the specified value
 * @param typeName Name of the type to cast the value
 * @param value Value to cast
 */
export function applyTypeCast(
  typeName: string,
  value: number | bigint
): number | bigint {
  switch (typeName) {
    case "i8":
      return Number(
        BigInt.asIntN(
          8,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "u8":
      return Number(
        BigInt.asUintN(
          8,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "i16":
      return Number(
        BigInt.asIntN(
          16,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "u16":
      return Number(
        BigInt.asUintN(
          16,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "i32":
      return Number(
        BigInt.asIntN(
          32,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "u32":
      return Number(
        BigInt.asUintN(
          32,
          BigInt(typeof value === "number" ? Math.trunc(value) : value)
        )
      );
    case "i64":
      return BigInt.asIntN(64, BigInt(value));
    case "u64":
      return BigInt.asUintN(64, BigInt(value));
    case "f32":
      return Math.fround(Number(value));
    case "f64":
      return value;
    default:
      throw new Error("Invalid type to cast a constant value");
  }
}

/**
 * Applies an unary operation to an operand
 * @param op Unary operation type
 * @param operand Operand value
 */
function applyUnaryOperation(
  op: UnaryOpSymbols,
  operand: number | bigint
): number | bigint {
  switch (op) {
    case "!":
      return operand ? 0 : 1;
    case "-":
      return -operand;
    case "~":
      return ~toBits(operand);
  }
  return operand;
}

/**
 * Applies an unary operation to an operand
 * @param op Unary operation type
 * @param left Left operand value
 * @param right Right operand value
 */
function applyBinaryOperation(
  op: BinaryOpSymbols,
  left: number | bigint,
  right: number | bigint
): number | bigint {
  switch (op) {
    case "+":
      return typeof left === "number" && typeof right === "number"
        ? left + right
        : BigInt(left) + BigInt(right);
    case "-":
      return typeof left === "number" && typeof right === "number"
        ? left - right
        : BigInt(left) - BigInt(right);
    case "*":
      return typeof left === "number" && typeof right === "number"
        ? left * right
        : BigInt(left) * BigInt(right);
    case "/":
      return typeof left === "number" && typeof right === "number"
        ? left / right
        : BigInt(left) / BigInt(right);
    case "%":
      return typeof left === "number" && typeof right === "number"
        ? left % right
        : BigInt(left) % BigInt(right);
    case "<<":
      return typeof left === "number" && typeof right === "number"
        ? left << right
        : BigInt(left) << BigInt(right);
    case ">>":
      return typeof left === "number" && typeof right === "number"
        ? left >> right
        : BigInt(left) >> BigInt(right);
    case ">>>":
      return typeof left === "number" && typeof right === "number"
        ? left >>> right
        : Number(left) >>> Number(right);
    case "&":
      if (
        (typeof left === "number" && !Number.isInteger(left)) ||
        (typeof right === "number" && !Number.isInteger(right))
      ) {
        throw new Error("Bitwise bit operators must use integer operands");
      }
      return typeof left === "number" && typeof right === "number"
        ? left & right
        : BigInt(left) & BigInt(right);

    case "^":
      if (
        (typeof left === "number" && !Number.isInteger(left)) ||
        (typeof right === "number" && !Number.isInteger(right))
      ) {
        throw new Error("Bitwise bit operators must use integer operands");
      }
      return typeof left === "number" && typeof right === "number"
        ? left ^ right
        : BigInt(left) ^ BigInt(right);

    case "|":
      if (
        (typeof left === "number" && !Number.isInteger(left)) ||
        (typeof right === "number" && !Number.isInteger(right))
      ) {
        throw new Error("Bitwise bit operators must use integer operands");
      }
      return typeof left === "number" && typeof right === "number"
        ? left | right
        : BigInt(left) | BigInt(right);

    case "!=":
      return left !== right ? 1 : 0;
    case "<":
      return left < right ? 1 : 0;
    case "<=":
      return left <= right ? 1 : 0;
    case "==":
      return left === right ? 1 : 0;
    case ">":
      return left > right ? 1 : 0;
    case ">=":
      return left >= right ? 1 : 0;
  }
}

/**
 * Applies a built-in function
 * @param name Function name
 * @param args Function arguments
 */
function applyBuiltInFunction(
  name: BuiltInFunctionNames,
  args: (number | bigint)[]
): number | bigint {
  let arg: number | bigint;
  switch (name) {
    case "abs":
      arg = singleArg();
      return arg < 0 ? -arg : arg;

    case "ceil":
      arg = singleArg();
      return typeof arg === "number" ? Math.ceil(arg) : arg;

    case "floor":
      arg = singleArg();
      return typeof arg === "number" ? Math.floor(arg) : arg;

    case "max":
      atLeastOneArg();
      return bigIntMax(...args);

    case "min":
      atLeastOneArg();
      return bigIntMin(...args);

    case "nearest":
      arg = singleArg();
      if (typeof arg === "bigint") return arg;
      const ceil = Math.ceil(arg);
      const floor = Math.floor(arg);
      return Math.abs(ceil - arg) < Math.abs(floor - arg) ? ceil : floor;

    case "sqrt":
      arg = singleArg();
      if (arg < 0) {
        throw new Error("Argument of sqrt must be a non-zero number");
      }
      return typeof arg === "number" ? Math.sqrt(arg) : sqrtBigInt(arg);

    case "trunc":
      arg = singleArg();
      return typeof arg === "number" ? Math.trunc(arg) : arg;
  }
  throw new Error(
    `The '${name}' function cannot be used in constant expressions`
  );

  function singleArg(): number | bigint {
    if (args.length != 1) {
      throw new Error(`'${name}' must have a single argument`);
    }
    return args[0];
  }

  function atLeastOneArg(): void {
    if (args.length == 0) {
      throw new Error(`'${name}' must have at least one argument`);
    }
  }
}

/**
 * Converts the argument to 32-bit or 64-bit signed integer
 * @param arg Argument to convert
 * @returns NaN, if arg is a float; otherwise the 32-bit or 64-bit
 * signed representation of arg
 */
function toBits(arg: number | bigint): number | bigint {
  if (typeof arg === "bigint") {
    return BigInt.asIntN(64, arg);
  }
  if (!Number.isInteger(arg)) {
    return NaN;
  }
  return Number(BigInt.asIntN(32, BigInt(arg)));
}

/**
 * Calculates the square root of a BigInt
 * @param arg Argument
 */
function sqrtBigInt(arg: bigint): bigint {
  if (arg < 0) {
    throw new Error("Argument of sqrt must be a non-zero number");
  }

  if (arg < 2) {
    return arg;
  }

  function newtonIteration(n: bigint, x0: bigint): bigint {
    const x1 = (n / x0 + x0) >> 1n;
    if (x0 === x1 || x0 === x1 - 1n) {
      return x0;
    }
    return newtonIteration(n, x1);
  }

  return newtonIteration(arg, 1n);
}

/**
 * Math.max alternative that works with number and BigInt
 * @param args
 */
function bigIntMax(...args: (number | bigint)[]) {
  return args.reduce((m, e) => (e > m ? e : m));
}

/**
 * Math.min alternative that works with number and BigInt
 * @param args
 */
function bigIntMin(...args: (number | bigint)[]) {
  return args.reduce((m, e) => (e < m ? e : m));
}

/**
 * Renders the specified expression
 * @param expr Expression to render
 */
export function renderExpression(expr: Expression): string {
  switch (expr.type) {
    case "Literal":
      return expr.value.toString();
    case "Identifier":
      return expr.name;
    case "BinaryExpression":
      return `(${renderExpression(expr.left)}${expr.operator}${renderExpression(
        expr.right
      )})`;
    case "FunctionInvocation":
    case "BuiltInFunctionInvocation":
      return `${expr.name}(${expr.arguments
        .map((arg) => renderExpression(arg))
        .join(",")})`;
    case "ConditionalExpression":
      return `(${renderExpression(expr.condition)}?${renderExpression(
        expr.consequent
      )}:${renderExpression(expr.alternate)}`;
    case "ItemAccess":
      return `(${renderExpression(expr.array)}[${renderExpression(
        expr.index
      )}])`;
    case "MemberAccess":
      return `(${renderExpression(expr.object)}.${expr.member})`;
    case "SizeOfExpression":
      return "sizeof()";
    case "TypeCast":
      return `${expr.name}(${renderExpression(expr.operand)})`;
    case "UnaryExpression":
      return `${expr.operator}(${renderExpression(expr.operand)})`;
  }
}
