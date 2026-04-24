import logger from "@/plugins/winston";
import db from "../db";
import { QueryTypes } from "sequelize";

const MODELS = [
  "Clubs",
  "Teams",
  "Seasons",
  "SeasonTeams",
  "Members",
  "Choreos",
  "Lineups",
  "Positions",
  "Hits",
  "Feedbacks",
];

async function migrateCreatorUpdaters() {
  logger.info("Starting creator/updater migration...");

  for (const tableName of MODELS) {
    const result = await db.query(
      `UPDATE "${tableName}"
        SET "creatorId" = "UserId", "updaterId" = "UserId"
        WHERE "creatorId" IS NULL AND "UserId" IS NOT NULL`,
      { type: QueryTypes.UPDATE },
    );
    logger.debug(`Migrated result for ${tableName}:`, result);
    logger.debug(`Migrated ${tableName}`);
  }

  logger.info("Creator/updater migration complete!");
}

export default migrateCreatorUpdaters;
