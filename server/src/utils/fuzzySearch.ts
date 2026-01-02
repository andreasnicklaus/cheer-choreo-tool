import logger from "../plugins/winston";

const Fuse = require("fuse.js");

function search(list: object[] | undefined, options: object, search: string) {
  logger.debug(`Fuzzy searching ${list?.length ?? 0} items for ${search}`);
  const fuse = new Fuse(list, options);
  return fuse.search(search).map((i: { item: string }) => i.item);
}

export default search;
