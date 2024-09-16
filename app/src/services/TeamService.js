const teams = [
  {
    id: "testteam",
    name: "TestTeam",
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
    return teams;
  }

  async getByName(name) {
    return teams.find((t) => t.name == name);
  }

  async getById(teamId) {
    return teams.find((t) => t.id == teamId);
  }
}

export default new TeamService();
