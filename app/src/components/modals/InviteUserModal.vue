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
      <BFormGroup
        class="mb-2"
        :label="$t('e-mail-adresse')"
        label-class="label-with-colon"
        :state="emailState"
        :invalid-feedback="emailStateFeedback"
      >
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
        class="mb-4"
        :label="$t('modals.invite-user.role')"
        label-class="label-with-colon"
      >
        <BFormSelect v-model="role" :options="roleOptions" />
      </BFormGroup>
    </BForm>

    <!-- Role explanation table -->
    <p class="text-muted small mt-4 mb-0">
      {{ $t("modals.invite-user.what-each-role-can-do") }}
    </p>
    <AccessOverViewTable />
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="success"
        :disabled="!emailState"
        @click="ok"
      >
        {{ $t("modals.invite-user.send") }}
      </BButton>
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import UserAccessService from "@/services/UserAccessService";
import MessagingService from "@/services/MessagingService";
import AccessOverViewTable from "../AccessOverViewTable.vue";
import { emailRegex } from "@/utils/validation";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

/**
 * Modal to invite users to share access to your account.
 * @example
 * <InviteUserModal ref="inviteUserModal" @invited="loadManagedByMe" />
 * <Button @click="() => $refs.inviteUserModal.open()" />
 */
export default defineComponent({
  name: "InviteUserModal",
  components: { AccessOverViewTable },
  emits: ["invited"],
  data: () => ({
    email: "",
    role: "athlete",
  }),
  computed: {
    emailState() {
      if (this.email.length === 0) return false;
      const match = this.email.match(emailRegex);
      return match != null && match.length > 0;
    },
    emailStateFeedback() {
      if (!this.email) return this.$t("erforderlich");
      else if (
        !this.email.match(emailRegex) ||
        this.email.match(emailRegex)?.length == 0
      )
        return this.$t("modals.contact.please-enter-a-valid-email-address");
      return undefined;
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
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    reset() {
      this.email = "";
      this.role = "athlete";
    },
    invite() {
      UserAccessService.invite(this.email, this.role)
        .then(() => {
          this.$emit("invited");
          (this.$refs.modal as InstanceType<typeof BModal>).hide();
        })
        .catch(() => {
          MessagingService.showError(
            this.$t("accountView.unbekannter-fehler"),
            this.$t("modals.invite-user.error")
          );
        });
    },
  },
});
</script>
