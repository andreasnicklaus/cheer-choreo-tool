<template>
  <b-modal
    :id="`modal-deleteSeasonTeam-${id}`"
    :title="$t('modals.delete-season.season-loeschen')"
    centered
    @show="reset"
    @ok="deleteSeasonTeam"
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
import SeasonTeamService from "@/services/SeasonTeamService";

/**
 * @module Modal:DeleteSeasonTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteSeasonTeamId=null
 *
 * @vue-events {string} seasonTeamDeleted
 */
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
      SeasonTeamService.remove(this.deleteSeasonTeamId).then(() => {
        this.$emit("seasonTeamDeleted", this.deleteSeasonTeamId);
      });
    },
  },
};
</script>
