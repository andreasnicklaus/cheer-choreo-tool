const AdminService = require("../services/AdminService");
const ChoreoService = require("../services/ChoreoService");
const ClubService = require("../services/ClubService");
const HitService = require("../services/HitService");
const LineupService = require("../services/LineupService");
const MemberService = require("../services/MemberService");
const PositionService = require("../services/PositionService");
const TeamService = require("../services/TeamService");
const UserService = require("../services/UserService");
const Season = require("./models/season");
const SeasonTeam = require("./models/seasonTeam");
const data = require("./seed.json");

function seed() {
  Promise.all(
    data.users.map((u) =>
      UserService.findOrCreate(u.username, u.password).then((user) =>
        Promise.all(
          data.seasons.map(async (s) => {
            const [season, created] = await Season.findOrCreate({
              where: {
                year: s.year,
                name: s.name,
                UserId: s.usersSpecific ? user.id : null,
              },
            });
            return season;
          })
        ).then((seasons) =>
          u.clubs.map((c) =>
            ClubService.findOrCreate(c.name, user.id).then((club) =>
              Promise.all(
                c.Teams.map((t) =>
                  TeamService.findOrCreate(t.name, club.id, user.id).then(
                    (team) =>
                      Promise.all(
                        t.SeasonTeams.map(async (st) =>
                          SeasonTeam.findOrCreate({
                            where: {
                              SeasonId: seasons.find(
                                (s) => s.name == st.SeasonName
                              ).id,
                              TeamId: team.id,
                              UserId: user.id,
                            },
                          }).then(([seasonTeam, created]) =>
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
                                    seasonTeam.id,
                                    user.id
                                  ).then((choreo) => {
                                    Promise.all(
                                      ch.Hits.map((h) =>
                                        HitService.findOrCreate(
                                          h.name,
                                          h.count,
                                          choreo.id,
                                          h.memberIndices.map(
                                            (i) => members[i].id
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
                                        ).then((lineup) =>
                                          Promise.all(
                                            l.Positions.map((p) => {
                                              const member = members.find(
                                                (m) =>
                                                  m.abbreviation ==
                                                  p.memberAbbreviation
                                              );
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
                                          members.find(
                                            (m) => m.abbreviation == p
                                          ).id,
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

module.exports = seed;
