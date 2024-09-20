<template>
  <div id="app">
    <HeadNav />
    <router-view />
  </div>
</template>

<script>
import HeadNav from "./components/HeadNav.vue";

export default {
  components: { HeadNav },
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
</style>
