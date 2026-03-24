<template>
  <BModal
    ref="modal"
    :id="`modal-newTeam-${id}`"
    :title="$t('nav.neues-team')"
    centered
    @show="resetTeamModal"
    @ok="createTeam"
  >
    <BForm>
      <BFormGroup
        :label="$t('name')"
        label-class="label-with-colon"
        :state="newTeamNameIsValid"
        :invalid-feedback="newTeamNameStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <BFormInput
          v-model="newTeamName"
          :state="newTeamNameIsValid"
          required
          :placeholder="$t('modals.create-team.example-team-names')"
          autofocus
        />
      </BFormGroup>
      <BFormGroup
        :label="$t('season', 1)"
        label-class="label-with-colon"
        :state="seasonIsValid"
        :invalid-feedback="seasonStateFeedback"
      >
        <BFormSelect
          v-model="seasonId"
          :state="seasonIsValid"
          required
          :options="this.seasonSelectOptions"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        @click="ok"
        variant="success"
        :disabled="!newTeamNameIsValid || !seasonIsValid"
      >
        {{ $t("erstellen") }}
      </BButton>
      <BButton @click="cancel" variant="danger">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import SeasonService from "@/services/SeasonService";
import TeamService from "@/services/TeamService";

/**
 * @module Modal:CreateTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newTeamName=null
 * @vue-data {Array} seasons
 * @vue-data {String|null} seasonId=null
 *
 * @vue-computed {Boolean} newTeamNameIsValid
 * @vue-computed {String|null} newTeamNameStateFeedback
 * @vue-computed {Array} seasonSelectOptions
 * @vue-computed {Boolean} seasonIsValid
 * @vue-computed {String|null} seasonStateFeedback
 *
 * @vue-event {string} teamCreated
 *
 * @example
 * <template>
 *  <CreateTeamModal ref="createTeamModal" @teamCreated="handler" />
 *  <Button @click="() => $refs.createTeamModal.open()" />
 * </template>
 */
export default {
  name: "CreateTeamModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newTeamName: null,
    seasons: [],
    seasonId: null,
  }),
  mounted() {
    this.load();
  },
  methods: {
    open() {
      this.load();
      this.$refs.modal.show();
    },
    load() {
      SeasonService.getAll().then((seasons) => {
        this.seasons = seasons.filter(
          (s) => s.year == null || s.year <= new Date().getFullYear() + 1
        );

        let currentRelevantYear = new Date().getFullYear();
        if (new Date().getMonth() <= 5) currentRelevantYear -= 1;
        const relevantCurrentSeasons = this.seasons.filter(
          (s) => s.year == currentRelevantYear
        );
        this.seasonId = relevantCurrentSeasons[0].id;
      });
    },
    resetTeamModal() {
      this.newTeamName = null;
    },
    createTeam() {
      TeamService.create(
        this.newTeamName,
        this.$store.state.clubId,
        this.seasonId
      ).then((team) => this.$emit("teamCreated", team));
    },
  },
  computed: {
    newTeamNameIsValid() {
      return this.newTeamName != null && this.newTeamName.length >= 3;
    },
    newTeamNameStateFeedback() {
      if (!this.newTeamName) return this.$t("erforderlich");
      if (this.newTeamName.length < 3)
        return this.$t("modals.create-team.min-team-name-laenge");
      return null;
    },
    seasonSelectOptions() {
      const years = Array.from(new Set(this.seasons.map((s) => s.year)));
      return years.map((y) => ({
        label: y
          ? `${this.$t("modals.create-lineup.start")} ${y}`
          : this.$t("modals.create-season.extra-events"),
        options: this.seasons
          .filter((s) => s.year == y)
          .map((s) => ({
            value: s.id,
            text: s.name,
          })),
      }));
    },
    seasonIsValid() {
      return (
        this.seasons.length > 0 &&
        this.seasonId != null &&
        this.seasons.map((s) => s.id).includes(this.seasonId)
      );
    },
    seasonStateFeedback() {
      if (!this.seasonId || this.seasons.length <= 0)
        return this.$t("erforderlich");
      if (!this.seasons.map((s) => s.id).includes(this.seasonId))
        return this.$t("errors.unerwarteter-fehler");
      return null;
    },
  },
};
</script>
