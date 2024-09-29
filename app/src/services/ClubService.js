import ax from "./RequestService";

const clubs = [
  {
    id: "testClub",
    name: "Glamourous Cheerleader",
    teamIds: ["testteam"],
  },
];

class ClubService {
  getById(clubId) {
    return ax
      .get(`/club/${clubId}`)
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return clubs.find((t) => t.id == clubId);
      });
  }

  findByName(name) {
    return ax
      .get("/club", { params: { name } })
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return clubs.filter((c) => c.name == name);
      });
  }
}

export default new ClubService();
