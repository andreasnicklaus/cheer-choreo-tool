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
      borderRadius: '0 0 20px 20px',
      border: 'none',
      boxShadow: '0px 0px 25px #aaa',
      color: '#2c3e50',
    }"
  >
    <b-row align-h="end" align-v="center">
      <b-col>
        <h4>App herunterladen!</h4>
        Die App nimmt keinen Speicherplatz auf deinem Gerät ein und erleichtert
        das Starten der Anwendung!
      </b-col>
      <b-col cols="auto">
        <b-button @click="dismiss" variant="link" class="mr-2">
          <u> Nein, danke! </u>
        </b-button>
        <b-button
          @click="install"
          variant="success"
          :style="{ color: 'white' }"
        >
          <b-icon-download class="mr-2" />
          INSTALLIEREN
        </b-button>
      </b-col>
    </b-row>
  </b-alert>
</template>

<script>
const cookieName = "install-dismissed";

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
