<template>
  <b-modal
    :id="`modal-newSeason-${id}`"
    title="Neue Season"
    size="xl"
    scrollable
    @show="reset"
    @ok="create"
  >
    <p class="text-muted">Team: {{ team?.name }}</p>
    <b-tabs fill v-model="tabIndex">
      <b-tab
        title="Reguläre Season"
        class="pt-2"
        :disabled="this.seasonSelectOptions.length == 0"
      >
        <b-form>
          <b-form-group
            label="Season:"
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
      </b-tab>
      <b-tab title="Extra Events" class="pt-2">
        <b-form>
          <b-form-group
            label="Name der Event-Gruppe:"
            :state="newSeasonNameIsValid"
            :invalid-feedback="newSeasonNameStateFeedback"
            valid-feedback="Gültig!"
          >
            <b-form-input
              v-model="newSeasonName"
              required
              placeholder="Sommer-Auftritte, ..."
              :state="newSeasonNameIsValid"
            />
          </b-form-group>
          <b-form-group
            label="Jahr:"
            :state="newSeasonYearIsValid"
            :invalid-feedback="newSeasonYearStateFeedback"
            valid-feedback="Gültig!"
          >
            <b-form-input
              v-model="newSeasonYear"
              type="number"
              :placeholder="new Date().getFullYear().toString()"
              :state="newSeasonYearIsValid"
            />
          </b-form-group>
        </b-form>
        <hr />
        <div class="text-muted">
          <p>
            <b>Name:</b>
            Der Name einer Extra-Season beschreibt für welchen Zweck oder
            Zeitraum ein Kader und Choreos bestehen.
          </p>
          <p class="mb-0">
            <b>Jahr:</b>
            Das Jahr einer Extra-Season hilft beim Sortieren. Lass das Feld
            leer, wenn der Kader keinem Jahr zuzuordnen ist.
          </p>
        </div>
      </b-tab>
    </b-tabs>

    <hr />

    <b-form-group
      label="Team-Mitglieder:"
      :state="newSeasonMembersIsValid"
      :invalid-feedback="newSeasonMembersStateFeedback"
    >
      <b-form-select
        v-model="seasonToCopyMembersFromId"
        :options="[
          { text: 'Keine Mitglieder kopieren', value: null },
          ...seasonToCopySelectOptions,
        ]"
        :state="newSeasonMembersIsValid"
      />
      <b-checkbox-group
        v-model="newSeasonMemberIds"
        :options="newMemberOptions"
        stacked
        :style="{ columnCount: 2 }"
        class="mt-2"
        :state="newSeasonMembersIsValid"
      />
    </b-form-group>

    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success" :disabled="!inputIsValid">
        Erstellen
      </b-button>
      <b-button @click="cancel" variant="danger">Abbrechen</b-button>
    </template>
  </b-modal>
</template>

<script>
import SeasonService from "@/services/SeasonService";
import SeasonTeamService from "@/services/SeasonTeamService";

