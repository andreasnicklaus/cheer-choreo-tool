<template>
  <BModal
    ref="modal"
    :id="`deleteAccountModal-${id}`"
    :title="$t('accountView.konto-loeschen')"
    centered
    @show="() => (this.accountDeletionApproval = false)"
  >
    <p>
      {{ $t("modals.delete-account.info") }}
    </p>
    <BFormCheckbox
      v-model="accountDeletionApproval"
      :state="accountDeletionApproval"
      autofocus
    >
      {{ $t("modals.delete-account.verstanden") }}
    </BFormCheckbox>
    <template #footer="{ cancel }">
      <BButton
        @click="openConfirmModal"
        variant="danger"
        :disabled="!accountDeletionApproval"
      >
        {{ $t("modals.delete-account.account-loeschen") }}
      </BButton>
      <BButton @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </BButton>
    </template>

    <BModal
      ref="confirmModal"
      :id="`confirmDeletionModal-${id}`"
      :title="$t('bist-du-sicher')"
      centered
      @ok="deleteMember"
    >
      <p>{{ $t("du-kannst-diese-aktion-nicht-rueckgaengig-machen") }}</p>
      <template #footer="{ ok, cancel }">
        <BButton @click="ok" variant="danger">{{
          $t("jetzt-loeschen")
        }}</BButton>
        <BButton @click="cancel" variant="outline-secondary">
          {{ $t("abbrechen") }}
        </BButton>
      </template>
    </BModal>
  </BModal>
</template>

<script>
import AuthService from "@/services/AuthService";

/**
 * @module Modal:DeleteAccountModal
 *
 * @vue-data {String} id
 * @vue-data {Boolean} accountDeletionApproval=false
 *
 * @example
 * <template>
 *  <DeleteAccountModal ref="deleteAccountModal" />
 *  <Button @click="() => $refs.deleteAccountModal.open()" />
 * </template>
 */
export default {
  name: "DeleteAccountModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    accountDeletionApproval: false,
  }),
  methods: {
    open() {
      this.$refs.modal.show();
    },
    openConfirmModal() {
      this.$refs.confirmModal.show();
    },
    deleteMember() {
      AuthService.deleteAccount();
    },
  },
};
</script>
