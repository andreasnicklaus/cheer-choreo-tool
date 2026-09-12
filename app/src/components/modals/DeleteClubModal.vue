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
      <BButton variant="light" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import ClubService from "@/services/ClubService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
  name: "DeleteClubModal",
  emits: ["clubDeleted"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteClubId: null as string | null,
  }),
  methods: {
    open(deleteClubId: string) {
      this.deleteClubId = deleteClubId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    reset() {
      this.deleteClubId = null;
    },
    deleteClub() {
      ClubService.remove(this.deleteClubId!).then(() => {
        this.$emit("clubDeleted", this.deleteClubId);
      });
    },
  },
});
</script>
