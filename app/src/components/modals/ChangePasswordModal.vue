<template>
  <b-modal
    :id="`changePasswordModal-${id}`"
    :title="$t('accountView.passwort-aendern')"
    centered
    @ok="changePassword"
    @show="
      () => {
        this.newPassword = null;
        this.passwordRepetition = null;
      }
    "
  >
    <b-form>
      <b-form-group
        :state="newPasswordIsValid"
        :invalid-feedback="newPasswordStateFeedback"
        :valid-feedback="$t('modals.change-password.dein-passwort-ist-gueltig')"
        :label="$t('modals.change-password.neues-passwort')"
      >
        <b-form-input
          v-model="newPassword"
          :placeholder="$t('modals.change-password.neues-passwort')"
          autofocus
          required
          :state="newPasswordIsValid"
        />
      </b-form-group>
      <b-form-group
        :state="passwordRepetitionIsValid"
        :invalid-feedback="passwordRepetitionStateFeedback"
        :valid-feedback="
          $t(
            'modals.change-password.die-wiederholung-entspricht-deinem-neuen-passwort'
          )
        "
        :label="$t('modals.change-password.wiederholung')"
      >
        <b-form-input
          v-model="passwordRepetition"
          :placeholder="$t('modals.change-password.neues-passwort')"
          required
          :state="passwordRepetitionIsValid"
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        @click="ok"
        variant="success"
        :disabled="!newPasswordIsValid || !passwordRepetitionIsValid"
      >
        {{ $t("modals.change-password.password-aendern") }}
      </b-button>
      <b-button @click="cancel" variant="danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import AuthService from "@/services/AuthService";

export default {
  name: "ChangePasswordModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newPassword: null,
    passwordRepetition: null,
  }),
  methods: {
    open() {
      this.$bvModal.show(`changePasswordModal-${this.id}`);
    },
    changePassword() {
      AuthService.changePassword(this.newPassword)
        .then(() => {
          this.$bvToast.toast(
            this.$t("modals.change-password.dein-passwort-wurde-geaendert"),
            {
              variant: "success",
              title: this.$t("modals.change-password.passwort-geaendert"),
              autoHideDelay: 3000,
              appendToast: true,
              solid: true,
            }
          );
        })
        .catch(() => {
          this.$bvToast.toast(
            this.$t(
              "modals.change-password.dein-neues-passwort-ist-nicht-erlaubt"
            ),
            {
              variant: "danger",
              title: this.$t("accountView.das-hat-nicht-funktioniert"),
              autoHideDelay: 3000,
              appendToast: true,
              solid: true,
            }
          );
        });
    },
  },
  computed: {
    newPasswordIsValid() {
      return Boolean(this.newPassword) && this.newPassword.length >= 6;
    },
    newPasswordStateFeedback() {
      if (!this.newPassword || this.newPassword.length < 6)
        return this.$t("modals.change-password.min-password-length");
      return null;
    },
    passwordRepetitionIsValid() {
      return (
        Boolean(this.passwordRepetition) &&
        this.newPassword == this.passwordRepetition
      );
    },
    passwordRepetitionStateFeedback() {
      if (!this.passwordRepetition) return this.$t("erforderlich");
      if (this.newPassword != this.passwordRepetition)
        return this.$t(
          "modals.change-password.die-wiederholung-entspricht-nicht-dem-ersten-passwort"
        );
      return null;
    },
  },
};
</script>
