import { Compiler } from "webpack";
import * as path from "path";
import * as fs from "fs";
import { generateDtsBundle } from "dts-bundle-generator";
import * as rimraf from "rimraf";

import { removePrivates } from "./remove-privates";

export interface PublicDtsBundleWebpackPluginOptions {
  sourcesFolder: string;
  entryPath: string;
  tsconfigPath: string;
  outputPath: string;
}

/**
 * A webpack plugin for creating a .d.ts bundle which contains only the top level exported and public members of a project.
 */
export class PublicDtsBundleWebpackPlugin {
  private static readonly NAME = "PublicDtsBundleWebpackPlugin";

  private _options: PublicDtsBundleWebpackPluginOptions;

  constructor(options: PublicDtsBundleWebpackPluginOptions) {
    this._options = options;
  }

  /**
   * This method is executed after Webpack emitted the assets
   */
  apply(compiler: Compiler): void {
    compiler.hooks.done.tap(PublicDtsBundleWebpackPlugin.NAME, (_) => {
      // --- Display messages
      console.log(`${PublicDtsBundleWebpackPlugin.NAME}:`);
      console.log("Creating the type declarations bundle.");

      // --- Get the calling project's root
      const root = compiler.options.context ?? "";

      // --- Generate the dts bundle which also contains the private members
      const dtsBundle = generateDtsBundle(
        [
          {
            filePath: path.resolve(
              root,
              this._options.sourcesFolder,
              this._options.entryPath
            ),
            output: {
              noBanner: true,
            },
          },
        ],
        {
          preferredConfigPath: path.resolve(root, this._options.tsconfigPath),
        }
      )[0];

      // --- Remove the private members from the dts bundle
      const publicDtsBundle = removePrivates(dtsBundle);

      // --- Emit the public dts bundle file
      fs.writeFileSync(
        path.resolve(root, this._options.outputPath),
        publicDtsBundle,
        "utf-8"
      );

      // --- Remove the generated .d.ts files
      rimraf(
        path.resolve(root, this._options.sourcesFolder, "**/*.d.ts"),
        (err) => {
          if (err) {
            console.log(
              `Error during removing the generated .d.ts files:\n${err}`
            );
          }
        }
      );

      // --- Dislpay success
      console.log(
        `${this._options.outputPath} type declarations bundle is succesfully emitted.`
      );
    });
  }
}
