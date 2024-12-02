<template>
  <b-container id="loginView" data-view>
    <h1>Dein Online-Zugang</h1>
    <b-tabs fill v-model="tabIndex">
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
              to="#"
              variant="primary"
              class="mr-2"
              block
              :disabled="!usernameIsValid || !passwordIsValid"
            >
              <b-spinner small v-if="loading" />
              <span v-else> Anmelden </span>
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

          <p class="my-3">
            Du hast noch kein Konto?
            <a href="#" @click="() => (tabIndex = 1)"> Registrieren </a>
          </p>
        </b-form>
      </b-tab>
      <b-tab title="Registrieren" class="mt-4">
        <b-form @submit="onRegisterSubmit" @reset="onReset">
          <b-form-group
            label="Nutzername"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
            valid-feedback="Gültig!"
          >
            <b-form-input
              placeholder="Nutzername"
              :state="usernameIsValid"
              v-model="username"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            label="E-Mail-Adresse"
            :state="emailIsValid"
            :invalid-feedback="emailError"
            valid-feedback="Gültig!"
          >
            <b-input-group>
              <b-form-input
                placeholder="E-Mail-Adresse"
                :state="emailIsValid"
                v-model="email"
              ></b-form-input>
              <template #append>
                <b-input-group-text
                  v-b-tooltip.hover
                  title="Deine E-Mail-Adresse brauchen wir, um dein Passwort zurücksetzen oder dein Konto wiederherstellen zu können."
                >
                  <b-icon-info-circle />
                </b-input-group-text>
              </template>
            </b-input-group>
          </b-form-group>
          <b-form-group
            label="Passwort"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
            valid-feedback="Gültig!"
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
            valid-feedback="Gültig!"
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
              to="#"
              variant="primary"
              class="mr-2"
              block
              :disabled="
                !usernameIsValid ||
                !emailIsValid ||
                !passwordIsValid ||
                !passwordRepetitionIsValid
              "
            >
              <b-spinner small v-if="loading" />
              <span v-else> Registrieren </span>
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

          <p class="my-3">
            Du hast schon ein Konto?
            <a href="#" @click="() => (tabIndex = 0)"> Anmelden </a>
          </p>
        </b-form>

        <b-card title="Information" class="mb-3">
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
            <p>
              Du kannst mit einem Konto <b>mehrere Verein verwalten!</b> Es ist
              möglich, mehrere Vereine in einem Benutzerkonto zusammenzufassen,
              aber du kannst immer nur einen Verein gleichzeitig bearbeiten.
            </p>
          </b-card-text>
        </b-card>
      </b-tab>
    </b-tabs>

    <ConfirmEmailModal ref="confirmEmailModal" />
  </b-container>
</template>

<script>
import ConfirmEmailModal from "@/components/modals/ConfirmEmailModal.vue";
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

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

export default {
  name: "LoginView",
  components: { ConfirmEmailModal },
  data: () => ({
    username: null,
    email: null,
    password: null,
    passwordRepetition: null,
    tabIndex: 0,
    loading: false,
  }),
  methods: {
    showFailMessage(message) {
      this.$bvToast.toast(message, {
        title: failMessages[Math.floor(Math.random() * failMessages.length)],
        autoHideDelay: 5000,
        appendToast: true,
        variant: "danger",
        solid: true,
        toaster: "b-toaster-top-center",
      });
    },
    onReset(event) {
      event.preventDefault();
      this.username = null;
      this.email = null;
      this.password = null;
      this.passwordRepetition = null;
      this.loading = false;
    },
    onLoginSubmit(event) {
      event.preventDefault();

      this.loading = true;

      AuthService.login(this.username, this.password, this.email)
        .then(() => {
          this.loading = false;
          window._paq.push(["trackGoal", 2]);
          this.$router
            .push(this.$route.query?.redirectUrl || "/start")
            .catch(() => {});
        })
        .catch((e) => {
          console.warn(e);
          this.loading = false;
          if (e.status == 400 && e.response.data.type == "EmailUnconfirmed")
            this.$refs.confirmEmailModal.open(true);
          else
            this.showFailMessage(
              e.response.data ||
                "Bitte kontrolliere, dass du Nutzernamen/Email und Passwort richtig geschrieben hast."
            );
        });
    },
    onRegisterSubmit(event) {
      event.preventDefault();

      this.loading = true;

      AuthService.register(this.username, this.password, this.email)
        .then(() => {
          this.loading = false;
          window._paq.push(["trackGoal", 3]);
          this.$refs.confirmEmailModal.open();
        })
        .catch((e) => {
          console.warn(e);
          this.loading = false;
          this.showFailMessage(
            "Es scheint so als gäbe es bereits einen Nutzer mit diesem Namen oder E-Mail-Adresse ..."
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
        return "Bitte angeben";
      else if (this.username.length < 6)
        return "Dein Benutzername muss mindestens 6 Zeichen lang sein.";
      else return null;
    },
    emailIsValid() {
      return this.email != null && this.email.match(emailRegex)?.length > 0;
    },
    emailError() {
      if (this.email == null || this.email.length == 0) return "Bitte angeben";
      const emailRegexMatches = this.email.match(emailRegex);
      if (!emailRegexMatches || emailRegexMatches.length <= 0)
        return "Deine E-Mail-Adresse muss ein valide E-Mail-Adresse sein.";
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
    isWelcome() {
      return this.$route.path == "/willkommen";
    },
  },
  metaInfo() {
    const meta = {
      title: "Einloggen",
      meta: [
        {
          name: "description",
          content:
            "Logge dich ein und nutze alle Funktionen des Choreo Planers!",
        },
        {
          name: "twitter:description",
          content:
            "Logge dich ein und nutze alle Funktionen des Choreo Planers!",
        },
        {
          property: "og:description",
          content:
            "Logge dich ein und nutze alle Funktionen des Choreo Planers!",
        },
        {
          property: "og:title",
          content: "Einloggen - Choreo Planer",
        },
        {
          name: "twitter:title",
          content: "Einloggen - Choreo Planer",
        },
      ],
    };
    if (this.isWelcome) {
      meta.meta.push(
        {
          vmid: "og:image",
          property: "og:image",
          content: "/Willkommen.png",
        },
        {
          vmid: "twitter:image",
          name: "twitter:image",
          content: "/Willkommen.png",
        }
      );
    }
    return meta;
  },
};
</script>
