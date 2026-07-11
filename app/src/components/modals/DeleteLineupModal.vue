<template>
  <BModal
    :id="`modal-deleteLineup-${id}`"
    ref="modal"
    :title="$t('modals.delete-lineup.aufstellung-loeschen')"
    centered
    @hidden="resetDeleteLineupModal"
    @ok="deleteLineup"
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
import LineupService from "@/services/LineupService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

/**
 * @module Modal:DeleteLineupModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteLineupId=null
 *
 * @vue-prop {Object} choreo
 *
 * @vue-event {Array} updateLineups
 *
 * @example
 * <template>
 *  <DeleteLineupModal ref="deleteLineupModal" :choreo="choreoObj" @updateLineups="handler" />
 *  <Button @click="() => $refs.deleteLineupModal.open('abc')" />
 * </template>
 */
export default defineComponent({
  name: "DeleteLineupModal",
  props: {
    choreo: {
      type: Object,
      default: null,
    },
  },
  emits: ["updateLineups"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteLineupId: null as string | null,
  }),
  methods: {
    open(deleteLineupId: string) {
      this.deleteLineupId = deleteLineupId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    resetDeleteLineupModal() {
      this.deleteLineupId = null;
    },
    deleteLineup() {
      LineupService.remove(this.deleteLineupId!).then(() => {
        this.$emit(
          "updateLineups",
          this.choreo.Lineups.filter((l: any) => l.id != this.deleteLineupId)
        );
      });
    },
  },
});
</script>
