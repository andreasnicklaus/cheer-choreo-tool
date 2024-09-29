import ax from "./RequestService";

class ChoreoService {
  async getByTeam(teamId) {
    return ax.get("/choreo", { params: { teamId } }).then((res) => res.data);
  }

  async getById(choreoId) {
    return ax.get(`/choreo/${choreoId}`).then((res) => res.data);
  }

  async changeName(choreoId, name) {
    return ax.put(`/choreo/${choreoId}`, { name }).then((res) => res.data);
  }
}

export default new ChoreoService();
