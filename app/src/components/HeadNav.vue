<template>
  <b-navbar toggleable="sm">
    <b-navbar-brand :to="{ name: 'Home' }">
      <img
        :src="
          $store.getters.isChristmasTime
            ? '/Icon-Christmas.png'
            : $store.getters.isEasterTime
            ? '/Icon-Easter.png'
            : '/Icon.png'
        "
        alt="Cheerleaderin-Icon, das ein Rad schlägt"
        width="50"
      />
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item
          :to="{ name: 'Home' }"
          v-bind:active-class="
            $route.name == 'Home' ? 'router-link-active' : ''
          "
        >
          Start
        </b-nav-item>
        <b-nav-item :to="{ name: 'Start' }" :disabled="!$store.state.loggedIn">
          Übersicht
        </b-nav-item>

        <b-nav-item-dropdown text="Choreos" :disabled="!$store.state.loggedIn">
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Choreo' }">
              Choreos
            </span>
          </template>
          <b-dropdown-group
            v-for="team in teams.filter((t) =>
              t.SeasonTeams.some((st) => st.Choreos?.length > 0)
            )"
            :key="team.id"
            :header="team.name"
          >
            <b-dropdown-text
              v-for="seasonTeam in team.SeasonTeams.filter(
                (st) => st.Choreos?.length > 0
              )"
              :key="seasonTeam.id"
              v-b-toggle="`collapse-${seasonTeam.id}`"
              class="dropdown-submenu"
            >
              <span class="d-flex justify-content-between align-items-center">
                {{ seasonTeam.Season.name }}
                <b-icon-caret-down-fill class="ml-auto" variant="secondary" />
              </span>
              <b-collapse :id="`collapse-${seasonTeam.id}`">
                <b-dropdown-item
                  v-for="choreo in seasonTeam.Choreos"
                  :key="choreo.id"
                  :to="{ name: 'Choreo', params: { choreoId: choreo.id } }"
                >
                  {{ choreo.name }}
                </b-dropdown-item>
              </b-collapse>
            </b-dropdown-text>
            <b-dropdown-divider />
          </b-dropdown-group>
          <b-dropdown-item
            variant="success"
            @click="() => $refs.createChoreoModal.open()"
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            Neue Choreo
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown :disabled="!$store.state.loggedIn">
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Team' }">
              Teams
            </span>
          </template>
          <b-dropdown-item
            v-for="team in teams"
            :key="team.id"
            :to="{ name: 'Team', params: { teamId: team.id } }"
          >
            {{ team.name }}
          </b-dropdown-item>
          <b-dropdown-divider v-if="teams && teams.length > 0" />
          <b-dropdown-item
            variant="success"
            @click="() => $refs.createTeamModal.open()"
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            Neues Team
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto align-items-sm-center">
        <b-nav-item
          class="d-sm-block d-none"
          v-if="onlineStatus != null"
          v-b-tooltip.hover
          :title="
            onlineStatus
              ? 'Server sind online' + (serverVersion && ` (${serverVersion})`)
              : 'Server sind offline'
          "
        >
          <b-icon-check-circle variant="success" v-if="onlineStatus === true" />
          <b-icon-x-circle variant="danger" v-if="onlineStatus === false" />
        </b-nav-item>
        <b-nav-item :to="{ name: 'Help' }">Hilfe</b-nav-item>
        <b-nav-item>
          <b-button
            variant="primary"
            :to="{ name: 'Login' }"
            v-if="!$store.state.loggedIn"
            :block="$vuetify.breakpoint.xs"
          >
            Anmelden / Registrieren
          </b-button>
          <b-dropdown
            v-else
            :variant="$vuetify.breakpoint.xs ? 'outline-secondary' : 'light'"
            right
            :block="$vuetify.breakpoint.xs"
          >
            <template #button-content>
              <b-icon-person-circle />
              <span v-if="$vuetify.breakpoint.xs" class="mx-2">{{
                user?.username
              }}</span>
            </template>
            <b-dropdown-group header="Konto">
              <b-dropdown-item :to="{ name: 'Account' }">
                <b-icon-person-circle class="mr-2" />{{ user?.username }}
              </b-dropdown-item>
            </b-dropdown-group>

            <b-dropdown-divider />

            <b-dropdown-group header="Vereine">
              <b-dropdown-item
                v-for="club in clubs"
                :key="club.id"
                :variant="club.id == $store.state.clubId ? 'primary' : null"
                @click="selectCurrentClub(club.id)"
              >
                {{ club.name }}
              </b-dropdown-item>
            </b-dropdown-group>
            <b-dropdown-item
              variant="success"
              @click="() => $refs.createClubModal.open()"
            >
              <b-icon-plus />
              Neuer Verein
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item variant="danger" @click="logout">
              <b-icon-door-open class="mr-2" />
              Ausloggen
            </b-dropdown-item>
          </b-dropdown>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>

    <CreateClubModal ref="createClubModal" @clubCreated="reloadPage" />

    <CreateChoreoModal
      ref="createChoreoModal"
      :teams="teams"
      @addChoreo="reloadPage"
    />

    <CreateTeamModal
      ref="createTeamModal"
      @teamCreated="onTeamCreated"
      v-if="$store.state.loggedIn"
    />
  </b-navbar>
