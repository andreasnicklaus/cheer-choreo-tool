import ax from "./RequestService";

class ChoreoService {
  getByTeam(teamId) {
    return ax.get("/choreo", { params: { teamId } }).then((res) => res.data);
  }

  getById(choreoId) {
    return ax.get(`/choreo/${choreoId}`).then((res) => res.data);
  }

  changeName(choreoId, name) {
    return ax.put(`/choreo/${choreoId}`, { name }).then((res) => res.data);
  }

  changeLength(choreoId, counts) {
    return ax.put(`/choreo/${choreoId}`, { counts }).then((res) => res.data);
  }

  create(name, counts, teamId) {
    return ax.post("/choreo", { name, counts, teamId }).then((res) => res.data);
  }

  remove(choreoId) {
    return ax.delete(`/choreo/${choreoId}`).then((res) => res.data);
  }

  getPositionsFromChoreoAndCount(choreo, count, teamMembers) {
    if (!teamMembers || !choreo || !choreo.Lineups) return [];

    const relevantLineups = choreo.Lineups.filter(
      (l) =>
        l.Positions &&
        l.Positions.length > 0 &&
        l.startCount <= count &&
        l.endCount >= count
    );

    const positionsForCurrentCount = relevantLineups
      .map((l) => l.Positions)
      .flat();

    let unPositionedTeamMembers = teamMembers.filter(
      (m) => !positionsForCurrentCount.some((p) => p.MemberId == m.id)
    );

    const interpolatedPositions = [];
    unPositionedTeamMembers.forEach((member) => {
      const lineupsForMember = choreo.Lineups.filter(
        (l) => l.Positions && l.Positions.some((p) => p.MemberId == member.id)
      );

      const previousLineupForMember = lineupsForMember
        .filter((l) => l.endCount < count)
        .sort((a, b) => b.endCount - a.endCount)[0];

      const followingLineupForMember = lineupsForMember
        .filter((l) => l.startCount > count)
        .sort((a, b) => a.startCount - b.startCount)[0];

      const previousPositionForMember = previousLineupForMember
        ? previousLineupForMember.Positions.find((p) => p.MemberId == member.id)
        : null;
      const followingPositionForMember = followingLineupForMember
        ? followingLineupForMember.Positions.find(
            (p) => p.MemberId == member.id
          )
        : null;

      if (!previousPositionForMember && followingPositionForMember)
        interpolatedPositions.push(followingPositionForMember);
      else if (previousPositionForMember && !followingPositionForMember)
        interpolatedPositions.push(previousPositionForMember);
      else if (previousPositionForMember && followingPositionForMember) {
        const countsSincePrevious = count - previousLineupForMember.endCount;
        const countsBetweenPreviousAndFollowing =
          followingLineupForMember.startCount -
          previousLineupForMember.endCount;

        const advancement =
          countsSincePrevious / countsBetweenPreviousAndFollowing;

        const interpolatedPositionForMember = {
          Member: member,
          MemberId: member.id,
          x:
            previousPositionForMember.x +
            (followingPositionForMember.x - previousPositionForMember.x) *
              advancement,
          y:
            previousPositionForMember.y +
            (followingPositionForMember.y - previousPositionForMember.y) *
              advancement,
        };

        interpolatedPositions.push(interpolatedPositionForMember);
      }
    });

    unPositionedTeamMembers = teamMembers.filter(
      (m) =>
        ![...positionsForCurrentCount, ...interpolatedPositions].some(
          (p) => p.MemberId == m.id
        )
    );

    const defaultPositions = unPositionedTeamMembers.map((member, i) => {
      let yNew = Math.floor(i / 7) * 10 + 10;
      let xNew = (100 / 7) * (i % 7) + 100 / 14;

      return {
        Member: member,
        MemberId: member.id,
        x: xNew,
        y: yNew,
      };
    });

    return [
      ...positionsForCurrentCount,
      ...interpolatedPositions,
      ...defaultPositions,
    ].sort((a, b) => a.Member.name.localeCompare(b.Member.name));
  }
}

export default new ChoreoService();
