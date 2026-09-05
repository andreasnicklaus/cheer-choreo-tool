<template>
  <BModal
    :id="`modal-newSeason-${id}`"
    ref="modal"
    :title="$t('modals.create-season.neue-season')"
    scrollable
    @ok="create"
  >
    <p class="text-muted">
      {{ $t("modals.create-season.team-team-name", [team?.name]) }}
    </p>
    <BTabs fill :index="tabIndex" @update:index="(i) => (tabIndex = i)">
      <BTab
        :title="$t('modals.create-season.regulaere-season')"
        class="pt-2"
        :disabled="seasonSelectOptions.length == 0"
      >
        <BForm>
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
      </BTab>
      <BTab :title="$t('modals.create-season.extra-events')" class="pt-2">
        <BForm>
          <BFormGroup
            :label="$t('modals.create-season.name-der-event-gruppe')"
            label-class="label-with-colon"
            :state="newSeasonNameIsValid"
            :invalid-feedback="newSeasonNameStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="newSeasonName"
              required
              :placeholder="$t('modals.create-season.example-event-name')"
              :state="newSeasonNameIsValid"
            />
          </BFormGroup>
          <BFormGroup
            :label="$t('jahr')"
            label-class="label-with-colon"
            :state="newSeasonYearIsValid"
            :invalid-feedback="newSeasonYearStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="newSeasonYear"
              type="number"
              :placeholder="new Date().getFullYear().toString()"
              :state="newSeasonYearIsValid"
            />
          </BFormGroup>
        </BForm>
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
      </BTab>
    </BTabs>

    <hr />

    <BFormGroup
      v-if="showOwnerSelect"
      :label="$t('accountView.owner')"
      label-class="label-with-colon"
      :state="selectedOwnerIsValid"
      :invalid-feedback="newSeasonOwnerStateFeedback"
    >
      <BFormSelect
        v-model="selectedOwnerId"
        :state="selectedOwnerIsValid"
        :options="ownerOptions"
        :placeholder="$t('accountView.owner')"
      />
    </BFormGroup>

    <BFormGroup
      :label="$t('modals.create-season.team-mitglieder')"
      label-class="label-with-colon"
      :state="newSeasonMembersIsValid"
      :invalid-feedback="newSeasonMembersStateFeedback"
    >
      <BFormSelect
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
      <BFormCheckboxGroup
        v-model="newSeasonMemberIds"
        :options="newMemberOptions"
        stacked
        :style="{ columnCount: 2 }"
        class="mt-2"
        :state="newSeasonMembersIsValid"
      />
    </BFormGroup>

    <template #footer="{ ok, cancel }">
      <BButton variant="success" :disabled="!inputIsValid" @click="ok">
        {{ $t("erstellen") }}
      </BButton>
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import SeasonService from "@/services/SeasonService";
import SeasonTeamService from "@/services/SeasonTeamService";
import { defineComponent, PropType } from "vue";
import { BModal } from "bootstrap-vue-next";
import type { Team, Season } from "@/types";

/**
 * @module Modal:CreateSeasonModal
 *
 * @vue-data {String} id
 * @vue-data {Number} tabIndex=0
 * @vue-data {String|null} newSeasonName=null
 * @vue-data {Number|null} newSeasonYear=null
 * @vue-data {Array} seasons
 * @vue-data {Number|null} seasonId=null
 * @vue-data {Number|null} teamId=null
 * @vue-data {Array} seasonsToCopy
 * @vue-data {Number|null} seasonToCopyMembersFromId=null
 * @vue-data {Array} newSeasonMemberIds
 * @vue-data {String|null} selectedOwnerId=null
 *
 * @vue-prop {Array} teams
 *
 * @vue-computed {Object} team
 * @vue-computed {Array} seasonSelectOptions
 * @vue-computed {Array} seasonToCopySelectOptions
 * @vue-computed {Array} newMemberOptions
 * @vue-computed {Boolean} inputIsValid
 * @vue-computed {Boolean} seasonIsValid
 * @vue-computed {String|null} seasonStateFeedback
 * @vue-computed {Boolean} newSeasonIsValid
 * @vue-computed {Boolean} newSeasonNameIsValid
 * @vue-computed {String|null} newSeasonNameStateFeedback
 * @vue-computed {Boolean} newSeasonYearIsValid
 * @vue-computed {String|null} newSeasonYearStateFeedback
 * @vue-computed {Boolean} newSeasonMembersIsValid
 * @vue-computed {String|null} newSeasonMembersStateFeedback
 * @vue-computed {Array} ownerOptions
 * @vue-computed {Boolean} showOwnerSelect
 *
 * @vue-event {Object} seasonTeamCreated
 *
 * @example
 * <template>
 *  <CreateSeasonModal ref=createSeasonModal :teams="teams" @seasonTeamCreated="handler" />
 *  <Button @click="() => $refs.createSeasonModal.open()" />
 * </template>
 */
