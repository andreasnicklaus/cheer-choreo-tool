<template>
  <b-modal
    :id="`modal-deleteClub-${id}`"
    :title="$t('modals.delete-club.verein-loeschen')"
    centered
    @show="reset"
    @ok="deleteClub"
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
      this.$bvModal.show(`modal-deleteClub-${this.id}`);
      this.deleteClubId = deleteClubId;
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
