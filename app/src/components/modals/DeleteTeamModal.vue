<template>
  <b-modal
    :id="`modal-deleteTeam-${id}`"
    title="Team löschen?"
    centered
    @show="reset"
    @ok="deleteTeam"
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
import TeamService from "@/services/TeamService";

export default {
  name: "DeleteTeamModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteTeamId: null,
  }),
  methods: {
    open(deleteTeamId) {
      this.$bvModal.show(`modal-deleteTeam-${this.id}`);
      this.deleteTeamId = deleteTeamId;
    },
    reset() {
      this.deleteTeamId = null;
    },
    deleteTeam() {
      TeamService.remove(this.deleteTeamId).then(() => {
        this.$emit("teamDeleted", this.deleteTeamId);
      });
    },
  },
};
</script>
