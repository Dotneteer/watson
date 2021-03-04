import * as path from "path";
import * as fs from "fs";

import {
  WatSharpCompiler,
  getVersion,
  IncludeHandlerResult,
} from "@dotneteer/watsharp-core";

/**
 * Runs the watsc command line tool
 */
export function run(): void {
  console.log(`WAT# Compiler (v${getVersion()})`);

  // --- Input and output file information
  const inFile = process.argv[2];
  let outFile = process.argv[3];

  if (!inFile) {
    console.log("Error: Input file not specified");
    process.exit(1);
  }

  const inputDir = path.dirname(path.resolve(inFile));
  let fileIndex = 0;

  let source: string | undefined;
  try {
    source = fs.readFileSync(inFile, "utf8");
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  if (!outFile) {
    outFile = inFile.split(".").slice(0, -1).join(".") + ".wat";
  }
  if (inFile === outFile) {
    console.log("Error: The input file is the same as the output file");
    process.exit(1);
  }

  // --- Do the comilation
  console.log(`Compiling ${inFile} from WAT# to WAT...`);
  const compiler = new WatSharpCompiler(source, includeHandler);
  const outputWat = compiler.compile();
  if (compiler.hasErrors) {
    for (const errInfo of compiler.errors) {
      console.log(
        `${errInfo.code}: ${errInfo.text} (${errInfo.line}:${errInfo.column})`
      );
    }
    process.exit(1);
  }

  // --- Try to write the output file
  const dir = path.dirname(outFile);
  try {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(outFile, outputWat);
    console.log(`WAT code written to ${outFile}`);
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  function includeHandler(fileName: string): IncludeHandlerResult {
    fileName = path.isAbsolute(fileName) ? fileName : path.join(inputDir, fileName);
    let source: string | undefined;
    try {
      source = fs.readFileSync(fileName, "utf8");
    } catch (err) {
      console.log(err);
      process.exit(1);
    }
    fileIndex++;
    return {
      fileIndex,
      source,
    };
  }
}
