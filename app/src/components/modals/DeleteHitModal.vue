<template>
  <b-modal
    :id="`modal-deleteHit-${this.id}`"
    title="Countsheet-Eintrag löschen?"
    centered
    @hidden="resetDeleteHitModal"
    @ok="deleteHit"
  >
    <p class="m-0">Du kannst das nicht rückgängig machen.</p>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger"> Löschen </b-button>
      <b-button @click="cancel" variant="outline-secondary">
        Abbrechen
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import HitService from "@/services/HitService";

export default {
  name: "DeleteHitModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteHitId: null,
  }),
  props: {
    choreo: {
      type: Object,
    },
  },
  methods: {
    open(deleteHitId) {
      this.deleteHitId = deleteHitId;
      this.$bvModal.show(`modal-deleteHit-${this.id}`);
    },
    resetDeleteHitModal() {
      this.deleteHitId = null;
    },
    deleteHit() {
      HitService.remove(this.deleteHitId).then(() => {
        this.$emit(
          "updateHits",
          this.choreo.Hits.filter((h) => h.id != this.deleteHitId)
        );
      });
    },
  },
};
</script>
