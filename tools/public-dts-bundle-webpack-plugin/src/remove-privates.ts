import { parse } from "@babel/parser";
import generate from "@babel/generator";
import {
  isClassBody,
  isClassDeclaration,
  TSModuleDeclaration,
  isTSModuleDeclaration,
  isTSModuleBlock,
  isExportNamedDeclaration,
  isExportDefaultDeclaration,
  ClassDeclaration,
  isClassProperty,
  isClassMethod,
  isTSDeclareMethod,
  Statement,
} from "@babel/types";

export function removePrivates(declarations: string): string {
  if (!declarations) {
    return "";
  }

  const _ast = parse(declarations, {
    sourceType: "module",
    plugins: ["typescript", "classProperties"],
  });

  _ast.program.body.forEach((node) => traverseNode(node));

  let publicDeclarations = generate(_ast).code;
  publicDeclarations = removeEmptyLines(publicDeclarations);

  return publicDeclarations;

  function traverseNode(node: Statement) {
    if (isExportNamedDeclaration(node) || isExportDefaultDeclaration(node)) {
      if (isClassDeclaration(node.declaration)) {
        removePrivateClassMembers(node.declaration);
      } else if (isTSModuleDeclaration(node.declaration)) {
        traverseModule(node.declaration);
      }
    } else if (isTSModuleDeclaration(node)) {
      traverseModule(node);
    } else if (isClassDeclaration(node)) {
      removePrivateClassMembers(node);
    }
  }

  function traverseModule(module: TSModuleDeclaration) {
    const moduleBlock = module.body;
    if (isTSModuleBlock(moduleBlock)) {
      moduleBlock.body.forEach((node) => traverseNode(node));
    }
  }

  function removePrivateClassMembers(classDclr: ClassDeclaration) {
    const classBody = classDclr.body;
    if (isClassBody(classBody)) {
      const body = classBody.body;
      for (let i = body.length - 1; i >= 0; i--) {
        const node = body[i];
        if (
          (isClassProperty(node) ||
            isClassMethod(node) ||
            isTSDeclareMethod(node)) &&
          node.accessibility === "private"
        ) {
          body.splice(i, 1);
        } else {
          // --- Remove the trailing comments of public class members because those
          // --- can be the leading comments of a private member
          // TODO: Find a more elegant way for doing this.
          node.trailingComments = null;
        }
      }
    }
  }

  function removeEmptyLines(text: string): string {
    return text
      .replace(/\r\n\r\n/g, "\r\n")
      .replace(/\r\r/g, "\r")
      .replace(/\n\n/g, "\n");
  }
}
