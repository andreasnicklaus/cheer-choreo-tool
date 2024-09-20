const teams = [
  {
    id: "blush",
    name: "Glamourous Blush",
    members: [
      {
        id: "aaa",
        name: "Anna N",
        nickname: "Anni",
        abbreviation: "AN",
      },
      // {
      //   id: "sst",
      //   name: "Sarah A",
      //   nickname: null,
      //   abbreviation: null,
      // },
      // {
      //   id: "sss",
      //   name: "Susanna A",
      //   nickname: null,
      //   abbreviation: null,
      // },
      // {
      //   id: "aab",
      //   name: "Anna N",
      //   nickname: "Anna",
      //   abbreviation: null,
      // },
      // {
      //   id: "jjj",
      //   name: "Julia",
      //   nickname: null,
      //   abbreviation: null,
      // },
      // {
      //   id: "mmm",
      //   name: "Marie",
      //   nickname: null,
      //   abbreviation: null,
      // },
    ],
  },
  {
    id: "berry",
    name: "Glamourous Berry",
    members: [
      {
        id: "aaa",
        name: "Anna N",
        nickname: "Anni",
        abbreviation: "AN",
      },
    ],
  },
];

class TeamService {
  getAll() {
    return teams;
  }

  findByName(name) {
    return teams.filter((t) => t.name == name);
  }

  findById(id) {
    return teams.find((t) => t.id == id);
  }
}

export default new TeamService();
