import { add, constVal } from "../wa-ast/FunctionBuilder";
import { ConstVal, WaInstruction, WaNode } from "../wa-ast/wa-nodes";

/**
 * Optimizes the specified set of instructions
 * @param instrs
 */
export function optimizeWat(instrs: WaInstruction[]): void {
  removeDeadCode(instrs);
  optimizeConstantOperations(instrs);
}

/**
 * Removes constant operations and replaces them with their equivalent
 * constant value
 */
function optimizeConstantOperations(instrs: WaInstruction[]): void {
  let changed: boolean;
  do {
    changed = false;
    for (let i = 0; i < instrs.length; i++) {
      if (isConstant(instrs, i)) {
        // --- We found a constant
        if (isUnary(instrs, i + 1)) {
          // --- We can reduce an unary operation
          changed = reduceUnary(instrs, i);
        } else if (isConstant(instrs, i + 1) && isBinary(instrs, i + 2)) {
          // --- We can reduce a binary operation
          changed = reduceBinary(instrs, i);
        } else if (
          isBinary(instrs, i + 1) &&
          isConstant(instrs, i + 2) &&
          isBinary(instrs, i + 3)
        ) {
          changed = reduceCascadedBinary(instrs, i);
        }
      }
      if (changed) {
        break;
      }
    }
  } while (changed);
}

function removeDeadCode(instrs: WaInstruction[]): void {
  let retIndex = -1;
  for (let i = instrs.length - 1; i >= 0; i--) {
    if (instrs[i].type === "Return") {
      retIndex = i;
      break;
    }
  }
  if (retIndex >= 0) {
    instrs.splice(retIndex, instrs.length - retIndex);
  }
}

/**
 * Tests if the specified instruction is a constant
 * @param index Instruction index in the function body
 */
function isConstant(instrs: WaInstruction[], index: number): boolean {
  return (
    index >= 0 &&
    index < instrs.length &&
    instructionTraits[instrs[index].type] === InstructionType.Const
  );
}

/**
 * Tests if the specified instruction is a unary operation
 * @param index Instruction index in the function body
 */
function isUnary(instrs: WaInstruction[], index: number): boolean {
  return (
    index >= 0 &&
    index < instrs.length &&
    instructionTraits[instrs[index].type] === InstructionType.Unary
  );
}

/**
 * Tests if the specified instruction is a binary operation
 * @param index Instruction index in the function body
 */
function isBinary(instrs: WaInstruction[], index: number): boolean {
  return (
    index >= 0 &&
    index < instrs.length &&
    instructionTraits[instrs[index].type] === InstructionType.Binary
  );
}

/**
 * Reduces the unary operation at the specified index
 * @param instrs Instructions
 * @param index Constant value index (followed by the unary op)
 * @returns true, if the operation has been reduced
 */
function reduceUnary(instrs: WaInstruction[], index: number): boolean {
  return false;
}

/**
 * Reduces the binary operation at the specified index
 * @param instrs Instructions
 * @param index Constant value index (followed by the second operand and the binary op)
 * @returns true, if the operation has been reduced
 */
function reduceBinary(instrs: WaInstruction[], index: number): boolean {
  const leftOp = instrs[index] as ConstVal;
  const left = leftOp.value;
  const waType = leftOp.valueType;
  const right = (instrs[index + 1] as ConstVal).value;
  const op = instrs[index + 2];
  let value: number | bigint | null = null;
  switch (op.type) {
    case "Mul":
      value =
        typeof left === "number" && typeof right === "number"
          ? left * right
          : BigInt(left) * BigInt(right);
      break;

    case "Add":
      value =
        typeof left === "number" && typeof right === "number"
          ? left + right
          : BigInt(left) + BigInt(right);
      break;

    case "And":
      value =
        typeof left === "number" && typeof right === "number"
          ? left & right
          : BigInt(left) & BigInt(right);
      break;

    case "Shl":
      value =
        typeof left === "number" && typeof right === "number"
          ? left << right
          : BigInt(left) << BigInt(right);
      break;

    case "Shr":
      if (op.signed) {
        value =
          typeof left === "number" && typeof right === "number"
            ? left >> right
            : BigInt(left) >> BigInt(right);
      } else {
        value =
          typeof left === "number" && typeof right === "number"
            ? left >>> right
            : Number(left) >>> Number(right);
      }
      break;
  }
  if (value !== null) {
    instrs[index] = constVal(waType, value);
    instrs.splice(index + 1, 2);
    return true;
  }
  return false;
}

