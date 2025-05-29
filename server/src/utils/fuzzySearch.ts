import { Model } from "sequelize";

const Fuse = require("fuse.js");

function search(list: Model[] | undefined, options: object, search: string) {
  const fuse = new Fuse(list, options);
  return fuse.search(search).map((i: { item: string }) => i.item);
}

export default search;
