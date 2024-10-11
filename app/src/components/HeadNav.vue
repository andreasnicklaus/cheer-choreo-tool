<template>
  <b-navbar toggleable="sm">
    <b-navbar-brand :to="{ name: 'Home' }">
      <img src="/Icon.png" alt="" width="50" />
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item :to="{ name: 'Start' }" :disabled="!$store.state.loggedIn"
          >Start</b-nav-item
        >

        <b-nav-item-dropdown text="Choreos" :disabled="!$store.state.loggedIn">
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
          <b-dropdown-item
            variant="success"
            v-b-modal.modal-newChoreo-header
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            Neue Choreo
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown text="Teams" :disabled="!$store.state.loggedIn">
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
            v-b-modal.modal-newTeam-header
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            Neues Team
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto align-items-sm-center align-items-start">
        <b-nav-item
          class="d-sm-block d-none"
          v-if="onlineStatus != null"
          v-b-tooltip.hover
          :title="onlineStatus ? 'Server sind online' : 'Server sind offline'"
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
          >
            Anmelden / Registrieren
          </b-button>
          <b-dropdown v-else variant="light" right>
            <template #button-content> <b-icon-person-circle /> </template>
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
            <b-dropdown-item variant="success" v-b-modal.modal-newClub-header>
              <b-icon-plus />
              Neuer Verein
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item variant="danger" @click="logout">
              <b-icon-door-open class="mr-2" />Ausloggen
            </b-dropdown-item>
          </b-dropdown>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>

    <b-modal
      id="modal-newClub-header"
      title="Neuer Verein"
      centered
      @show="resetClubModal"
      @ok="createAndSelectClub"
    >
      <b-form>
        <b-form-group label="Vereinsname" :state="newClubNameIsValid">
          <b-form-input
            v-model="newClubName"
            :state="newClubNameIsValid"
            required
          />
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="success" :disabled="!newClubName">
          Erstellen
        </b-button>
        <b-button @click="cancel" variant="danger">Abbrechen</b-button>
      </template></b-modal
    >

    <b-modal
      id="modal-newChoreo-header"
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

    <b-modal
      id="modal-newTeam-header"
      title="Neues Team"
      centered
      @show="resetTeamModal"
      @ok="createTeam"
    >
      <b-form>
        <b-form-group label="Name" :state="newTeamNameIsValid">
          <b-form-input
            v-model="newTeamName"
            :state="newTeamNameIsValid"
            required
          />
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="success" :disabled="!newTeamNameIsValid">
          Erstellen
        </b-button>
        <b-button @click="cancel" variant="danger">Abbrechen</b-button>
      </template>
    </b-modal>
  </b-navbar>
</template>

<script>
import AuthService from "@/services/AuthService";
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import TeamService from "@/services/TeamService";

export default {
  name: "HeadNav",
  data: () => ({
    teams: [],
    choreos: [],
    clubs: [],
    user: null,
    newClubName: null,
    newChoreoName: null,
    newChoreoAchter: 1,
    newChoreoCount: 0,
    newChoreoTeamId: null,
    newTeamName: null,
  }),
  props: {
    onlineStatus: {
      type: Boolean,
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
            this.choreos = this.teams.map((t) => t.Choreos).flat();
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
    logout() {
      AuthService.logout();
    },
    selectCurrentClub(id) {
      this.$store.commit("setClubId", id);
    },
    resetClubModal() {
      this.newClubName = null;
    },
    createAndSelectClub() {
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
        this.choreos.push(choreo);
        this.$router.push({ name: "Edit", params: { choreoId: choreo.id } });
      });
    },
    resetTeamModal() {
      this.newTeamName = null;
    },
    createTeam() {
      TeamService.create(this.newTeamName, this.$store.state.clubId).then(
        (team) => {
          this.teams.push(team);
          this.$router.push({ name: "Team", params: { teamId: team.id } });
        }
      );
    },
  },
  computed: {
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
    newTeamNameIsValid() {
      return this.newTeamName != null && this.newTeamName.length > 2;
    },
  },
  watch: {
    "$store.state.loggedIn": {
      handler() {
        this.load();
      },
    },
    "$store.state.clubId": {
      handler() {
        this.load();
      },
    },
  },
  mounted() {
    this.load();
  },
};
</script>