export default defineComponent({
  name: "CreateSeasonModal",
  props: {
    teams: {
      type: Array as PropType<Team[]>,
      default: () => [],
    },
    me: {
      type: Object as PropType<{
        id: string;
        username?: string;
        email?: string;
      }>,
      default: null,
    },
  },
  emits: ["seasonTeamCreated"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    tabIndex: 0,
    newSeasonName: undefined as string | undefined,
    newSeasonYear: undefined as string | number | undefined,
    seasons: [] as Season[],
    seasonId: undefined as string | undefined,
    teamId: undefined as string | number | undefined,
    seasonsToCopy: [] as Season[],
    seasonToCopyMembersFromId: undefined as string | undefined,
    newSeasonMemberIds: [] as string[],
    selectedOwnerId: undefined as string | undefined,
  }),
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
        (st) => st.Season?.id == this.seasonToCopyMembersFromId
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
        this.seasons.map((s) => s.id).includes(this.seasonId ?? "")
      );
    },
    seasonStateFeedback() {
      if (
        !this.seasonId ||
        !this.seasons.map((s) => s.id).includes(this.seasonId ?? "")
      )
        return this.$t("erforderlich");
      return undefined;
    },
    newSeasonIsValid() {
      return this.newSeasonNameIsValid && this.newSeasonYearIsValid;
    },
    newSeasonNameIsValid() {
      return (
        Boolean(this.newSeasonName) &&
        (this.newSeasonName ?? "").trim().length > 0
      );
    },
    newSeasonNameStateFeedback() {
      if (!this.newSeasonName || this.newSeasonName.trim().length == 0)
        return this.$t("erforderlich");
      return undefined;
    },
    newSeasonYearIsValid() {
      return (
        this.newSeasonYear == "" ||
        this.newSeasonYear == null ||
        (parseInt(String(this.newSeasonYear)) > 1990 &&
          parseInt(String(this.newSeasonYear)) < 2200)
      );
    },
    newSeasonYearStateFeedback() {
      if (this.newSeasonYear == "" || this.newSeasonYear == null)
        return this.$t("erforderlich");
      if (parseInt(String(this.newSeasonYear)) <= 1990)
        return this.$t("modals.create-season.choreos-vor-1990");
      if (parseInt(String(this.newSeasonYear)) >= 2200)
        return this.$t("modals.create-season.choreos-nach-2200");
      return undefined;
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
      return undefined;
    },
    ownerOptions() {
      // @ts-ignore
      const options = this.$store.state.owners.map((o) => {
        const baseText = o.owner?.username || o.owner?.email || o.ownerUserId;
        const isYou = this.me && o.ownerUserId === this.$store.state.me.id;
        return {
          value: o.ownerUserId,
          text: isYou ? `${baseText} (you)` : baseText,
        };
      });

      if (
        this.$store.state.me &&
        // @ts-ignore
        !options.some((o) => o["value"] === this.$store.state.me["id"])
      ) {
        options.push({
          value: this.$store.state.me.id,
          text: `${this.$store.state.me.username || this.$store.state.me.email || this.$store.state.me.id} (you)`,
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
          // @ts-ignore
          .map((o) => o["ownerUserId"])
          .includes(this.selectedOwnerId) ||
          this.selectedOwnerId === this.$store.state.me?.id)
      );
    },
    newSeasonOwnerStateFeedback() {
      if (!this.selectedOwnerId) return this.$t("erforderlich");
      if (
        !this.$store.state.owners
          // @ts-ignore
          .map((o) => o["ownerUserId"])
          .includes(this.selectedOwnerId) &&
        this.selectedOwnerId !== this.$store.state.me?.id
      )
        return this.$t("errors.unerwarteter-fehler");
      return undefined;
    },
  },
  mounted() {
    this.load();
  },
  methods: {
    open(teamId: string | number) {
      this.reset();
      this.teamId = teamId;
      if (this.$store.state.me?.id) {
        this.selectedOwnerId = this.$store.state.me?.id;
      }
      (this.$refs.modal as InstanceType<typeof BModal>).show();
      this.$nextTick(() => {
        this.load();
      });
    },
    load() {
      if (!this.teamId) return;
      SeasonService.getAll().then((seasons) => {
        this.seasons = seasons.filter(
          (s) =>
            !this.team?.SeasonTeams.map((st) => st.Season?.id).includes(s.id)
        );
        this.seasonsToCopy = seasons.filter((s) =>
          this.team?.SeasonTeams.map((st) => st.Season?.id).includes(s.id)
        );
        this.seasonToCopyMembersFromId = undefined;
        this.newSeasonMemberIds = [];

        if (this.seasons.length > 0)
          this.seasonId = this.seasons[0]?.id ?? undefined;
      });
    },
    reset() {
      this.tabIndex = 0;
      this.newSeasonName = undefined;
      this.newSeasonYear = undefined;
      this.seasonId = undefined;
      this.teamId = undefined;
      this.seasonToCopyMembersFromId = undefined;
      this.newSeasonMemberIds = [];
      this.seasons = [];
      this.seasonsToCopy = [];
      this.selectedOwnerId = undefined;
    },
    create() {
      const ownerId = this.selectedOwnerId || null;
      if (this.tabIndex == 0)
        SeasonTeamService.create(
          (this.team as Team).id,
          this.seasonId ?? "",
          this.newSeasonMemberIds
        ).then((seasonTeam) => {
          this.$emit("seasonTeamCreated", seasonTeam);
        });
      else {
        if (this.newSeasonYear == "") this.newSeasonYear = undefined;
        else if (this.newSeasonYear != null)
          this.newSeasonYear = parseInt(String(this.newSeasonYear));
        SeasonService.create(
          this.newSeasonName ?? "",
          this.newSeasonYear ?? 0,
          ownerId
        ).then((season) => {
          SeasonTeamService.create(
            (this.team as Team).id,
            season.id,
            this.newSeasonMemberIds
          ).then((seasonTeam) => {
            this.$emit("seasonTeamCreated", seasonTeam);
          });
        });
      }
    },
  },
});
</script>
