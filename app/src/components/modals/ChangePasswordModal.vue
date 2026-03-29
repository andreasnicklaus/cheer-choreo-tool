<template>
  <BModal
    :id="`changePasswordModal-${id}`"
    ref="modal"
    :title="$t('accountView.passwort-aendern')"
    centered
    @ok="changePassword"
    @show="
      () => {
        newPassword = null;
        passwordRepetition = null;
      }
    "
  >
    <BForm>
      <BFormGroup
        :state="newPasswordIsValid"
        :invalid-feedback="newPasswordStateFeedback"
        :valid-feedback="$t('modals.change-password.dein-passwort-ist-gueltig')"
        :label="$t('modals.change-password.neues-passwort')"
        label-class="label-with-colon"
      >
        <BFormInput
          v-model="newPassword"
          :placeholder="$t('modals.change-password.neues-passwort')"
          type="password"
          autofocus
          required
          :state="newPasswordIsValid"
        />
      </BFormGroup>
      <BFormGroup
        :state="passwordRepetitionIsValid"
        :invalid-feedback="passwordRepetitionStateFeedback"
        :valid-feedback="
          $t(
            'modals.change-password.die-wiederholung-entspricht-deinem-neuen-passwort'
          )
        "
        :label="$t('modals.change-password.wiederholung')"
        label-class="label-with-colon"
      >
        <BFormInput
          v-model="passwordRepetition"
          :placeholder="$t('modals.change-password.neues-passwort')"
          required
          type="password"
          :state="passwordRepetitionIsValid"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        variant="success"
        :disabled="!newPasswordIsValid || !passwordRepetitionIsValid"
        @click="ok"
      >
        {{ $t("modals.change-password.password-aendern") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import ERROR_CODES from "@/utils/error_codes";
import { error, log } from "@/utils/logging";

/**
 * @module Modal:ChangePasswordModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newPassword=null
 * @vue-data {String|null} passwordRepetition=null
 *
 * @vue-computed {Boolean} newPasswordIsValid
 * @vue-computed {String|null} newPasswordStateFeedback
 * @vue-computed {Boolean} passwordRepetitionIsValid
 * @vue-computed {String|null} passwordRepetitionStateFeedback
 *
 * @example <ChangePasswordModal />
 */
export default {
  name: "ChangePasswordModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newPassword: null,
    passwordRepetition: null,
  }),
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
  methods: {
    open() {
      this.$refs.modal.show();
    },
    changePassword() {
      AuthService.changePassword(this.newPassword)
        .then(() => {
          log("Your password has been changed");
          MessagingService.showSuccess(
            this.$t("modals.change-password.dein-passwort-wurde-geaendert"),
            this.$t("modals.change-password.passwort-geaendert")
          );
        })
        .catch(() => {
          error(
            "Password replacement is not allowed",
            ERROR_CODES.PASSWORD_CHANGE_NOT_ALLOWED
          );
          MessagingService.showError(
            this.$t(
              "modals.change-password.dein-neues-passwort-ist-nicht-erlaubt"
            ),
            this.$t("accountView.das-hat-nicht-funktioniert")
          );
        });
    },
  },
};
</script>
