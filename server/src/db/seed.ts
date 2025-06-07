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

const data: seedData = require("./seed.json");

type seasonSeedData = {
  year: number,
  name: string,
  usersSpecific?: boolean
}

type userSeedData = {
  username: string,
  password: string,
  clubs: clubSeedData[],
  notifications: notificationSeedData[]
}
type clubSeedData = {
  name: string,
  Teams: teamSeedData[]
}

type teamSeedData = {
  name: string,
  SeasonTeams: seasonTeamData[]
}

type seasonTeamData = {
  SeasonName: string,
  Members: memberSeedData[],
  Choreos: choreoSeedData[]
}

type memberSeedData = {
  name: string,
  nickname: string,
  abbreviation: string,
  // color?: string
}

type choreoSeedData = {
  name: string,
  counts: number,
  matType: MatType,
  Hits: hitSeedData[],
  Lineups: lineupSeedData[],
  Participants: string[]
}

type hitSeedData = {
  name: string,
  count: number,
  memberIndices: number[]
}

type lineupSeedData = {
  startCount: number,
  endCount: number,
  Positions: positionSeedData[]
}

type positionSeedData = {
  x: number,
  y: number,
  memberAbbreviation?: string
}

type notificationSeedData = {
  title: string,
  message: string,
  read?: boolean
}


type seedData = {
  users: userSeedData[],
  seasons: seasonSeedData[],
  admins: {
    username: string,
    password: string
  }[]
}

function seed() {
  Promise.all(
    data.users.map((u) =>
      UserService.findOrCreate(u.username, u.password).then((user: User) =>
        Promise.all([
          Promise.all(
            data.seasons.map(async (s) => {
              const [season, _created] = await Season.findOrCreate({
                where: {
                  year: s.year,
                  name: s.name,
                  UserId: s.usersSpecific ? user.id : { [require('sequelize').Op.is]: null },
                },
              });
              return season;
            })
          ),
          Promise.all(
            u.notifications.map((n) =>
              NotificationService.findOrCreate(
                n.title,
                n.message,
                user.id
              ).then((notification: NotificationModel) => {
                if (n.read)
                  NotificationService.markRead(notification.id, user.id);
              })
            )
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
                                    (s) => s.name == st.SeasonName
                                  );
                                  if (!season) {
                                    throw new Error(`Season with name ${st.SeasonName} not found`);
                                  }
                                  return season.id;
                                })(),
                                TeamId: team.id,
                                UserId: user.id,
                              },
                            }).then(([seasonTeam, _created]: [SeasonTeam, boolean]) =>
                              Promise.all(
                                st.Members.map((m) =>
                                  MemberService.findOrCreate(
                                    m.name,
                                    m.nickname,
                                    m.abbreviation,
                                    // m.color,
                                    seasonTeam.id,
                                    user.id
                                  )
                                )
                              ).then((members) =>
                                Promise.all(
                                  st.Choreos.map((ch) =>
                                    ChoreoService.findOrCreate(
                                      ch.name,
                                      ch.counts,
                                      ch.matType,
                                      seasonTeam.id,
                                      user.id
                                    ).then((choreo: Choreo) => {
                                      Promise.all(
                                        ch.Hits.map((h) =>
                                          HitService.findOrCreate(
                                            h.name,
                                            h.count,
                                            choreo.id,
                                            h.memberIndices.map(
                                              (i) => members[i]?.id
                                            ),
                                            user.id
                                          )
                                        )
                                      );
                                      Promise.all(
                                        ch.Lineups.map((l) =>
                                          LineupService.findOrCreate(
                                            l.startCount,
                                            l.endCount,
                                            choreo.id,
                                            user.id
                                          ).then((lineup: Lineup) =>
                                            Promise.all(
                                              l.Positions.map((p) => {
                                                const member = members.find(
                                                  (m) =>
                                                    m.abbreviation ==
                                                    p.memberAbbreviation
                                                );
                                                if (!member) {
                                                  throw new Error(`Member with abbreviation ${p.memberAbbreviation} not found`);
                                                }
                                                return PositionService.findOrCreate(
                                                  p.x,
                                                  p.y,
                                                  lineup.id,
                                                  member.id,
                                                  user.id
                                                );
                                              })
                                            )
                                          )
                                        )
                                      );
                                      Promise.all(
                                        ch.Participants.map((p) =>
                                          ChoreoService.addParticipant(
                                            choreo.id,
                                            (() => {
                                              const participant = members.find(
                                                (m) => m.abbreviation == p
                                              );
                                              if (!participant) {
                                                throw new Error(`Participant with abbreviation ${p} not found`);
                                              }
                                              return participant.id;
                                            })(),
                                            user.id
                                          )
                                        )
                                      );
                                    })
                                  )
                                )
                              )
                            )
                          )
                        )
                    )
                  )
                )
              )
            )
          )
        )
      )
    )
  );
  Promise.all([
    ...(data.admins?.map((a) =>
      AdminService.findOrCreate(a.username, a.password)
    ) || []),
    process.env.DEFAULT_ADMIN_USERNAME &&
    process.env.DEFAULT_ADMIN_PASSWORD &&
    AdminService.findOrCreate(
      process.env.DEFAULT_ADMIN_USERNAME,
      process.env.DEFAULT_ADMIN_PASSWORD
    ),
  ]);
}

export default seed;
