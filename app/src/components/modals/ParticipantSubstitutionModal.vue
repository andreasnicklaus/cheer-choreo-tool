<template>
  <BModal
    :id="`modal-participation-substitution-${id}`"
    ref="modal"
    centered
    :title="$t('modals.substitution.teilnehmer-auswechseln')"
    @show="reset"
    @ok="substituteParticipants"
  >
    <p class="text-muted">
      {{ $t("choreo", 1) }}: {{ choreo?.name }} ({{
        choreo?.SeasonTeam?.Team?.name
      }}, {{ choreo?.SeasonTeam?.Season?.name }})
    </p>
    <BFormGroup
      :label="$t('modals.substitution.auswechseln')"
      label-class="label-with-colon"
      :state="memberToReplaceIdIsValid"
      :invalid-feedback="memberToReplaceIdStateFeedback"
    >
      <BFormSelect
        v-model="memberToReplaceId"
        :state="memberToReplaceIdIsValid"
        required
        :options="participantOptions"
        :autofocus="memberToReplaceId == null"
      />
    </BFormGroup>
    <BFormGroup
      :label="$t('modals.substitution.einwechseln')"
      label-class="label-with-colon"
      :state="memberToSubInIdIsValid"
      :invalid-feedback="memberToSubInIdStateFeedback"
    >
      <BFormSelect
        v-model="memberToSubInId"
        :state="memberToSubInIdIsValid"
        required
        :options="nonParticipantOptions"
        :autofocus="memberToSubInId == null"
      />
    </BFormGroup>
    <template #footer="{ ok, cancel }">
      <BButton variant="success" @click="ok">{{
        $t("modals.substitution.auswechseln")
      }}</BButton>
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import ChoreoService from "@/services/ChoreoService";
import { defineComponent, PropType } from "vue";
import { BModal } from "bootstrap-vue-next";
import type { Choreo, Member, Participant } from "@/types";

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
export default defineComponent({
  name: "ParticipantSubstitutionModal",
  props: {
    choreo: {
      type: Object as PropType<Choreo>,
      default: null,
    },
    participants: {
      type: Array as PropType<Participant[]>,
      required: true,
    },
    nonParticipants: {
      type: Array as PropType<Member[]>,
      required: true,
    },
  },
  emits: ["substitution"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    memberToReplaceId: null as string | null,
    memberToSubInId: null as string | null,
  }),
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
      return undefined;
    },
    memberToSubInIdIsValid() {
      return Boolean(this.memberToSubInId);
    },
    memberToSubInIdStateFeedback() {
      if (!this.memberToSubInId) return this.$t("erfolgreich");
      return undefined;
    },
  },
  methods: {
    open(
      memberToReplaceId: string | null = null,
      memberToSubInId: string | null = null
    ) {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
      this.memberToReplaceId = memberToReplaceId;
      this.memberToSubInId = memberToSubInId;
    },
    reset() {
      this.memberToReplaceId = null;
      this.memberToSubInId = null;
    },
    substituteParticipants() {
      ChoreoService.replaceParticipant(
        this.choreo.id,
        this.memberToReplaceId as unknown as string,
        this.memberToSubInId as unknown as string
      ).then((choreo) => {
        this.$emit("substitution", choreo);
      });
    },
  },
});
</script>
