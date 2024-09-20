<template>
  <b-container class="team">
    <EditableNameHeading
      name="Team"
      :value="teams?.find((t) => t.id == teamId)?.name"
      class="mb-3"
      @input="onNameEdit"
    />

    <b-row align-h="between" class="px-3 mb-4">
      <b-dropdown
        :text="teams.find((t) => t.id == teamId)?.name || 'Wähle ein Team'"
        variant="outline-primary"
      >
        <b-dropdown-item
          v-for="team in teams"
          :key="team.id"
          :to="{ name: 'Team', params: { teamId: team.id } }"
          :variant="team.id == teamId ? 'primary' : 'outline-primary'"
        >
          {{ team.name }}
        </b-dropdown-item>
      </b-dropdown>

      <b-button-group>
        <b-button
          :variant="presentation == 'table' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'table')"
        >
          <b-icon-table />
        </b-button>
        <b-button
          :variant="presentation == 'list' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'list')"
        >
          <b-icon-list-ul />
        </b-button>
        <b-button
          :variant="presentation == 'grid' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'grid')"
        >
          <b-icon-grid />
        </b-button>
      </b-button-group>
    </b-row>

    <b-table
      v-if="presentation == 'table'"
      :items="currentTeam?.members"
      :fields="tableFields"
    />

    <b-list-group v-if="presentation == 'list'">
      <b-list-group-item
        v-for="member in sortedMembersOfCurrentTeam"
        :key="member.id"
        class="d-flex justify-content-between align-items-center"
      >
        {{ member.name }} {{ member.nickname ? `(${member.nickname})` : "" }}
        <b-badge v-if="member.abbreviation" variant="primary">{{
          member.abbreviation
        }}</b-badge>
      </b-list-group-item>
    </b-list-group>

    <b-row v-if="presentation == 'grid'">
      <b-col v-for="member in sortedMembersOfCurrentTeam" :key="member.id">
        <b-card variant="primary" :title="member.name" class="w-100 h-100">
          <b-card-text>
            {{ member.nickname }}
            <b-badge v-if="member.abbreviation" variant="primary">
              {{ member.abbreviation }}
            </b-badge>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import TeamService from "@/services/TeamService";

export default {
  name: "TeamView",
  components: { EditableNameHeading },
  data: () => ({
    presentation: "table",
    teamId: null,
    teams: [],
    tableFields: [
      { key: "name", sortable: true },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
    ],
    editTeamName: false,
  }),
  mounted() {
    TeamService.getAll().then((teams) => {
      this.teams = teams;
    });
  },
  computed: {
    currentTeam() {
      if (!this.teamId || !this.teams) return null;

      return this.teams.find((t) => t.id == this.teamId);
    },
    sortedMembersOfCurrentTeam() {
      if (!this.currentTeam?.members) return [];
      return [...this.currentTeam?.members].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
  },
  methods: {
    setTeamName() {
      // TODO
    },
    saveMember(member) {
      console.log(member);
      // TODO
    },
    onNameEdit(nameNew) {
      console.log(nameNew);
      // TODO
    },
  },
  watch: {
    "$route.params": {
      handler() {
        this.teamId = this.$route.params.teamId;
      },
      immediate: true,
    },
  },
};
</script>
