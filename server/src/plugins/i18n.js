const i18n = require("i18n");
const path = require("path");
const { JSONC } = require("jsonc.min");

i18n.configure({
  directory: path.join(__dirname, "..", "i18n"),
  retryInDefaultLocale: true,
  api: {
    __: "t",
    __n: "tn",
  },
  updateFiles: false,
  objectNotation: true,
  logDebugFn: console.debug,
  logWarnFn: console.warn,
  logErrorFn: console.error,
  mustacheConfig: {
    disable: false,
  },
  extension: ".jsonc",
  // parser: {
  //   parse: (msg) => {
  //     console.log("PARSER.parse", msg);
  //     return JSON.parse(msg);
  //   },
  //   stringify: (msg) => {
  //     console.log("PARSER.stringify", msg);
  //     return JSON.stringify(msg);
  //   },
  // },
  parser: JSONC,
});
