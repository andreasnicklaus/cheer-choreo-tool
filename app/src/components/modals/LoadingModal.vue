<template>
  <b-modal
    :id="`loading-modal-${id}`"
    centered
    no-close-on-backdrop
    no-close-on-esc
    hide-footer
    hide-header
    @close="(event) => event.preventDefault()"
  >
    <b-row align-h="center">
      <b-col cols="auto" class="text-center my-5">
        <b-spinner />
        <p class="m-0">
          <slot>
            {{ description }}
          </slot>
        </p>
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
export default {
  name: "LoadingModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    description: {
      type: String,
      default: this.$t("modals.loading.wird-geladen"),
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`loading-modal-${this.id}`);
    },
    close() {
      this.$bvModal.hide(`loading-modal-${this.id}`);
    },
  },
};
</script>
