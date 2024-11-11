import ax from "./RequestService";

class SeasonService {
  getAll() {
    return ax.get("/season").then((res) => res.data);
  }

  create(name, year) {
    return ax.post("/season", { name, year }).then((res) => res.data);
  }
}

export default new SeasonService();
