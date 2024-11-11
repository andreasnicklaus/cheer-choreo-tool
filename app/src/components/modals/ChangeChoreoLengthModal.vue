<template>
  <b-modal
    :id="`changeLengthModal-${id}`"
    centered
    title="Länge der Choreo ändern"
    @show="
      () => {
        if (this.choreo) {
          this.newChoreoAchter = Math.floor(this.choreo.counts / 8);
          this.newChoreoCount = this.choreo.counts % 8;
        }
      }
    "
    @ok="changeChoreoLength"
  >
    <b-form>
      <b-form-group
        description="Achter"
        :state="achterIsValid"
        :invalid-feedback="lengthStateFeedback"
      >
        <b-form-input
          type="number"
          min="0"
          v-model="newChoreoAchter"
          :state="achterIsValid"
          autofocus
        />
      </b-form-group>
      <b-form-group
        description="Counts (Zusätzliche Counts nach den Achtern)"
        :state="countIsValid"
        :invalid-feedback="lengthStateFeedback"
      >
        <b-form-input
          type="number"
          min="0"
          max="7"
          v-model="newChoreoCount"
          :state="countIsValid"
        />
      </b-form-group>
      <p class="text-muted">Geschätzte Zeit: {{ timeEstimationString }}</p>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success" :disabled="!newCountIsValid">
        Länge ändern
      </b-button>
      <b-button @click="cancel" variant="danger"> Abbrechen </b-button>
    </template>
  </b-modal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";

export default {
  name: "ChangeChoreoLengthModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newChoreoAchter: 1,
    newChoreoCount: 0,
  }),
  props: {
    choreo: {
      type: Object,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`changeLengthModal-${this.id}`);
    },
    changeChoreoLength() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      ChoreoService.changeLength(this.choreoId, counts).then(() => {
        this.$emit("countUpdate", counts);
      });
    },
  },
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
      if (counts == 0) return "Du kannst keine Choreo mit 0 Counts haben.";
      return null;
    },
  },
};
</script>
