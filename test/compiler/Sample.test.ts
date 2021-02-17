import "mocha";
import * as expect from "expect";
import * as path from "path";
import * as fs from "fs";

import { WatSharpCompiler } from "../../src/compiler/WatSharpCompiler";

describe("Z80 sample compilation", () => {
  it("Compile", () => {
    // --- Arrange
    const sampleFile = path.join(__dirname, "../_z80Sample/z80.wats");
    const sampleOutFile = path.join(__dirname, "../_z80Sample/z80_build.wat");
    const sampleSource = fs.readFileSync(sampleFile, "utf8");
    const wComp = new WatSharpCompiler(sampleSource);

    // --- Act
    const watCode = wComp.compile();

    // --- Assert
    expect(wComp.hasErrors).toBe(false);

    // --- Complete
    fs.writeFileSync(sampleOutFile, watCode);
  });
});