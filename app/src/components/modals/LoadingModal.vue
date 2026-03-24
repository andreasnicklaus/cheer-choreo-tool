<template>
  <BModal
    ref="modal"
    :id="`loading-modal-${id}`"
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
            {{ description }}
          </slot>
        </p>
      </BCol>
    </BRow>
  </BModal>
</template>

<script>
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
export default {
  name: "LoadingModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    description: {
      type: String,
      default: function () {
        return this.$t("modals.loading.wird-geladen");
      },
    },
  },
  methods: {
    open() {
      this.$refs.modal?.show();
    },
    close() {
      this.$refs.modal?.hide();
    },
  },
};
</script>
