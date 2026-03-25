<template>
  <BModal
    ref="modal"
    :id="`modal-deleteSeasonTeam-${id}`"
    :title="$t('modals.delete-season.season-loeschen')"
    centered
    @hidden="reset"
    @ok="deleteSeasonTeam"
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
import SeasonTeamService from "@/services/SeasonTeamService";

/**
 * @module Modal:DeleteSeasonTeamModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteSeasonTeamId=null
 *
 * @vue-event {string} seasonTeamDeleted
 *
 * @example
 * <template>
 *  <DeleteSeasonTeamModal ref="deleteSeasonTeamModal" @seasonTeamDeleted="handler" />
 *  <Button @click="() => $refs.deleteSeasonTeamModal.open('abc')" />
 * </template>
 */
export default {
  name: "DeleteSeasonTeamModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteSeasonTeamId: null,
  }),
  methods: {
    open(deleteSeasonTeamId) {
      this.deleteSeasonTeamId = deleteSeasonTeamId;
      this.$refs.modal.show();
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
