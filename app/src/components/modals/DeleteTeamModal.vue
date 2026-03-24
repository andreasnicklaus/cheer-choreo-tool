<template>
  <BModal
    ref="modal"
    :id="`modal-deleteTeam-${id}`"
    :title="$t('modals.delete-team.team-loeschen')"
    centered
    @show="reset"
    @ok="deleteTeam"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #footer="{ ok, cancel }">
      <BButton @click="ok" variant="danger">{{ $t("loeschen") }}</BButton>
      <BButton @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import TeamService from "@/services/TeamService";

/**
 * @module Modal:DeleteTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteTeamId=null
 *
 * @vue-event {string} teamDeleted
 *
 * @example
 * <template>
 *  <DeleteTeamModal ref="deleteTeamModal" @teamDeleted="handler" />
 *  <Button @click="() => $refs.deleteTeamModal.open('abc')" />
 * </template>
 */
export default {
  name: "DeleteTeamModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteTeamId: null,
  }),
  methods: {
    open(deleteTeamId) {
      this.deleteTeamId = deleteTeamId;
      this.$refs.modal.show();
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
