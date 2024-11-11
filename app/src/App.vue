<template>
  <div id="app">
    <HeadNav :onlineStatus="online" />
    <router-view :style="{ minHeight: 'calc(100vh - 116px)' }" />
    <footer
      class="d-flex justify-content-center align-items-center py-2"
      :style="{
        backgroundColor: '#0069d9',
        color: 'white',
      }"
    >
      <span class="mr-2">
        Andreas Nicklaus @{{ new Date().getFullYear() }}
      </span>
      <img
        src="https://uptime.betterstack.com/status-badges/v3/monitor/1l68q.svg"
        alt=""
      />
      <span
        class="mx-2"
        :style="{ fontFamily: 'monospace', fontSize: '0.8em' }"
      >
        Version: {{ applicationVersion }}
      </span>
    </footer>
    <ConsentWindow />
  </div>
</template>

<script>
import ConsentWindow from "./components/ConsentWindow.vue";
import HeadNav from "./components/HeadNav.vue";
import ax from "./services/RequestService";

export default {
  components: { HeadNav, ConsentWindow },
  data: () => ({
    online: null,
    applicationVersion: process.env.VUE_APP_VERSION,
  }),
  mounted() {
    ax.get("/")
      .then(() => {
        setTimeout(() => (this.online = true), 1000);
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
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  // text-align: center;
  color: #2c3e50;
}

.modal-open {
  padding: 0 !important;
}

.router-link-active {
  color: #2c3e50 !important;
}
</style>
