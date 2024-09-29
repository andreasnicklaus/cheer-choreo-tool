<template>
  <b-nav class="p-4">
    <b-nav-item :to="{ name: 'Home' }">Start</b-nav-item>

    <b-nav-item-dropdown text="Choreos">
      <b-dropdown-group
        v-for="team in teams"
        :key="team.id"
        :header="team.name"
      >
        <b-dropdown-item
          v-for="choreo in choreos.filter((c) => c.TeamId == team.id)"
          :key="choreo.id"
          :to="{ name: 'Edit', params: { choreoId: choreo.id } }"
        >
          {{ choreo.name }}
        </b-dropdown-item>
        <b-dropdown-divider></b-dropdown-divider>
      </b-dropdown-group>
    </b-nav-item-dropdown>
    <b-nav-item-dropdown text="Teams">
      <b-dropdown-item
        v-for="team in teams"
        :key="team.id"
        :to="{ name: 'Team', params: { teamId: team.id } }"
      >
        {{ team.name }}
      </b-dropdown-item>
    </b-nav-item-dropdown>
    <b-nav-item :to="{ name: 'About' }">Über</b-nav-item>
  </b-nav>
</template>

<script>
import ClubService from "@/services/ClubService";

export default {
  name: "HeadNav",
  data: () => ({
    clubName: "Glamorous Cheerleader",
    teams: [],
    choreos: [],
  }),
  methods: {
    load() {
      ClubService.findByName(this.clubName).then((clubList) => {
        const club = clubList[0];
        this.teams = club.Teams;
        this.choreos = club.Teams.map((t) => t.Choreos).flat();
      });
    },
  },
  // watch: {
  //   $route() {
  //     this.load();
  //   },
  // },
  mounted() {
    this.load();
  },
};
</script>
