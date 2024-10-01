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

  create(name, counts, teamId) {
    return ax.post("/choreo", { name, counts, teamId }).then((res) => res.data);
  }
}

export default new ChoreoService();
