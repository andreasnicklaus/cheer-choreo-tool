import ax from "./RequestService";

const choreos = [
  {
    id: "asdf",
    teamId: "testteam",
    name: "RM 2023",
    counts: 200,
    actions: [
      {
        count: 0,
        items: [
          {
            type: "position",
            items: [
              {
                memberId: "aaa",
                x: 20,
                y: 20,
              },
              {
                memberId: "sst",
                x: 60,
                y: 20,
              },
              {
                memberId: "sss",
                x: 100,
                y: 20,
              },
              {
                memberId: "aab",
                x: 20,
                y: 60,
              },
              {
                memberId: "jjj",
                x: 60,
                y: 60,
              },
              {
                memberId: "mmm",
                x: 200,
                y: 60,
              },
            ],
          },
        ],
      },
      {
        count: 3,
        items: [
          {
            type: "position",
            items: [
              {
                memberId: "aaa",
                x: 20,
                y: 20,
              },
              {
                memberId: "sst",
                x: 250,
                y: 20,
              },
              {
                memberId: "sss",
                x: 480,
                y: 20,
              },
              {
                memberId: "aab",
                x: 20,
                y: 480,
              },
              {
                memberId: "jjj",
                x: 250,
                y: 480,
              },
              {
                memberId: "mmm",
                x: 480,
                y: 480,
              },
            ],
          },
        ],
      },
    ],
  },
];

class ChoreoService {
  async getByTeam(teamId) {
    return ax
      .get("/choreo", { params: { teamId } })
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return choreos.filter((c) => c.teamId == teamId);
      });
  }

  async getById(choreoId) {
    return ax
      .get(`/choreo/${choreoId}`)
      .then((res) => res.data)
      .catch((e) => {
        console.warn(e);
        return choreos.find((c) => c.id == choreoId);
      });
  }
}

export default new ChoreoService();
