import logger from "@/plugins/winston";
import AdminService from "@/services/AdminService";
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import NotificationService from "@/services/NotificationService";
import TeamService from "@/services/TeamService";
import UserService from "@/services/UserService";
import UserAccessService from "@/services/UserAccessService";
import { AccessRole } from "@/db/models/userAccess";
import { MatType } from "@/db/models/choreo";
import Hit from "@/db/models/hit";
import Lineup from "@/db/models/lineup";
import Member from "@/db/models/member";
import Position from "@/db/models/position";
import Season from "@/db/models/season";
import SeasonTeam from "@/db/models/seasonTeam";
import ChoreoParticipation from "@/db/models/choreoParticipation";

import seedData from "./seed.json";
const data: seedData = seedData;

type seasonSeedData = {
  year: number | null;
  name: string;
};

type userSeedData = {
  username: string;
  password: string;
  clubs: clubSeedData[];
  notifications?: notificationSeedData[];
};

type clubSeedData = {
  name: string;
  Teams: teamSeedData[];
};

type teamSeedData = {
  name: string;
  SeasonTeams: seasonTeamData[];
};

type seasonTeamData = {
  SeasonName: string;
  Members: memberSeedData[];
  Choreos: choreoSeedData[];
};

type memberSeedData = {
  name: string;
  nickname: string | null;
  abbreviation: string | null;
  color?: string;
};

type choreoSeedData = {
  name: string;
  counts: number;
  matType: string;
  Hits: hitSeedData[];
  Lineups: lineupSeedData[];
  Participants: string[];
};

type hitSeedData = {
  name: string;
  count: number;
  memberIndices: number[];
};

type lineupSeedData = {
  startCount: number;
  endCount: number;
  Positions: positionSeedData[];
};

type positionSeedData = {
  x: number;
  y: number;
  memberAbbreviation?: string;
};

type notificationSeedData = {
  title: string;
  message: string;
  read?: boolean;
};

type userAccessSeedData = {
  owner: string;
  child: string;
  role: string;
  enabled: boolean;
};

type seedData = {
  users: userSeedData[];
  seasons: seasonSeedData[];
  admins: {
    username: string;
    password: string;
  }[];
  userAccess?: userAccessSeedData[];
};

