const babel = require("@babel/core");

exports.handlers = {
  beforeParse(e) {
    if (e.filename.endsWith(".vue") || e.filename.endsWith(".ts")) {
      const result = babel.transformSync(e.source, {
        filename: e.filename,
        presets: [["@babel/preset-typescript", { allExtensions: true }]],
        configFile: false,
        babelrc: false,
      });
      e.source = result.code;
    }
  },
};
