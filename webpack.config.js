const path = require("path");
const libraryName = "whatsharp-core";
const srcFolder = "./src";
const entrySrcName = "index.ts";
const buildOutputFolder = "./dist";
const bundleName = "index.js";

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
  ],
};