async function seed() {
  logger.info("Starting database seeding...");
  const totalStart = Date.now();

  // Statistics for logging
  const stats = {
    admins: { created: 0, existing: 0 },
    seasons: { created: 0, existing: 0 },
    users: { created: 0, existing: 0 },
    notifications: { created: 0, existing: 0 },
    clubs: { created: 0, existing: 0 },
    teams: { created: 0, existing: 0 },
    seasonTeams: { created: 0, existing: 0 },
    members: { created: 0, existing: 0 },
    choreos: { created: 0, existing: 0 },
    hits: { created: 0, existing: 0 },
    lineups: { created: 0, existing: 0 },
    positions: { created: 0, existing: 0 },
    participants: { created: 0, existing: 0 },
    userAccess: { created: 0, existing: 0 },
  };

  // Create admins
  for (const a of data.admins || []) {
    const [_admin, created] = await AdminService.findOrCreate(
      a.username,
      a.password,
    );
    if (created) stats.admins.created++;
    else stats.admins.existing++;
  }

  if (
    process.env.DEFAULT_ADMIN_USERNAME &&
    process.env.DEFAULT_ADMIN_PASSWORD
  ) {
    const [_admin, created] = await AdminService.findOrCreate(
      process.env.DEFAULT_ADMIN_USERNAME,
      process.env.DEFAULT_ADMIN_PASSWORD,
    );
    if (created) stats.admins.created++;
    else stats.admins.existing++;
  }

  // Create seasons
  const seasons: Season[] = [];
  for (const s of data.seasons) {
    const whereParams: {
      year?: number;
      name: string;
      UserId?: number;
    } = {
      name: s.name,
    };
    if (s.year !== null && s.year !== undefined) {
      whereParams.year = s.year;
    }
    const [season, created] = await Season.findOrCreate({
      where: whereParams,
    });
    if (created) stats.seasons.created++;
    else stats.seasons.existing++;
    seasons.push(season);
  }

  // Process users sequentially
  for (const u of data.users) {
    const [user, userCreated] = await UserService.findOrCreate(
      u.username,
      u.password,
    );
    if (userCreated) stats.users.created++;
    else stats.users.existing++;

    // Create notifications
    if (u.notifications && u.notifications.length > 0) {
      for (const n of u.notifications) {
        const [notification, notifCreated] =
          await NotificationService.findOrCreate(n.title, n.message, user.id);
        if (notifCreated) stats.notifications.created++;
        else stats.notifications.existing++;
        if (n.read) {
          await NotificationService.markRead(notification.id, user.id);
        }
      }
    }

    // Create clubs sequentially
    for (const c of u.clubs) {
      const [club, clubCreated] = await ClubService.findOrCreate(
        c.name,
        user.id,
        user.id,
      );
      if (clubCreated) stats.clubs.created++;
      else stats.clubs.existing++;

      // Create teams sequentially
      for (const t of c.Teams) {
        const [team, teamCreated] = await TeamService.findOrCreate(
          t.name,
          club.id,
          user.id,
          user.id,
        );
        if (teamCreated) stats.teams.created++;
        else stats.teams.existing++;

        // Create season teams sequentially
        for (const st of t.SeasonTeams) {
          const season = seasons.find((s) => s.name == st.SeasonName);
          if (!season) {
            logger.error(`Season with name ${st.SeasonName} not found`);
            throw new Error(`Season with name ${st.SeasonName} not found`);
          }

          const [seasonTeam, stCreated] = await SeasonTeam.findOrCreate({
            where: {
              SeasonId: season.id,
              TeamId: team.id,
              UserId: user.id,
            },
          });
          if (stCreated) stats.seasonTeams.created++;
          else stats.seasonTeams.existing++;

          // CREATE MEMBERS (find or create - no duplicates)
          const members: Member[] = [];
          for (const m of st.Members) {
            const [member, memCreated] = await Member.findOrCreate({
              where: {
                name: m.name,
                SeasonTeamId: seasonTeam.id,
              },
              defaults: {
                name: m.name,
                nickname: m.nickname || undefined,
                abbreviation:
                  m.abbreviation || m.name.substring(0, 3).toUpperCase(),
                SeasonTeamId: seasonTeam.id,
                UserId: user.id,
                creatorId: user.id,
                updaterId: user.id,
              },
            });
            if (memCreated) stats.members.created++;
            else stats.members.existing++;
            members.push(member);
          }

          // Create lookup map for fast abbreviation lookup
          const memberMap = new Map<string, Member>();
          members.forEach((m) => {
            if (m.abbreviation) {
              memberMap.set(m.abbreviation.toUpperCase(), m);
            }
            const generatedAbbr = m.name
              .split(" ")
              .map((s: string) => s.substring(0, 1))
              .join("")
              .toUpperCase();
            if (!memberMap.has(generatedAbbr)) {
              memberMap.set(generatedAbbr, m);
            }
          });

          // Create choreos sequentially
          for (const ch of st.Choreos) {
            const [choreo, choreoCreated] = await ChoreoService.findOrCreate(
              ch.name,
              ch.counts,
              ch.matType as MatType,
              seasonTeam.id,
              user.id,
              user.id,
            );
            if (choreoCreated) stats.choreos.created++;
            else stats.choreos.existing++;

            // CREATE HITS (find or create - no duplicates)
            const hits: Hit[] = [];
            if (ch.Hits.length > 0) {
              for (const h of ch.Hits) {
                const [hit, hitCreated] = await Hit.findOrCreate({
                  where: {
                    name: h.name,
                    count: h.count,
                    ChoreoId: choreo.id,
                  },
                  defaults: {
                    name: h.name,
                    count: h.count,
                    ChoreoId: choreo.id,
                    UserId: user.id,
                    creatorId: user.id,
                    updaterId: user.id,
                  },
                });
                if (hitCreated) stats.hits.created++;
                else stats.hits.existing++;
                hits.push(hit);
              }

              // Associate members to hits
              for (let hitIndex = 0; hitIndex < ch.Hits.length; hitIndex++) {
                const h = ch.Hits[hitIndex];
                const hit = hits[hitIndex];
                const memberIds = h.memberIndices
                  .map((i) => members[i]?.id)
                  .filter(Boolean);
                for (const memberId of memberIds) {
                  if (memberId) {
                    // Check if association already exists
                    const existingMembers = await hit.getMembers();
                    if (!existingMembers.some((m) => m.id === memberId)) {
                      await hit.addMember(memberId);
                    }
                  }
                }
              }
            }

            // Create lineups and positions
            for (const l of ch.Lineups) {
              const [lineup, lineupCreated] = await Lineup.findOrCreate({
                where: {
                  startCount: l.startCount,
                  endCount: l.endCount,
                  ChoreoId: choreo.id,
                },
                defaults: {
                  startCount: l.startCount,
                  endCount: l.endCount,
                  ChoreoId: choreo.id,
                  UserId: user.id,
                  creatorId: user.id,
                  updaterId: user.id,
                },
              });
              if (lineupCreated) stats.lineups.created++;
              else stats.lineups.existing++;

              // CREATE POSITIONS (find or create - no duplicates)
              if (l.Positions.length > 0) {
                for (const p of l.Positions) {
                  const member = memberMap.get(
                    p.memberAbbreviation?.toUpperCase() || "",
                  );
                  if (!member) {
                    logger.error(
                      `Member with abbreviation ${p.memberAbbreviation} not found`,
                    );
                    throw new Error(
                      `Member with abbreviation ${p.memberAbbreviation} not found`,
                    );
                  }
                  const [_pos, posCreated] = await Position.findOrCreate({
                    where: {
                      x: p.x,
                      y: p.y,
                      LineupId: lineup.id,
                      MemberId: member.id,
                    },
                    defaults: {
                      x: p.x,
                      y: p.y,
                      LineupId: lineup.id,
                      MemberId: member.id,
                      UserId: user.id,
                      creatorId: user.id,
                      updaterId: user.id,
                    },
                  });
                  if (posCreated) stats.positions.created++;
                  else stats.positions.existing++;
                }
              }
            }

            // Add participants
            if (ch.Participants.length > 0) {
              for (const p of ch.Participants) {
                const participant = memberMap.get(p.toUpperCase());
                if (!participant) {
                  logger.error(`Participant with abbreviation ${p} not found`);
                  throw new Error(
                    `Participant with abbreviation ${p} not found`,
                  );
                }
                // Check if participation already exists
                const existing = await ChoreoParticipation.findOne({
                  where: {
                    ChoreoId: choreo.id,
                    MemberId: participant.id,
                  },
                });
                if (!existing) {
                  await ChoreoService.addParticipant(
                    choreo.id,
                    participant.id,
                    user.id,
                  );
                  stats.participants.created++;
                } else {
                  stats.participants.existing++;
                }
              }
            }
          }
        }
      }
    }
  }

  // Create user access
  if (data.userAccess) {
    for (const ua of data.userAccess) {
      const owner = await UserAccessService.findByUsername(ua.owner);
      const child = await UserAccessService.findByUsername(ua.child);
      if (owner && child) {
        const existing = await UserAccessService.findByOwnerAndChild(
          owner.id,
          child.id,
        );
        if (!existing) {
          await UserAccessService.create(
            owner.id,
            child.id,
            ua.role as AccessRole,
            ua.enabled,
          );
          stats.userAccess.created++;
        } else {
          stats.userAccess.existing++;
        }
      }
    }
  }

  // Log statistics
  logger.info("Database seeding statistics:");
  for (const [entity, counts] of Object.entries(stats)) {
    logger.info(
      `${entity}: ${counts.created} created, ${counts.existing} existing (no duplicates)`,
    );
  }
  logger.info(
    `Database seeding complete! Total time: ${Date.now() - totalStart}ms`,
  );
}

export default seed;
