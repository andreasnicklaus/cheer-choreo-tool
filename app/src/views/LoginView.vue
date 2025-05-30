<template>
  <b-container id="loginView" data-view>
    <h1>{{ $t("login.dein-online-zugang") }}</h1>
    <b-tabs fill v-model="tabIndex">
      <b-tab :title="$t('anmelden')" class="mt-4">
        <b-form @submit="onLoginSubmit" @reset="onReset">
          <b-form-group
            :label="$t('username')"
            label-class="label-with-colon"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
          >
            <b-form-input
              :placeholder="$t('username')"
              :state="usernameIsValid"
              v-model="username"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
          >
            <b-form-input
              :placeholder="$t('passwort')"
              type="password"
              :state="passwordIsValid"
              v-model="password"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex">
            <b-button
              type="submit"
              :style="{ color: 'white' }"
              variant="primary"
              class="mr-2"
              block
              :disabled="!usernameIsValid || !passwordIsValid"
            >
              <b-spinner small v-if="loading" />
              <span v-else> {{ $t("anmelden") }} </span>
            </b-button>
            <b-button
              type="reset"
              variant="light"
              v-b-tooltip.hover
              :title="$t('login.formular-zuruecksetzen')"
            >
              <b-icon-arrow-counterclockwise />
            </b-button>
          </div>

          <p class="my-3">
            {{ $t("login.du-hast-noch-kein-konto") }}
            <a href="#" @click="() => (tabIndex = 1)">
              {{ $t("registrieren") }}
            </a>
          </p>

          <a href="#" @click="() => $refs.passwordResetModal.open()"
            >{{ $t("login.passwort-vergessen") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']"
          /></a>
        </b-form>
      </b-tab>
      <b-tab :title="$t('registrieren')" class="mt-4">
        <b-form @submit="onRegisterSubmit" @reset="onReset">
          <b-form-group
            :label="$t('username')"
            label-class="label-with-colon"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              :placeholder="$t('username')"
              :state="usernameIsValid"
              v-model="username"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('e-mail-adresse')"
            label-class="label-with-colon"
            :state="emailIsValid"
            :invalid-feedback="emailError"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-input-group>
              <b-form-input
                :placeholder="$t('e-mail-adresse')"
                :state="emailIsValid"
                v-model="email"
              ></b-form-input>
              <template #append>
                <b-input-group-text
                  v-b-tooltip.hover
                  :title="$t('login.warum-email')"
                >
                  <b-icon-info-circle />
                </b-input-group-text>
              </template>
            </b-input-group>
          </b-form-group>
          <b-form-group
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              :placeholder="$t('passwort')"
              type="password"
              :state="passwordIsValid"
              v-model="password"
            ></b-form-input>
          </b-form-group>
          <b-form-group
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordRepetitionIsValid"
            :invalid-feedback="passwordRepetitionError"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              :placeholder="$t('login.passwort-wiederholen')"
              type="password"
              :state="passwordRepetitionIsValid"
              v-model="passwordRepetition"
            ></b-form-input>
          </b-form-group>

          <div class="d-flex">
            <b-button
              type="submit"
              :style="{ color: 'white' }"
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
              <span v-else>{{ $t("registrieren") }}</span>
            </b-button>
            <b-button
              type="reset"
              variant="light"
              v-b-tooltip.hover
              :title="$t('login.formular-zuruecksetzen')"
            >
              <b-icon-arrow-counterclockwise />
            </b-button>
          </div>

          <p class="my-3">
            {{ $t("login.du-hast-schon-ein-konto") }}
            <a href="#" @click="() => (tabIndex = 0)">{{ $t("anmelden") }}</a>
          </p>
        </b-form>

        <b-card :title="$t('login.information')" class="mb-3">
          <b-card-text>
            <i18n path="login.information-text-1" tag="p">
              <b>{{ $t("login.information-text-1-highlight") }}</b>
            </i18n>
            <i18n path="login.information-text-2" tag="p">
              <b>{{ $t("login.information-text-2-highlight") }}</b>
            </i18n>
            <i18n path="login.information-text-3" tag="p">
              <b>{{ $t("login.information-text-3-highlight") }}</b>
            </i18n>
          </b-card-text>
        </b-card>
      </b-tab>
    </b-tabs>

    <ConfirmEmailModal ref="confirmEmailModal" />

    <PasswordResetModal
      ref="passwordResetModal"
      @passwordResetRequested="onPasswordReset"
    />
  </b-container>
</template>

<script>
import ConfirmEmailModal from "@/components/modals/ConfirmEmailModal.vue";
import PasswordResetModal from "@/components/modals/PasswordResetModal.vue";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * @vue-data {string|null} username=null
 * @vue-data {string|null} email=null
 * @vue-data {string|null} password=null
 * @vue-data {string|null} passwordRepetition=null
 * @vue-data {number} tabIndex=0
 * @vue-data {boolean} loading=false
 * @vue-computed {string[]} failMessages
 * @vue-computed {boolean} usernameIsValid
 * @vue-computed {string|null} usernameError
 * @vue-computed {boolean} emailIsValid
 * @vue-computed {string|null} emailError
 * @vue-computed {boolean} passwordIsValid
 * @vue-computed {string|null} passwordError
 * @vue-computed {boolean} passwordRepetitionIsValid
 * @vue-computed {string|null} passwordRepetitionError
 * @vue-computed {boolean} isWelcome
 * @vue-computed {MetaInfo} metaInfo
 */
export default {
  name: "LoginView",
  components: { ConfirmEmailModal, PasswordResetModal, NewVersionBadge },
  data: () => ({
    username: null,
    email: null,
    password: null,
    passwordRepetition: null,
    tabIndex: 0,
    loading: false,
  }),
  mounted() {
    const query = this.$route.query;
    if (query?.sso)
      AuthService.ssoLogin(query.sso)
        .then(() => {
          window._paq.push(["trackGoal", 2]);
          this.$router
            .push(
              this.$route.query?.redirectUrl ||
                `/${this.$root.$i18n.locale}/start`
            )
            .catch(() => {});
        })
        .catch((e) => {
          this.showFailMessage(e.response.data);
        });
  },
  methods: {
    showFailMessage(message, title = null) {
      MessagingService.showError(message, title);
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
            .push(
              this.$route.query?.redirectUrl ||
                `/${this.$root.$i18n.locale}/start`
            )
            .catch(() => {});
        })
        .catch((e) => {
          this.loading = false;
          if (e.status == 400 && e.response.data.type == "EmailUnconfirmed")
            this.$refs.confirmEmailModal.open(true);
          else {
            if (e.code == "ERR_NETWORK")
              return this.showFailMessage(
                e.response?.data || this.$t("login.server-offline")
              );
            this.showFailMessage(
              e.response.data ||
                this.$t(
                  "login.bitte-kontrolliere-nutzernamen-email-und-passwort"
                )
            );
          }
        });
    },
    onRegisterSubmit(event) {
      event.preventDefault();

      this.loading = true;

      AuthService.register(this.username, this.password, this.email)
        .then(() => {
          this.loading = false;
          window._paq.push(["trackGoal", 3]);
          // this.$refs.confirmEmailModal.open();
          this.$router
            .push(
              this.$route.query?.redirectUrl ||
                `/${this.$root.$i18n.locale}/start`
            )
            .catch(() => {});
        })
        .catch((e) => {
          this.loading = false;
          if (e.code == "ERR_NETWORK")
            return this.showFailMessage(
              e.response?.data || this.$t("login.server-offline")
            );
          this.showFailMessage(this.$t("login.account-exists"));
        });
    },
    onPasswordReset() {
      MessagingService.showSuccess(
        this.$t("login.login-link-was-sent"),
        this.$t("login.erfolg"),
        {
          autoHideDelay: 5_000,
        }
      );
    },
  },
  computed: {
    failMessages() {
      return [
        this.$t("failMessages.oh-oh"),
        this.$t("failMessages.satz-mit-x"),
        this.$t("failMessages.da-dumm"),
        this.$t("failMessages.check-ich-nicht"),
        this.$t("failMessages.probiers-nochmal"),
        this.$t("failMessages.computer-sagt-nein"),
        this.$t("failMessages.traurige-trompete"),
      ];
    },
    usernameIsValid() {
      return this.username != null && this.username.length >= 6;
    },
    usernameError() {
      if (this.username == null || this.username.length == 0)
        return this.$t("login.bitte-angeben");
      else if (this.username.length < 6)
        return this.$t("login.benutzername-mindestens-laenge");
      else return null;
    },
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
    passwordIsValid() {
      return this.password != null && this.password.length >= 6;
    },
    passwordError() {
      if (this.password == null || this.password.length == 0)
        return this.$t("login.bitte-angeben");
      else if (this.password.length < 6)
        return this.$t("login.passwort-mindest-laenge");
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
        return this.$t("login.wiederholung-gleicht-nicht-passwort");
      else return null;
    },
    isWelcome() {
      return this.$route.path == "/willkommen";
    },
  },
  metaInfo() {
    const meta = {
      title: `${this.$t("anmelden")} - ${this.$t(
        "general.ChoreoPlaner"
      )} | ${this.$t("login.meta.dein-zugang-zu-allen-funktionen")}`,
      titleTemplate: null,
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.loginView.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.loginView.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.loginView.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("anmelden")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("login.meta.dein-zugang-zu-allen-funktionen")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("anmelden")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("login.meta.dein-zugang-zu-allen-funktionen")}`,
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
