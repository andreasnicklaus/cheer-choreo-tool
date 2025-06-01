<template>
  <b-modal
    :id="`modal-deleteLineup-${this.id}`"
    :title="$t('modals.delete-lineup.aufstellung-loeschen')"
    centered
    @hidden="resetDeleteLineupModal"
    @ok="deleteLineup"
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
import LineupService from "@/services/LineupService";

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
export default {
  name: "DeleteLineupModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteLineupId: null,
  }),
  props: {
    choreo: {
      type: Object,
    },
  },
  methods: {
    open(deleteLineupId) {
      this.deleteLineupId = deleteLineupId;
      this.$bvModal.show(`modal-deleteLineup-${this.id}`);
    },
    resetDeleteLineupModal() {
      this.deleteLineupId = null;
    },
    deleteLineup() {
      LineupService.remove(this.deleteLineupId).then(() => {
        this.$emit(
          "updateLineups",
          this.choreo.Lineups.filter((l) => l.id != this.deleteLineupId)
        );
      });
    },
  },
};
</script>
