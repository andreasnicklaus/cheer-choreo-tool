const i18n = require("i18n");
const path = require("path");
const JSON5 = require("json5");

i18n.configure({
  directory: path.join(__dirname, "..", "i18n"),
  retryInDefaultLocale: true,
  api: {
    __: "t",
    __n: "tn",
  },
  updateFiles: false,
  objectNotation: true,
  mustacheConfig: {
    disable: false,
  },
  extension: ".json5",
  parser: JSON5,
});
