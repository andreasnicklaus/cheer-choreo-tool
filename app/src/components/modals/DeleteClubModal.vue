<template>
  <BModal
    :id="`modal-deleteClub-${id}`"
    ref="modal"
    :title="$t('modals.delete-club.verein-loeschen')"
    centered
    @hidden="reset"
    @ok="deleteClub"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #footer="{ ok, cancel }">
      <BButton variant="danger" @click="ok">{{ $t("loeschen") }}</BButton>
      <BButton variant="outline-secondary" @click="cancel">
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
  emits: ["clubDeleted"],
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
