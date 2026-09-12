import AuthService from "@/services/AuthService";
import FeatureFlagService, {
  FeatureFlagKeys,
} from "@/services/FeatureFlagService";
import { createStore } from "vuex";
import type { UserAccess, User } from "@/types";

const tokenStorageKey = "choreo-planer-token";

export interface State {
  loggedIn: boolean;
  clubId: string | null;
  isMobile: boolean;
  owners: UserAccess[];
  ownersLoaded: boolean;
  me: User | null;
}

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
    isChristmasTime(): boolean {
      const now = new Date();
      const currentYear = now.getFullYear();
      const christmasStart = new Date("12/01").setFullYear(currentYear);
      const christmasEnd = new Date("12/27").setFullYear(currentYear);
      return christmasStart < now.getTime() && now.getTime() < christmasEnd;
    },
    isEasterTime(): boolean {
      const now = new Date();
      const currentYear = now.getFullYear();
      const easterStart = new Date("03/20").setFullYear(currentYear);
      const easterEnd = new Date("04/30").setFullYear(currentYear);
      return easterStart < now.getTime() && now.getTime() < easterEnd;
    },
  },
  mutations: {
    setLoginState(state: State, loginState: boolean) {
      state.loggedIn = loginState;
      if (!loginState) {
        state.clubId = null;
        state.owners = [];
        state.ownersLoaded = false;
      }
    },
    setClubId(state: State, id: string) {
      state.clubId = id;
    },
    setMobile(state: State, isMobile: boolean) {
      state.isMobile = isMobile;
    },
    setOwners(state: State, owners: UserAccess[]) {
      state.owners = owners;
      state.ownersLoaded = true;
    },
    clearOwners(state: State) {
      state.owners = [];
      state.ownersLoaded = false;
    },
    setMe(state: State, me: User) {
      state.me = me;
    },
    clearMe(state: State) {
      state.me = null;
    },
  },
  actions: {
    async loadUserInfo({
      commit,
    }: {
      commit: (type: string, payload?: unknown) => void;
    }) {
      try {
        const me = (await AuthService.getUserInfo(true)) as User & {
          childAccess?: UserAccess[];
        };
        commit("setMe", me);
        const accessSharingEnabled = await FeatureFlagService.isEnabled(
          FeatureFlagKeys.ACCESS_SHARING
        );
        commit(
          "setOwners",
          accessSharingEnabled
            ? (me.childAccess || []).filter(
                (access: UserAccess) => access.enabled
              )
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
