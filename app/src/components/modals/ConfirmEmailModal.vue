<template>
  <b-modal
    :id="`comfirmEmailModal-${id}`"
    :title="$t('modals.confirm-email.bestaetige-deine-e-mail-adresse')"
    centered
    :header-bg-variant="isError ? 'danger' : 'success'"
    header-text-variant="light"
  >
    <p>
      {{ $t("modals.confirm-email.info-1") }}
    </p>
    <p>{{ $t("modals.confirm-email.info-2") }}</p>
    <template #modal-footer="{ cancel }">
      <b-button
        @click="cancel"
        :variant="isError ? 'outline-danger' : 'outline-success'"
      >
        {{ $t("feedback.schliessen") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
/**
 * @module Modal:ConfirmEmailModal
 *
 * @vue-data {String} id
 * @vue-data {Boolean} isError=false
 *
 * @example <ConfirmEmailModal />
 */
export default {
  name: "HowToModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    isError: false,
  }),
  methods: {
    open(isError = false) {
      this.isError = isError;
      this.$bvModal.show(`comfirmEmailModal-${this.id}`);
    },
  },
};
</script>
