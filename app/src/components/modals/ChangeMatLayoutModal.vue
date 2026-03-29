<template>
  <BModal
    :id="`changeMatLayoutModal-${id}`"
    ref="modal"
    centered
    @show="
      () => {
        if (choreo) {
          newMatType = choreo?.matType ?? 'cheer';
        }
      }
    "
    @ok="changeMatType"
  >
    <template #title>
      {{ $t("modals.change-mat.layout-der-buehne-matte-aendern") }}
      <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
    </template>
    <BForm>
      <BFormGroup
        :label="$t('mat')"
        label-class="label-with-colon"
        :state="newMatTypeIsValid"
        :invalid-feedback="newMatTypeStateFeedback"
      >
        <BFormSelect
          v-model="newMatType"
          required
          :state="newMatTypeIsValid"
          :options="matTypeOptions"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton variant="success" :disabled="!newMatTypeIsValid" @click="ok">
        {{ $t("modals.change-mat.layout-aendern") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";
import NewVersionBadge from "@/components/NewVersionBadge.vue";

/**
 * @module Modal:ChangeMatLayoutModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newMatType=null
 *
 * @vue-prop {Object} choreo
 *
 * @vue-computed {Array} matTypeOptions
 * @vue-computed {String|null} newMatTypeStateFeedback
 * @vue-computed {Boolean} newMatTypeIsValid
 *
 * @vue-event {string} matTypeUpdate
 *
 * @example
 * <template>
 *  <ChangeMatLayoutModal :choreo="choreoObj" ref="changeMatLayoutModal" @matTypeUpdate="handler" />
 *  <Button @click="() => $refs.changeMatLayoutModal.open()" />
 * </template>
 */
export default {
  name: "ChangeMatLayoutModal",
  components: { NewVersionBadge },
  props: {
    choreo: {
      type: Object,
      default: null,
    },
  },
  emits: ["matTypeUpdate"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newMatType: null,
  }),
  computed: {
    matTypeOptions() {
      return ChoreoService.matTypeOptions();
    },
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
  methods: {
    open() {
      this.$refs.modal.show();
    },
    changeMatType() {
      ChoreoService.changeMatType(this.choreo.id, this.newMatType).then(() => {
        this.$emit("matTypeUpdate", this.newMatType);
      });
    },
  },
};
</script>
