<template>
  <b-modal
    :id="`modal-selectHitToUpdate-${id}`"
    centered
    @ok="() => selectHit()"
    @hidden="() => (hitIdToUpdate = null)"
    :title="$t('modals.selectHit.welchen-eintrag-willst-du-aendern')"
  >
    <b-form-radio-group
      id="hitToUpdateSelectGroup"
      v-model="hitIdToUpdate"
      :options="hitsForCurrentCount.map((h) => ({ text: h.name, value: h.id }))"
      name="hitToUpdateSelectGroup"
      stacked
      autofocus
    />
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success">{{ $t("auswaehlen") }}</b-button>
      <b-button @click="cancel" variant="outline-danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: "SelectHitModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    hitIdToUpdate: null,
  }),
  props: {
    hitsForCurrentCount: {
      type: Array,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-selectHitToUpdate-${this.id}`);
      this.hitsForCurrentCount[0].id;
    },
    selectHit() {
      this.$emit("selection", this.hitIdToUpdate);
    },
  },
};
</script>
