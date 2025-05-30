<template>
  <b-modal
    :id="`modal-deleteTeam-${id}`"
    :title="$t('modals.delete-team.team-loeschen')"
    centered
    @show="reset"
    @ok="deleteTeam"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger">{{ $t("loeschen") }}</b-button>
      <b-button @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import TeamService from "@/services/TeamService";

/**
 * @module Modal:DeleteSeasonTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteSeasonTeamId=null
 *
 * @vue-events {string} seasonTeamDeleted
 */
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
