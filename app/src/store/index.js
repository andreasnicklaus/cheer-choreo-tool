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
  getters: {
    isChristmasTime() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const christmasStart = new Date("12/01").setFullYear(currentYear);
      const christmasEnd = new Date("12/27").setFullYear(currentYear);
      return christmasStart < now && now < christmasEnd;
    },
    isEasterTime() {
      const now = new Date();
      const currentYear = now.getFullYear();
      const easterStart = new Date("03/20").setFullYear(currentYear);
      const easterEnd = new Date("04/30").setFullYear(currentYear);
      return easterStart < now && now < easterEnd;
    },
  },
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
