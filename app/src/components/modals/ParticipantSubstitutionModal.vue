<template>
  <b-modal
    :id="`modal-participation-substitution-${id}`"
    centered
    @show="reset"
    @ok="substituteParticipants"
    :title="$t('modals.substitution.teilnehmer-auswechseln')"
  >
    <p class="text-muted">
      {{ $tc("choreo", 1) }}: {{ choreo?.name }} ({{
        choreo?.SeasonTeam.Team.name
      }}, {{ choreo?.SeasonTeam.Season.name }})
    </p>
    <b-form-group
      :label="$t('modals.substitution.auswechseln')"
      label-class="label-with-colon"
      :state="memberToReplaceIdIsValid"
      :invalid-feedback="memberToReplaceIdStateFeedback"
    >
      <b-form-select
        v-model="memberToReplaceId"
        :state="memberToReplaceIdIsValid"
        required
        :options="participantOptions"
        :autofocus="memberToReplaceId == null"
      />
    </b-form-group>
    <b-form-group
      :label="$t('modals.substitution.einwechseln')"
      label-class="label-with-colon"
      :state="memberToSubInIdIsValid"
      :invalid-feedback="memberToSubInIdStateFeedback"
    >
      <b-form-select
        v-model="memberToSubInId"
        :state="memberToSubInIdIsValid"
        required
        :options="nonParticipantOptions"
        :autofocus="memberToSubInId == null"
      />
    </b-form-group>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success">{{
        $t("modals.substitution.auswechseln")
      }}</b-button>
      <b-button @click="cancel" variant="outline-danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";

/**
 * @module Modal:ParticipantSubstitutionModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} memberToReplaceId=null
 * @vue-data {String|null} memberToSubInId=null
 *
 * @vue-prop {Object} choreo
 * @vue-prop {Array} participants
 * @vue-prop {Array} nonParticipants
 *
 * @vue-computed {Array} participantOptions
 * @vue-computed {Array} nonParticipantOptions
 * @vue-computed {Boolean} memberToReplaceIdIsValid
 * @vue-computed {String|null} memberToReplaceIdStateFeedback
 * @vue-computed {Boolean} memberToSubInIdIsValid
 * @vue-computed {String|null} memberToSubInIdStateFeedback
 *
 * @vue-event {Object} substitution
 *
 * @example
 * <template>
 *   <ParticipantSubstitutionModal ref="participantSubstitutionModal" :choreo="choreoObj" :participants="p" :nonParticipants="np" @substitution="handler" />
 *   <Button @click="() => $refs.participantSubstitutionModal.open()" />
 * </template>
 */
export default {
  name: "ParticipantSubstitutionModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    memberToReplaceId: null,
    memberToSubInId: null,
  }),
  props: {
    choreo: {
      type: Object,
    },
    participants: {
      type: Array,
      required: true,
    },
    nonParticipants: {
      type: Array,
      required: true,
    },
  },
  methods: {
    open(memberToReplaceId = null, memberToSubInId = null) {
      this.$bvModal.show(`modal-participation-substitution-${this.id}`);
      this.memberToReplaceId = memberToReplaceId;
      this.memberToSubInId = memberToSubInId;
    },
    reset() {
      (this.memberToReplaceId = null), (this.memberToSubInId = null);
    },
    substituteParticipants() {
      ChoreoService.replaceParticipant(
        this.choreo.id,
        this.memberToReplaceId,
        this.memberToSubInId
      ).then((choreo) => {
        this.$emit("substitution", choreo);
      });
    },
  },
  computed: {
    participantOptions() {
      return this.participants.map((p) => ({
        text: p.name,
        value: p.id,
      }));
    },
    nonParticipantOptions() {
      return this.nonParticipants.map((m) => ({
        text: m.name,
        value: m.id,
      }));
    },
    memberToReplaceIdIsValid() {
      return Boolean(this.memberToReplaceId);
    },
    memberToReplaceIdStateFeedback() {
      if (!this.memberToReplaceId) return this.$t("erforderlich");
      return null;
    },
    memberToSubInIdIsValid() {
      return Boolean(this.memberToSubInId);
    },
    memberToSubInIdStateFeedback() {
      if (!this.memberToSubInId) return this.$t("erfolgreich");
      return null;
    },
  },
};
</script>
