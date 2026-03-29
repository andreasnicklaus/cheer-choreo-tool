<template>
  <BModal
    :id="`changeLengthModal-${id}`"
    ref="modal"
    centered
    :title="$t('modals.change-length.laenge-der-choreo-aendern')"
    @show="
      () => {
        if (choreo) {
          newChoreoAchter = Math.floor(choreo.counts / 8);
          newChoreoCount = choreo.counts % 8;
        }
      }
    "
    @ok="changeChoreoLength"
  >
    <BForm>
      <BFormGroup
        :description="$t('achter')"
        :state="achterIsValid"
        :invalid-feedback="lengthStateFeedback"
      >
        <BFormInput
          v-model="newChoreoAchter"
          type="number"
          min="0"
          :state="achterIsValid"
          autofocus
        />
      </BFormGroup>
      <BFormGroup
        :description="
          $t('modals.change-length.counts-zusaetzliche-counts-nach-den-achtern')
        "
        :state="countIsValid"
        :invalid-feedback="lengthStateFeedback"
      >
        <BFormInput
          v-model="newChoreoCount"
          type="number"
          min="0"
          max="7"
          :state="countIsValid"
        />
      </BFormGroup>
      <p class="text-muted">
        {{ $t("modals.change-length.geschaetzte-zeit") }}
        {{ timeEstimationString }}
      </p>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton variant="success" :disabled="!newCountIsValid" @click="ok">
        {{ $t("modals.change-length.laenge-aendern") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";

/**
 * @module Modal:ChangeChoreoLengthModal
 *
 * @vue-data {String} id
 * @vue-data {Number} newChoreoAchter=1
 * @vue-data {Number} newChoreoCount=0
 *
 * @vue-prop {Object} choreo
 *
 * @vue-computed {String} timeEstimationString
 * @vue-computed {Boolean} achterIsValid
 * @vue-computed {Boolean} countIsValid
 * @vue-computed {Boolean} newCountIsValid
 * @vue-computed {String|null} lengthStateFeedback
 *
 * @vue-event {Number} countUpdate
 *
 * @example
 * <template>
 *  <ChangeChoreoLengthModal :choreo="choreoObj" ref="changeChoreoLengthModal" @countUpdate="handler" />
 *  <Button @click="() => $refs.changeChoreoLengthModal.open()" />
 * </template>
 */
export default {
  name: "ChangeChoreoLengthModal",
  props: {
    choreo: {
      type: Object,
      default: null,
    },
  },
  emits: ["countUpdate"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newChoreoAchter: 1,
    newChoreoCount: 0,
  }),
  computed: {
    timeEstimationString() {
      const date = new Date(
        (parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount)) *
          400
      );
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      return `${minutes} Min. ${seconds} Sek.`;
    },
    achterIsValid() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      return this.newChoreoAchter >= 0 && counts > 0;
    },
    countIsValid() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      return this.newChoreoCount >= 0 && this.newChoreoCount <= 7 && counts > 0;
    },
    newCountIsValid() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      return this.achterIsValid && this.countIsValid && counts > 0;
    },
    lengthStateFeedback() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      if (counts == 0) return this.$t("modals.change-length.choreo-min-length");
      return null;
    },
  },
  methods: {
    open() {
      this.$refs.modal.show();
    },
    changeChoreoLength() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      ChoreoService.changeLength(this.choreo.id, counts).then(() => {
        this.$emit("countUpdate", counts);
      });
    },
  },
};
</script>
