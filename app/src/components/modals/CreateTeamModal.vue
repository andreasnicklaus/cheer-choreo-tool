<template>
  <BModal
    :id="`modal-newTeam-${id}`"
    ref="modal"
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
        v-if="showOwnerSelect"
        :label="$t('accountView.owner')"
        label-class="label-with-colon"
        :state="selectedOwnerIsValid"
        :invalid-feedback="newTeamOwnerStateFeedback"
      >
        <BFormSelect
          v-model="selectedOwnerId"
          :state="selectedOwnerIsValid"
          :options="ownerOptions"
          :placeholder="$t('accountView.owner')"
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
          :options="seasonSelectOptions"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        variant="success"
        :disabled="!newTeamNameIsValid || !seasonIsValid"
        @click="ok"
      >
        {{ $t("erstellen") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import SeasonService from "@/services/SeasonService";
import TeamService from "@/services/TeamService";
import UserAccessService from "@/services/UserAccessService";

/**
 * @module Modal:CreateTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newTeamName=null
 * @vue-data {Array} seasons
 * @vue-data {String|null} seasonId=null
 * @vue-data {String|null} selectedOwnerId=null
 * @vue-prop {Object} me - currently logged in user
 *
 * @vue-computed {Boolean} newTeamNameIsValid
 * @vue-computed {String|null} newTeamNameStateFeedback
 * @vue-computed {Array} seasonSelectOptions
 * @vue-computed {Boolean} seasonIsValid
 * @vue-computed {String|null} seasonStateFeedback
 * @vue-computed {Array} ownerOptions
 * @vue-computed {Boolean} showOwnerSelect
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
  props: {
    me: {
      type: Object,
      default: null,
    },
  },
  emits: ["teamCreated"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newTeamName: null,
    seasons: [],
    seasonId: null,
    selectedOwnerId: null,
  }),
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
    ownerOptions() {
      const options = this.$store.state.owners.map((o) => {
        const baseText = o.owner?.username || o.owner?.email || o.ownerUserId;
        const isYou = this.me && o.ownerUserId === this.me.id;
        return {
          value: o.ownerUserId,
          text: isYou ? `${baseText} (you)` : baseText,
        };
      });

      if (this.me && !options.some((o) => o.value === this.me.id)) {
        options.push({
          value: this.me.id,
          text: `${this.me.username || this.me.email || this.me.id} (you)`,
        });
      }

      return options;
    },
    showOwnerSelect() {
      return this.$store.state.owners.length > 0;
    },
    selectedOwnerIsValid() {
      return (
        this.selectedOwnerId != null &&
        (this.$store.state.owners
          .map((o) => o.ownerUserId)
          .includes(this.selectedOwnerId) ||
          this.selectedOwnerId === this.$store.state.me?.id)
      );
    },
    newTeamOwnerStateFeedback() {
      if (!this.selectedOwnerId) return this.$t("erforderlich");
      if (
        !this.$store.state.owners
          .map((o) => o.ownerUserId)
          .includes(this.selectedOwnerId) &&
        this.selectedOwnerId !== this.$store.state.me?.id
      )
        return this.$t("errors.unerwarteter-fehler");
      return null;
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    open() {
      this.load();
      this.$refs.modal.show();
      if (this.$store.state.me?.id) {
        this.selectedOwnerId = this.$store.state.me?.id;
      }
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
      this.selectedOwnerId = null;
    },
    createTeam() {
      const ownerId = this.selectedOwnerId || null;
      TeamService.create(
        this.newTeamName,
        this.$store.state.clubId,
        this.seasonId,
        ownerId
      ).then((team) => this.$emit("teamCreated", team));
    },
  },
};
</script>
