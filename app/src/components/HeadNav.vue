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
          v-for="choreo in choreos.filter((c) => c.teamId == team.id)"
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
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import TeamService from "@/services/TeamService";

export default {
  name: "HeadNav",
  data: () => ({
    clubId: "testClub",
    teams: [],
    choreos: [],
  }),
  components: {},
  mounted() {
    ClubService.getById(this.clubId).then((club) => {
      Promise.all(
        club.teamIds.map((teamId) => TeamService.getById(teamId))
      ).then((teams) => (this.teams = teams));
      Promise.all(
        club.teamIds.map((teamId) => ChoreoService.getByTeam(teamId))
      ).then((choreos) => (this.choreos = choreos.flat()));
    });
  },
};
</script>
