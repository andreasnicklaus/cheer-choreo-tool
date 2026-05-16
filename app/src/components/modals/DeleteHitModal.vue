<template>
  <BModal
    :id="`modal-deleteHit-${id}`"
    ref="modal"
    :title="$t('modals.delete-hit.countsheet-eintrag-loeschen')"
    centered
    @hidden="resetDeleteHitModal"
    @ok="deleteHit"
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
import HitService from "@/services/HitService";

/**
 * @module Modal:DeleteHitModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteHitId=null
 *
 * @vue-prop {Object} choreo
 *
 * @vue-event {Array} updateHits
 *
 * @example
 * <template>
 *  <DeleteHitModal ref="deleteHitModal" :choreo="choreoObj" @updateHits="handler" />
 *  <Button @click="() => $refs.deleteHitModal.open('abc')" />
 * </template>
 */
export default {
  name: "DeleteHitModal",
  props: {
    choreo: {
      type: Object,
      default: null,
    },
  },
  emits: ["updateHits"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteHitId: null,
  }),
  methods: {
    open(deleteHitId) {
      this.deleteHitId = deleteHitId;
      this.$refs.modal.show();
    },
    resetDeleteHitModal() {
      this.deleteHitId = null;
    },
    deleteHit() {
      HitService.remove(this.deleteHitId).then(() => {
        this.$emit(
          "updateHits",
          this.choreo.Hits.filter((h) => h.id != this.deleteHitId)
        );
      });
    },
  },
};
</script>
