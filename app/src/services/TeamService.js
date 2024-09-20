import ax from "./RequestService";

const teams = [
  {
    id: "testteam",
    name: "Glamourous Blush",
    members: [
      {
        id: "aaa",
        name: "Anna N",
        nickname: "Anni",
        abbreviation: null,
      },
      {
        id: "sst",
        name: "Sarah A",
        nickname: null,
        abbreviation: null,
      },
      {
        id: "sss",
        name: "Susanna A",
        nickname: null,
        abbreviation: null,
      },
      {
        id: "aab",
        name: "Anna N",
        nickname: "Anna",
        abbreviation: null,
      },
      {
        id: "jjj",
        name: "Julia",
        nickname: null,
        abbreviation: null,
      },
      {
        id: "mmm",
        name: "Marie",
        nickname: null,
        abbreviation: null,
      },
    ],
  },
];

class TeamService {
  async getAll() {
    return ax
      .get("/team")
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return teams;
      });
  }

  async getByName(name) {
    return ax
      .get("/team", { params: { name } })
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return teams.find((t) => t.name == name);
      });
  }

  async getById(teamId) {
    return ax
      .get(`/team/${teamId}`)
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return teams.find((t) => t.id == teamId);
      });
  }
}

export default new TeamService();
