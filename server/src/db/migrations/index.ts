import logger from "plugins/winston";
import migrateCreatorUpdaters from "./migrateCreatorUpdaters";

async function migrate() {
  const migrations = [migrateCreatorUpdaters];
  logger.info(`Starting ${migrations.length} migrations...`);
  await Promise.allSettled(migrations.map((migration) => migration()));
  logger.info("All migrations complete!");
}

export default migrate;
