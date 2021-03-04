// Cannot be `import` as it's not under TS root dir
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const { version: VERSION } = require("../package.json");

export function getVersion(): string {
  return VERSION;
}
