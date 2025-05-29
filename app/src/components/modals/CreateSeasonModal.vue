<template>
  <b-modal
    :id="`modal-newSeason-${id}`"
    :title="$t('modals.create-season.neue-season')"
    size="xl"
    scrollable
    @show="reset"
    @ok="create"
  >
    <p class="text-muted">
      {{ $t("modals.create-season.team-team-name", [team?.name]) }}
    </p>
    <b-tabs fill v-model="tabIndex">
      <b-tab
        :title="$t('modals.create-season.regulaere-season')"
        class="pt-2"
        :disabled="this.seasonSelectOptions.length == 0"
      >
        <b-form>
          <b-form-group
            :label="$tc('season', 1)"
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
      </b-tab>
      <b-tab :title="$t('modals.create-season.extra-events')" class="pt-2">
        <b-form>
          <b-form-group
            :label="$t('modals.create-season.name-der-event-gruppe')"
            label-class="label-with-colon"
            :state="newSeasonNameIsValid"
            :invalid-feedback="newSeasonNameStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              v-model="newSeasonName"
              required
              :placeholder="$t('modals.create-season.example-event-name')"
              :state="newSeasonNameIsValid"
            />
          </b-form-group>
          <b-form-group
            :label="$t('jahr')"
            label-class="label-with-colon"
            :state="newSeasonYearIsValid"
            :invalid-feedback="newSeasonYearStateFeedback"
            :valid-feedback="$t('login.gueltig')"
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
            <b>{{ $t("name") }}:</b>
            {{ $t("modals.create-season.name-info") }}
          </p>
          <p class="mb-0">
            <b>{{ $t("jahr") }}:</b>
            {{ $t("modals.create-season.jahr-info") }}
          </p>
        </div>
      </b-tab>
    </b-tabs>

    <hr />

    <b-form-group
      :label="$t('modals.create-season.team-mitglieder')"
      label-class="label-with-colon"
      :state="newSeasonMembersIsValid"
      :invalid-feedback="newSeasonMembersStateFeedback"
    >
      <b-form-select
        v-model="seasonToCopyMembersFromId"
        :options="[
          {
            text: $t('modals.create-season.keine-mitglieder-kopieren'),
            value: null,
          },
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
        label: y || this.$t("modals.create-season.extra-events"),
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
        label: y || this.$t("modals.create-season.extra-events"),
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
        return this.$t("erforderlich");
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
        return this.$t("erforderlich");
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
        return this.$t("erforderlich");
      if (parseInt(this.newSeasonYear) <= 1990)
        return this.$t("modals.create-season.choreos-vor-1990");
      if (parseInt(this.newSeasonYear) >= 2200)
        return this.$t("modals.create-season.choreos-nach-2200");
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
        return this.$t("modals.create-season.min-team-mitglied");
      return null;
    },
  },
};
</script>
