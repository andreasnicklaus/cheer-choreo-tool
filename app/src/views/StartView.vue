<template>
  <b-container id="startView">
    <b-row>
      <!-- FILTER -->
      <b-col cols="12" lg="3">
        <b-card class="filters">
          <b-card-title
            class="d-flex justify-content-between align-items-center"
          >
            Filter
            <b-icon-info id="popover-info-target" variant="secondary" />
            <b-popover target="popover-info-target" triggers="hover">
              <p><b>Suchen:</b> Suche nach einem Team oder einer Choreo</p>
              <p><b>Team:</b> Filtere die Choreos nach Teams</p>
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
                        filteredChoreos.filter((c) => c.TeamId == team.id)
                          .length
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

      <!-- CHOREOS -->
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
                <h5>
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
                          :to="{ name: 'PDF', params: { choreoId: choreo.id } }"
                        >
                          <b-icon-file-pdf />
                        </b-button>
                      </b-button-group>
                    </b-col>
                  </b-row>
                </h5>
                <router-link
                  :to="{
                    name: 'Team',
                    params: {
                      teamId: teams.find((t) => t.id == choreo.TeamId)?.id,
                    },
                  }"
                  :style="{ color: 'inherit' }"
                >
                  {{ teams.find((t) => t.id == choreo.TeamId)?.name }}
                </router-link>
                <p>
                  {{ Math.floor(choreo.counts / 8) }} Achter
                  {{ choreo.counts % 8 > 0 ? `+ ${choreo.counts % 8}` : "" }}
                </p>
              </b-list-group-item>
              <b-list-group-item>
                <b-button
                  block
                  variant="light"
                  class="text-muted"
                  v-b-modal.modal-newChoreo
                >
                  <b-icon-plus />
                  Neue Choreo anlegen
                </b-button>
              </b-list-group-item>
            </b-list-group>

            <b-card
              v-if="teams.length == 0 || choreos.length == 0"
              title="Hier kannst du noch nichts finden..."
              class="mt-5"
            >
              <b-card-text>
                Du hast aktuell hier nichts zu sehen, weil du
                <b>{{ teams.length }}</b> Teams und
                <b>{{ choreos.length }}</b> Choreos angelegt hast.
              </b-card-text>
              <b-card-body>
                <b-row>
                  <b-col cols="6">
                    <b-card title="Team anlegen">
                      <b-card-text class="m-0">
                        Wähle im Menü oben den Reiter
                      </b-card-text>
                      <b-dropdown
                        variant="light"
                        text="Teams"
                        disabled
                      ></b-dropdown>
                      <b-card-text class="mb-2">
                        aus und klicke auf
                      </b-card-text>
                      <span
                        :style="{
                          color: 'var(--success)',
                        }"
                      >
                        <b-icon-plus />
                        Neues Team
                      </span>
                    </b-card>
                  </b-col>
                  <b-col cols="6">
                    <b-card title="Choreo anlegen">
                      <b-card-text class="m-0">
                        Wähle im Menü oben den Reiter
                      </b-card-text>
                      <b-dropdown
                        variant="light"
                        text="Choreos"
                        disabled
                      ></b-dropdown>
                      <b-card-text class="mb-2">
                        aus und klicke auf
                      </b-card-text>
                      <span
                        :style="{
                          color: 'var(--success)',
                        }"
                      >
                        <b-icon-plus />
                        Neue Choreo
                      </span>
                    </b-card>
                  </b-col>
                </b-row>
              </b-card-body>
            </b-card>
          </template>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>

    <b-modal
      id="modal-newClub"
      title="Neuer Verein"
      centered
      @close="(event) => event.preventDefault()"
      no-close-on-backdrop
      no-close-on-esc
      @show="resetClubModal"
      @ok="createClub"
      hide-header-close
    >
      <b-form>
        <b-form-group label="Vereinsname" :state="newClubNameIsValid">
          <b-form-input
            v-model="newClubName"
            :state="newClubNameIsValid"
            required
            placeholder="TSG Salach e.V., Glamorous Cheerleader, ..."
          />
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok }">
        <b-button @click="ok" variant="success" :disabled="!newClubName">
          Erstellen
        </b-button>
      </template>
    </b-modal>

    <b-modal
      id="modal-newChoreo"
      title="Neue Choreo"
      centered
      @show="resetChoreoModal"
      @ok="createChoreo"
    >
      <b-form>
        <b-form-group label="Name" :state="newChoreoNameIsValid">
          <b-form-input
            v-model="newChoreoName"
            :state="newChoreoNameIsValid"
            required
            autofocus
            :placeholder="`Landesmeisterschaft, RM ${new Date().getFullYear()}, ...`"
          />
        </b-form-group>
        <b-form-group label="Länge">
          <b-row>
            <b-col>
              <b-form-group
                description="Achter"
                :state="newChoreoAchterIsValid"
              >
                <b-form-input
                  type="number"
                  min="1"
                  v-model="newChoreoAchter"
                  :state="newChoreoAchterIsValid"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group
                description="Counts (Zusätzliche Counts nach den Achtern)"
                :state="newChoreoCountIsValid"
              >
                <b-form-input
                  type="number"
                  min="0"
                  max="7"
                  v-model="newChoreoCount"
                  :state="newChoreoCountIsValid"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-form-group>
        <b-form-group label="Team" :state="newChoreoTeamIsValid">
          <b-form-select
            v-model="newChoreoTeamId"
            :state="newChoreoTeamIsValid"
            required
            :options="teams.map((t) => ({ value: t.id, text: t.name }))"
          />
        </b-form-group>
        <!-- TODO: Exclude Members -->
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button
          @click="ok"
          variant="success"
          :disabled="
            !newChoreoNameIsValid ||
            !newChoreoCountIsValid ||
            !newChoreoAchterIsValid ||
            !newChoreoTeamIsValid
          "
        >
          Erstellen
        </b-button>
        <b-button @click="cancel" variant="danger">Abbrechen</b-button>
      </template>
    </b-modal>
  </b-container>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";

