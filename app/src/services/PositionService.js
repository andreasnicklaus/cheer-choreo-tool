import ax from "./RequestService";

class PositionService {
  create(lineupId, x, y, memberId) {
    return ax
      .post(`/lineup/${lineupId}/position`, { x, y, memberId })
      .then((res) => res.data);
  }

  update(lineupId, positionId, x, y) {
    return ax
      .put(`/lineup/${lineupId}/position/${positionId}`, { x, y })
      .then((res) => res.data);
  }

  remove(positionId) {
    return ax.delete(`/position/${positionId}`).then((res) => res.data);
  }
}

export default new PositionService();
