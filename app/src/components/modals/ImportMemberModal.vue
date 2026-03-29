<template>
  <BModal
    :id="`modal-importMember-${id}`"
    ref="modal"
    centered
    :title="$t('modals.import-member.team-mitglied-importieren')"
    @show="reset"
    @ok="importMembers"
  >
    <BFormGroup
      :label="$t('team', 1)"
      label-class="label-with-colon"
      :state="teamIdIsValid"
      :invalid-feedback="teamIdStateFeedback"
    >
      <BFormSelect
        v-model="teamId"
        :options="teamOptions"
        :state="teamIdIsValid"
      />
    </BFormGroup>
    <BFormGroup
      :label="$t('season', 1)"
      label-class="label-with-colon"
      :state="seasonIdIsValid"
      :invalid-feedback="seasonIdStateFeedback"
    >
      <BFormSelect
        v-model="seasonId"
        :options="seasonOptions"
        :state="seasonIdIsValid"
      />
    </BFormGroup>
    <BFormGroup
      :label="$t('modals.import-member.team-mitglied')"
      label-class="label-with-colon"
      :state="memberIdsIsValid"
      :invalid-feedback="memberIdsStateFeedback"
    >
      <BFormCheckboxGroup
        v-model="memberIds"
        :options="memberOptions"
        :state="memberIdsIsValid"
        stacked
        :style="{ columnCount: 2 }"
      />
    </BFormGroup>
    <template #footer="{ ok, cancel }">
      <BButton
        variant="success"
        :disabled="!teamId || !seasonId || !memberIds || memberIds.length == 0"
        @click="ok"
        >{{ $t("teamView.importieren") }}</BButton
      >
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script>
import SeasonTeamService from "@/services/SeasonTeamService";

/**
 * @module Modal:ImportMemberModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} teamId=null
 * @vue-data {String|null} seasonId=null
 * @vue-data {Array} memberIds
 *
 * @vue-prop {Array} teams
 * @vue-prop {String} currentTeamId
 * @vue-prop {String} currentSeasonTeamId
 *
 * @vue-computed {Array} teamOptions
 * @vue-computed {Object|null} selectedTeam
 * @vue-computed {Array} seasonOptions
 * @vue-computed {Object|null} selectedSeasonTeam
 * @vue-computed {Array} memberOptions
 * @vue-computed {Boolean} teamIdIsValid
 * @vue-computed {String|null} teamIdStateFeedback
 * @vue-computed {Boolean} seasonIdIsValid
 * @vue-computed {String|null} seasonIdStateFeedback
 * @vue-computed {Boolean} memberIdsIsValid
 * @vue-computed {String|null} memberIdsStateFeedback
 *
 * @vue-event {Array} import
 *
 * @example
 * <template>
 *  <ImportMemberModal ref="importMemberModal" :teams="teams" currentTeamId="1" currentSeasonTeamId="2" @import="handler" />
 *  <Button @click="() => $refs.importMemberModal.open()" />
 * </template>
 */
export default {
  name: "ImportMemberModal",
  props: {
    teams: {
      type: Array,
      default: () => [],
    },
    currentTeamId: {
      type: String,
      default: null,
    },
    currentSeasonTeamId: {
      type: String,
      default: null,
    },
  },
  emits: ["import"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    teamId: null,
    seasonId: null,
    memberIds: [],
  }),
  computed: {
    teamOptions() {
      if (!this.teams || this.teams.length === 0) return [];
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
      if (!this.teams || this.teams.length === 0) return null;
      return this.teams.find((t) => t.id == this.teamId);
    },
    seasonOptions() {
      if (!this.selectedTeam || !this.selectedTeam.SeasonTeams) return [];
      return this.selectedTeam.SeasonTeams.filter(
        (st) => st.id != this.currentSeasonTeamId && st.Season?.id
      ).map((st) => ({
        text: st.Season?.name || "Unknown",
        value: st.Season.id,
      }));
    },
    selectedSeasonTeam() {
      if (!this.selectedTeam || !this.selectedTeam.SeasonTeams) return null;
      if (!this.seasonId) return null;
      return this.selectedTeam.SeasonTeams.find(
        (st) => st.Season?.id == this.seasonId
      );
    },
    memberOptions() {
      if (!this.selectedSeasonTeam || !this.selectedSeasonTeam.Members)
        return [];
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
        return this.$t(
          "modals.import-member.fuer-das-team-this-selectedteam-name-gibt-es-bisher-keine-andere-season",
          [this.selectedTeam?.name]
        );
      if (!this.teamId) return this.$t("erforderlich");
      return null;
    },
    seasonIdIsValid() {
      return Boolean(this.seasonId);
    },
    seasonIdStateFeedback() {
      if (!this.seasonId) return this.$t("erforderlich");
      return null;
    },
    memberIdsIsValid() {
      return Boolean(this.memberIds) && this.memberIds.length > 0;
    },
    memberIdsStateFeedback() {
      if (!this.memberIds || this.memberIds.length == 0)
        return this.$t("erforderlich");
      return null;
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
  methods: {
    open() {
      this.$refs.modal.show();
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
};
</script>