export default {
  name: "StartView",
  data: () => ({
    club: null,
    teams: [],
    choreos: [],
    teamFilterIds: [],
    searchTerm: null,
    minCount: 0,
    maxCount: 400,
    loading: true,
    newClubName: null,
    newChoreoName: null,
    newChoreoAchter: 1,
    newChoreoCount: 0,
    newChoreoTeamId: null,
  }),
  mounted() {
    this.load();
  },
  methods: {
    load() {
      if (this.$store.state.clubId) {
        ClubService.getById(this.$store.state.clubId).then((club) => {
          if (!club) this.$store.commit("setClubId", null);
          else {
            this.club = club;
            this.teams = club?.Teams || [];
            this.choreos = this.teams.map((t) => t.Choreos).flat();
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
      } else {
        ClubService.getAll().then((clubList) => {
          if (clubList.length == 0) {
            this.$bvModal.show("modal-newClub");
          } else {
            const club = clubList[0];
            this.club = club;
            this.$store.commit("setClubId", club.id);
            this.teams = club?.Teams || [];
            this.choreos = this.teams.map((t) => t.Choreos).flat();
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
      }
    },
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
    resetClubModal() {
      this.newClubName = null;
    },
    createClub() {
      ClubService.create(this.newClubName).then((club) => {
        this.$store.commit("setClubId", club.id);
        this.$bvModal.hide("modal-newClub");
        this.load();
      });
    },
    resetChoreoModal() {
      this.newChoreoName = null;
      this.newChoreoAchter = 1;
      this.newChoreoCount = 0;
      this.newChoreoTeamId = this.teams[0]?.id;
    },
    createChoreo() {
      const count =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      ChoreoService.create(
        this.newChoreoName,
        count,
        this.newChoreoTeamId
      ).then((choreo) => {
        this.choreos = [...this.choreos, choreo];
      });
    },
  },
  computed: {
    filteredChoreos() {
      let result = this.choreos;
      if (this.teamFilterIds.length > 0)
        result = result.filter((r) => this.teamFilterIds.includes(r.TeamId));
      if (this.searchTerm)
        result = result.filter(
          (c) =>
            c.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            c.id.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
            this.teams
              .find((t) => t.id == c.TeamId)
              ?.name.toLowerCase()
              .includes(this.searchTerm.toLowerCase())
        );
      result = result.filter(
        (c) => c.counts >= this.minCount && c.counts <= this.maxCount
      );
      return result;
    },
    newClubNameIsValid() {
      return this.newClubName != null && this.newClubName.length > 0;
    },
    newChoreoNameIsValid() {
      return this.newChoreoName != null && this.newChoreoName.length >= 2;
    },
    newChoreoCountIsValid() {
      return (
        this.newChoreoCount != null &&
        this.newChoreoCount !== "" &&
        parseInt(this.newChoreoCount) >= 0 &&
        parseInt(this.newChoreoCount) <= 7
      );
    },
    newChoreoAchterIsValid() {
      return (
        this.newChoreoAchter != null &&
        this.newChoreoAchter !== "" &&
        parseInt(this.newChoreoAchter) > 0
      );
    },
    newChoreoTeamIsValid() {
      return (
        this.newChoreoTeamId != null &&
        this.teams.map((t) => t.id).includes(this.newChoreoTeamId)
      );
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
</style>
