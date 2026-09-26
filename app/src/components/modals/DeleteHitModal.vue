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
      <BButton variant="light" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import HitService from "@/services/HitService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
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
    deleteHitId: null as string | null,
  }),
  methods: {
    open(deleteHitId: string) {
      this.deleteHitId = deleteHitId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    resetDeleteHitModal() {
      this.deleteHitId = null;
    },
    deleteHit() {
      HitService.remove(this.deleteHitId!).then(() => {
        this.$emit(
          "updateHits",
          this.choreo.Hits.filter((h: any) => h.id != this.deleteHitId)
        );
      });
    },
  },
});
</script>
