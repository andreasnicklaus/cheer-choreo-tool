<template>
  <b-modal
    :id="`modal-deleteSeasonTeam-${id}`"
    title="Season löschen?"
    centered
    @show="reset"
    @ok="deleteSeasonTeam"
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
import SeasonTeamService from "@/services/SeasonTeamService";

export default {
  name: "DeleteSeasonTeamModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteSeasonTeamId: null,
  }),
  methods: {
    open(deleteSeasonTeamId) {
      this.$bvModal.show(`modal-deleteSeasonTeam-${this.id}`);
      this.deleteSeasonTeamId = deleteSeasonTeamId;
    },
    reset() {
      this.deleteSeasonTeamId = null;
    },
    deleteSeasonTeam() {
      console.log("Deleting", this.deleteSeasonTeamId);
      SeasonTeamService.remove(this.deleteSeasonTeamId).then(() => {
        this.$emit("seasonTeamDeleted", this.deleteSeasonTeamId);
      });
    },
  },
};
</script>
