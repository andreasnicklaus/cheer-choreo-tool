<template>
  <BApp id="app" :class="{ mobile: $store.state.isMobile }">
    <AppInstallWindow />
    <HeadNav :online-status="online" :server-version="serverVersion" />
    <router-view :style="{ minHeight: 'calc(100vh - 116px)' }" class="mb-2" />
    <footer class="p-4 px-5 pt-5 d-flex flex-column align-items-center">
      <BRow align-h="around" class="w-75 footer-link" :style="{ gap: '20px' }">
        <BCol cols="auto">
          <h5>
            <b>{{ $t("navigation.internalLinks") }}</b>
          </h5>
          <BButton
            variant="link"
            :to="{ name: 'Home', params: { locale: $i18n.locale } }"
          >
            {{ $t("navigation.StartPage") }} </BButton
          ><br />
          <BButton
            variant="link"
            :to="{ name: 'Help', params: { locale: $i18n.locale } }"
          >
            {{ $t("general.help") }} </BButton
          ><br />
          <BButton
            variant="link"
            :to="{ name: 'Contact', params: { locale: $i18n.locale } }"
            >{{ $t("contact.contact-and-support") }}</BButton
          ><br />
          <BButton
            variant="link"
            :to="{
              name: 'Impressum',
              params: { locale: $i18n.locale },
            }"
          >
            {{ $t("navigation.impressum") }} </BButton
          ><br />
          <BButton
            variant="link"
            :to="{
              name: 'Datenschutz',
              params: { locale: $i18n.locale },
            }"
          >
            {{ $t("navigation.datenschutz") }} </BButton
          ><br />
          <BButton
            variant="link"
            @click="() => $refs.feedbackPrompt.open(true)"
          >
            {{ $t("navigation.feedback-geben") }} </BButton
          ><br />
          <BButton variant="link" href="/docs/" target="_blank">
            {{ $t("HelpView.documentation_capitalized") }}
          </BButton>
        </BCol>
        <BCol cols="auto">
          <h5>
            <b>{{ $t("navigation.externe-links") }}</b>
          </h5>
          <BButton
            variant="link"
            href="https://www.instagram.com/choreoplaner/"
            target="_blank"
          >
            <IBiInstagram class="me-2" />{{
              $t("navigation.instagram")
            }}</BButton
          ><br />
          <BButton
            variant="link"
            href="https://www.facebook.com/choreoplaner/"
            target="_blank"
          >
            <IBiFacebook class="me-2" />{{ $t("navigation.facebook") }}</BButton
          ><br />
          <BButton
            variant="link"
            href="https://github.com/andreasnicklaus/cheer-choreo-tool"
            target="_blank"
          >
            <IBiGithub class="me-2" />{{ $t("navigation.github") }}</BButton
          ><br />
        </BCol>
      </BRow>
      <hr :style="{ width: '100%', borderColor: '000225' }" class="my-3" />
      <BRow align-h="center" class="mt-1">
        <BCol cols="auto">
          <span class="me-2">
            Andreas Nicklaus @{{ new Date().getFullYear() }}
          </span>
        </BCol>
        <BCol cols="auto">
          <img
            src="https://uptime.betterstack.com/status-badges/v3/monitor/1l68q.svg"
            :alt="`Status-Anzeige der Server: Server sind ${
              online ? ' nicht online' : 'online'
            }`"
            width="80"
            height="20"
            loading="lazy"
          />
        </BCol>
        <BCol cols="auto">
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
              v-show="serverVersion && serverVersion != applicationVersion"
              v-b-tooltip.hover="
                `Die Version der Webseite (${applicationVersion}) entspricht nicht der Version der Server (${serverVersion})!`
              "
              data-testid="serverVersionTooltip"
            >
              <IBiExclamationTriangleFill />
            </span>
          </span>
        </BCol>
      </BRow>
    </footer>
    <ConsentWindow />
    <FeedbackPrompt ref="feedbackPrompt" />

    <!-- <script type="application/ld+json">
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
    </script> -->
  </BApp>
</template>

<script setup>
import { useToast } from "bootstrap-vue-next";
import { computed, getCurrentInstance } from "vue";
import { useHead } from "@unhead/vue";
import { useRoute } from "vue-router";
import { getApiDomain } from "./services/RequestService";
import { useI18n } from "vue-i18n";

const { create } = useToast();
const instance = getCurrentInstance();
if (instance) {
  instance.appContext.app.config.globalProperties.$showToast = create;
}

const { t } = useI18n();
const route = useRoute();

useHead({
  titleTemplate: (title) =>
    title
      ? `${title} - ${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
      : t("meta.defaults.title"),
  meta: [
    {
      vmid: "keywords",
      name: "keywords",
      content: computed(() => t("meta.defaults.keywords")),
    },
    {
      vmid: "author",
      name: "author",
      content: "Andreas Nicklaus",
    },
    {
      vmid: "description",
      name: "description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      vmid: "twitter:description",
      name: "twitter:description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      vmid: "og:description",
      property: "og:description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      vmid: "og:url",
      property: "og:url",
      content: computed(() => "https://www.choreo-planer.de" + route.path),
    },
    {
      vmid: "og:title",
      property: "og:title",
      content: computed(
        () => `${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
      ),
    },
    {
      vmid: "twitter:title",
      name: "twitter:title",
      content: computed(
        () => `${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
      ),
    },
    {
      vmid: "twitter:url",
      property: "twitter:url",
      content: computed(() => "https://www.choreo-planer.de" + route.path),
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
      content: computed(
        () =>
          `default-src 'self' https: blob:; script-src 'self' https: blob: 'unsafe-eval' 'unsafe-inline'; style-src 'self' https: blob: 'unsafe-inline'; connect-src 'self' https: blob: ${getApiDomain()}; img-src 'self' https: blob: data: ${getApiDomain()};`
      ),
    },
  ],
  link: [
    {
      vmid: "canonical",
      rel: "canonical",
      href: computed(() => "https://www.choreo-planer.de" + route.path),
    },
  ],
});
</script>

