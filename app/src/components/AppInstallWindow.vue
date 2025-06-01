<template>
  <b-alert
    :show="Boolean(installationPrompt)"
    class="m-0 py-3 px-4"
    fade
    :style="{
      position: 'sticky',
      top: 0,
      zIndex: 99,
      backgroundColor: '#fff',
      border: 'none',
      boxShadow: '0px 0px 25px #aaa',
      color: '#2c3e50',
    }"
  >
    <b-row align-h="end" align-v="center" :style="{ rowGap: '1rem' }">
      <b-col cols="12" md="">
        <h4>{{ $t("app-install.app-herunterladen") }}</h4>
        {{ $t("app-install.install-info") }}
      </b-col>
      <b-col cols="auto">
        <b-button @click="dismiss" variant="link" class="mr-2">
          <u>{{ $t("app-install.nein-danke") }}</u>
        </b-button>
        <b-button
          @click="install"
          variant="success"
          :style="{ color: 'white' }"
        >
          <b-icon-download class="mr-2" />
          {{ $t("app-install.installieren") }}
        </b-button>
      </b-col>
    </b-row>
  </b-alert>
</template>

<script>
const cookieName = "install-dismissed";

/**
 * @module Component:AppInstallWindow
 *
 * @vue-data {Object|null} installationPrompt=null - The installation prompt event, if available.
 *
 * @example
 * <AppInstallWindow />
 */
export default {
  name: "AppInstallWindow",
  data: () => ({
    installationPrompt: null,
  }),
  mounted() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      const cookie = this.$cookie.get(cookieName);
      if (cookie == null) {
        this.installationPrompt = null;
        this.$cookie.set(cookieName, "false", { expires: 30 });
      }
      if (cookie == "false") {
        this.installationPrompt = e;
      } else this.installationPrompt = null;
    });
    window.addEventListener("appinstalled", () => {
      this.installationPrompt = null;
    });
  },
  methods: {
    async dismiss() {
      this.$cookie.set(cookieName, "true", { expires: 30 });
      this.installationPrompt = null;
    },
    async install() {
      this.installationPrompt?.prompt();
    },
  },
};
</script>
