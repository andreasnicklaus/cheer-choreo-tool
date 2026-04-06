<template>
  <BModal
    :id="`comfirmEmailModal-${id}`"
    ref="modal"
    :title="$t('modals.confirm-email.bestaetige-deine-e-mail-adresse')"
    centered
    :header-bg-variant="isError ? 'danger' : 'success'"
    header-text-variant="light"
  >
    <p>
      {{ $t("modals.confirm-email.info-1") }}
    </p>
    <p>{{ $t("modals.confirm-email.info-2") }}</p>
    <template #footer="{ cancel }">
      <BButton
        :variant="isError ? 'outline-danger' : 'outline-success'"
        @click="cancel"
      >
        {{ $t("feedback.schliessen") }}
      </BButton>
    </template>
  </BModal>
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
  name: "ConfirmEmailModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    isError: false,
  }),
  methods: {
    open(isError = false) {
      this.isError = isError;
      this.$refs.modal.show();
    },
  },
};
</script>
