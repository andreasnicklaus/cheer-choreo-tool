import ax from "./RequestService";

class MemberService {
  create(name, nickname, abbreviation, color, teamId) {
    return ax
      .post("/member", { name, nickname, abbreviation, color, teamId })
      .then((res) => res.data);
  }

  setColor(memberId, color) {
    return ax.put(`/member/${memberId}`, { color }).then((res) => res.data);
  }

  update(memberId, data) {
    return ax.put(`/member/${memberId}`, data).then((res) => res.data);
  }

  remove(memberId) {
    return ax.delete(`/member/${memberId}`).then((res) => res.data);
  }
}

export default new MemberService();
