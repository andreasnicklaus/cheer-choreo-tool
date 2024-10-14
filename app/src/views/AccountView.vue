<template>
  <b-container id="AccountView" class="w-75">
    <b-row align-v="center" align-h="between">
      <b-col cols="auto">
        <b-icon-person-circle class="h1" />
      </b-col>
      <b-col>
        <editable-name-heading
          :name="''"
          :value="user?.username"
          @input="onNameEdit"
          placeholder="Lädt..."
        />
      </b-col>
    </b-row>
    <p class="text-muted m-0">
      Erstellt am: {{ new Date(user?.createdAt).toLocaleDateString("de") }},
      {{
        new Date(user?.createdAt).toLocaleTimeString("de", {
          hour: "numeric",
          minute: "numeric",
        })
      }}
      Uhr
    </p>
    <p class="text-muted">
      Zuletzt geändert am:
      {{ new Date(user?.updatedAt).toLocaleDateString("de") }},
      {{
        new Date(user?.updatedAt).toLocaleTimeString("de", {
          hour: "numeric",
          minute: "numeric",
        })
      }}
      Uhr
    </p>
    <b-row align-v="center" align-h="between" class="mt-3">
      <b-col cols="auto">
        <b-button-group>
          <b-button variant="warning" v-b-modal.changePasswordModal>
            <b-icon-key />
            Passwort ändern
          </b-button>
          <b-button variant="danger" v-b-modal.deleteAccountModal>
            <b-icon-trash />
            Konto löschen
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <b-modal
      id="changePasswordModal"
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
        <b-form-group :state="Boolean(newPassword)">
          <b-form-input
            v-model="newPassword"
            placeholder="Neues Passwort"
            autofocus
            required
            :state="Boolean(newPassword) && newPassword.length >= 6"
          />
        </b-form-group>
        <b-form-group
          :state="
            Boolean(passwordRepetition) && newPassword == passwordRepetition
          "
        >
          <b-form-input
            v-model="passwordRepetition"
            placeholder="Neues Passwort"
            autofocus
            required
            :state="
              Boolean(passwordRepetition) && newPassword == passwordRepetition
            "
          />
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button
          @click="ok"
          variant="success"
          :disabled="
            !Boolean(newPassword) ||
            newPassword.length < 6 ||
            !Boolean(passwordRepetition) ||
            newPassword != passwordRepetition
          "
        >
          Password ändern
        </b-button>
        <b-button @click="cancel" variant="danger"> Abbrechen </b-button>
      </template>
    </b-modal>

    <b-modal
      id="deleteAccountModal"
      title="Konto löschen"
      centered
      @show="() => (this.accountDeletionApproval = false)"
    >
      <p>
        Wenn du dein Konto löscht, werden alle damit verbundenen Informationen
        gelöscht. Dazu gehören Vereine, Teams, Mitglieder, Choreos,
        Aufstellungen und Countsheets.
      </p>
      <b-checkbox v-model="accountDeletionApproval">
        Ich habe verstanden und möchte fortfahren.
      </b-checkbox>
      <template #modal-footer="{ cancel }">
        <b-button
          v-b-modal.confirmDeletionModal
          variant="danger"
          :disabled="!accountDeletionApproval"
        >
          Account löschen
        </b-button>
        <b-button @click="cancel" variant="outline-secondary">
          Abbrechen
        </b-button>
      </template>
    </b-modal>

    <b-modal
      id="confirmDeletionModal"
      title="Bist du sicher?"
      centered
      @ok="deleteMember"
    >
      <p>Du kannst diese Aktion nicht rückgängig machen.</p>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="danger"> Jetzt löschen </b-button>
        <b-button @click="cancel" variant="outline-secondary">
          Abbrechen
        </b-button>
      </template>
    </b-modal>
  </b-container>
</template>

<script>
import AuthService from "@/services/AuthService";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
export default {
  components: { EditableNameHeading },
  name: "AccountView",
  data: () => ({
    user: null,
    accountDeletionApproval: false,
    newPassword: null,
    passwordRepetition: null,
  }),
  mounted() {
    AuthService.getUserInfo()
      .then((user) => {
        this.user = user;
      })
      .catch(() => {
        this.$bvToast.toast(
          "Ein unbekannter Fehler ist aufgetreten. Lade die Seite neu oder logge dich erneut ein, um die Seite anzuzeigen.",
          {
            variant: "danger",
            title: "Das hat nicht funktioniert",
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          }
        );
      });
  },
  methods: {
    onNameEdit(username) {
      AuthService.changeUsername(username)
        .then((user) => {
          this.user = user;
        })
        .catch(() => {
          this.$bvToast.toast(
            "Dein neuer Nutzername ist nicht erlaubt. Entweder ist der Nutzername leer oder es gibt schon einen Nutzer mit dem Namen.",
            {
              variant: "danger",
              title: "Das hat nicht funktioniert",
              autoHideDelay: 3000,
              appendToast: true,
              solid: true,
            }
          );
        });
    },
    deleteMember() {
      AuthService.deleteAccount();
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
};
</script>
