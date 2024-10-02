<template>
  <div id="app">
    <HeadNav :onlineStatus="online" />
    <router-view />
    <footer
      class="d-flex justify-content-center py-2"
      :style="{ backgroundColor: '#0069d9', color: 'white' }"
    >
      <span class="mr-2">
        Andreas Nicklaus @{{ new Date().getFullYear() }}
      </span>
      <img
        src="https://uptime.betterstack.com/status-badges/v3/monitor/1l68q.svg"
        alt=""
      />
    </footer>
  </div>
</template>

<script>
import HeadNav from "./components/HeadNav.vue";
import ax from "./services/RequestService";

export default {
  components: { HeadNav },
  data: () => ({
    online: null,
  }),
  mounted() {
    ax.get("/")
      .then(() => {
        setTimeout(() => (this.online = true), 1000);
      })
      .catch((e) => {
        this.online = false;
        console.error(e);
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
</style>
