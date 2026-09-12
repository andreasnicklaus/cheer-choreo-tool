<template>
  <BModal
    :id="`modal-deleteTeam-${id}`"
    ref="modal"
    :title="$t('modals.delete-team.team-loeschen')"
    centered
    @hidden="reset"
    @ok="deleteTeam"
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

<script lang="ts">
import TeamService from "@/services/TeamService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
  name: "DeleteTeamModal",
  emits: ["teamDeleted"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteTeamId: null as string | null,
  }),
  methods: {
    open(deleteTeamId: string) {
      this.deleteTeamId = deleteTeamId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    reset() {
      this.deleteTeamId = null;
    },
    deleteTeam() {
      TeamService.remove(this.deleteTeamId!).then(() => {
        this.$emit("teamDeleted", this.deleteTeamId);
      });
    },
  },
});
</script>
