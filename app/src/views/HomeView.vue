<template>
  <b-container class="home">
    <b-row>
      <b-col cols="3">
        <b-card title="Filter">
          <b-input-group class="mb-4 mt-2">
            <b-form-input
              placeholder="Suchen"
              v-model="searchTerm"
              type="search"
            />
            <b-input-group-append>
              <b-button
                :disabled="!searchTerm"
                @click="() => (this.searchTerm = null)"
              >
                <b-icon-x />
              </b-button>
            </b-input-group-append>
          </b-input-group>

          <div>
            <p class="mb-0 font-weight-bold font-italic text-muted">Team</p>
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-list-group flush class="mb-2">
                  <b-list-group-item v-for="(_, ix) in Array(2)" :key="ix">
                    <b-skeleton />
                  </b-list-group-item>
                </b-list-group>
              </template>
              <template #default>
                <b-list-group flush class="mb-2">
                  <b-list-group-item
                    v-for="team in teams"
                    :key="team.id"
                    :variant="
                      teamFilterIds.includes(team.id) ? 'dark' : 'light'
                    "
                    @click="() => addOrRemoveTeamFilter(team.id)"
                    class="d-flex justify-content-between align-items-center"
                    block
                    href="#"
                  >
                    {{ team.name }}
                    <b-badge variant="light">
                      {{
                        filteredChoreos.filter((c) => c.teamId == team.id)
                          .length
                      }}
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </template>
            </b-skeleton-wrapper>
          </div>

          <div>
            <p class="mb-0 font-weight-bold font-italic text-muted">Counts</p>
            <b-skeleton-wrapper :loading="loading" :key="'asdf'">
              <template #loading>
                <b-skeleton type="input" />
                <b-skeleton type="input" />
              </template>
              <template #default>
                <b-input-group>
                  <b-input-group-prepend is-text>
                    {{ minCount }}
                  </b-input-group-prepend>
                  <b-form-input
                    v-model="minCount"
                    :min="Math.min(...choreos.map((c) => c.counts))"
                    :max="Math.max(...choreos.map((c) => c.counts))"
                    type="range"
                  />
                </b-input-group>
                <b-input-group>
                  <b-input-group-prepend is-text>
                    {{ maxCount }}
                  </b-input-group-prepend>
                  <b-form-input
                    v-model="maxCount"
                    :min="Math.min(...choreos.map((c) => c.counts))"
                    :max="Math.max(...choreos.map((c) => c.counts))"
                    type="range"
                  />
                </b-input-group>
              </template>
            </b-skeleton-wrapper>
          </div>

          <b-button
            block
            class="mt-2"
            :disabled="!this.searchTerm && this.teamFilterIds.length == 0"
            :variant="
              !this.searchTerm && this.teamFilterIds.length == 0
                ? 'outline-secondary'
                : 'secondary'
            "
            @click="() => resetFilters()"
          >
            Zurücksetzen
          </b-button>
        </b-card>
      </b-col>
      <b-col>
        <b-skeleton-wrapper :loading="loading">
          <template #loading>
            <b-list-group flush>
              <b-list-group-item v-for="i in Array(3)" :key="i">
                <b-skeleton width="25%" height="30px" class="mb-2" />
                <b-skeleton width="50%" />
                <b-skeleton width="25%" class="mb-3" />
              </b-list-group-item>
            </b-list-group>
          </template>
          <template #default>
            <b-list-group flush>
              <b-list-group-item
                v-for="choreo in filteredChoreos"
                :key="choreo.id"
                :to="{ name: 'Edit', params: { choreoId: choreo.id } }"
                variant="light"
              >
                <h5>{{ choreo.name }}</h5>
                <router-link
                  :to="{
                    name: 'Team',
                    params: {
                      teamId: teams.find((t) => t.id == choreo.teamId)?.id,
                    },
                  }"
                  :style="{ color: 'inherit' }"
                >
                  {{ teams.find((t) => t.id == choreo.teamId)?.name }}
                </router-link>
                <p>
                  {{ Math.floor(choreo.counts / 8) }} Achter
                  {{ choreo.counts % 8 > 0 ? `+ ${choreo.counts % 8}` : "" }}
                </p>
              </b-list-group-item>
            </b-list-group>
          </template>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import TeamService from "@/services/TeamService";

export default {
  name: "HomeView",
  data: () => ({
    clubId: "testClub",
    teams: [],
    choreos: [],
    teamFilterIds: [],
    searchTerm: null,
    minCount: 0,
    maxCount: 400,
    loading: true,
  }),
  components: {},
  mounted() {
    ClubService.getById(this.clubId).then((club) => {
      Promise.all(
        club.teamIds.map((teamId) => TeamService.getById(teamId))
      ).then((teams) => (this.teams = teams));
      Promise.all(
        club.teamIds.map((teamId) => ChoreoService.getByTeam(teamId))
      ).then((choreos) => {
        this.choreos = choreos.flat();
        setTimeout(() => (this.loading = false), 1000);
        this.minCount = Math.min(...this.choreos.map((c) => c.counts));
        this.maxCount = Math.max(...this.choreos.map((c) => c.counts));
      });
    });
  },
  methods: {
    addOrRemoveTeamFilter(teamId) {
      if (this.teamFilterIds.includes(teamId))
        this.teamFilterIds.splice(this.teamFilterIds.indexOf(teamId), 1);
      else this.teamFilterIds.push(teamId);
    },
    resetFilters() {
      this.searchTerm = null;
      this.teamFilterIds = [];
      this.minCount = Math.min(...this.choreos.map((c) => c.counts));
      this.maxCount = Math.max(...this.choreos.map((c) => c.counts));
    },
  },
  computed: {
    loading2() {
      return this.loading;
    },
    filteredChoreos() {
      let result = this.choreos;
      if (this.teamFilterIds.length > 0)
        result = result.filter((r) => this.teamFilterIds.includes(r.teamId));
      if (this.searchTerm)
        result = result.filter(
          (c) =>
            c.name.toLowerCase().startsWith(this.searchTerm.toLowerCase()) ||
            c.id.toLowerCase().startsWith(this.searchTerm.toLowerCase()) ||
            this.teams
              .find((t) => t.id == c.teamId)
              ?.name.toLowerCase()
              .startsWith(this.searchTerm.toLowerCase())
        );
      result = result.filter(
        (c) => c.counts >= this.minCount && c.counts <= this.maxCount
      );
      return result;
    },
  },
};
</script>

<style lang="scss" scoped>
h4,
h5 {
  font-weight: bold;
}

button.btn:not(:disabled) {
  color: white !important;
}
</style>
