<template>
  <b-modal
    :id="`modal-newTeam-${id}`"
    :title="$t('nav.neues-team')"
    centered
    @show="resetTeamModal"
    @ok="createTeam"
  >
    <b-form>
      <b-form-group
        :label="$t('name')"
        label-class="label-with-colon"
        :state="newTeamNameIsValid"
        :invalid-feedback="newTeamNameStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <b-form-input
          v-model="newTeamName"
          :state="newTeamNameIsValid"
          required
          :placeholder="$t('modals.create-team.example-team-names')"
          autofocus
        />
      </b-form-group>
      <b-form-group
        :label="$t('season', 1)"
        label-class="label-with-colon"
        :state="seasonIsValid"
        :invalid-feedback="seasonStateFeedback"
      >
        <b-form-select
          v-model="seasonId"
          :state="seasonIsValid"
          required
          :options="this.seasonSelectOptions"
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        @click="ok"
        variant="success"
        :disabled="!newTeamNameIsValid || !seasonIsValid"
      >
        {{ $t("erstellen") }}
      </b-button>
      <b-button @click="cancel" variant="danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import SeasonService from "@/services/SeasonService";
import TeamService from "@/services/TeamService";

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
      this.$bvModal.show(`modal-newTeam-${this.id}`);
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
