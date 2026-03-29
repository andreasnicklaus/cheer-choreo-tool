<template>
  <BModal
    :id="`modal-selectHitToUpdate-${id}`"
    ref="modal"
    centered
    :title="$t('modals.selectHit.welchen-eintrag-willst-du-aendern')"
    @ok="() => selectHit()"
    @hidden="() => (hitIdToUpdate = null)"
  >
    <BFormRadioGroup
      id="hitToUpdateSelectGroup"
      v-model="hitIdToUpdate"
      :options="hitsForCurrentCount.map((h) => ({ text: h.name, value: h.id }))"
      name="hitToUpdateSelectGroup"
      stacked
      autofocus
    />
    <template #footer="{ ok, cancel }">
      <BButton variant="success" @click="ok">{{ $t("auswaehlen") }}</BButton>
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script>
/**
 * @module Modal:SelectHitModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} hitIdToUpdate=null
 *
 * @vue-prop {Array} hitsForCurrentCount
 *
 * @vue-event {string} selection
 *
 * @example
 * <template>
 *   <SelectHitModal ref="selectHitModal" :hitsForCurrentCount="hits" @selection="handler" />
 *   <Button @click="() => $refs.selectHitModal.open()" />
 * </template>
 */
export default {
  name: "SelectHitModal",
  props: {
    hitsForCurrentCount: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["selection"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    hitIdToUpdate: null,
  }),
  methods: {
    open() {
      this.$refs.modal.show();
    },
    selectHit() {
      this.$emit("selection", this.hitIdToUpdate);
    },
  },
};
</script>
