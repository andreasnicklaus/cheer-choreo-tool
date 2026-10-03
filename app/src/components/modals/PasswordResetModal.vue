<template>
  <BModal
    :id="`passwordReset-modal-${id}`"
    ref="modal"
    centered
    @show="resetPasswordResetModal"
    @ok.prevent="initializePasswordReset"
    @close="close"
  >
    <template #title>
      {{ $t("modals.reset-password.lost-password") }}
      <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
    </template>
    <BFormGroup
      :label="$t('e-mail-adresse')"
      label-class="label-with-colon"
      :description="$t('modals.reset-password.no-email-info')"
      :state="emailIsValid"
      :invalid-feedback="emailError"
    >
      <BInputGroup>
        <BFormInput
          v-model="email"
          autofocus
          placeholder="info@choreo-planer.de"
          :state="emailIsValid"
        />
        <template #append>
          <BInputGroupText
            v-b-tooltip.hover="$t('modals.reset-password.email-info')"
          >
            <IBiInfoCircle />
          </BInputGroupText>
        </template>
      </BInputGroup>
    </BFormGroup>
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="outline-success"
        :disabled="!emailIsValid"
        @click="ok"
      >
        <BSpinner v-if="loading" small />
        <span v-else>{{
          $t("modals.reset-password.login-link-schicken")
        }}</span>
      </BButton>
      <BButton variant="secondary" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import { error } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import { emailRegex } from "@/utils/validation";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

/**
 * @module Modal:PasswordResetModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} email=null
 * @vue-data {Boolean} loading=false
 *
 * @vue-computed {Boolean} emailIsValid
 * @vue-computed {String|null} emailError
 *
 * @vue-event {null} passwordResetRequested
 *
 * @example
 * <template>
 *  <PasswordResetModal ref="passwordResetModal" @passwordResetRequested="handler" />
 *  <Button @click="() => $refs.passwordResetModal.open()" />
 * </template>
 */
export default defineComponent({
  name: "LoadingModal",
  components: { NewVersionBadge },
  emits: ["passwordResetRequested"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    email: "",
    loading: false,
  }),
  computed: {
    emailIsValid() {
      if (this.email.length === 0) return false;
      const match = this.email.match(emailRegex);
      return match != null && match.length > 0;
    },
    emailError() {
      if (this.email == null || this.email.length == 0)
        return this.$t("login.bitte-angeben");
      const emailRegexMatches = this.email.match(emailRegex);
      if (!emailRegexMatches || emailRegexMatches.length <= 0)
        return this.$t("login.echte-email");
      else return undefined;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    close() {
      (this.$refs.modal as InstanceType<typeof BModal>).hide();
    },
    resetPasswordResetModal() {
      this.email = "";
      this.loading = false;
    },
    initializePasswordReset(event: any) {
      this.loading = true;
      AuthService.requestSSO(this.email)
        .then(() => {
          this.$emit("passwordResetRequested");
          this.loading = false;
          this.close();
        })
        .catch((e) => {
          error(e, ERROR_CODES.SSO_REQUEST_FAILED);
          this.loading = false;
          MessagingService.showError(e.response.data, this.$t("fehler"), {
            autoHideDelay: 5_000,
          });
        });
    },
  },
});
</script>
