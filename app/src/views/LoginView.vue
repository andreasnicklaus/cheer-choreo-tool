<template>
  <b-container id="loginView">
    <b-tabs fill>
      <b-tab title="Anmelden" class="mt-4">
        <b-form @submit="onLoginSubmit" @reset="onReset">
          <b-form-group
            label="Nutzername"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
          >
            <b-form-input
              placeholder="Nutzername"
              :state="usernameIsValid"
              v-model="username"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Passwort"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
          >
            <b-form-input
              placeholder="Passwort"
              type="password"
              :state="passwordIsValid"
              v-model="password"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex">
            <b-button
              type="submit"
              variant="primary"
              class="mr-2"
              block
              :disabled="!usernameIsValid || !passwordIsValid"
            >
              Anmelden
            </b-button>
            <b-button
              type="reset"
              variant="light"
              v-b-tooltip.hover
              title="Formular zurücksetzen"
            >
              <b-icon-arrow-counterclockwise />
            </b-button>
          </div>
        </b-form>
      </b-tab>
      <b-tab title="Registrieren" class="mt-4">
        <b-form @submit="onRegisterSubmit" @reset="onReset">
          <b-form-group
            label="Nutzername"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
          >
            <b-form-input
              placeholder="Nutzername"
              :state="usernameIsValid"
              v-model="username"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Passwort"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
          >
            <b-form-input
              placeholder="Passwort"
              type="password"
              :state="passwordIsValid"
              v-model="password"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="Passwort"
            :state="passwordRepetitionIsValid"
            :invalid-feedback="passwordRepetitionError"
          >
            <b-form-input
              placeholder="Passwort wiederholen"
              type="password"
              :state="passwordRepetitionIsValid"
              v-model="passwordRepetition"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex">
            <b-button
              type="submit"
              variant="primary"
              class="mr-2"
              block
              :disabled="
                !usernameIsValid ||
                !passwordIsValid ||
                !passwordRepetitionIsValid
              "
            >
              Registrieren
            </b-button>
            <b-button
              type="reset"
              variant="light"
              v-b-tooltip.hover
              title="Formular zurücksetzen"
            >
              <b-icon-arrow-counterclockwise />
            </b-button>
          </div>
        </b-form>

        <b-card title="Information" class="my-2">
          <b-card-text>
            <p>
              Dein Konto ist der
              <b>Zugang für das gesamte Trainerteam</b>. Wähle Nutzername und
              Passwort frei nach Lust und Laune und teile es anschließend mit
              deinem Verein.
            </p>
            <p>
              <b>Dein Nutzername muss nicht der Vereinsname sein!</b> Nach der
              Erstellung deines Kontos wirst du aufgefordert, deinem Verein
              einen Namen zu geben.
            </p>
          </b-card-text>
        </b-card>
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script>
import AuthService from "@/services/AuthService";

const failMessages = [
  "Oh, oh!",
  "Satz mit X",
  "Da-dumm...",
  "Check ich nicht :/",
  "Probier's nochmal!",
  "Computer sagt Nein!",
  "~ Traurige Trompete ~",
];

export default {
  name: "LoginView",
  data: () => ({
    username: null,
    password: null,
    passwordRepetition: null,
  }),
  methods: {
    showFailMessage(message) {
      this.$bvToast.toast(message, {
        title: failMessages[Math.floor(Math.random() * failMessages.length)],
        autoHideDelay: 3000,
        appendToast: true,
        variant: "danger",
        solid: true,
        toaster: "b-toaster-top-center",
      });
    },
    onReset(event) {
      event.preventDefault();
      this.username = null;
      this.password = null;
      this.passwordRepetition = null;
    },
    onLoginSubmit(event) {
      event.preventDefault();

      AuthService.login(this.username, this.password)
        .then(() => {
          this.$router
            .push(this.$route.query?.redirectUrl || "/start")
            .catch(() => {});
        })
        .catch((e) => {
          console.warn(e);
          this.showFailMessage(
            "Bitte kontrolliere, dass du Nutzernamen und Passwort richtig geschrieben hast."
          );
        });
    },
    onRegisterSubmit(event) {
      event.preventDefault();

      AuthService.register(this.username, this.password)
        .then(() => {
          this.$router.push(this.$route.query?.redirectUrl || "/start");
        })
        .catch((e) => {
          console.warn(e);
          this.showFailMessage(
            "Es scheint so als gäbe es bereits einen Nutzer mit diesem Namen ..."
          );
        });
    },
  },
  computed: {
    usernameIsValid() {
      return this.username != null && this.username.length >= 6;
    },
    usernameError() {
      if (this.username == null || this.username.length == 0)
        return "Bitte angeben!";
      else if (this.username.length < 6)
        return "Dein Benutzername muss mindestens 6 Zeichen lang sein.";
      else return null;
    },
    passwordIsValid() {
      return this.password != null && this.password.length >= 6;
    },
    passwordError() {
      if (this.password == null || this.password.length == 0)
        return "Bitte angeben";
      else if (this.password.length < 6)
        return "Dein Passwort muss mindestens 6 Zeichen lang sein.";
      else return null;
    },
    passwordRepetitionIsValid() {
      return (
        this.passwordRepetition != null &&
        this.passwordRepetition == this.password
      );
    },
    passwordRepetitionError() {
      if (this.passwordRepetition != this.password)
        return "Die Wiederholung gleicht nicht dem Passwort.";
      else return null;
    },
  },
};
</script>
