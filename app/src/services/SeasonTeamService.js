import ax from "./RequestService";

class SeasonTeamService {
  create(teamId, seasonId, memberIds) {
    return ax
      .post("/seasonTeam", { teamId, seasonId, memberIds })
      .then((res) => res.data);
  }

  importMembers(seasonTeamId, memberIds) {
    return ax
      .put(`/seasonTeam/${seasonTeamId}`, { memberIds })
      .then((res) => res.data);
  }

  remove(seasonTeamId) {
    return ax.delete(`/seasonTeam/${seasonTeamId}`).then((res) => res.data);
  }
}

export default new SeasonTeamService();
