/**
 * JSDoc plugin to fix doclets that are incompatible with clean-jsdoc-theme v5.
 *
 * jsdoc-vuejs sets memberof = null for Vue hooks and deletes meta from some doclets,
 * but clean-jsdoc-theme v5's Zod validator requires memberof to be a string and
 * meta.lineno to be a number. This plugin normalises both fields.
 */
exports.handlers = {
  newDoclet(e) {
    if (!e.doclet) return;
    if ("memberof" in e.doclet && e.doclet.memberof === null) {
      e.doclet.memberof = "";
    }
    if (!e.doclet.meta) {
      e.doclet.meta = { lineno: 0, filename: "", path: "" };
    } else if (!Number.isFinite(e.doclet.meta.lineno)) {
      e.doclet.meta.lineno = 0;
    }
  },
};