</template>

<script>
import AuthService from "@/services/AuthService";
import ClubService from "@/services/ClubService";
import CreateChoreoModal from "./modals/CreateChoreoModal.vue";
import CreateClubModal from "./modals/CreateClubModal.vue";
import CreateTeamModal from "./modals/CreateTeamModal.vue";

export default {
  name: "HeadNav",
  components: { CreateChoreoModal, CreateClubModal, CreateTeamModal },
  data: () => ({
    teams: [],
    choreos: [],
    clubs: [],
    user: null,
  }),
  props: {
    onlineStatus: {
      type: Boolean,
    },
    serverVersion: {
      type: String,
      default: null,
    },
  },
  methods: {
    load() {
      if (this.$store.state.loggedIn) {
        AuthService.getUserInfo().then((user) => {
          this.user = user;
        });

        if (this.$store.state.clubId) {
          ClubService.getById(this.$store.state.clubId).then((club) => {
            this.teams = club?.Teams || [];
            this.choreos = this.teams
              .map((t) => t.SeasonTeams.map((st) => st.Choreos))
              .flat(Infinity);
          });
        }

        ClubService.getAll().then((clubList) => {
          this.clubs = clubList;
          const club = clubList[0];
          if (!club) return;
          if (!this.$store.state.clubId)
            this.$store.commit("setClubId", club.id);
          this.teams = club?.Teams || [];
          this.choreos = this.teams.map((t) => t.Choreos).flat();
        });
      }
    },
    checkEmailConfirmation() {
      if (this.user?.email && !this.user?.emailConfirmed) {
        this.$bvToast.toast(
          "Du solltest den Link zur Bestätigung in deinem Postfach finden. Bitte überprüfe auch deinen Spam-Ordner.",
          {
            variant: "warning",
            title: "Bitte bestätige deine E-Mail-Adresse",
            appendToast: true,
            solid: true,
            autoHideDelay: 10_000,
          }
        );
      }
    },
    logout() {
      AuthService.logout();
    },
    selectCurrentClub(id) {
      this.$store.commit("setClubId", id);
    },
    onTeamCreated(team) {
      this.teams.push(team);
      this.$router.push({ name: "Team", params: { teamId: team.id } });
    },
    reloadPage() {
      location.reload();
    },
  },
  watch: {
    "$store.state.loggedIn": {
      handler() {
        this.load();
      },
      immediate: true,
    },
    "$store.state.clubId": {
      handler() {
        this.load();
      },
      immediate: true,
    },
  },
  created() {
    this.load();
    setTimeout(this.checkEmailConfirmation, 1000);
    setInterval(this.load, 60_000);
  },
};
</script>

<style lang="scss" scoped>
.dropdown-submenu:hover:not(:has(div.collapse:hover)) {
  color: #16181b;
  background-color: #e9ecef;
}
</style>
