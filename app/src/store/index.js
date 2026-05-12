import AuthService from "@/services/AuthService";
import FeatureFlagService, {
  FeatureFlagKeys,
} from "@/services/FeatureFlagService";
import { createStore } from "vuex";

const tokenStorageKey = "choreo-planer-token";

export default createStore({
  state: {
    loggedIn: localStorage.getItem(tokenStorageKey) != null,
    clubId: null,
    isMobile: true,
    owners: [],
    ownersLoaded: false,
    me: null,
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
      if (!loginState) {
        state.clubId = null;
        state.owners = [];
        state.ownersLoaded = false;
      }
    },
    setClubId(state, id) {
      state.clubId = id;
    },
    setMobile(state, isMobile) {
      state.isMobile = isMobile;
    },
    setOwners(state, owners) {
      state.owners = owners;
      state.ownersLoaded = true;
    },
    clearOwners(state) {
      state.owners = [];
      state.ownersLoaded = false;
    },
    setMe(state, me) {
      state.me = me;
    },
    clearMe(state) {
      state.me = null;
    },
  },
  actions: {
    async loadUserInfo({ commit }) {
      try {
        const me = await AuthService.getUserInfo(true);
        commit("setMe", me);
        const accessSharingEnabled = await FeatureFlagService.isEnabled(
          FeatureFlagKeys.ACCESS_SHARING
        );
        commit(
          "setOwners",
          accessSharingEnabled
            ? (me.childAccess || []).filter((access) => access.enabled)
            : []
        );
      } catch {
        commit("clearMe");
        commit("clearOwners");
      }
    },
  },
  modules: {},
});
