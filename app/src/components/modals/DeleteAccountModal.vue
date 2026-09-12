<template>
  <BModal
    :id="`deleteAccountModal-${id}`"
    ref="modal"
    :title="$t('accountView.konto-loeschen')"
    centered
    @show="() => (accountDeletionApproval = false)"
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
        variant="danger"
        :disabled="!accountDeletionApproval"
        @click="openConfirmModal"
      >
        {{ $t("modals.delete-account.account-loeschen") }}
      </BButton>
      <BButton variant="light" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>

    <BModal
      :id="`confirmDeletionModal-${id}`"
      ref="confirmModal"
      :title="$t('bist-du-sicher')"
      centered
      @ok="deleteMember"
    >
      <p>{{ $t("du-kannst-diese-aktion-nicht-rueckgaengig-machen") }}</p>
      <template #footer="{ ok, cancel }">
        <BButton variant="danger" @click="ok">{{
          $t("jetzt-loeschen")
        }}</BButton>
        <BButton variant="light" @click="cancel">
          {{ $t("abbrechen") }}
        </BButton>
      </template>
    </BModal>
  </BModal>
</template>

<script lang="ts">
import AuthService from "@/services/AuthService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
  name: "DeleteAccountModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    accountDeletionApproval: false,
  }),
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    openConfirmModal() {
      (this.$refs.confirmModal as InstanceType<typeof BModal>).show();
    },
    deleteMember() {
      AuthService.deleteAccount();
    },
  },
});
</script>
