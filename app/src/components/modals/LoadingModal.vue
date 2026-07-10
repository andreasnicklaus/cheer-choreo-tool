<template>
  <BModal
    :id="`loading-modal-${id}`"
    ref="modal"
    centered
    no-close-on-backdrop
    no-close-on-esc
    no-footer
    no-header
    @close="(event) => event.preventDefault()"
  >
    <BRow align-h="center">
      <BCol cols="auto" class="text-center my-5">
        <BSpinner />
        <p class="m-0">
          <slot>
            {{ description || $t("modals.loading.wird-geladen") }}
          </slot>
        </p>
      </BCol>
    </BRow>
  </BModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";
/**
 * @module Modal:LoadingModal
 *
 * @vue-data {String} id
 *
 * @vue-prop {String} [description="Lade Daten..."]
 *
 * @example
 * <template>
 *  <LoadingModal ref="loadingModal" />
 *  <Button @click="() => $refs.loadingModal.open()" />
 *  <Button @click="() => $refs.loadingModal.close()" />
 * </template>
 * @example <LoadingModal />
 * @example <LoadingModal description="Bitte warten..." />
 */
export default defineComponent({
  name: "LoadingModal",
  props: {
    description: {
      type: String,
      default: null,
    },
  },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>)?.show();
    },
    close() {
      (this.$refs.modal as InstanceType<typeof BModal>)?.hide();
    },
  },
});
</script>
