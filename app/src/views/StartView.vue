<template>
  <BContainer id="startView" data-view>
    <BRow>
      <!-- FILTER -->
      <BCol cols="12" lg="3" v-if="teams.length > 0 || loading" class="mb-3">
        <BCard class="filters" body-class="pb-2">
          <BCardTitle class="d-flex justify-content-between align-items-center">
            {{ $t("start.filter") }}
            <IBiInfo id="popover-info-target" variant="secondary" />
            <BPopover target="popover-info-target" triggers="hover, focus">
              <p>
                <b>{{ $t("suchen") }}:</b>
                {{ $t("start.suche-nach-einem-team-oder-einer-choreo") }}
              </p>
              <p>
                <b>{{ $t("team", 1) }}:</b>
                {{ $t("start.filtere-die-choreos-nach-teams") }}
              </p>
              <p>
                <b>{{ $t("season", 1) }}:</b>
                {{ $t("start.filtere-die-choreos-nach-season") }}
              </p>
              <p>
                <b>{{ $t("count", 2) }}:</b>
                {{ $t("start.filtere-die-choreo-nach-ihrer-laenge") }}
              </p>
              <hr />
              <p class="text-muted">
                {{ $t("start.aktiver-verein") }}: <b>{{ club?.name }}</b>
              </p>
            </BPopover>
          </BCardTitle>

          <BCollapse
            id="filter-collapse"
            v-model="filterCollapseVisible"
            class="mb-2"
          >
            <BInputGroup class="mb-4 mt-2">
              <BFormInput
                :placeholder="$t('suchen')"
                v-model="searchTerm"
                type="search"
              />
              <template #append>
                <BButton
                  :disabled="!searchTerm"
                  @click="() => (this.searchTerm = null)"
                >
                  <IBiX />
                </BButton>
              </template>
            </BInputGroup>

            <div v-if="teams.length > 0 || loading">
              <p class="mb-0 font-weight-bold font-italic text-muted">
                {{ $t("team", 1) }}
              </p>
              <BPlaceholderWrapper :loading="loading">
                <template #loading>
                  <BListGroup flush class="mb-2">
                    <BListGroupItem
                      v-for="(_, ix) in Array(2)"
                      :key="`teamSkeleton-${ix}`"
                    >
                      <BPlaceholder animation="wave" />
                    </BListGroupItem>
                  </BListGroup>
                </template>
                <template #default>
                  <BListGroup flush class="mb-2">
                    <BListGroupItem
                      v-for="team in teams"
                      :key="team.id"
                      :variant="
                        teamFilterIds.includes(team.id) ? 'dark' : 'light'
                      "
                      @click="() => addOrRemoveTeamFilter(team.id)"
                      class="d-flex justify-content-between align-items-center"
                      button
                    >
                      {{ team.name }}
                      <BBadge variant="light" pill>
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
                      </BBadge>
                    </BListGroupItem>
                  </BListGroup>
                </template>
              </BPlaceholderWrapper>
            </div>

            <div v-if="seasons.length > 0 || loading">
              <p class="mb-0 font-weight-bold font-italic text-muted">
                {{ $t("season", 1) }}
              </p>
              <BPlaceholderWrapper :loading="loading">
                <template #loading>
                  <BListGroup flush class="mb-2">
                    <BListGroupItem
                      v-for="(_, ix) in Array(2)"
                      :key="`seasonSkeleton-${ix}`"
                    >
                      <BPlaceholder animation="wave" />
                    </BListGroupItem>
                  </BListGroup>
                </template>
                <template #default>
                  <BListGroup flush class="mb-2">
                    <BListGroupItem
                      v-for="season in seasons"
                      :key="season.id"
                      :variant="
                        seasonFilterIds.includes(season.id) ? 'dark' : 'light'
                      "
                      @click="() => addOrRemoveSeasonFilter(season.id)"
                      class="d-flex justify-content-between align-items-center"
                      button
                    >
                      {{ season.name }}
                      <BBadge variant="light" pill>
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
                      </BBadge>
                    </BListGroupItem>
                  </BListGroup>
                </template>
              </BPlaceholderWrapper>
            </div>

            <div
              v-if="
                (choreos.length > 0 &&
                  Math.min(...choreos.map((c) => c.counts)) !=
                    Math.max(...choreos.map((c) => c.counts))) ||
                loading
              "
            >
              <p class="mb-0 font-weight-bold font-italic text-muted">
                {{ $t("count", 2) }}
              </p>
              <BPlaceholderWrapper :loading="loading">
                <template #loading>
                  <BFormGroup
                    :label="$t('start.min-laenge')"
                    label-class="label-with-colon"
                  >
                    <BPlaceholderButton animation="wave" variant="secondary" />
                    <BPlaceholder animation="wave" size="sm" width="50%" />
                  </BFormGroup>
                  <hr />
                  <BFormGroup
                    :label="$t('start.max-laenge')"
                    label-class="label-with-colon"
                  >
                    <BPlaceholderButton animation="wave" variant="secondary" />
                    <BPlaceholder animation="wave" size="sm" width="50%" />
                  </BFormGroup>
                </template>
                <template #default>
                  <BFormGroup
                    :label="$t('start.min-laenge')"
                    label-class="label-with-colon"
                    :description="`${Math.floor(minCount / 8)} ${$t(
                      'achter'
                    )} + ${minCount % 8}`"
                  >
                    <BFormInput
                      v-model="minCount"
                      :min="Math.min(...choreos.map((c) => c.counts))"
                      :max="Math.max(...choreos.map((c) => c.counts))"
                      type="range"
                    />
                  </BFormGroup>
                  <hr />
                  <BFormGroup
                    :label="$t('start.max-laenge')"
                    label-class="label-with-colon"
                    :description="`${Math.floor(maxCount / 8)} ${$t(
                      'achter'
                    )} + ${maxCount % 8}`"
                  >
                    <BFormInput
                      v-model="maxCount"
                      :min="Math.min(...choreos.map((c) => c.counts))"
                      :max="Math.max(...choreos.map((c) => c.counts))"
                      type="range"
                    />
                  </BFormGroup>
                </template>
              </BPlaceholderWrapper>
            </div>

            <div class="d-grid">
              <BButton
                class="mt-2"
                :disabled="
                  !this.searchTerm &&
                  this.teamFilterIds.length == 0 &&
                  this.seasonFilterIds.length == 0
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
                {{ $t("zuruecksetzen") }}
              </BButton>
            </div>
          </BCollapse>

          <div class="d-grid">
            <BButton
              v-if="$store.state.isMobile"
              variant="light"
              v-b-toggle.filter-collapse
            >
              <IBiCaretDownFill
                v-if="!filterCollapseVisible"
                variant="secondary"
              />
              <IBiCaretUpFill v-else variant="secondary" />
            </BButton>
          </div>
        </BCard>
      </BCol>

      <!-- CHOREOS -->
      <BCol>
        <BPlaceholderWrapper :loading="loading">
          <template #loading>
            <BListGroup flush>
              <BListGroupItem
                v-for="(_, ix) in Array(3)"
                :key="`choreoSkeleton-${ix}`"
              >
                <BPlaceholder
                  width="25%"
                  size="lg"
                  class="mb-2"
                  animation="wave"
                /><br />
                <BPlaceholder width="50%" animation="wave" /><br />
                <BPlaceholder width="25%" class="mb-3" animation="wave" />
              </BListGroupItem>
            </BListGroup>
          </template>
          <template #default>
            <BListGroup flush>
              <BListGroupItem
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
                  <IBiCaretDownFill variant="secondary" />
                  {{ team.name }}
                  ({{ seasonCountStringByTeam(team) }})
                </div>
                <BCollapse :id="`team-collapse-${team.id}`" class="ms-3">
                  <BListGroup flush>
                    <BListGroupItem
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
                        <IBiCaretDownFill variant="secondary" />
                        {{ seasonTeam.Season.name }}
                        ({{ choreoCountStringBySeasonTeam(seasonTeam) }})
                      </div>
                      <BCollapse
                        :id="`seasonTeam-collapse-${seasonTeam.id}`"
                        class="ms-3"
                      >
                        <BListGroup flush>
                          <BLink
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
                            :to="{
                              name: 'Choreo',
                              params: {
                                choreoId: choreo.id,
                                locale: $i18n.locale,
                              },
                            }"
                          >
                            <BListGroupItem variant="light" button href="#">
                              <b>
                                <BRow align-h="between" align-v="center">
                                  <BCol>
                                    {{ choreo.name }}
                                  </BCol>
                                  <BCol cols="auto">
                                    <BButtonGroup>
                                      <BButton
                                        variant="light"
                                        :to="{
                                          name: 'Video',
                                          params: {
                                            choreoId: choreo.id,
                                            locale: $i18n.locale,
                                          },
                                        }"
                                        v-b-tooltip.hover="
                                          $t('start.video-erstellen')
                                        "
                                      >
                                        <IBiFilm />
                                      </BButton>
                                      <BButton
                                        variant="light"
                                        :to="{
                                          name: 'PDF',
                                          params: {
                                            choreoId: choreo.id,
                                            locale: $i18n.locale,
                                          },
                                        }"
                                        v-b-tooltip.hover="
                                          $t('start.pdf-erstellen')
                                        "
                                      >
                                        <IBiFilePdf />
                                      </BButton>
                                    </BButtonGroup>
                                  </BCol>
                                </BRow>
                              </b>
                              <router-link
                                :to="{
                                  name: 'Team',
                                  params: {
                                    teamId: team.id,
                                    locale: $i18n.locale,
                                  },
                                }"
                                :style="{
                                  color: 'inherit',
                                  textDecoration: 'underline',
                                }"
                              >
                                {{ team.name }}
                              </router-link>
                              <p class="m-0">
                                {{ seasonTeam.Season.name }}
                              </p>
                              <p class="m-0">
                                {{ Math.floor(choreo.counts / 8) }}
                                {{ $t("achter") }}
                                {{
                                  choreo.counts % 8 > 0
                                    ? `+ ${choreo.counts % 8}`
                                    : ""
                                }}
                              </p>
                            </BListGroupItem>
                          </BLink>
                          <BListGroupItem
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
                            <IBiPlusSquare class="me-1" />
                            <u>{{ $t("start.choreo-hinzufuegen") }}</u>
                          </BListGroupItem>
                        </BListGroup>
                      </BCollapse>
                    </BListGroupItem>
                    <BListGroupItem
                      variant="light"
                      class="text-muted"
                      @click="() => $refs.createSeasonModal.open(team.id)"
                      href="#"
                    >
                      <IBiPlusSquare class="me-1" />
                      <u>{{ $t("start.saison-anfangen") }}</u>
                    </BListGroupItem>
                  </BListGroup>
                </BCollapse>
              </BListGroupItem>
              <BListGroupItem
                :variant="teams.length == 0 ? 'success' : 'light'"
                :class="{ 'text-muted': teams.length > 0 }"
                @click="() => $refs.createTeamModal.open()"
                href="#"
              >
                <IBiPlusSquare class="me-1" />
                <u>{{ $t("start.team-hinzufuegen") }}</u>
              </BListGroupItem>
            </BListGroup>

            <BCard
              v-if="teams.length == 0"
              :title="$t('start.hier-kannst-du-noch-nichts-finden')"
              class="mt-5"
            >
              <BCardText>
                {{ $t("start.noch-kein-team-angelegt") }}
              </BCardText>
            </BCard>
          </template>
        </BPlaceholderWrapper>
      </BCol>
    </BRow>

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
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed, getCurrentInstance } from "vue";
import CreateChoreoModal from "@/components/modals/CreateChoreoModal.vue";
import CreateClubModal from "@/components/modals/CreateClubModal.vue";
import CreateSeasonModal from "@/components/modals/CreateSeasonModal.vue";
import CreateTeamModal from "@/components/modals/CreateTeamModal.vue";
import ClubService from "@/services/ClubService";
import { error } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

/**
 * @vue-data {boolean} useFolderColors=true - Whether to use folder colors for teams and seasons.
 * @vue-data {Object|null} club=null - The currently active club, or null if no club is selected.
 * @vue-data {Array} teams - List of teams in the club, sorted by name.
 * @vue-data {Array} seasons - List of seasons across all teams, sorted by year.
 * @vue-data {Array} teamFilterIds - List of team IDs to filter choreos by.
 * @vue-data {Array} seasonFilterIds - List of season IDs to filter choreos by.
 * @vue-data {string|null} searchTerm=null - The search term for filtering choreos.
 * @vue-data {number} minCount=0 - Minimum count of choreos to filter by.
 * @vue-data {number} maxCount=400 - Maximum count of choreos to filter by.
 * @vue-data {boolean} loading=true - Whether the data is currently loading.
 * @vue-data {boolean} filterCollapseVisible=false - Whether the filter section is expanded or collapsed.
 *
 * @vue-computed {Array} choreos - Flattened list of all choreos across all teams and seasons, sorted by update date.
 *
 * @vue-computed {MetaInfo} metaInfo
 */
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
    filterCollapseVisible: false,
  }),
  mounted() {
    this.load();

    const { proxy } = getCurrentInstance();

    useHead({
      title: computed(() => proxy.$t("nav.start")),
      meta: [
        {
          name: "description",
          content: computed(() => proxy.$t("meta.defaults.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => proxy.$t("meta.defaults.description")),
        },
        {
          property: "og:description",
          content: computed(() => proxy.$t("meta.defaults.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${proxy.$t("general.ChoreoPlaner")} | ${proxy.$t(
                "meta.defaults.title"
              )}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${proxy.$t("general.ChoreoPlaner")} | ${proxy.$t(
                "meta.defaults.title"
              )}`
          ),
        },
      ],
    });
  },
  methods: {
    load() {
      this.filterCollapseVisible = !this.$store.state.isMobile;
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
    addChoreo() {
      this.load();
    },
    onTeamCreated(team) {
      this.$router
        .push({
          name: "Team",
          params: { teamId: team.id, locale: this.$i18n.locale },
        })
        .catch(() => {
          error("Redundant navigation to team", ERROR_CODES.REDUNDANT_ROUTING);
        });
    },
    choreoCountStringBySeasonTeam(seasonTeam) {
      const count = seasonTeam.Choreos.filter(
        (c) => c.counts >= this.minCount && c.counts <= this.maxCount
      ).length;
      return `${count} ${this.$t("choreo", count)}`;
    },
    seasonCountStringByTeam(team) {
      const count = team.SeasonTeams.filter(
        (st) =>
          this.seasonFilterIds.length == 0 ||
          this.seasonFilterIds.includes(st.Season.id)
      ).flat(Infinity).length;
      return `${count} ${this.$t("season", count)}`;
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
