const choreos = [
  {
    id: "blush-rm2023",
    teamId: "blush",
    name: "RM 2023",
    counts: 200,
    actions: [
      {
        type: "position",
        startCount: 0,
        endCount: 2,
        items: [
          {
            memberId: "aaa",
            x: 50,
            y: 50,
          },
        ],
      },
      {
        type: "position",
        startCount: 6,
        endCount: 7,
        items: [
          {
            memberId: "aaa",
            x: 450,
            y: 450,
          },
        ],
      },
      {
        type: "hit",
        count: 0,
        name: "Pose",
      },
      {
        type: "hit",
        count: 0,
        name: "Test",
        memberIds: ["aaa"],
      },
    ],
  },
  {
    id: "berry-lm2024",
    teamId: "berry",
    name: "LM 2024",
    counts: 150,
    actions: [],
  },
];

class ChoreoService {
  getAll() {
    return choreos;
  }

  findByTeamId(teamId) {
    return choreos.filter((c) => c.teamId == teamId);
  }

  findById(id) {
    return choreos.find((c) => c.id == id);
  }
}

export default new ChoreoService();
