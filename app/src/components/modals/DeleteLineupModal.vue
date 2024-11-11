<template>
  <b-modal
    :id="`modal-deleteLineup-${this.id}`"
    title="Aufstellung löschen?"
    centered
    @hidden="resetDeleteLineupModal"
    @ok="deleteLineup"
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
import LineupService from "@/services/LineupService";

export default {
  name: "DeleteLineupModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteLineupId: null,
  }),
  props: {
    choreo: {
      type: Object,
    },
  },
  methods: {
    open(deleteLineupId) {
      this.deleteLineupId = deleteLineupId;
      this.$bvModal.show(`modal-deleteLineup-${this.id}`);
    },
    resetDeleteLineupModal() {
      this.deleteLineupId = null;
    },
    deleteLineup() {
      LineupService.remove(this.deleteLineupId).then(() => {
        this.$emit(
          "updateLineups",
          this.choreo.Lineups.filter((l) => l.id != this.deleteLineupId)
        );
      });
    },
  },
};
</script>