export default {
  name: "CreateSeasonModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    tabIndex: 0,
    newSeasonName: null,
    newSeasonYear: null,
    seasons: [],
    seasonId: null,
    teamId: null,
    seasonsToCopy: [],
    seasonToCopyMembersFromId: null,
    newSeasonMemberIds: [],
  }),
  props: {
    teams: {
      type: Array,
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    open(teamId) {
      this.$bvModal.show(`modal-newSeason-${this.id}`);
      this.teamId = teamId;
      this.load();
    },
    load() {
      SeasonService.getAll().then((seasons) => {
        this.seasons = seasons.filter(
          (s) =>
            !this.team?.SeasonTeams.map((st) => st.Season.id).includes(s.id)
        );
        this.seasonsToCopy = seasons.filter((s) =>
          this.team?.SeasonTeams.map((st) => st.Season.id).includes(s.id)
        );
        this.seasonToCopyMembersFromId = null;
        this.newSeasonMemberIds = [];

        if (this.seasons.length > 0) this.seasonId = this.seasons[0].id;

        if (this.seasonSelectOptions.length == 0) this.tabIndex = 1;
      });
    },
    reset() {
      this.newSeasonName = null;
      this.newSeasonYear = null;
      this.seasonId = null;
      this.teamId = null;
      this.seasonToCopyMembersFromId = null;
      this.newSeasonMemberIds = [];
    },
    create() {
      if (this.tabIndex == 0)
        SeasonTeamService.create(
          this.team.id,
          this.seasonId,
          this.newSeasonMemberIds
        ).then((seasonTeam) => {
          this.$emit("seasonTeamCreated", seasonTeam);
        });
      else {
        if (this.newSeasonYear == "") this.newSeasonYear = null;
        else if (this.newSeasonYear != null)
          this.newSeasonYear = parseInt(this.newSeasonYear);
        SeasonService.create(this.newSeasonName, this.newSeasonYear).then(
          (season) => {
            SeasonTeamService.create(
              this.team.id,
              season.id,
              this.newSeasonMemberIds
            ).then((seasonTeam) => {
              this.$emit("seasonTeamCreated", seasonTeam);
            });
          }
        );
      }
    },
  },
  computed: {
    team() {
      return this.teams.find((t) => t.id == this.teamId);
    },
    seasonSelectOptions() {
      const years = Array.from(new Set(this.seasons.map((s) => s.year)));
      return years.map((y) => ({
        label: y || "Extra Events",
        options: this.seasons
          .filter((s) => s.year == y)
          .map((s) => ({
            value: s.id,
            text: s.name,
          })),
      }));
    },
    seasonToCopySelectOptions() {
      const years = Array.from(new Set(this.seasonsToCopy.map((s) => s.year)));
      return years.map((y) => ({
        label: y || "Extra Events",
        options: this.seasonsToCopy
          .filter((s) => s.year == y)
          .map((s) => ({
            value: s.id,
            text: s.name,
          })),
      }));
    },
    newMemberOptions() {
      const seasonTeam = this.team?.SeasonTeams.find(
        (st) => st.Season.id == this.seasonToCopyMembersFromId
      );
      if (!seasonTeam) return [];

      const members = seasonTeam.Members;
      if (!members) return [];

      return members.map((m) => ({
        value: m.id,
        text: m.name,
      }));
    },
    inputIsValid() {
      return (
        (this.tabIndex == 0 ? this.seasonIsValid : this.newSeasonIsValid) &&
        (!this.seasonToCopyMembersFromId || this.newSeasonMemberIds.length > 0)
      );
    },
    seasonIsValid() {
      return (
        this.seasons.length > 0 &&
        this.seasons.map((s) => s.id).includes(this.seasonId)
      );
    },
    seasonStateFeedback() {
      if (
        !this.seasonId ||
        !this.seasons.map((s) => s.id).includes(this.seasonId)
      )
        return "Erforderlich";
      return null;
    },
    newSeasonIsValid() {
      return this.newSeasonNameIsValid && this.newSeasonYearIsValid;
    },
    newSeasonNameIsValid() {
      return (
        Boolean(this.newSeasonName) && this.newSeasonName.trim().length > 0
      );
    },
    newSeasonNameStateFeedback() {
      if (!this.newSeasonName || this.newSeasonName.trim().length == 0)
        return "Erforderlich";
      return null;
    },
    newSeasonYearIsValid() {
      return (
        this.newSeasonYear == "" ||
        this.newSeasonYear == null ||
        (parseInt(this.newSeasonYear) > 1990 &&
          parseInt(this.newSeasonYear) < 2200)
      );
    },
    newSeasonYearStateFeedback() {
      if (this.newSeasonYear == "" || this.newSeasonYear == null)
        return "Erforderlich";
      if (parseInt(this.newSeasonYear) <= 1990)
        return "Choreos vor 1990 sind nicht erlaubt.";
      if (parseInt(this.newSeasonYear) >= 2200)
        return "Choreos nach 2200 sind nicht erlaubt.";
      return null;
    },
    newSeasonMembersIsValid() {
      return (
        this.seasonToCopyMembersFromId == null ||
        this.newSeasonMemberIds.length > 0
      );
    },
    newSeasonMembersStateFeedback() {
      if (this.newSeasonMemberIds.length == 0)
        return "Min. 1 Team-Mitglied erforderlich";
      return null;
    },
  },
};
</script>
