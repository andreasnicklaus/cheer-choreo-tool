<template>
  <b-modal
    :id="`modal-newChoreo-${id}`"
    title="Neue Choreo"
    centered
    scrollable
    size="xl"
    @show="resetChoreoModal"
    @ok="createChoreo"
  >
    <b-form>
      <b-form-group
        label="Name:"
        :state="newChoreoNameIsValid"
        :invalid-feedback="newChoreoNameStateFeedback"
        valid-feedback="Gültig!"
      >
        <b-form-input
          v-model="newChoreoName"
          :state="newChoreoNameIsValid"
          required
          autofocus
          :placeholder="`Landesmeisterschaft, RM ${new Date().getFullYear()}, ...`"
        />
      </b-form-group>
      <b-form-group label="Länge:">
        <b-row>
          <b-col>
            <b-form-group
              description="Achter"
              :state="newChoreoAchterIsValid"
              :invalid-feedback="newChoreoAchterStateFeedback"
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
              :invalid-feedback="newChoreoCountStateFeedback"
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
        <p class="text-muted">Geschätzte Zeit: {{ timeEstimationString }}</p>
      </b-form-group>
      <b-form-group
        label="Team:"
        :state="newChoreoTeamIsValid"
        :invalid-feedback="newChoreoTeamStateFeedback"
      >
        <b-form-select
          v-model="newChoreoTeamId"
          :state="newChoreoTeamIsValid"
          required
          :options="teams.map((t) => ({ value: t.id, text: t.name }))"
        />
      </b-form-group>
      <b-form-group
        label="Season:"
        :state="newChoreoSeasonIsValid"
        :invalid-feedback="newChoreoSeasonStateFeedback"
        valid-feedback="Gültig"
      >
        <b-form-select
          v-model="newChoreoSeasonId"
          :state="newChoreoSeasonIsValid"
          required
          :disabled="!newChoreoTeamId"
          :options="
            teams
              .find((t) => t.id == newChoreoTeamId)
              ?.SeasonTeams?.map((st) => ({
                value: st.Season.id,
                text: st.Season.name,
              }))
          "
        />
      </b-form-group>
      <b-form-group label="Teilnehmer:">
        <b-skeleton-wrapper
          :loading="!newChoreoTeamIsValid || !newChoreoSeasonIsValid"
        >
          <template #loading>
            <b-skeleton v-for="(_, i) in Array(3)" :key="i" />
          </template>
          <b-button-group>
            <b-button
              variant="light"
              @click="
                () =>
                  (this.newChoreoParticipantIds = participantOptions.map(
                    (po) => po.value
                  ))
              "
              :disabled="
                newChoreoParticipantIds?.length == participantOptions?.length
              "
            >
              <b-icon-check-all />
              Alle auswählen
            </b-button>
            <b-button
              variant="light"
              @click="() => (this.newChoreoParticipantIds = [])"
              :disabled="newChoreoParticipantIds?.length == 0"
            >
              <b-icon-slash /> Keine auswählen
            </b-button>
            <b-button
              variant="light"
              @click="
                () =>
                  (this.newChoreoParticipantIds = participantOptions
                    .filter((po) => !newChoreoParticipantIds.includes(po.value))
                    .map((po) => po.value))
              "
              :disabled="
                newChoreoParticipantIds?.length == 0 ||
                newChoreoParticipantIds?.length == participantOptions?.length
              "
            >
              <b-icon-arrow-repeat />
              Auswahl wechseln
            </b-button>
          </b-button-group>
          <b-checkbox-group
            :id="`participant-checkbox-group-${id}`"
            :name="`participant-checkbox-group-${id}`"
            v-model="newChoreoParticipantIds"
            :style="{ columnCount: 2 }"
            stacked
          >
            <b-form-checkbox
              v-for="option in participantOptions"
              :key="option.value"
              :value="option.value"
            >
              <b-row
                align-h="between"
                align-v="start"
                :style="{ minWidth: '300px', minHeight: '38px' }"
              >
                <b-col cols="auto">
                  {{ option.text }}
                </b-col>
                <b-col :style="{ width: '100px' }" cols="auto">
                  <b-input
                    type="color"
                    v-model="option.color"
                    v-show="newChoreoParticipantIds.includes(option.value)"
                  />
                </b-col>
              </b-row>
            </b-form-checkbox>
          </b-checkbox-group>
        </b-skeleton-wrapper>
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        @click="ok"
        variant="success"
        :disabled="
          !newChoreoNameIsValid ||
          !newChoreoCountIsValid ||
          !newChoreoAchterIsValid ||
          !newChoreoTeamIsValid ||
          !newChoreoSeasonIsValid ||
          newChoreoParticipantIds.length == 0
        "
      >
        Erstellen
      </b-button>
      <b-button @click="cancel" variant="danger">Abbrechen</b-button>
    </template>
  </b-modal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";
import ColorService from "@/services/ColorService";

