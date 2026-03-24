<template>
  <BModal
    ref="modal"
    :id="`modal-deleteClub-${id}`"
    :title="$t('modals.delete-club.verein-loeschen')"
    centered
    @show="reset"
    @ok="deleteClub"
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
import ClubService from "@/services/ClubService";

/**
 * @module Modal:DeleteClubModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteClubId=null
 *
 * @vue-event {string} clubDeleted
 *
 * @example
 * <template>
 *  <DeleteClubModal ref="deleteClubModal" @clubDeleted="handler" />
 *  <Button @click="() => $refs.deleteClubModal.open('abc')" />
 * </template>
 */
export default {
  name: "DeleteClubModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteClubId: null,
  }),
  methods: {
    open(deleteClubId) {
      this.deleteClubId = deleteClubId;
      this.$refs.modal.show();
    },
    reset() {
      this.deleteClubId = null;
    },
    deleteClub() {
      ClubService.remove(this.deleteClubId).then(() => {
        this.$emit("clubDeleted", this.deleteClubId);
      });
    },
  },
};
</script>
