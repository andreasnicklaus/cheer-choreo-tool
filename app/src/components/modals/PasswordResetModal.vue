<template>
  <b-modal
    :id="`passwordReset-modal-${id}`"
    centered
    @show="resetPasswordResetModal"
    @ok="initializePasswordReset"
    @close="close"
  >
    <template #modal-title>
      {{ $t("modals.reset-password.lost-password") }}
      <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
    </template>
    <b-form-group
      :label="$t('e-mail-adresse')"
      label-class="label-with-colon"
      :description="$t('modals.reset-password.no-email-info')"
      :state="emailIsValid"
      :invalid-feedback="emailError"
    >
      <b-input-group>
        <b-form-input
          v-model="email"
          autofocus
          placeholder="info@choreo-planer.de"
          :state="emailIsValid"
        />
        <b-input-group-append>
          <b-input-group-text
            v-b-tooltip.hover
            :title="$t('modals.reset-password.email-info')"
          >
            <b-icon-info-circle />
          </b-input-group-text>
        </b-input-group-append>
      </b-input-group>
    </b-form-group>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        type="submit"
        @click="ok"
        variant="outline-success"
        :disabled="!emailIsValid"
      >
        <b-spinner small v-if="loading" />
        <span v-else>{{
          $t("modals.reset-password.login-link-schicken")
        }}</span>
      </b-button>
      <b-button @click="cancel" variant="secondary">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import NewVersionBadge from "@/components/NewVersionBadge.vue";

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * @module Modal:LoadingModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} email=null
 * @vue-data {Boolean} loading=false
 *
 * @vue-computed {Boolean} emailIsValid
 * @vue-computed {String|null} emailError
 *
 * @vue-event {null} passwordResetRequested
 */
export default {
  name: "LoadingModal",
  components: { NewVersionBadge },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    email: null,
    loading: false,
  }),
  methods: {
    open() {
      this.$bvModal.show(`passwordReset-modal-${this.id}`);
    },
    close() {
      this.$bvModal.hide(`passwordReset-modal-${this.id}`);
    },
    resetPasswordResetModal() {
      this.email = null;
      this.loading = false;
    },
    initializePasswordReset(event) {
      this.loading = true;
      event.preventDefault();
      AuthService.requestSSO(this.email)
        .then(() => {
          this.$emit("passwordResetRequested");
          this.loading = false;
          this.close();
        })
        .catch((e) => {
          this.loading = false;
          MessagingService.showError(e.response.data, this.$t("fehler"), {
            autoHideDelay: 5_000,
          });
        });
    },
  },
  computed: {
    emailIsValid() {
      return this.email != null && this.email.match(emailRegex)?.length > 0;
    },
    emailError() {
      if (this.email == null || this.email.length == 0)
        return this.$t("login.bitte-angeben");
      const emailRegexMatches = this.email.match(emailRegex);
      if (!emailRegexMatches || emailRegexMatches.length <= 0)
        return this.$t("login.echte-email");
      else return null;
    },
  },
};
</script>