export default {
  name: "CreateChoreoModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newChoreoName: null,
    newChoreoAchter: 1,
    newChoreoCount: 0,
    newChoreoTeamId: null,
    newChoreoSeasonId: null,
    newChoreoParticipantIds: [],
    participantOptions: [],
  }),
  props: {
    teams: {
      type: Array,
    },
  },
  mounted() {
    // this.open();
  },
  methods: {
    open(teamId = null, seasonId = null) {
      this.$bvModal.show(`modal-newChoreo-${this.id}`);
      if (teamId) {
        this.newChoreoTeamId = teamId;

        if (seasonId) {
          this.newChoreoSeasonId = seasonId;
          this.updateParticipantOptions();
        }
      }
    },
    resetChoreoModal() {
      this.newChoreoName = null;
      this.newChoreoAchter = 1;
      this.newChoreoCount = 0;
      this.newChoreoTeamId = this.teams[0]?.id;

      const seasonTeamsOfSelectedTeam = this.teams.find(
        (t) => t.id == this.newChoreoTeamId
      )?.SeasonTeams;

      if (seasonTeamsOfSelectedTeam && seasonTeamsOfSelectedTeam.length == 1) {
        this.newChoreoSeasonId = seasonTeamsOfSelectedTeam[0].Season.id;
        this.updateParticipantOptions();
      } else {
        this.newChoreoSeasonId = null;
        this.newChoreoParticipantIds = [];
      }
    },
    updateParticipantOptions() {
      if (!this.selectedSeasonTeam) this.participantOptions = [];
      else {
        this.participantOptions = this.selectedSeasonTeam.Members.map((m) => ({
          text: m.name,
          value: m.id,
          color: ColorService.getRandom(),
        }));
        this.newChoreoParticipantIds = this.participantOptions.map(
          (o) => o.value
        );
      }
    },
    createChoreo() {
      const count =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      const seasonTeamId = this.selectedSeasonTeam.id;
      const participants = this.newChoreoParticipantIds
        .map((pId) => this.participantOptions.find((o) => o.value == pId))
        .map((o) => ({ id: o.value, color: o.color }));
      ChoreoService.create(
        this.newChoreoName,
        count,
        seasonTeamId,
        participants
      ).then((choreo) => {
        this.$emit("addChoreo", choreo);
      });
    },
  },
  watch: {
    newChoreoTeamId: {
      handler() {
        this.updateParticipantOptions();
      },
    },
    newChoreoSeasonId: {
      handler() {
        this.updateParticipantOptions();
      },
    },
  },
  computed: {
    selectedTeam() {
      return this.teams.find((t) => t.id == this.newChoreoTeamId);
    },
    selectedSeasonTeam() {
      if (!this.selectedTeam) return null;

      return this.selectedTeam.SeasonTeams.find(
        (st) => this.newChoreoSeasonId == st.Season.id
      );
    },
    timeEstimationString() {
      const date = new Date(
        (this.newChoreoAchter * 8 + this.newChoreoCount) * 400
      );
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${minutes} Min. ${seconds} Sek.`;
    },
    newChoreoNameIsValid() {
      return this.newChoreoName != null && this.newChoreoName.length >= 2;
    },
    newChoreoNameStateFeedback() {
      if (!this.newChoreoName) return "Erforderlich";
      if (this.newChoreoName.length < 2) return "Min. 2 Zeichen";
      return null;
    },
    newChoreoCountIsValid() {
      return (
        this.newChoreoCount != null &&
        this.newChoreoCount !== "" &&
        parseInt(this.newChoreoCount) >= 0 &&
        parseInt(this.newChoreoCount) <= 7
      );
    },
    newChoreoCountStateFeedback() {
      if (!this.newChoreoCount || this.newChoreoCount == "")
        return "Erforderlich";
      if (
        parseInt(this.newChoreoCount) < 0 ||
        parseInt(this.newChoreoCount) > 7
      )
        return "Extra-Count muss zwischen 0 und 7 liegen";
      return null;
    },
    newChoreoAchterIsValid() {
      return (
        this.newChoreoAchter != null &&
        this.newChoreoAchter !== "" &&
        parseInt(this.newChoreoAchter) > 0
      );
    },
    newChoreoAchterStateFeedback() {
      if (!this.newChoreoAchter || this.newChoreoAchter == "")
        return "Erforderlich";
      if (parseInt(this.newChoreoAchter) <= 0)
        return "Achter muss größer als 0 sein";
      return null;
    },
    newChoreoTeamIsValid() {
      return (
        this.newChoreoTeamId != null &&
        this.teams.map((t) => t.id).includes(this.newChoreoTeamId)
      );
    },
    newChoreoTeamStateFeedback() {
      if (!this.newChoreoTeamId) return "Erforderlich";
      if (!this.teams.map((t) => t.id).includes(this.newChoreoTeamId))
        return "Unerwarteter Fehler. Bitte kontaktiere uns.";
      return null;
    },
    newChoreoSeasonIsValid() {
      return (
        this.newChoreoSeasonId != null &&
        this.selectedTeam?.SeasonTeams.map((st) => st.Season.id)
          .flat(Infinity)
          .includes(this.newChoreoSeasonId)
      );
    },
    newChoreoSeasonStateFeedback() {
      if (!this.newChoreoSeasonId) return "Erforderlich";
      if (
        !this.selectedTeam?.SeasonTeams.map((st) => st.Season.id)
          .flat(Infinity)
          .includes(this.newChoreoSeasonId)
      )
        return "Unerwarteter Fehler. Bitte kontaktiere uns.";
      return null;
    },
  },
};
</script>

<style lang="scss" scoped>
input[type="color"] {
  padding: 0;
  border-width: 0;
}
</style>
