<template>
  <BContainer id="loginView" class="mt-4 my-4" data-view>
    <h1>{{ $t("login.dein-online-zugang") }}</h1>
    <BTabs v-model="tabIndex" fill>
      <BTab :title="$t('anmelden')" class="mt-4">
        <BForm @submit.prevent="onLoginSubmit" @reset.prevent="onReset">
          <BFormGroup
            :label="$t('username')"
            label-class="label-with-colon"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
          >
            <BFormInput
              v-model="username"
              :placeholder="$t('username')"
              :state="usernameIsValid"
              autocomplete="username"
            ></BFormInput>
          </BFormGroup>
          <BFormGroup
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
          >
            <BFormInput
              v-model="password"
              :placeholder="$t('passwort')"
              type="password"
              :state="passwordIsValid"
              autocomplete="current-password"
            ></BFormInput>
          </BFormGroup>

          <div class="d-flex my-2">
            <div class="d-grid" :style="{ width: '100%' }">
              <BButton
                type="submit"
                :style="{ color: 'white' }"
                variant="primary"
                class="me-2"
                :disabled="!usernameIsValid || !passwordIsValid"
              >
                <BSpinner v-if="loading" small />
                <span v-else> {{ $t("anmelden") }} </span>
              </BButton>
            </div>
            <BButton
              v-b-tooltip.hover="$t('login.formular-zuruecksetzen')"
              type="reset"
              variant="light"
            >
              <IBiArrowCounterclockwise />
            </BButton>
          </div>

          <p class="mt-3 mb-0">
            {{ $t("login.du-hast-noch-kein-konto") }}
            <a href="#" @click="() => (tabIndex = 1)">
              {{ $t("registrieren") }}
            </a>
          </p>

          <a href="#" @click="() => $refs.passwordResetModal.open()"
            >{{ $t("login.passwort-vergessen") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
          </a>
        </BForm>
      </BTab>
      <BTab :title="$t('registrieren')" class="mt-4">
        <BForm @submit.prevent="onRegisterSubmit" @reset.prevent="onReset">
          <BFormGroup
            :label="$t('username')"
            label-class="label-with-colon"
            :state="usernameIsValid"
            :invalid-feedback="usernameError"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="username"
              :placeholder="$t('username')"
              :state="usernameIsValid"
              autocomplete="username"
            ></BFormInput>
          </BFormGroup>
          <BFormGroup
            :label="$t('e-mail-adresse')"
            label-class="label-with-colon"
            :state="emailIsValid"
            :invalid-feedback="emailError"
            :valid-feedback="$t('login.gueltig')"
          >
            <BInputGroup>
              <BFormInput
                v-model="email"
                :placeholder="$t('e-mail-adresse')"
                :state="emailIsValid"
                autocomplete="email"
              ></BFormInput>
              <template #append>
                <BInputGroupText v-b-tooltip.hover="$t('login.warum-email')">
                  <IBiInfoCircle />
                </BInputGroupText>
              </template>
            </BInputGroup>
          </BFormGroup>
          <BFormGroup
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordIsValid"
            :invalid-feedback="passwordError"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="password"
              :placeholder="$t('passwort')"
              type="password"
              :state="passwordIsValid"
              autocomplete="new-password"
            ></BFormInput>
          </BFormGroup>
          <BFormGroup
            :label="$t('passwort')"
            label-class="label-with-colon"
            :state="passwordRepetitionIsValid"
            :invalid-feedback="passwordRepetitionError"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="passwordRepetition"
              :placeholder="$t('login.passwort-wiederholen')"
              type="password"
              :state="passwordRepetitionIsValid"
              autocomplete="new-password"
            ></BFormInput>
          </BFormGroup>

          <div class="d-flex my-2">
            <div class="d-grid" :style="{ width: '100%' }">
              <BButton
                type="submit"
                :style="{ color: 'white' }"
                variant="primary"
                class="me-2"
                :disabled="
                  !usernameIsValid ||
                  !emailIsValid ||
                  !passwordIsValid ||
                  !passwordRepetitionIsValid
                "
              >
                <BSpinner v-if="loading" small />
                <span v-else>{{ $t("registrieren") }}</span>
              </BButton>
            </div>
            <BButton
              v-b-tooltip.hover="$t('login.formular-zuruecksetzen')"
              type="reset"
              variant="light"
            >
              <IBiArrowCounterclockwise />
            </BButton>
          </div>

          <p class="my-3">
            {{ $t("login.du-hast-schon-ein-konto") }}
            <a href="#" @click="() => (tabIndex = 0)">{{ $t("anmelden") }}</a>
          </p>
        </BForm>

        <BCard :title="$t('login.information')" class="mb-3">
          <BCardText>
            <I18n-t keypath="login.information-text-1" tag="p">
              <b>{{ $t("login.information-text-1-highlight") }}</b>
            </I18n-t>
            <I18n-t keypath="login.information-text-2" tag="p">
              <b>{{ $t("login.information-text-2-highlight") }}</b>
            </I18n-t>
            <I18n-t keypath="login.information-text-3" tag="p">
              <b>{{ $t("login.information-text-3-highlight") }}</b>
            </I18n-t>
          </BCardText>
        </BCard>
      </BTab>
    </BTabs>

    <ConfirmEmailModal ref="confirmEmailModal" />

    <PasswordResetModal
      ref="passwordResetModal"
      @password-reset-requested="onPasswordReset"
    />
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import ConfirmEmailModal from "@/components/modals/ConfirmEmailModal.vue";
import PasswordResetModal from "@/components/modals/PasswordResetModal.vue";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import ERROR_CODES from "@/utils/error_codes";
import { error, log } from "@/utils/logging";
import { emailRegex } from "@/utils/validation";

/**
 * @vue-data {string|null} username=null - The username for login or registration.
 * @vue-data {string|null} email=null - The email address for login or registration.
 * @vue-data {string|null} password=null - The password for login or registration.
 * @vue-data {string|null} passwordRepetition=null - The repeated password for registration.
 * @vue-data {number} tabIndex=0 - The index of the currently active tab (0 for login, 1 for registration).
 * @vue-data {boolean} loading=false - Whether a login or registration request is in progress.
 *
 * @vue-computed {string[]} failMessages - An array of random failure messages to show on error.
 * @vue-computed {boolean} usernameIsValid - Whether the username is valid (at least 6 characters).
 * @vue-computed {string|null} usernameError - Error message for invalid username.
 * @vue-computed {boolean} emailIsValid - Whether the email is valid (matches email regex).
 * @vue-computed {string|null} emailError - Error message for invalid email.
 * @vue-computed {boolean} passwordIsValid - Whether the password is valid (at least 6 characters).
 * @vue-computed {string|null} passwordError - Error message for invalid password.
 * @vue-computed {boolean} passwordRepetitionIsValid - Whether the password repetition matches the password.
 * @vue-computed {string|null} passwordRepetitionError - Error message for mismatched password repetition.
 * @vue-computed {boolean} isWelcome - Whether the current route is the welcome page.
 *
 * @vue-computed {MetaInfo} metaInfo
 */
export default {
  name: "LoginView",
  components: { ConfirmEmailModal, PasswordResetModal, NewVersionBadge },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data: () => ({
    username: null,
    email: null,
    password: null,
    passwordRepetition: null,
    tabIndex: 0,
    loading: false,
  }),
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
  mounted() {
    if (this.$store.state.loggedIn) {
      this.redirect();
      return;
    }

    const query = this.$route.query;
    if (query?.sso)
      AuthService.ssoLogin(query.sso)
        .then(() => {
          window._paq.push(["trackGoal", 2]);
          this.redirect();
        })
        .catch((e) => {
          error(e, ERROR_CODES.SSO_LOGIN_FAILED);
          this.showFailMessage(e.response.data);
        });

    const baseMeta = [
      {
        name: "description",
        content: computed(() => this.t("meta.loginView.description")),
      },
      {
        name: "twitter:description",
        content: computed(() => this.t("meta.loginView.description")),
      },
      {
        property: "og:description",
        content: computed(() => this.t("meta.loginView.description")),
      },
      {
        property: "og:title",
        content: computed(
          () =>
            `${this.t("anmelden")} - ${this.t(
              "general.ChoreoPlaner"
            )} | ${this.t("login.meta.dein-zugang-zu-allen-funktionen")}`
        ),
      },
      {
        name: "twitter:title",
        content: computed(
          () =>
            `${this.t("anmelden")} - ${this.t(
              "general.ChoreoPlaner"
            )} | ${this.t("login.meta.dein-zugang-zu-allen-funktionen")}`
        ),
      },
    ];

    if (this.isWelcome) {
      baseMeta.push(
        {
          property: "og:image",
          content: "/Willkommen.png",
        },
        {
          name: "twitter:image",
          content: "/Willkommen.png",
        }
      );
    }

    useHead({
      title: computed(
        () =>
          `${this.t("anmelden")} - ${this.t(
            "general.ChoreoPlaner"
          )} | ${this.t("login.meta.dein-zugang-zu-allen-funktionen")}`
      ),
      titleTemplate: null,
      meta: baseMeta,
    });
  },
  methods: {
    redirect() {
      this.$router
        .push(this.$route.query?.redirectUrl || `/${this.$i18n.locale}/start`)
        .catch(() => {
          error(
            "Redundant navigation to redirect url or start",
            ERROR_CODES.REDUNDANT_ROUTING
          );
        });
    },
    showFailMessage(message, title = null) {
      MessagingService.showError(message, title);
    },
    onReset() {
      this.username = null;
      this.email = null;
      this.password = null;
      this.passwordRepetition = null;
      this.loading = false;
    },
    onLoginSubmit() {
      this.loading = true;

      AuthService.login(this.username, this.password, this.email)
        .then(() => {
          this.loading = false;
          window._paq.push(["trackGoal", 2]);
          this.$router
            .push(
              this.$route.query?.redirectUrl || `/${this.$i18n.locale}/start`
            )
            .catch(() => {
              error(
                "Redundant navigation to redirect url or start",
                ERROR_CODES.REDUNDANT_ROUTING
              );
            });
        })
        .catch((e) => {
          error(e, ERROR_CODES.LOGIN_FAILED);
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
    onRegisterSubmit() {
      this.loading = true;

      AuthService.register(this.username, this.password, this.email)
        .then(() => {
          this.loading = false;
          window._paq.push(["trackGoal", 3]);
          // this.$refs.confirmEmailModal.open();
          this.$router
            .push(
              this.$route.query?.redirectUrl || `/${this.$i18n.locale}/start`
            )
            .catch(() => {
              error(
                "Redundant navigation to redirect url or start",
                ERROR_CODES.REDUNDANT_ROUTING
              );
            });
        })
        .catch((e) => {
          error(e, ERROR_CODES.REGISTRATION_FAILED);
          this.loading = false;
          if (e.code == "ERR_NETWORK")
            return this.showFailMessage(
              e.response?.data || this.$t("login.server-offline")
            );
          this.showFailMessage(this.$t("login.account-exists"));
        });
    },
    onPasswordReset() {
      log("A password link was sent to your email address. Check your inbox!");
      MessagingService.showSuccess(
        this.$t("login.login-link-was-sent"),
        this.$t("login.erfolg"),
        {
          autoHideDelay: 5_000,
        }
      );
    },
  },
};
</script>
