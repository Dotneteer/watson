import { WaInstruction } from "../wa-ast/wa-nodes";

/**
 * Visits all instruction recursively to carry out the specified action
 * @param instrs Array of instructions to visit
 * @param action Action to execute on a visited instruction
 */
export function visitInstructions(
  instrs: WaInstruction[],
  action: (ins: WaInstruction, all: WaInstruction[], index: number) => void,
  startIndex = 0
): void {
  for (let i = startIndex; i < instrs.length; i++) {
    const instr = instrs[i];
    action(instr, instrs, i);
    switch (instr.type) {
      case "If":
        visitInstructions(instr.consequtive, action);
        if (instr.alternate) {
          visitInstructions(instr.alternate, action);
        }
        break;
      case "Block":
      case "Loop":
        visitInstructions(instr.body, action);
    }
  }
}

/**
 * Visits the instruction tree recursively to execute an action until there
 * are any changes
 * @param instrs Instructions
 * @param action Action to carry out
 */
export function instructionsActionLoop(
  instrs: WaInstruction[],
  action: (insArr: WaInstruction[], index: number) => boolean
): number {
  let changeCount = 0;
  let changed: boolean;
  do {
    changed = false;
    for (let i = 0; i < instrs.length; i++) {
      changed = action(instrs, i);
      if (changed) {
        changeCount++;
        break;
      }
      const instr = instrs[i];
      switch (instr.type) {
        case "If":
          changeCount += instructionsActionLoop(instr.consequtive, action);
          if (instr.alternate) {
            changeCount += instructionsActionLoop(instr.alternate, action);
          }
          break;
        case "Block":
        case "Loop":
          changeCount += instructionsActionLoop(instr.body, action);
          break;
      }
    }
  } while (changed);
  return changeCount;
}

/**
 * Tests if there is any instruction in the tree with a specific predicate
 * @param instrs Instrcutions to test recursively
 * @param predicate Predicate to test
 */
export function findInstruction(
  instrs: WaInstruction[],
  predicate: (instr: WaInstruction) => boolean
): boolean {
  for (let i = 0; i < instrs.length; i++) {
    const instr = instrs[i];
    switch (instr.type) {
      case "If":
        let found = findInstruction(instr.consequtive, predicate);
        if (found) {
          return true;
        }
        if (instr.alternate) {
          found = findInstruction(instr.alternate, predicate);
        }
        if (found) {
          return true;
        }
        break;
      case "Block":
      case "Loop": {
        let found = findInstruction(instr.body, predicate);
        if (found) {
          return true;
        }
      }
      default:
        if (predicate(instr)) {
          return true;
        }
        break;
    }
  }
  return false;
}

/**
 * Gets the number of WebAssembly instrcutions
 * @param instrs Instructions to count recursively
 */
export function countInstructions(instrs: WaInstruction[]): number {
  let count = 0;
  for (let i = 0; i < instrs.length; i++) {
    count++;
    const instr = instrs[i];
    switch (instr.type) {
      case "If":
        count += countInstructions(instr.consequtive);
        if (instr.alternate) {
          count += countInstructions(instr.alternate);
        }
        break;
      case "Block":
      case "Loop":
        count += countInstructions(instr.body);
    }
  }
  return count;
}
