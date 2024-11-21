import Vue from "vue";
import Vuex from "vuex";

Vue.use(Vuex);

const tokenStorageKey = "choreo-planer-token";

export default new Vuex.Store({
  state: {
    loggedIn: localStorage.getItem(tokenStorageKey) != null,
    clubId: null,
    isMobile: true,
  },
  getters: {},
  mutations: {
    setLoginState(state, loginState) {
      state.loggedIn = loginState;
      if (!loginState) state.clubId = null;
    },
    setClubId(state, id) {
      state.clubId = id;
    },
    setMobile(state, isMobile) {
      state.isMobile = isMobile;
    },
  },
  actions: {},
  modules: {},
});
