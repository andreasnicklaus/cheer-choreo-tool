import logger from "@/plugins/winston";
import db from "./db";
import { QueryTypes } from "sequelize";

const MODELS = [
  "clubs",
  "teams",
  "seasons",
  "season_teams",
  "members",
  "choreos",
  "lineups",
  "positions",
  "hits",
  "feedbacks",
];

async function migrateCreatorUpdaters() {
  logger.info("Starting creator/updater migration...");

  for (const tableName of MODELS) {
    await db.query(
      `UPDATE ${tableName}
      SET creator_id = "UserId", updater_id = "UserId"
      WHERE creator_id IS NULL AND "UserId" IS NOT NULL`,
      { type: QueryTypes.UPDATE },
    );

    logger.info(`Migrated ${tableName}`);
  }

  logger.info("Creator/updater migration complete");
}

export default migrateCreatorUpdaters;