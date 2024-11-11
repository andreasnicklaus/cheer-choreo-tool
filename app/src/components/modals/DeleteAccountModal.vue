<template>
  <b-modal
    :id="`deleteAccountModal-${id}`"
    title="Konto löschen"
    centered
    @show="() => (this.accountDeletionApproval = false)"
  >
    <p>
      Wenn du dein Konto löscht, werden alle damit verbundenen Informationen
      gelöscht. Dazu gehören Vereine, Teams, Mitglieder, Choreos, Aufstellungen
      und Countsheets.
    </p>
    <b-form-checkbox
      v-model="accountDeletionApproval"
      :state="accountDeletionApproval"
      autofocus
    >
      Ich habe verstanden und möchte fortfahren.
    </b-form-checkbox>
    <template #modal-footer="{ cancel }">
      <b-button
        v-b-modal="`confirmDeletionModal-${id}`"
        variant="danger"
        :disabled="!accountDeletionApproval"
      >
        Account löschen
      </b-button>
      <b-button @click="cancel" variant="outline-secondary">
        Abbrechen
      </b-button>
    </template>

    <b-modal
      :id="`confirmDeletionModal-${id}`"
      title="Bist du sicher?"
      centered
      @ok="deleteMember"
    >
      <p>Du kannst diese Aktion nicht rückgängig machen.</p>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="danger"> Jetzt löschen </b-button>
        <b-button @click="cancel" variant="outline-secondary">
          Abbrechen
        </b-button>
      </template>
    </b-modal>
  </b-modal>
</template>

<script>
import AuthService from "@/services/AuthService";

export default {
  name: "DeleteAccountModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    accountDeletionApproval: false,
  }),
  methods: {
    open() {
      this.$bvModal.show(`deleteAccountModal-${this.id}`);
    },
    deleteMember() {
      AuthService.deleteAccount();
    },
  },
};
</script>
