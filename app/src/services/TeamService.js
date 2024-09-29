import ax from "./RequestService";

class TeamService {
  async getAll() {
    return ax.get("/team").then((res) => res.data);
  }

  async getByName(name) {
    return ax.get("/team", { params: { name } }).then((res) => res.data);
  }

  async getById(teamId) {
    return ax.get(`/team/${teamId}`).then((res) => res.data);
  }

  async setName(teamId, name) {
    return ax.put(`/team/${teamId}`, { name }).then((res) => res.data);
  }
}

export default new TeamService();
