const ChoreoService = require("../services/ChoreoService");
const ClubService = require("../services/ClubService");
const HitService = require("../services/HitService");
const LineupService = require("../services/LineupService");
const MemberService = require("../services/MemberService");
const PositionService = require("../services/PositionService");
const TeamService = require("../services/TeamService");
const data = require("./seed.json");

function seed() {
  return Promise.all(
    data.clubs.map((c) =>
      ClubService.findOrCreate(c.name).then((club) =>
        Promise.all(
          c.Teams.map((t) =>
            TeamService.findOrCreate(t.name, club.id).then((team) =>
              Promise.all(
                t.Members.map((m) =>
                  MemberService.findOrCreate(
                    m.name,
                    m.nickname,
                    m.abbreviation,
                    m.color,
                    team.id
                  )
                )
              ).then((members) =>
                Promise.all(
                  t.Choreos.map((ch) =>
                    ChoreoService.findOrCreate(
                      ch.name,
                      ch.counts,
                      team.id
                    ).then((choreo) => {
                      Promise.all(
                        ch.Hits.map((h) =>
                          HitService.findOrCreate(
                            h.name,
                            h.count,
                            choreo.id,
                            h.memberIndices.map((i) => members[i].id)
                          )
                        )
                      );
                      Promise.all(
                        ch.Lineups.map((l) =>
                          LineupService.findOrCreate(
                            l.startCount,
                            l.endCount,
                            choreo.id
                          ).then((lineup) =>
                            Promise.all(
                              l.Positions.map((p) => {
                                const member = members.find(
                                  (m) => m.abbreviation == p.memberAbbreviation
                                );
                                if (!member)
                                  console.error(
                                    "Bratwurst",
                                    JSON.stringify(members, null, 2),
                                    member
                                  );
                                return PositionService.findOrCreate(
                                  p.x,
                                  p.y,
                                  lineup.id,
                                  member.id
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
  );
}

module.exports = seed;
