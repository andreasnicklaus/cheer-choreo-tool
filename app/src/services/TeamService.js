import ax from "./RequestService";

class TeamService {
  getAll() {
    return ax.get("/team").then((res) => res.data);
  }

  getByName(name) {
    return ax.get("/team", { params: { name } }).then((res) => res.data);
  }

  getById(teamId) {
    return ax.get(`/team/${teamId}`).then((res) => res.data);
  }

  create(name, clubId, seasonId) {
    return ax.post("/team", { name, clubId, seasonId }).then((res) => res.data);
  }

  setName(teamId, name) {
    return ax.put(`/team/${teamId}`, { name }).then((res) => res.data);
  }

  remove(teamId) {
    return ax.delete(`/team/${teamId}`).then((res) => res.data);
  }
}

export default new TeamService();
