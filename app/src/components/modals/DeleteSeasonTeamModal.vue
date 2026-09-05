<template>
  <BModal
    :id="`modal-deleteSeasonTeam-${id}`"
    ref="modal"
    :title="$t('modals.delete-season.season-loeschen')"
    centered
    @hidden="reset"
    @ok="deleteSeasonTeam"
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
import SeasonTeamService from "@/services/SeasonTeamService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
  name: "DeleteSeasonTeamModal",
  emits: ["seasonTeamDeleted"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteSeasonTeamId: null as string | null,
  }),
  methods: {
    open(deleteSeasonTeamId: string) {
      this.deleteSeasonTeamId = deleteSeasonTeamId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    reset() {
      this.deleteSeasonTeamId = null;
    },
    deleteSeasonTeam() {
      SeasonTeamService.remove(this.deleteSeasonTeamId!).then(() => {
        this.$emit("seasonTeamDeleted", this.deleteSeasonTeamId);
      });
    },
  },
});
</script>
