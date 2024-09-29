import ax from "./RequestService";

class HitService {
  create(name, count, choreoId, memberIds = []) {
    return ax
      .post("/hit", { name, count, choreoId, memberIds })
      .then((res) => res.data);
  }

  setCount(hitId, count) {
    return ax.put(`/hit/${hitId}`, { count }).then((res) => res.data);
  }

  update(hitId, name, count, MemberIds) {
    return ax
      .put(`/hit/${hitId}`, {
        name,
        count,
        MemberIds,
      })
      .then((res) => res.data);
  }

  remove(hitId) {
    return ax.delete(`/hit/${hitId}`).then((res) => res.data);
  }
}

export default new HitService();
