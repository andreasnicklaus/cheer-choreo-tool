import logger from "@/plugins/winston";
import AdminService from "../services/AdminService";
import ChoreoService from "../services/ChoreoService";
import ClubService from "../services/ClubService";
import HitService from "../services/HitService";
import LineupService from "../services/LineupService";
import MemberService from "../services/MemberService";
import NotificationService from "../services/NotificationService";
import PositionService from "../services/PositionService";
import TeamService from "../services/TeamService";
import UserService from "../services/UserService";
import Choreo, { MatType } from "./models/choreo";
import Club from "./models/club";
import Lineup from "./models/lineup";
import NotificationModel from "./models/notification";
import Season from "./models/season";
import SeasonTeam from "./models/seasonTeam";
import Team from "./models/team";
import User from "./models/user";

import seedData from "./seed.json";
const data: seedData = seedData;

type seasonSeedData = {
  year: number | null;
  name: string;
  usersSpecific?: boolean;
};

type userSeedData = {
  username: string;
  password: string;
  clubs: clubSeedData[];
  notifications: notificationSeedData[];
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
  // color?: string
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

type seedData = {
  users: userSeedData[];
  seasons: seasonSeedData[];
  admins: {
    username: string;
    password: string;
  }[];
};

async function seed() {
  const adminPromises = [
    ...(data.admins?.map((a) =>
      AdminService.findOrCreate(a.username, a.password),
    ) || []),
  ];

  if (process.env.DEFAULT_ADMIN_USERNAME && process.env.DEFAULT_ADMIN_PASSWORD)
    adminPromises.push(
      AdminService.findOrCreate(
        process.env.DEFAULT_ADMIN_USERNAME,
        process.env.DEFAULT_ADMIN_PASSWORD,
      ),
    );

  await Promise.all([
    Promise.all(
      data.users.map((u) =>
        UserService.findOrCreate(u.username, u.password).then((user: User) =>
          Promise.all([
            Promise.all(
              data.seasons.map(async (s) => {
                const whereParams: {
                  year?: number;
                  name: string;
                  UserId?: string;
                } = {
                  name: s.name,
                };
                if (s.year !== null && s.year !== undefined) {
                  whereParams.year = s.year;
                }
                if (s.usersSpecific) whereParams.UserId = user.id;
                const [season, _created] = await Season.findOrCreate({
                  where: whereParams,
                });
                return season;
              }),
            ),
            Promise.all(
              u.notifications.map((n) =>
                NotificationService.findOrCreate(
                  n.title,
                  n.message,
                  user.id,
                ).then((notification: NotificationModel) => {
                  if (n.read)
                    return NotificationService.markRead(
                      notification.id,
                      user.id,
                    );
                }),
              ),
            ),
          ]).then(([seasons, _notifications]) =>
            Promise.all(
              u.clubs.map((c) =>
                ClubService.findOrCreate(c.name, user.id).then((club: Club) =>
                  Promise.all(
                    c.Teams.map((t) =>
                      TeamService.findOrCreate(t.name, club.id, user.id).then(
                        (team: Team) =>
                          Promise.all(
                            t.SeasonTeams.map(async (st) =>
                              SeasonTeam.findOrCreate({
                                where: {
                                  SeasonId: (() => {
                                    const season = seasons.find(
                                      (s) => s.name == st.SeasonName,
                                    );
                                    if (!season) {
                                      logger.error(
                                        `Season with name ${st.SeasonName} not found`,
                                      );
                                      throw new Error(
                                        `Season with name ${st.SeasonName} not found`,
                                      );
                                    }
                                    return season.id;
                                  })(),
                                  TeamId: team.id,
                                  UserId: user.id,
                                },
                              }).then(
                                ([seasonTeam, _created]: [
                                  SeasonTeam,
                                  boolean,
                                ]) =>
                                  Promise.all(
                                    st.Members.map((m) =>
                                      MemberService.findOrCreate(
                                        m.name,
                                        m.nickname,
                                        m.abbreviation,
                                        // m.color,
                                        seasonTeam.id,
                                        user.id,
                                      ),
                                    ),
                                  ).then((members) =>
                                    Promise.all(
                                      st.Choreos.map((ch) =>
                                        ChoreoService.findOrCreate(
                                          ch.name,
                                          ch.counts,
                                          ch.matType as MatType,
                                          seasonTeam.id,
                                          user.id,
                                        ).then((choreo: Choreo) => {
                                          Promise.all([
                                            ...ch.Hits.map((h) =>
                                              HitService.findOrCreate(
                                                h.name,
                                                h.count,
                                                choreo.id,
                                                h.memberIndices.map(
                                                  (i) => members[i]?.id,
                                                ),
                                                user.id,
                                              ),
                                            ),
                                            ...ch.Lineups.map((l) =>
                                              LineupService.findOrCreate(
                                                l.startCount,
                                                l.endCount,
                                                choreo.id,
                                                user.id,
                                              ).then((lineup: Lineup) =>
                                                Promise.all(
                                                  l.Positions.map((p) => {
                                                    const member = members.find(
                                                      (m) =>
                                                        m.abbreviation ==
                                                        p.memberAbbreviation,
                                                    );
                                                    if (!member) {
                                                      logger.error(
                                                        `Member with abbreviation ${p.memberAbbreviation} not found`,
                                                      );
                                                      throw new Error(
                                                        `Member with abbreviation ${p.memberAbbreviation} not found`,
                                                      );
                                                    }
                                                    return PositionService.findOrCreate(
                                                      p.x,
                                                      p.y,
                                                      lineup.id,
                                                      member.id,
                                                      user.id,
                                                    );
                                                  }),
                                                ),
                                              ),
                                            ),
                                            ...ch.Participants.map((p) =>
                                              ChoreoService.addParticipant(
                                                choreo.id,
                                                (() => {
                                                  const participant =
                                                    members.find(
                                                      (m) =>
                                                        m.abbreviation == p,
                                                    );
                                                  if (!participant) {
                                                    logger.error(
                                                      `Participant with abbreviation ${p} not found`,
                                                    );
                                                    throw new Error(
                                                      `Participant with abbreviation ${p} not found`,
                                                    );
                                                  }
                                                  return participant.id;
                                                })(),
                                                user.id,
                                              ),
                                            ),
                                          ]);
                                        }),
                                      ),
                                    ),
                                  ),
                              ),
                            ),
                          ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
    Promise.all(adminPromises),
  ]);
}

export default seed;
