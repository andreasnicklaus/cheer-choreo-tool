<template>
  <b-modal
    :id="`comfirmEmailModal-${id}`"
    title="Bestätige deine E-Mail-Adresse"
    centered
    :header-bg-variant="isError ? 'danger' : 'success'"
    header-text-variant="light"
  >
    <p>
      Um dein Konto zu aktivieren, bestätige deine E-Mail-Adresse mit dem Link
      aus der E-Mail, die wir dir geschickt haben.
    </p>
    <p>Überprüfe auch dein Spam-Postfach, um die E-Mail zu finden.</p>
    <template #modal-footer="{ cancel }">
      <b-button
        @click="cancel"
        :variant="isError ? 'outline-danger' : 'outline-success'"
      >
        Schließen
      </b-button>
    </template>
  </b-modal>
</template>

<script>
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
