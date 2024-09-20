const clubs = [
  {
    id: "testClub",
    name: "Glamourous Cheerleader",
    teamIds: ["blush", "berry"],
  },
];

class ClubService {
  findById(id) {
    return clubs.find((c) => (c.id = id));
  }
}

export default new ClubService();
