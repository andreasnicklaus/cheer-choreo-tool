<template>
  <div id="app" :class="{ mobile: $store.state.isMobile }">
    <AppInstallWindow />
    <HeadNav :onlineStatus="online" :serverVersion="serverVersion" />
    <router-view :style="{ minHeight: 'calc(100vh - 116px)' }" class="mb-2" />
    <footer class="p-4 px-5 pt-5 d-flex flex-column align-items-center">
      <b-row align-h="around" class="w-75 footer-link" :style="{ gap: '20px' }">
        <b-col cols="auto">
          <h5>
            <b>{{ $tc("navigation.internalLinks") }}</b>
          </h5>
          <b-button
            variant="link"
            :to="{ name: 'Home', params: { locale: $root.$i18n.locale } }"
          >
            {{ $tc("navigation.StartPage") }} </b-button
          ><br />
          <b-button
            variant="link"
            :to="{ name: 'Help', params: { locale: $root.$i18n.locale } }"
          >
            {{ $tc("general.help") }} </b-button
          ><br />
          <b-button
            variant="link"
            :to="{
              name: 'Impressum',
              params: { locale: $root.$i18n.locale },
            }"
          >
            {{ $tc("navigation.impressum") }} </b-button
          ><br />
          <b-button
            variant="link"
            :to="{
              name: 'Datenschutz',
              params: { locale: $root.$i18n.locale },
            }"
          >
            {{ $tc("navigation.datenschutz") }} </b-button
          ><br />
          <b-button
            variant="link"
            @click="() => this.$refs.feedbackPrompt.open(true)"
          >
            {{ $tc("navigation.feedback-geben") }} </b-button
          ><br />
        </b-col>
        <b-col cols="auto">
          <h5>
            <b>{{ $tc("navigation.externe-links") }}</b>
          </h5>
          <b-button
            variant="link"
            href="https://www.instagram.com/choreoplaner/"
            target="_blank"
          >
            <b-icon-instagram class="mr-2" />{{
              $tc("navigation.instagram")
            }}</b-button
          ><br />
          <b-button
            variant="link"
            href="https://www.facebook.com/choreoplaner/"
            target="_blank"
          >
            <b-icon-facebook class="mr-2" />{{
              $tc("navigation.facebook")
            }}</b-button
          ><br />
          <b-button
            variant="link"
            href="https://github.com/andreasnicklaus/cheer-choreo-tool"
            target="_blank"
          >
            <b-icon-github class="mr-2" />{{
              $tc("navigation.github")
            }}</b-button
          ><br />
        </b-col>
      </b-row>
      <hr :style="{ width: '100%', borderColor: '000225' }" class="my-3" />
      <b-row align-h="center" class="mt-1">
        <b-col cols="auto">
          <span class="mr-2">
            Andreas Nicklaus @{{ new Date().getFullYear() }}
          </span>
        </b-col>
        <b-col cols="auto">
          <img
            src="https://uptime.betterstack.com/status-badges/v3/monitor/1l68q.svg"
            :alt="`Status-Anzeige der Server: Server sind ${
              online ? ' nicht online' : 'online'
            }`"
            width="80"
            height="20"
            loading="lazy"
          />
        </b-col>
        <b-col cols="auto">
          <span
            class="mx-2"
            :style="{
              display: 'inline-block',
              fontFamily: 'monospace',
              fontSize: '0.8em',
            }"
          >
            Version: {{ applicationVersion }}
            <span
              v-b-tooltip.hover
              :title="`Die Version der Webseite (${applicationVersion}) entspricht nicht der Version der Server (${serverVersion})!`"
              v-if="serverVersion && serverVersion != applicationVersion"
            >
              <b-icon-exclamation-triangle-fill />
            </span>
          </span>
        </b-col>
      </b-row>
    </footer>
    <ConsentWindow />
    <FeedbackPrompt ref="feedbackPrompt" />

    <script type="application/ld+json">
      {{
        {
          "@context": "https://schema.org/",
          "@type": "BreadcrumbList",
          itemListElement: this.$route.path.split("/")
            .filter((route, index) => index > 0)
            .map((route, index) => ({
              "@type": "ListItem",
              position: index + 1,
              name: this.$route.name || route,
              item: `https://www.choreo-planer.de/${this.$route.path
                .split("/")
                .filter((route, index) => index > 0)
                .slice(0, index + 1)
                .join("/")}`,
            }))
        }
      }}
    </script>
  </div>
</template>

<script>
import AppInstallWindow from "./components/AppInstallWindow.vue";
import ConsentWindow from "./components/ConsentWindow.vue";
import FeedbackPrompt from "./components/FeedbackPrompt.vue";
import HeadNav from "./components/HeadNav.vue";
import ax, { getApiDomain } from "./services/RequestService";
import breakpoints from "@/utils/breakpoints";
import MessagingService from "./services/MessagingService";

export default {
  components: { HeadNav, ConsentWindow, AppInstallWindow, FeedbackPrompt },
  data: () => ({
    online: true,
    serverVersion: null,
    applicationVersion: process.env.VUE_APP_VERSION,
    breakpoints,
  }),
  metaInfo() {
    return {
      titleTemplate: `%s - ${this.$t("general.ChoreoPlaner")} | ${this.$t(
        "meta.defaults.title"
      )}`,
      meta: [
        {
          vmid: "keywords",
          name: "keywords",
          content: this.$t("meta.defaults.keywords"),
        },
        {
          vmid: "author",
          name: "author",
          content: "Andreas Nicklaus",
        },
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.defaults.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.defaults.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.defaults.description"),
        },
        {
          vmid: "og:url",
          property: "og:url",
          content: "https://www.choreo-planer.de" + this.$route.path,
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("general.ChoreoPlaner")} | ${this.$t(
            "meta.defaults.title"
          )}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("general.ChoreoPlaner")} | ${this.$t(
            "meta.defaults.title"
          )}`,
        },
        {
          vmid: "twitter:url",
          property: "twitter:url",
          content: "https://www.choreo-planer.de" + this.$route.path,
        },
        {
          vmid: "twitter:domain",
          property: "twitter:domain",
          content: "https://www.choreo-planer.de",
        },
        {
          vmid: "og:image",
          property: "og:image",
          content: "/PreviewImage.png",
        },
        {
          vmid: "twitter:image",
          name: "twitter:image",
          content: "/PreviewImage.png",
        },
        {
          vmid: "Content-Security-Policy",
          "http-equiv": "Content-Security-Policy",
          content: `default-src 'self' https: blob:; script-src 'self' https: blob: 'unsafe-eval' 'unsafe-inline'; style-src 'self' https: blob: 'unsafe-inline'; connect-src 'self' https: blob: ${getApiDomain()}; img-src 'self' https: blob: data: ${getApiDomain()};`,
        },
      ],
      link: [
        {
          vmid: "canonical",
          rel: "canonical",
          href: "https://www.choreo-planer.de" + this.$route.path,
        },
      ],
    };
  },
  mounted() {
    MessagingService.subscribe("App", (message, options) =>
      this.$bvToast.toast(message, options)
    );

    if (!window.__PRERENDER_INJECTED)
      ax.get("/version")
        .then((res) => {
          this.online = true;
          this.serverVersion = res.data;
        })
        .catch(() => {
          this.online = false;
          MessagingService.showError(this.$t("errors.offline"), "Offline");
        });
  },
  watch: {
    "breakpoints.screen.mobile": {
      handler(value) {
        this.$store.commit("setMobile", value);
      },
      immediate: true,
    },
  },
};
</script>

<style lang="scss">
html {
  width: 100vw;
  overflow-x: hidden;
}
.modal-open {
  padding: 0 !important;
}
</style>

<style lang="scss">
.label-with-colon::after {
  content: ":";
}
</style>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
  overflow-wrap: break-word;
  word-wrap: break-word;
  hyphens: auto;
}

.router-link-active {
  color: #2c3e50 !important;
}

footer a,
footer .btn-link {
  color: white !important;
  text-decoration: underline;
  &.router-link-active:not(:hover) {
    color: white !important;
  }
  &:hover {
    color: #d6d6d6 !important;
  }
}

footer {
  color: white;
  background-color: #0150a4;
}
</style>
