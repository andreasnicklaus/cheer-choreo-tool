<template>
  <BModal
    :id="`deleteModal-${id}`"
    ref="modal"
    centered
    :title="$t('bist-du-sicher')"
    @ok="removeChoreo"
  >
    {{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}
    <template #footer="{ ok, cancel }">
      <BButton variant="danger" @click="ok">{{ $t("loeschen") }}</BButton>
      <BButton variant="light" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import ChoreoService from "@/services/ChoreoService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

/**
 * @module Modal:DeleteChoreoModal
 *
 * @vue-data {String} id
 *
 * @vue-prop {String} choreoId
 *
 * @vue-event {string} choreoDeleted - Emitted when choreo has been deleted
 *
 * @example
 * <template>
 *  <DeleteChoreoModal ref="deleteChoreoModal" choreoId="abc" @choreoDeleted="handler" />
 *  <Button @click="() => $refs.deleteChoreoModal.open()" />
 * </template>
 */
export default defineComponent({
  name: "DeleteChoreoModal",
  props: {
    choreoId: {
      type: String,
      default: "",
    },
  },
  emits: ["choreoDeleted"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    removeChoreo() {
      ChoreoService.remove(this.choreoId).then(() => {
        this.$emit("choreoDeleted", this.choreoId);
      });
    },
  },
});
</script>
