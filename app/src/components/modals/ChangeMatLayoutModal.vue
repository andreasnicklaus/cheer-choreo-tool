<template>
  <b-modal
    :id="`changeMatLayoutModal-${id}`"
    centered
    title="Layout der Bühne / Matte ändern"
    @show="
      () => {
        if (this.choreo) {
          this.newMatType = this.choreo?.matType ?? 'cheer';
        }
      }
    "
    @ok="changeMatType"
  >
    <b-form>
      <b-form-group
        label="Mat"
        label-class="label-with-colon"
        :state="newMatTypeIsValid"
        :invalid-feedback="newMatTypeStateFeedback"
      >
        <!-- TODO: translate group labels and layout names -->
        <b-form-select
          v-model="newMatType"
          required
          :state="newMatTypeIsValid"
          :options="[
            {
              label: 'By Sport (Lines on the mat)',
              options: [{ value: 'cheer', text: 'Cheer (1:1, 7 lanes)' }],
            },
            {
              label: 'By stage form (no lines)',
              options: [
                { value: 'square', text: 'Square (1:1)' },
                { value: '1:2', text: 'Flat Rectangle (1:2)' },
                { value: '3:4', text: 'Boxy Rectangle (3:4)' },
              ],
            },
          ]"
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success" :disabled="!newMatTypeIsValid">
        <!-- TODO: translate -->
        Layout ändern
      </b-button>
      <b-button @click="cancel" variant="danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";

export default {
  name: "ChangeMatLayoutModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newMatType: 1,
  }),
  props: {
    choreo: {
      type: Object,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`changeMatLayoutModal-${this.id}`);
    },
    changeMatType() {
      ChoreoService.changeMatType(this.choreo.id, this.newMatType).then(() => {
        this.$emit("matTypeUpdate", this.newMatType);
      });
    },
  },
  computed: {
    newMatTypeStateFeedback() {
      if (!this.newMatType) return this.$t("erforderlich");
      if (!["cheer", "square", "1:2", "3:4"].includes(this.newMatType))
        return this.$t("errors.unerwarteter-fehler");
      return null;
    },
    newMatTypeIsValid() {
      return (
        this.newMatType != null &&
        ["cheer", "square", "1:2", "3:4"].includes(this.newMatType)
      );
    },
  },
};
</script>
