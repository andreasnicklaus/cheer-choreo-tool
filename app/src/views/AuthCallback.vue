<template>
  <BContainer class="mt-4 my-4" data-view>
    <p>{{ $t("auth.redirecting") }}</p>
  </BContainer>
</template>

<script lang="ts">
import { useI18n } from "vue-i18n";
import store from "@/store";
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import ERROR_CODES from "@/utils/error_codes";
import { error } from "@/utils/logging";
import { defineComponent } from "vue";

export default defineComponent({
  name: "AuthCallback",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  async mounted() {
    const query = this.$route.query;
    const removeQueryParams = () => {
      const cleanedQuery = { ...this.$route.query };
      delete cleanedQuery.token;
      delete cleanedQuery.error;
      delete cleanedQuery.errorDescription;

      if (
        Object.keys(cleanedQuery).length !==
        Object.keys(this.$route.query || {}).length
      ) {
        this.$router
          .replace({ path: this.$route.path, query: cleanedQuery })
          .catch(() => {});
      }
    };
    const redirectToLogin = () =>
      this.$router.push(
        this.$route.query?.redirectUrl?.toString() ||
          `/${this.$i18n.locale}/login`
      );

    removeQueryParams();

    if (query.error) {
      redirectToLogin().then(() => {
        MessagingService.showError(
          this.$t("auth.socialLoginFailed"),
          query.error?.toString()
        );
      });
      return;
    }

    if (query.token) {
      AuthService.saveLoginToken(query.token.toString());
      console.log("Login token saved, loading user info...");
      store.commit("setLoginState", true);
      console.log("Login state set to true, dispatching loadUserInfo...");
      console.log("User info loaded, redirecting to start...");
      this.$router
        .push({ name: "Start", params: { locale: this.$i18n.locale } })
        .then(() => {
          console.log("Redirected to start");
        })
        .catch(() => {
          error("Redundant navigation to start", ERROR_CODES.REDUNDANT_ROUTING);
        });
      return;
    }

    redirectToLogin();
  },
});
</script>
