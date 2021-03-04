# Public Dts Bundle Webpack Plugin

## Introduction

This internal webpack plugin creates a .d.ts bundle which contains only the top level exported and public members of a project.

## Usage

Import the plugin in the package's `webpack.config.js` and add it to the `plugins` array:

```js
const { PublicDtsBundleWebpackPlugin } = require('@preemptive/public-dts-bundle-webpack-plugin');

// --Other configuration

plugins: [
  // --Other plugins
    new PublicDtsBundleWebpackPlugin({
      sourcesFolder: 'src', // Path to the TypeScript sources
      entryPath: 'index.d.ts', // Path to the top-level TypeScript file which has the public declarations exported
      tsconfigPath: 'tsconfig.json' // Path to the tsconfig.json to use when generating the declaration files
      outputPath: 'index.d.ts' // Path of the output declarations file
    })
]
```
