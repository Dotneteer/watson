import { WatSharpCompiler, getVersion } from "@dotneteer/watsharp-core";
/**
 * Runs the watsc command line tool
 */
export function run(): void {
  console.log(`WAT# Compiler (v${getVersion()})`);

  const inFile = process.argv[2];
  const outFile = process.argv[3];

  console.log(`Compiling ${inFile}...`);
  console.log(`WAT code written to ${outFile}`);

}
