<template>
  <BModal
    id="modal-invite-user"
    ref="modal"
    :title="$t('modals.invite-user.title')"
    centered
    @show="reset"
    @hidden="reset"
    @ok="invite"
  >
    <p class="mb-3">{{ $t("modals.invite-user.info") }}</p>
    <BForm>
      <BFormGroup :label="$t('e-mail-adresse')" label-class="label-with-colon">
        <BFormInput
          v-model="email"
          type="email"
          :placeholder="$t('e-mail-adresse')"
          autofocus
          required
          :state="emailState"
        />
      </BFormGroup>
      <BFormGroup
        :label="$t('modals.invite-user.role')"
        label-class="label-with-colon"
      >
        <BFormSelect v-model="role" :options="roleOptions" />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="success"
        :disabled="!emailState"
        @click="ok"
      >
        {{ $t("modals.invite-user.send") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import UserAccessService from "@/services/UserAccessService";
import MessagingService from "@/services/MessagingService";

/**
 * Modal to invite users to share access to your account.
 * @example
 * <InviteUserModal ref="inviteUserModal" @invited="loadManagedByMe" />
 * <Button @click="() => $refs.inviteUserModal.open()" />
 */
export default {
  name: "InviteUserModal",
  emits: ["invited"],
  data: () => ({
    email: null,
    role: "athlete",
  }),
  computed: {
    emailState() {
      return this.email != null && this.email.length > 0;
    },
    roleOptions() {
      return [
        { value: "coach", text: this.$t("accountView.role.coach") },
        { value: "assistant", text: this.$t("accountView.role.assistant") },
        { value: "athlete", text: this.$t("accountView.role.athlete") },
      ];
    },
  },
  methods: {
    open() {
      this.$refs.modal.show();
    },
    reset() {
      this.email = null;
      this.role = "athlete";
    },
    invite() {
      UserAccessService.invite(this.email, this.role)
        .then(() => {
          this.$emit("invited");
          this.$refs.modal.hide();
        })
        .catch(() => {
          MessagingService.showError(
            this.$t("accountView.unbekannter-fehler"),
            this.$t("modals.invite-user.error")
          );
        });
    },
  },
};
</script>
