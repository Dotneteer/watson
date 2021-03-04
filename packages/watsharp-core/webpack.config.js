const path = require("path");
const {
  PublicDtsBundleWebpackPlugin,
} = require("@dotneteer/watsharp-public-dts-bundle-webpack-plugin");

const libraryName = "whatsharp-core";
const tsconfigPath = "tsconfig.build.json";
const srcFolder = "./src";
const entrySrcName = "index.ts";
const buildOutputFolder = "";
const bundleName = "index.js";
const declarationsFileName = "index.d.ts";

module.exports = {
  entry: path.resolve(srcFolder, entrySrcName),
  mode: "development",
  output: {
    filename: bundleName,
    path: path.resolve(__dirname, buildOutputFolder),
    library: libraryName,
    libraryTarget: "umd",
  },
  target: "node",
  devtool: "source-map",
  resolve: {
    extensions: [".ts", ".js", ".json"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        exclude: /node_modules/,
        options: { configFile: "../tsconfig.build.json" },
      },
    ],
  },
  plugins: [
    // --- Bundle the root declarations into one declaration file
    new PublicDtsBundleWebpackPlugin({
      sourcesFolder: srcFolder,
      entryPath: declarationsFileName,
      tsconfigPath: tsconfigPath,
      outputPath: declarationsFileName,
    }),
  ],
};
