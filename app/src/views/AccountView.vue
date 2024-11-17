<template>
  <b-container id="AccountView" class="w-75" data-view>
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
          <b-button
            variant="warning"
            @click="() => $refs.changePasswordModal.open()"
          >
            <b-icon-key />
            Passwort ändern
          </b-button>
          <b-button
            variant="danger"
            @click="() => $refs.deleteAccountModal.open()"
          >
            <b-icon-trash />
            Konto löschen
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <ChangePasswordModal ref="changePasswordModal" />

    <DeleteAccountModal ref="deleteAccountModal" />
  </b-container>
</template>

<script>
import AuthService from "@/services/AuthService";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal.vue";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal.vue";

export default {
  components: { EditableNameHeading, ChangePasswordModal, DeleteAccountModal },
  name: "AccountView",
  data: () => ({
    user: null,
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
  },
  metaInfo: {
    title: "Konto",
    meta: [
      {
        name: "description",
        content:
          "Verwalte dein Konto und nehme Aktionen wie Passwortänderungen vor.",
      },
      {
        name: "twitter:description",
        content:
          "Verwalte dein Konto und nehme Aktionen wie Passwortänderungen vor.",
      },
      {
        property: "og:description",
        content:
          "Verwalte dein Konto und nehme Aktionen wie Passwortänderungen vor.",
      },
      {
        property: "og:title",
        content: "Konto - Choreo Planer",
      },
      {
        name: "twitter:title",
        content: "Konto - Choreo Planer",
      },
    ],
  },
};
</script>
