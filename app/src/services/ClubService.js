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

  update(clubId, data) {
    return ax.put(`/club/${clubId}`, data).then((res) => res.data);
  }

  updateClubLogo(clubId, clubLogo) {
    const formData = new FormData();
    formData.append("clubLogo", clubLogo);
    return ax
      .put(`/club/${clubId}/clubLogo`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
      .then((res) => res.data);
  }

  getClubLogo(clubId) {
    const clubLogoUrl = `/club/${clubId}/clubLogo`;
    return ax.get(clubLogoUrl, { responseType: "blob" });
  }

  deleteClubLogo(clubId) {
    return ax.delete(`/club/${clubId}/clubLogo`).then((res) => res.data);
  }
}

export default new ClubService();
