const i18n = require("i18n");
const path = require("path");

i18n.configure({
  directory: path.join(__dirname, "..", "i18n"),
  retryInDefaultLocale: true,
  api: {
    __: "t",
    __n: "tn",
  },
  updateFiles: false,
  objectNotation: true,
  // logDebugFn: console.debug,
  // logWarnFn: console.warm,
  // logErrorFn: console.error,
});
