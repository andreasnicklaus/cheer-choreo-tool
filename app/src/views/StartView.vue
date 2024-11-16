<template>
  <b-container id="startView" data-view>
    <b-row>
      <!-- FILTER -->
      <b-col cols="12" lg="3" v-if="teams.length > 0">
        <b-card class="filters">
          <b-card-title
            class="d-flex justify-content-between align-items-center"
          >
            Filter
            <b-icon-info id="popover-info-target" variant="secondary" />
            <b-popover target="popover-info-target" triggers="hover">
              <p><b>Suchen:</b> Suche nach einem Team oder einer Choreo</p>
              <p><b>Team:</b> Filtere die Choreos nach Teams</p>
              <p><b>Season:</b> Filtere die Choreos nach Season</p>
              <p><b>Counts:</b> Filtere die Choreo nach ihrer Länge</p>
              <hr />
              <p class="text-muted">
                Aktiver Verein: <b>{{ club?.name }}</b>
              </p>
            </b-popover>
          </b-card-title>
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

          <div v-if="teams.length > 0">
            <p class="mb-0 font-weight-bold font-italic text-muted">Team</p>
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-list-group flush class="mb-2">
                  <b-list-group-item
                    v-for="(_, ix) in Array(2)"
                    :key="`teamSkeleton-${ix}`"
                  >
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
                        teams
                          .find((t) => t.id == team.id)
                          .SeasonTeams.filter(
                            (st) =>
                              seasonFilterIds.length == 0 ||
                              seasonFilterIds.includes(st.Season.id)
                          )
                          .map((st) =>
                            st.Choreos.filter(
                              (c) =>
                                c.counts >= minCount && c.counts <= maxCount
                            )
                          )
                          .flat(Infinity).length
                      }}
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </template>
            </b-skeleton-wrapper>
          </div>

          <div v-if="seasons.length > 0">
            <p class="mb-0 font-weight-bold font-italic text-muted">Season</p>
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-list-group flush class="mb-2">
                  <b-list-group-item
                    v-for="(_, ix) in Array(2)"
                    :key="`seasonSkeleton-${ix}`"
                  >
                    <b-skeleton />
                  </b-list-group-item>
                </b-list-group>
              </template>
              <template #default>
                <b-list-group flush class="mb-2">
                  <b-list-group-item
                    v-for="season in seasons"
                    :key="season.id"
                    :variant="
                      seasonFilterIds.includes(season.id) ? 'dark' : 'light'
                    "
                    @click="() => addOrRemoveSeasonFilter(season.id)"
                    class="d-flex justify-content-between align-items-center"
                    block
                    href="#"
                  >
                    {{ season.name }}
                    <b-badge variant="light">
                      {{
                        teams
                          .filter(
                            (t) =>
                              teamFilterIds.length == 0 ||
                              teamFilterIds.includes(t.id)
                          )
                          .map((t) =>
                            t.SeasonTeams.filter(
                              (st) => st.Season.id == season.id
                            ).map((st) =>
                              st.Choreos.filter(
                                (c) =>
                                  c.counts >= minCount && c.counts <= maxCount
                              )
                            )
                          )
                          .flat(Infinity).length
                      }}
                    </b-badge>
                  </b-list-group-item>
                </b-list-group>
              </template>
            </b-skeleton-wrapper>
          </div>

          <div
            v-if="
              choreos.length > 0 &&
              Math.min(...choreos.map((c) => c.counts)) !=
                Math.max(...choreos.map((c) => c.counts))
            "
          >
            <p class="mb-0 font-weight-bold font-italic text-muted">Counts</p>
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-skeleton type="input" />
                <b-skeleton type="input" />
              </template>
              <template #default>
                <b-form-group
                  label="Min. Länge:"
                  :description="`${Math.floor(minCount / 8)} Achter + ${
                    minCount % 8
                  }`"
                >
                  <b-form-input
                    v-model="minCount"
                    :min="Math.min(...choreos.map((c) => c.counts))"
                    :max="Math.max(...choreos.map((c) => c.counts))"
                    type="range"
                  />
                </b-form-group>
                <hr />
                <b-form-group
                  label="Max. Länge:"
                  :description="`${Math.floor(maxCount / 8)} Achter + ${
                    maxCount % 8
                  }`"
                >
                  <b-form-input
                    v-model="maxCount"
                    :min="Math.min(...choreos.map((c) => c.counts))"
                    :max="Math.max(...choreos.map((c) => c.counts))"
                    type="range"
                  />
                </b-form-group>
              </template>
            </b-skeleton-wrapper>
          </div>

          <b-button
            block
            class="mt-2"
            :disabled="
              !this.searchTerm &&
              this.teamFilterIds.length == 0 &&
              this.seasonFilterIds == 0
            "
            :variant="
              !this.searchTerm &&
              this.teamFilterIds.length == 0 &&
              this.seasonFilterIds.length == 0
                ? 'outline-secondary'
                : 'secondary'
            "
            @click="resetFilters"
          >
            Zurücksetzen
          </b-button>
        </b-card>
      </b-col>

      <!-- CHOREOS -->
      <b-col>
        <b-skeleton-wrapper :loading="loading">
          <template #loading>
            <b-list-group flush>
              <b-list-group-item
                v-for="(_, ix) in Array(3)"
                :key="`choreoSkeleton-${ix}`"
              >
                <b-skeleton width="25%" height="30px" class="mb-2" />
                <b-skeleton width="50%" />
                <b-skeleton width="25%" class="mb-3" />
              </b-list-group-item>
            </b-list-group>
          </template>
          <template #default>
            <b-list-group flush>
              <b-list-group-item
                v-for="team in teams"
                :key="team.id"
                :variant="useFolderColors ? 'info' : 'light'"
                href="#"
                class="collapse-submenu p-0"
              >
                <div
                  v-b-toggle="`team-collapse-${team.id}`"
                  :style="{ padding: '12px 20px' }"
                >
                  <b-icon-caret-down-fill variant="secondary" />
                  {{ team.name }}
                  ({{ seasonCountStringByTeam(team) }})
                </div>
                <b-collapse :id="`team-collapse-${team.id}`" class="ml-3">
                  <b-list-group flush>
                    <b-list-group-item
                      v-for="seasonTeam in team.SeasonTeams"
                      :key="seasonTeam.id"
                      :variant="useFolderColors ? 'warning' : 'light'"
                      href="#"
                      class="collapse-submenu p-0"
                    >
                      <div
                        v-b-toggle="`seasonTeam-collapse-${seasonTeam.id}`"
                        :style="{ padding: '12px 20px' }"
                      >
                        <b-icon-caret-down-fill variant="secondary" />
                        {{ seasonTeam.Season.name }}
                        ({{ choreoCountStringBySeasonTeam(seasonTeam) }})
                      </div>
                      <b-collapse
                        :id="`seasonTeam-collapse-${seasonTeam.id}`"
                        class="ml-3"
                      >
                        <b-list-group flush>
                          <b-list-group-item
                            v-for="choreo in seasonTeam.Choreos.filter(
                              (c) =>
                                c.counts >= minCount &&
                                c.counts <= maxCount &&
                                (seasonFilterIds.length == 0 ||
                                  seasonFilterIds.includes(
                                    seasonTeam.Season.id
                                  )) &&
                                (teamFilterIds.length == 0 ||
                                  teamFilterIds.includes(team.id))
                            )"
                            :key="choreo.id"
                            variant="light"
                            :to="{
                              name: 'Choreo',
                              params: {
                                choreoId: choreo.id,
                              },
                            }"
                          >
                            <b>
                              <b-row align-h="between" align-v="center">
                                <b-col>
                                  {{ choreo.name }}
                                </b-col>
                                <b-col cols="auto">
                                  <b-button-group>
                                    <b-button
                                      variant="light"
                                      :to="{
                                        name: 'Video',
                                        params: { choreoId: choreo.id },
                                      }"
                                    >
                                      <b-icon-film />
                                    </b-button>
                                    <b-button
                                      variant="light"
                                      :to="{
                                        name: 'PDF',
                                        params: { choreoId: choreo.id },
                                      }"
                                    >
                                      <b-icon-file-pdf />
                                    </b-button>
                                  </b-button-group>
                                </b-col>
                              </b-row>
                            </b>
                            <router-link
                              :to="{
                                name: 'Team',
                                params: {
                                  teamId: team.id,
                                },
                              }"
                              :style="{ color: 'inherit' }"
                            >
                              {{ team.name }}
                            </router-link>
                            <p class="m-0">
                              {{ seasonTeam.Season.name }}
                            </p>
                            <p class="m-0">
                              {{ Math.floor(choreo.counts / 8) }} Achter
                              {{
                                choreo.counts % 8 > 0
                                  ? `+ ${choreo.counts % 8}`
                                  : ""
                              }}
                            </p>
                          </b-list-group-item>
                          <b-list-group-item
                            variant="light"
                            class="text-muted"
                            @click="
                              () =>
                                $refs.createChoreoModal.open(
                                  team.id,
                                  seasonTeam.Season.id
                                )
                            "
                            href="#"
                          >
                            <b-icon-plus-square class="mr-1" />
                            <u>Choreo hinzufügen</u>
                          </b-list-group-item>
                        </b-list-group>
                      </b-collapse>
                    </b-list-group-item>
                    <b-list-group-item
                      variant="light"
                      class="text-muted"
                      @click="() => $refs.createSeasonModal.open(team.id)"
                      href="#"
                    >
                      <b-icon-plus-square class="mr-1" />
                      <u>Saison anfangen</u>
                    </b-list-group-item>
                  </b-list-group>
                </b-collapse>
              </b-list-group-item>
              <b-list-group-item
                :variant="teams.length == 0 ? 'success' : 'light'"
                :class="{ 'text-muted': teams.length > 0 }"
                @click="() => $refs.createTeamModal.open()"
                href="#"
              >
                <b-icon-plus-square class="mr-1" />
                <u>Team hinzufügen</u>
              </b-list-group-item>
            </b-list-group>

            <b-card
              v-if="teams.length == 0"
              title="Hier kannst du noch nichts finden..."
              class="mt-5"
            >
              <b-card-text>
                Du hast aktuell hier nichts zu sehen, weil du noch keine Teams
                angelegt hast.
              </b-card-text>
            </b-card>
          </template>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>

    <CreateClubModal
      ref="createClubModal"
      :preventClosing="true"
      @clubCreated="onClubCreated"
    />

    <CreateChoreoModal
      ref="createChoreoModal"
      :teams="teams"
      @addChoreo="addChoreo"
    />

    <CreateTeamModal ref="createTeamModal" @teamCreated="onTeamCreated" />

    <CreateSeasonModal
      ref="createSeasonModal"
      :teams="teams"
      @seasonTeamCreated="onSeasonTeamCreation"
    />
  </b-container>
</template>

<script>
import CreateChoreoModal from "@/components/modals/CreateChoreoModal.vue";
import CreateClubModal from "@/components/modals/CreateClubModal.vue";
import CreateSeasonModal from "@/components/modals/CreateSeasonModal.vue";
import CreateTeamModal from "@/components/modals/CreateTeamModal.vue";
import ClubService from "@/services/ClubService";

export default {
  name: "StartView",
  components: {
    CreateChoreoModal,
    CreateTeamModal,
    CreateClubModal,
    CreateSeasonModal,
  },
  data: () => ({
    useFolderColors: true,
    club: null,
    teams: [],
    seasons: [],
    teamFilterIds: [],
    seasonFilterIds: [],
    searchTerm: null,
    minCount: 0,
    maxCount: 400,
    loading: true,
  }),
  mounted() {
    this.load();
  },
  methods: {
    load() {
      let getClubPromise = null;

      if (this.$store.state.clubId) {
        getClubPromise = ClubService.getById(this.$store.state.clubId);
      } else {
        getClubPromise = ClubService.getAll().then((clubList) => {
          if (clubList.length == 0) {
            this.$refs.createClubModal.open();
          } else {
            const club = clubList[0];
            return club;
          }
        });
      }

      getClubPromise.then((club) => {
        if (!club) this.$store.commit("setClubId", null);
        else {
          this.club = club;
          this.teams =
            club?.Teams.map((t) => ({
              ...t,
              SeasonTeams: t.SeasonTeams.sort(
                (a, b) => b.Season.year - a.Season.year
              ).map((st) => ({
                ...st,
                Choreos: st.Choreos.sort(
                  (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
                ),
              })),
            })).sort((a, b) => a.name.localeCompare(b.name)) || [];
          this.seasons = Array.from(
            new Set(
              this.teams
                .map((t) =>
                  t.SeasonTeams.sort(
                    (a, b) => b.Season.year - a.Season.year
                  ).map((st) => JSON.stringify(st.Season))
                )
                .flat(Infinity)
            )
          ).map((s) => JSON.parse(s));
          this.minCount =
            this.choreos.length > 0
              ? Math.min(...this.choreos.map((c) => c.counts))
              : 0;
          this.maxCount =
            this.choreos.length > 0
              ? Math.max(...this.choreos.map((c) => c.counts))
              : 0;
          this.loading = false;
        }
      });
    },
    addOrRemoveTeamFilter(teamId) {
      if (this.teamFilterIds.includes(teamId))
        this.teamFilterIds.splice(this.teamFilterIds.indexOf(teamId), 1);
      else this.teamFilterIds.push(teamId);
    },
    addOrRemoveSeasonFilter(seasonId) {
      if (this.seasonFilterIds.includes(seasonId))
        this.seasonFilterIds.splice(this.seasonFilterIds.indexOf(seasonId), 1);
      else this.seasonFilterIds.push(seasonId);
    },
    resetFilters() {
      this.searchTerm = null;
      this.teamFilterIds = [];
      this.seasonFilterIds = [];
      this.minCount = Math.min(...this.choreos.map((c) => c.counts));
      this.maxCount = Math.max(...this.choreos.map((c) => c.counts));
    },
    onClubCreated() {
      this.$refs.createClubModal.close();
      this.load();
    },
    addChoreo(choreo) {
      const selectedTeam = this.teams.find((t) =>
        t.SeasonTeams.some((st) => st.id == choreo.SeasonTeamId)
      );
      const selectedSeasonTeam = selectedTeam.SeasonTeams.find(
        (st) => st.id == choreo.SeasonTeamId
      );
      selectedSeasonTeam.Choreos.push({
        ...choreo,
        SeasonTeamId: selectedSeasonTeam.id,
        SeasonTeam: {
          ...selectedSeasonTeam,
          TeamId: selectedTeam.id,
          Team: selectedTeam,
        },
      });
    },
    onTeamCreated(team) {
      this.$router
        .push({ name: "Team", params: { teamId: team.id } })
        .catch(() => {});
    },
    choreoCountStringBySeasonTeam(seasonTeam) {
      const count = seasonTeam.Choreos.filter(
        (c) => c.counts >= this.minCount && c.counts <= this.maxCount
      ).length;
      const choreoDeclination = count == 1 ? "Choreo" : "Choreos";
      return `${count} ${choreoDeclination}`;
    },
    seasonCountStringByTeam(team) {
      const count = team.SeasonTeams.filter(
        (st) =>
          this.seasonFilterIds.length == 0 ||
          this.seasonFilterIds.includes(st.Season.id)
      ).flat(Infinity).length;
      const seasonDeclination = count == 1 ? "Season" : "Seasons";
      return `${count} ${seasonDeclination}`;
    },
    onSeasonTeamCreation() {
      this.load();
    },
  },
  computed: {
    choreos() {
      return this.teams
        .map((t) =>
          t.SeasonTeams.map((st) =>
            st.Choreos.map((c) => ({
              ...c,
              SeasonTeam: { ...st, Team: t },
            }))
          )
        )
        .flat(Infinity);
    },
  },
  watch: {
    "$store.state.clubId": {
      handler() {
        this.load();
      },
    },
  },
  metaInfo: {
    title: "Start",
    meta: [
      {
        name: "description",
        content:
          "Dein Planungs-Tool für Choreographien im Tanz und Cheerleading",
      },
      {
        name: "twitter:description",
        content:
          "Dein Planungs-Tool für Choreographien im Tanz und Cheerleading",
      },
      {
        name: "og:description",
        content:
          "Dein Planungs-Tool für Choreographien im Tanz und Cheerleading",
      },
    ],
  },
};
</script>

<style lang="scss" scoped>
h4,
h5 {
  font-weight: bold;
}

.filters button.btn:not(:disabled) {
  color: white !important;
}

.collapse-submenu:hover:has(:not(div):hover) {
  background-color: #ffffff;

  &.list-group-item-info {
    background-color: #bee5eb;
  }
  &.list-group-item-success {
    background-color: #c3e6cb;
  }
  &.list-group-item-warning {
    background-color: #ffeeba;
  }
}
</style>
