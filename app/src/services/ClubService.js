import ax from "./RequestService";

class ClubService {
  getAll() {
    return ax.get("/club").then((res) => res.data);
  }

  getById(clubId) {
    return ax.get(`/club/${clubId}`).then((res) => res.data);
  }

  findByName(name) {
    return ax.get("/club", { params: { name } }).then((res) => res.data);
  }

  create(name) {
    return ax.post("/club", { name }).then((res) => res.data);
  }
}

export default new ClubService();
