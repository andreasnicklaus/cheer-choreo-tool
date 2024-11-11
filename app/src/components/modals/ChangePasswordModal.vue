<template>
  <b-modal
    :id="`changePasswordModal-${id}`"
    title="Passwort ändern"
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
        valid-feedback="Dein Passwort ist gültig!"
        label="Neues Passwort:"
      >
        <b-form-input
          v-model="newPassword"
          placeholder="Neues Passwort"
          autofocus
          required
          :state="newPasswordIsValid"
        />
      </b-form-group>
      <b-form-group
        :state="passwordRepetitionIsValid"
        :invalid-feedback="passwordRepetitionStateFeedback"
        valid-feedback="Die Wiederholung entspricht deinem neuen Passwort!"
        label="Wiederholung:"
      >
        <b-form-input
          v-model="passwordRepetition"
          placeholder="Neues Passwort"
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
        Password ändern
      </b-button>
      <b-button @click="cancel" variant="danger"> Abbrechen </b-button>
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
          this.$bvToast.toast("Dein Passwort wurde geändert", {
            variant: "success",
            title: "Passwort geändert",
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
        })
        .catch(() => {
          this.$bvToast.toast("Dein neues Passwort ist nicht erlaubt.", {
            variant: "danger",
            title: "Das hat nicht funktioniert",
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
        });
    },
  },
  computed: {
    newPasswordIsValid() {
      return Boolean(this.newPassword) && this.newPassword.length >= 6;
    },
    newPasswordStateFeedback() {
      if (!this.newPassword || this.newPassword.length < 6)
        return "Min. 6 Zeichen";
      return null;
    },
    passwordRepetitionIsValid() {
      return (
        Boolean(this.passwordRepetition) &&
        this.newPassword == this.passwordRepetition
      );
    },
    passwordRepetitionStateFeedback() {
      if (!this.passwordRepetition) return "Erforderlich";
      if (this.newPassword != this.passwordRepetition)
        return "Die Wiederholung entspricht nicht dem ersten Passwort";
      return null;
    },
  },
};
</script>
