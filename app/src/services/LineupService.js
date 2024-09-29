import ax from "./RequestService";

class LineupService {
  create(startCount, endCount, choreoId) {
    return ax
      .post(`/lineup`, { startCount, endCount, choreoId })
      .then((res) => res.data);
  }

  update(id, data) {
    return ax.put(`/lineup/${id}`, data).then((res) => res.data);
  }

  remove(id) {
    return ax.delete(`/lineup/${id}`).then((res) => res.data);
  }
}

export default new LineupService();
