const Fuse = require("fuse.js");

function search(list, options, search) {
  const fuse = new Fuse(list, options);
  return fuse.search(search).map((i) => i.item);
}

module.exports = search;
