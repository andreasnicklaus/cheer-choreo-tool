const ChoreoService = require("../services/ChoreoService");
const ClubService = require("../services/ClubService");
const HitService = require("../services/HitService");
const LineupService = require("../services/LineupService");
const MemberService = require("../services/MemberService");
const PositionService = require("../services/PositionService");
const TeamService = require("../services/TeamService");
const UserService = require("../services/UserService");
const data = require("./seed.json");

function seed() {
  return Promise.all(
    data.users.map((u) =>
      UserService.findOrCreate(u.username, u.password).then((user) =>
        u.clubs.map((c) =>
          ClubService.findOrCreate(c.name, user.id).then((club) =>
            Promise.all(
              c.Teams.map((t) =>
                TeamService.findOrCreate(t.name, club.id, user.id).then(
                  (team) =>
                    Promise.all(
                      t.Members.map((m) =>
                        MemberService.findOrCreate(
                          m.name,
                          m.nickname,
                          m.abbreviation,
                          m.color,
                          team.id,
                          user.id
                        )
                      )
                    ).then((members) =>
                      Promise.all(
                        t.Choreos.map((ch) =>
                          ChoreoService.findOrCreate(
                            ch.name,
                            ch.counts,
                            team.id,
                            user.id
                          ).then((choreo) => {
                            Promise.all(
                              ch.Hits.map((h) =>
                                HitService.findOrCreate(
                                  h.name,
                                  h.count,
                                  choreo.id,
                                  h.memberIndices.map((i) => members[i].id),
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
                                          m.abbreviation == p.memberAbbreviation
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
  );
}

module.exports = seed;
