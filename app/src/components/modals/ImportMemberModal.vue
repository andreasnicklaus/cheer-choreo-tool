<template>
  <b-modal
    :id="`modal-importMember-${id}`"
    centered
    @show="reset"
    @ok="importMembers"
    title="Team-Mitglied importieren"
  >
    <b-form-group
      label="Team:"
      :state="teamIdIsValid"
      :invalid-feedback="teamIdStateFeedback"
    >
      <b-select
        v-model="teamId"
        :options="teamOptions"
        :state="teamIdIsValid"
      />
    </b-form-group>
    <b-form-group
      label="Season:"
      :state="seasonIdIsValid"
      :invalid-feedback="seasonIdStateFeedback"
    >
      <b-select
        v-model="seasonId"
        :options="seasonOptions"
        :state="seasonIdIsValid"
      />
    </b-form-group>
    <b-form-group
      label="Team-Mitglied:"
      :state="memberIdsIsValid"
      :invalid-feedback="memberIdsStateFeedback"
    >
      <b-checkbox-group
        v-model="memberIds"
        :options="memberOptions"
        :state="memberIdsIsValid"
        stacked
        :style="{ columnCount: 2 }"
      />
    </b-form-group>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success"> Importieren </b-button>
      <b-button @click="cancel" variant="outline-danger"> Abbrechen </b-button>
    </template>
  </b-modal>
</template>

<script>
import SeasonTeamService from "@/services/SeasonTeamService";

export default {
  name: "ImportMemberModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    teamId: null,
    seasonId: null,
    memberIds: [],
  }),
  props: {
    teams: {
      type: Array,
    },
    currentTeamId: {
      type: String,
    },
    currentSeasonTeamId: {
      type: String,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-importMember-${this.id}`);
    },
    reset() {
      this.teamId = this.currentTeamId;
      if (this.seasonOptions.length == 0) {
        this.teamId = this.teamOptions.filter(
          (to) => to.value != this.currentTeamId
        )[0]?.value;
      }
      this.seasonId = this.seasonOptions[0]?.value;
      this.memberIds = [];
    },
    importMembers() {
      SeasonTeamService.importMembers(
        this.currentSeasonTeamId,
        this.memberIds
      ).then((members) => {
        this.$emit("import", members);
      });
    },
  },
  watch: {
    seasonId: {
      handler() {
        this.memberIds = [];
      },
    },
    teamId: {
      handler() {
        this.memberIds = [];
      },
    },
  },
  computed: {
    teamOptions() {
      return (
        this.teams
          // .filter((t) => t.id != this.currentTeamId)
          .map((t) => ({
            text: t.name,
            value: t.id,
          }))
      );
    },
    selectedTeam() {
      return this.teams.find((t) => t.id == this.teamId);
    },
    seasonOptions() {
      if (!this.selectedTeam) return [];
      return this.selectedTeam.SeasonTeams.filter(
        (st) => st.id != this.currentSeasonTeamId
      ).map((st) => ({
        text: st.Season.name,
        value: st.Season.id,
      }));
    },
    selectedSeasonTeam() {
      if (!this.selectedTeam) return null;
      return this.selectedTeam.SeasonTeams.find(
        (st) => st.Season.id == this.seasonId
      );
    },
    memberOptions() {
      if (!this.selectedSeasonTeam) return [];
      return this.selectedSeasonTeam.Members.map((m) => ({
        text: m.name,
        value: m.id,
      }));
    },
    teamIdIsValid() {
      return Boolean(this.teamId) && this.seasonOptions.length > 0;
    },
    teamIdStateFeedback() {
      if (this.seasonOptions.length == 0)
        return `Für das Team ${this.selectedTeam?.name} gibt es bisher keine andere Season`;
      if (!this.teamId) return "Erforderlich";
      return null;
    },
    seasonIdIsValid() {
      return Boolean(this.seasonId);
    },
    seasonIdStateFeedback() {
      if (!this.seasonId) return "Erforderlich";
      return null;
    },
    memberIdsIsValid() {
      return Boolean(this.memberIds) && this.memberIds.length > 0;
    },
    memberIdsStateFeedback() {
      if (!this.memberIds || this.memberIds.length == 0) return "Erforderlich";
      return null;
    },
  },
};
</script>