<script>
import AppInstallWindow from "./components/AppInstallWindow.vue";
import ConsentWindow from "./components/ConsentWindow.vue";
import FeedbackPrompt from "./components/FeedbackPrompt.vue";
import HeadNav from "./components/HeadNav.vue";
import { getApiDomain } from "./services/RequestService";
import breakpoints from "@/utils/breakpoints";
import MessagingService from "./services/MessagingService";
import { isPrerender } from "@/utils/isPrerender";
import { debug, error, logWelcomeMessage } from "@/utils/logging";
import VersionService from "./services/VersionService";
import env from "@/utils/env";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-vue-next/dist/bootstrap-vue-next.css";

/**
 * @vue-data {boolean} online
 * @vue-data {string} serverVersion
 * @vue-data {string} applicationVersion
 * @vue-data {Breakpoints} breakpoints
 * @vue-computed {MetaInfo} metaInfo
 */
export default {
  components: { HeadNav, ConsentWindow, AppInstallWindow, FeedbackPrompt },
  data: () => ({
    online: true,
    serverVersion: null,
    applicationVersion: env.VITE_VERSION,
    breakpoints,
  }),
  watch: {
    "breakpoints.screen.mobile": {
      handler(value) {
        this.$store.commit("setMobile", value);
      },
      immediate: true,
    },
  },
  mounted() {
    debug("Started App", {
      VITE_VERSION: env.VITE_VERSION,
    });
    MessagingService.subscribe("App", (message, options) => {
      this.$showToast?.({ body: message, ...options });
    });

    this.$store.dispatch("loadUserInfo");

    logWelcomeMessage();

    // Check prerender status - use setTimeout to ensure window.__PRERENDER__ is set
    const checkPrerender = () => {
      if (isPrerender()) {
        debug("Prerendering mode - skipping server version check");
        this.online = true;
        this.serverVersion = this.applicationVersion;
      } else {
        VersionService.getServerVersion().then((version) => {
          if (version) {
            this.online = true;
            this.serverVersion = version;
          } else {
            this.online = false;
            error(
              "The servers are currently offline. Please refresh or try again later."
            );
            MessagingService.showError(
              this.$t("errors.offline"),
              this.$t("general.offline")
            );
          }
        });
      }
    };

    // Use nextTick to ensure DOM is fully ready
    this.$nextTick(checkPrerender);
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
.toast-container {
  z-index: 9999999 !important;
}

.label-with-colon::after {
  content: ":";
}

/* Hide all placeholders by default */
.betteruptime-announcement__placeholder {
  display: none !important;
}

/* Re-enable placeholders that come after a div containing the announcement */
div:has(.betteruptime-announcement) ~ .betteruptime-announcement__placeholder {
  display: block !important;
}

/* But only allow the FIRST such placeholder */
div:has(.betteruptime-announcement)
  ~ .betteruptime-announcement__placeholder
  ~ .betteruptime-announcement__placeholder {
  display: none !important;
}

.placeholder,
.placeholder-wave {
  border-radius: 4px;
  display: block;
  margin-bottom: 0.25rem;
}

.fs-7 {
  font-size: 0.9em !important;
}

/*
 * Fix button group rounded corners when buttons have tooltips.
 *
 * bootstrap-vue-next's v-b-tooltip directive inserts a <span> wrapper element
 * as a sibling to each button that has a tooltip. This breaks the DOM adjacency
 * of buttons within a BButtonGroup, which is required for Bootstrap's border-radius
 * rules to work correctly (using :first-of-type, :last-of-type, etc.).
 *
 * This CSS makes the tooltip wrapper spans invisible to the layout engine (display: contents),
 * and manually applies the correct border-radius to buttons based on their position.
 */
.btn-group {
  /* Make tooltip wrapper spans invisible to layout */
  > span:not([class]):not([style]):not([role]) {
    display: contents;
  }

  /* Only child: keep all corners rounded */
  > .btn:only-of-type,
  > a[role="button"]:only-of-type {
    border-radius: var(--bs-btn-border-radius) !important;
  }

  /* First button (not only): round left corners */
  > .btn:first-of-type:not(:last-of-type),
  > a[role="button"]:first-of-type:not(:last-of-type) {
    border-top-right-radius: 0 !important;
    border-bottom-right-radius: 0 !important;
    border-top-left-radius: var(--bs-btn-border-radius) !important;
    border-bottom-left-radius: var(--bs-btn-border-radius) !important;
  }

  /* Last button (not only): round right corners */
  > .btn:last-of-type:not(:first-of-type),
  > a[role="button"]:last-of-type:not(:first-of-type) {
    border-top-left-radius: 0 !important;
    border-bottom-left-radius: 0 !important;
    border-top-right-radius: var(--bs-btn-border-radius) !important;
    border-bottom-right-radius: var(--bs-btn-border-radius) !important;
  }

  /* Middle buttons: no rounded corners */
  > .btn:not(:first-of-type):not(:last-of-type),
  > a[role="button"]:not(:first-of-type):not(:last-of-type) {
    border-radius: 0 !important;
  }
}

.nav-link {
  display: flex;
  gap: 4px;
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
