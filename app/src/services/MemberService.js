import ax from "./RequestService";

class MemberService {
  create(name, nickname, abbreviation, seasonTeamId) {
    return ax
      .post("/member", { name, nickname, abbreviation, seasonTeamId })
      .then((res) => res.data);
  }

  update(memberId, data) {
    return ax.put(`/member/${memberId}`, data).then((res) => res.data);
  }

  remove(memberId) {
    return ax.delete(`/member/${memberId}`).then((res) => res.data);
  }
}

export default new MemberService();
