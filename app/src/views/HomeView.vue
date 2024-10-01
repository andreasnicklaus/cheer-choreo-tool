<template>
  <b-container
    id="homeView"
    class="d-flex flex-column justify-content-center align-items-center"
    :style="{
      minHeight: '50vh',
    }"
  >
    <b-button variant="primary" :to="{ name: 'Login' }" class="mb-4">
      Anmelden / Registrieren
    </b-button>
    <router-link :to="{ name: 'Help' }"> Hilfe </router-link>
  </b-container>
</template>

<script>
export default {
  name: "HomeView",
  mounted() {
    if (this.$store.state.loggedIn)
      this.$router.push({ name: "Start" }).catch(() => {});
  },
};
</script>