/**
 * Reduces the binary operation at the specified index
 * @param instrs Instructions
 * @param index Constant value index (const, binary, const, binary)
 * @returns true, if the operation has been reduced
 */
function reduceCascadedBinary(instrs: WaInstruction[], index: number): boolean {
  const leftOp = instrs[index] as ConstVal;
  const left = leftOp.value;
  const waType = leftOp.valueType;
  const right = (instrs[index + 2] as ConstVal).value;
  const opsType = instrs[index + 1].type + instrs[index + 3].type;
  let value: number | bigint | null = null;
  switch (opsType) {
    case "AddAdd":
      value =
        typeof left === "number" && typeof right === "number"
          ? left + right
          : BigInt(left) + BigInt(right);
      break;
  }
  if (value !== null) {
    instrs[index] = constVal(waType, value);
    instrs[index + 1] = add(waType);
    instrs.splice(index + 2, 2);
    return true;
  }
  return false;
}

/**
 * Type of a particular instruction
 */
enum InstructionType {
  None,
  Const,
  Unary,
  Binary,
}

/**
 * Traits of instrcutions
 */
type InstructionTraits = Record<WaInstruction["type"], InstructionType>;

const instructionTraits: InstructionTraits = {
  Abs: InstructionType.Unary,
  Add: InstructionType.Binary,
  And: InstructionType.Binary,
  Block: InstructionType.None,
  Branch: InstructionType.None,
  BranchIf: InstructionType.None,
  BranchTable: InstructionType.None,
  Call: InstructionType.None,
  CallIndirect: InstructionType.None,
  Ceil: InstructionType.None,
  Clz: InstructionType.None,
  Comment: InstructionType.None,
  ConstVal: InstructionType.Const,
  Convert32: InstructionType.None,
  Convert64: InstructionType.None,
  CopySign: InstructionType.None,
  Ctz: InstructionType.None,
  Demote64: InstructionType.None,
  Div: InstructionType.Binary,
  Drop: InstructionType.None,
  Eq: InstructionType.Binary,
  Eqz: InstructionType.Unary,
  Extend32: InstructionType.None,
  Floor: InstructionType.None,
  Ge: InstructionType.Binary,
  GlobalGet: InstructionType.None,
  GlobalSet: InstructionType.None,
  Gt: InstructionType.Binary,
  If: InstructionType.None,
  Le: InstructionType.Binary,
  Load: InstructionType.None,
  LocalGet: InstructionType.None,
  LocalSet: InstructionType.None,
  LocalTee: InstructionType.None,
  Loop: InstructionType.None,
  Lt: InstructionType.Binary,
  Max: InstructionType.Binary,
  Min: InstructionType.Binary,
  MemoryGrow: InstructionType.None,
  MemorySize: InstructionType.None,
  Mul: InstructionType.Binary,
  Ne: InstructionType.Binary,
  Nearest: InstructionType.None,
  Neg: InstructionType.None,
  Nop: InstructionType.None,
  Or: InstructionType.Binary,
  PopCnt: InstructionType.None,
  Promote32: InstructionType.None,
  ReinterpretF32: InstructionType.None,
  ReinterpretF64: InstructionType.None,
  ReinterpretI32: InstructionType.None,
  ReinterpretI64: InstructionType.None,
  Rem: InstructionType.Binary,
  Return: InstructionType.None,
  Rotl: InstructionType.None,
  Rotr: InstructionType.None,
  Select: InstructionType.None,
  SeparatorLine: InstructionType.None,
  Shl: InstructionType.Binary,
  Shr: InstructionType.Binary,
  Sqrt: InstructionType.None,
  Store: InstructionType.None,
  Sub: InstructionType.None,
  Trunc: InstructionType.None,
  Trunc32: InstructionType.None,
  Trunc64: InstructionType.None,
  Unreachable: InstructionType.None,
  Wrap64: InstructionType.None,
  Xor: InstructionType.Binary,
};
