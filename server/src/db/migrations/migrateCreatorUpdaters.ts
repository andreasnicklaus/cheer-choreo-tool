import logger from "@/plugins/winston";
import ChoreoService from "@/services/ChoreoService";
import TeamService from "@/services/TeamService";
import SeasonService from "@/services/SeasonService";
import SeasonTeamService from "@/services/SeasonTeamService";
import MemberService from "@/services/MemberService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";
import HitService from "@/services/HitService";
import FeedbackService from "@/services/FeedbackService";
import ClubService from "@/services/ClubService";

const services = [
  ClubService,
  TeamService,
  SeasonService,
  SeasonTeamService,
  MemberService,
  ChoreoService,
  LineupService,
  PositionService,
  HitService,
  FeedbackService,
];

async function migrateCreatorUpdaters() {
  logger.info(
    `Starting creator/updater migration (${services.length} services) ...`,
  );

  await Promise.all(
    services.map((service) => {
      const serviceName = service.constructor.name;
      logger.debug(`Migrating ${serviceName}...`);

      return service
        .migrateCreatorUpdater()
        .then(() => {
          logger.debug(`Migrated records for ${serviceName}`);
        })
        .catch((error) => {
          logger.warn(`Error migrating ${serviceName}: ${error}`);
        });
    }),
  );
  logger.info("Creator/updater migration complete!");
}

export default migrateCreatorUpdaters;
