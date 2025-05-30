<template>
  <b-modal
    :id="`deleteAccountModal-${id}`"
    :title="$t('accountView.konto-loeschen')"
    centered
    @show="() => (this.accountDeletionApproval = false)"
  >
    <p>
      {{ $t("modals.delete-account.info") }}
    </p>
    <b-form-checkbox
      v-model="accountDeletionApproval"
      :state="accountDeletionApproval"
      autofocus
    >
      {{ $t("modals.delete-account.verstanden") }}
    </b-form-checkbox>
    <template #modal-footer="{ cancel }">
      <b-button
        v-b-modal="`confirmDeletionModal-${id}`"
        variant="danger"
        :disabled="!accountDeletionApproval"
      >
        {{ $t("modals.delete-account.account-loeschen") }}
      </b-button>
      <b-button @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </b-button>
    </template>

    <b-modal
      :id="`confirmDeletionModal-${id}`"
      :title="$t('bist-du-sicher')"
      centered
      @ok="deleteMember"
    >
      <p>{{ $t("du-kannst-diese-aktion-nicht-rueckgaengig-machen") }}</p>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="danger">{{
          $t("jetzt-loeschen")
        }}</b-button>
        <b-button @click="cancel" variant="outline-secondary">
          {{ $t("abbrechen") }}
        </b-button>
      </template>
    </b-modal>
  </b-modal>
</template>

<script>
import AuthService from "@/services/AuthService";

/**
 * @module Modal:DeleteAccountModal
 *
 * @vue-data {String} id
 * @vue-data {Boolean} accountDeletionApproval=false
 */
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
