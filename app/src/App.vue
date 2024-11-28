<template>
  <div id="app" :class="{ mobile: $store.state.isMobile }">
    <AppInstallWindow />
    <HeadNav :onlineStatus="online" :serverVersion="serverVersion" />
    <router-view :style="{ minHeight: 'calc(100vh - 116px)' }" class="mb-2" />
    <footer class="p-4 px-5 d-flex flex-column align-items-center">
      <b-row align-h="around" class="w-75 footer-link" :style="{ gap: '20px' }">
        <b-col cols="auto">
          <h5>
            <b>Interne Links</b>
          </h5>
          <b-button variant="link" :to="{ name: 'Home' }"> Startseite </b-button
          ><br />
          <b-button variant="link" :to="{ name: 'Help' }"> Hilfe </b-button
          ><br />
          <b-button variant="link" :to="{ name: 'Impressum' }">
            Impressum </b-button
          ><br />
          <b-button variant="link" :to="{ name: 'Datenschutz' }">
            Datenschutz </b-button
          ><br />
        </b-col>
        <b-col cols="auto">
          <h5>
            <b>Externe Links</b>
          </h5>
          <b-button
            variant="link"
            href="https://www.instagram.com/choreoplaner/"
            target="_blank"
          >
            <b-icon-instagram class="mr-2" />
            Instagram </b-button
          ><br />
          <b-button
            variant="link"
            href="https://github.com/andreasnicklaus/cheer-choreo-tool"
            target="_blank"
          >
            <b-icon-github class="mr-2" />
            Github </b-button
          ><br />
        </b-col>
      </b-row>
      <hr :style="{ width: '100%', borderColor: '000225' }" class="my-3" />
      <b-row align-h="center">
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
  </div>
</template>

<script>
import AppInstallWindow from "./components/AppInstallWindow.vue";
import ConsentWindow from "./components/ConsentWindow.vue";
import HeadNav from "./components/HeadNav.vue";
import ax from "./services/RequestService";

export default {
  components: { HeadNav, ConsentWindow, AppInstallWindow },
  data: () => ({
    online: true,
    serverVersion: null,
    applicationVersion: process.env.VUE_APP_VERSION,
  }),
  metaInfo() {
    return {
      titleTemplate: "%s - Choreo Planer",
      meta: [
        {
          name: "keywords",
          content:
            "Choreo, Choreographie, Cheer, Cheerleading, Tanz, Planer, Editor",
        },
        {
          name: "author",
          content: "Andreas Nicklaus",
        },
        {
          property: "og:url",
          content: "https://www.choreo-planer.de" + this.$route.path,
        },
        {
          property: "twitter:url",
          content: "https://www.choreo-planer.de" + this.$route.path,
        },
        {
          property: "twitter:domain",
          content: "https://www.choreo-planer.de",
        },
      ],
      link: [
        {
          rel: "canonical",
          href: "https://www.choreo-planer.de" + this.$route.path,
        },
      ],
    };
  },
  mounted() {
    if (!window.__PRERENDER_INJECTED)
      ax.get("/version")
        .then((res) => {
          this.online = true;
          this.serverVersion = res.data;
        })
        .catch(() => {
          this.online = false;
          this.$bvToast.toast(
            "Die Server sind zurzeit offline. Bitte versuche es später nochmal!",
            {
              title: "Offline",
              variant: "danger",
            }
          );
        });
  },
  watch: {
    "$vuetify.breakpoint.smAndDown": {
      handler(value) {
        this.$store.commit("setMobile", value);
      },
      immediate: true,
    },
  },
};
</script>
<style lang="scss">
.modal-open {
  padding: 0 !important;
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

footer a {
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
