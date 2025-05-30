<template>
  <b-navbar toggleable="sm">
    <b-navbar-brand
      :to="{ name: 'Home', params: { locale: $root.$i18n.locale } }"
    >
      <img
        :src="
          $store.getters.isChristmasTime
            ? '/Icon-Christmas.png'
            : $store.getters.isEasterTime
            ? '/Icon-Easter.png'
            : '/Icon.png'
        "
        :alt="$t('choreo-planer-icon')"
        width="50"
        height="50"
      />
    </b-navbar-brand>

    <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

    <b-collapse id="nav-collapse" is-nav>
      <b-navbar-nav>
        <b-nav-item
          :to="{ name: 'Home', params: { locale: $root.$i18n.locale } }"
          v-bind:active-class="
            $route.name == 'Home' ? 'router-link-active' : ''
          "
        >
          <b-icon-house-fill class="mr-1" />
          {{ $t("nav.start") }}
        </b-nav-item>
        <b-nav-item
          :to="{ name: 'Start', params: { locale: $root.$i18n.locale } }"
          :disabled="!$store.state.loggedIn"
        >
          {{ $t("nav.uebersicht") }}
        </b-nav-item>

        <b-nav-item-dropdown :disabled="!$store.state.loggedIn">
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Choreo' }">
              {{ $tc("choreo", 2) }}
            </span>
          </template>
          <b-dropdown-group
            v-for="team in teams.filter((t) =>
              t.SeasonTeams.some((st) => st.Choreos?.length > 0)
            )"
            :key="team.id"
            :header="team.name"
          >
            <b-dropdown-text
              v-for="seasonTeam in team.SeasonTeams.filter(
                (st) => st.Choreos?.length > 0
              )"
              :key="seasonTeam.id"
              v-b-toggle="`collapse-${seasonTeam.id}`"
              class="dropdown-submenu"
            >
              <span class="d-flex justify-content-between align-items-center">
                {{ seasonTeam.Season.name }}
                <b-icon-caret-down-fill class="ml-auto" variant="secondary" />
              </span>
              <b-collapse :id="`collapse-${seasonTeam.id}`">
                <b-dropdown-item
                  v-for="choreo in seasonTeam.Choreos"
                  :key="choreo.id"
                  :to="{
                    name: 'Choreo',
                    params: {
                      choreoId: choreo.id,
                      locale: $root.$i18n.locale,
                    },
                  }"
                >
                  {{ choreo.name }}
                </b-dropdown-item>
              </b-collapse>
            </b-dropdown-text>
            <b-dropdown-divider />
          </b-dropdown-group>
          <b-dropdown-item
            variant="success"
            @click="() => $refs.createChoreoModal.open()"
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            {{ $t("nav.neue-choreo") }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
        <b-nav-item-dropdown :disabled="!$store.state.loggedIn">
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Team' }">
              {{ $tc("team", 2) }}
            </span>
          </template>
          <b-dropdown-item
            v-for="team in teams"
            :key="team.id"
            :to="{
              name: 'Team',
              params: { teamId: team.id, locale: $root.$i18n.locale },
            }"
          >
            {{ team.name }}
          </b-dropdown-item>
          <b-dropdown-divider v-if="teams && teams.length > 0" />
          <b-dropdown-item
            variant="success"
            @click="() => $refs.createTeamModal.open()"
            v-if="$store.state.clubId"
          >
            <b-icon-plus />
            {{ $t("nav.neues-team") }}
          </b-dropdown-item>
        </b-nav-item-dropdown>
      </b-navbar-nav>

      <b-navbar-nav class="ml-auto align-items-sm-center">
        <b-nav-item-dropdown
          no-caret
          right
          :class="{ 'mr-3': $store.state.isMobile }"
          v-if="$store.state.loggedIn"
        >
          <template #button-content>
            <b-icon-bell />
            <span v-if="$store.state.isMobile" class="ml-2">{{
              $t("nav.benachrichtigungen")
            }}</span>
            <b-badge
              pill
              variant="danger"
              v-if="notifications.filter((n) => !n.read).length > 0"
              :style="{
                position: 'absolute',
                right: 0,
                top: $store.state.isMobile ? null : 0,
              }"
              >{{ notifications.filter((n) => !n.read).length }}</b-badge
            >
          </template>
          <b-dropdown-text
            style="width: 400px"
            class="text-center"
            v-if="
              notifications.filter((n) => showAllNotifications || !n.read)
                .length == 0
            "
          >
            <b-icon-bell />
            {{ $t("nav.du-hast-noch-keine-benachrichtigungen-erhalten") }}
          </b-dropdown-text>
          <b-dropdown-text
            style="width: 400px"
            text-class="p-0"
            v-for="notification in notifications.filter(
              (n) => showAllNotifications || !n.read
            )"
            :key="notification.id"
          >
            <b-card border-variant="light" class="notification-card">
              <b-row>
                <b-col>
                  <b-card-sub-title>
                    <b-badge
                      pill
                      variant="success"
                      class="mr-1"
                      v-if="!notification.read"
                      >{{ $t("nav.neu-0") }}</b-badge
                    >
                    <b-badge pill variant="primary">{{
                      toTimeAgo(notification.createdAt)
                    }}</b-badge>
                  </b-card-sub-title>
                  <b-card-title class="mt-1 mb-2"
                    ><vue-markdown
                      :breaks="false"
                      class="notification-card-text"
                      :anchorAttributes="{ target: '_blank' }"
                    >
                      {{ notification.title.replace(/  +/g, " ") }}
                    </vue-markdown>
                  </b-card-title>
                </b-col>
                <b-col cols="auto">
                  <b-button
                    variant="link"
                    @click="
                      () =>
                        notification.read
                          ? markNotificationAsNotRead(notification.id)
                          : markNotificationAsRead(notification.id)
                    "
                  >
                    <b-icon-envelope v-if="notification.read" />
                    <b-icon-envelope-open v-else />
                  </b-button>
                  <b-button
                    variant="link"
                    @click="() => deleteNotification(notification.id)"
                  >
                    <b-icon-trash variant="danger" />
                  </b-button>
                </b-col>
              </b-row>
              <vue-markdown
                :breaks="false"
                class="notification-card-text"
                :anchorAttributes="{ target: '_blank' }"
              >
                {{ notification.message.replace(/  +/g, " ") }}
              </vue-markdown>
            </b-card>
          </b-dropdown-text>
          <b-dropdown-text v-if="!showAllNotifications">
            <b-button
              block
              @click="() => (showAllNotifications = true)"
              variant="link"
              :disabled="notifications.length == 0"
              >{{ $t("nav.alte-nachrichten-anzeigen") }}</b-button
            ></b-dropdown-text
          >
          <b-dropdown-text v-else>
            <b-button
              block
              @click="() => (showAllNotifications = false)"
              variant="link"
              :disabled="notifications.length == 0"
              >{{ $t("nav.alte-nachrichten-ausblenden") }}</b-button
            >
          </b-dropdown-text>
        </b-nav-item-dropdown>

        <b-nav-item-dropdown variant="link" no-caret>
          <template #button-content>
            <flag
              :squared="false"
              :iso="flags.find((f) => f.lang == $root.$i18n.locale)?.flag"
            />
            <span v-if="$store.state.isMobile">
              {{ flags.find((f) => f.lang == $root.$i18n.locale)?.localName }}
            </span>
          </template>
          <b-dropdown-item
            v-for="({ lang, flag, localName }, i) in flags"
            :key="`lang${i}`"
            :value="lang"
            @click="() => LanguageService.setLanguage(lang)"
          >
            <flag :squared="false" :iso="flag" class="mr-1" />
            <span>{{ localName }}</span>
          </b-dropdown-item>
        </b-nav-item-dropdown>

        <b-nav-item
          @click="share"
          v-b-tooltip.hover
          :title="$t('nav.teilen')"
          v-if="shareable"
        >
          <b-icon-share />
          <span class="d-sm-none ml-2">{{ $t("nav.teilen") }}</span>
        </b-nav-item>
        <b-nav-item
          class="d-sm-block d-none"
          v-if="onlineStatus != null"
          v-b-tooltip.hover
          :title="
            onlineStatus
              ? $t('nav.server-sind-online') +
                (serverVersion && ` (${serverVersion || $t('errors.unknown')})`)
              : $t('nav.server-sind-offline')
          "
        >
          <b-icon-check-circle variant="success" v-if="onlineStatus === true" />
          <b-icon-x-circle variant="danger" v-if="onlineStatus === false" />
        </b-nav-item>
        <b-nav-item
          :to="{ name: 'Help', params: { locale: $root.$i18n.locale } }"
          v-b-tooltip.hover
          :title="$t('general.help')"
        >
          <b-icon-question-circle />
          <span class="d-sm-none ml-2">{{ $t("general.help") }}</span>
        </b-nav-item>
        <b-nav-item
          :to="
            $store.state.loggedIn
              ? null
              : { name: 'Login', params: { locale: $root.$i18n.locale } }
          "
        >
          <b-button
            variant="primary"
            :style="{ color: 'white' }"
            v-if="!$store.state.loggedIn"
            :block="$store.state.isMobile"
          >
            {{ $t("anmelden") }}
          </b-button>
          <b-dropdown
            v-else
            :variant="$store.state.isMobile ? 'outline-secondary' : 'light'"
            right
            :block="$store.state.isMobile"
          >
            <template #button-content>
              <b-avatar
                size="25px"
                variant="light"
                :src="currentProfilePictureBlob"
              />
              <span v-if="$store.state.isMobile" class="mx-2">{{
                user?.username
              }}</span>
            </template>
            <b-dropdown-group :header="$t('konto')">
              <b-dropdown-item
                :to="{
                  name: 'Account',
                  params: { locale: $root.$i18n.locale },
                }"
              >
                <b-avatar
                  size="25px"
                  class="mr-2"
                  variant="primary"
                  :src="currentProfilePictureBlob"
                />
                {{ user?.username }}
              </b-dropdown-item>
            </b-dropdown-group>

            <b-dropdown-divider />

            <b-dropdown-group :header="$t('nav.vereine')">
              <b-dropdown-item
                v-for="club in clubs"
                :key="club.id"
                :variant="club.id == $store.state.clubId ? 'primary' : null"
                @click="selectCurrentClub(club.id)"
              >
                {{ club.name }}
              </b-dropdown-item>
            </b-dropdown-group>
            <b-dropdown-item
              variant="success"
              @click="() => $refs.createClubModal.open()"
            >
              <b-icon-plus />
              {{ $t("nav.neuer-verein") }}
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item variant="danger" @click="logout">
              <b-icon-door-open class="mr-2" />
              {{ $t("nav.ausloggen") }}
            </b-dropdown-item>
          </b-dropdown>
        </b-nav-item>
      </b-navbar-nav>
    </b-collapse>

    <CreateClubModal ref="createClubModal" @clubCreated="reloadPage" />

    <CreateChoreoModal
      ref="createChoreoModal"
      :teams="teams"
      @addChoreo="reloadPage"
    />

    <CreateTeamModal
      ref="createTeamModal"
      @teamCreated="onTeamCreated"
      v-if="$store.state.loggedIn"
    />
  </b-navbar>
</template>

<script>
import AuthService from "@/services/AuthService";
import ClubService from "@/services/ClubService";
import CreateChoreoModal from "./modals/CreateChoreoModal.vue";
import CreateClubModal from "./modals/CreateClubModal.vue";
import CreateTeamModal from "./modals/CreateTeamModal.vue";
import LanguageService from "@/services/LanguageService";
import MessagingService from "@/services/MessagingService";
import NotificationService from "@/services/NotificationService";
import VueMarkdown from "vue-markdown-v2";
import toTimeAgo from "@/utils/time";

/**
 * @module Component:HeadNav
 *
 * @vue-data {Array} teams=[]
 * @vue-data {Array} choreos=[]
 * @vue-data {Array} clubs=[]
 * @vue-data {Object} user=null
 * @vue-data {Boolean} shareable=false
 * @vue-data {Array} flags=[]
 * @vue-data {Object} currentProfilePictureBlob=null
 * @vue-data {Object} loadInterval=null
 * @vue-data {Object} loadNotificationsInterval=null
 * @vue-data {Array} notifications=[]
 * @vue-data {Boolean} showAllNotifications=false
 * @vue-data {Boolean} showNotificationsDropdown=false
 *
 * @vue-prop {Boolean} onlineStatus
 * @vue-prop {String} [serverVersion=null]
 *
 * @vue-computed {Object} shareData
 */
export default {
  name: "HeadNav",
  components: {
    CreateChoreoModal,
    CreateClubModal,
    CreateTeamModal,
    VueMarkdown,
  },
  data: () => ({
    teams: [],
    choreos: [],
    clubs: [],
    user: null,
    shareable: false,
    flags: [
      {
        flag: "de",
        lang: "de",
        localName: "Deutsch",
      },
      { flag: "us", lang: "en", localName: "English" },
    ],
    LanguageService,
    currentProfilePictureBlob: null,
    loadInterval: null,
    loadNotificationsInterval: null,
    notifications: [],
    showAllNotifications: false,
    showNotificationsDropdown: false,
  }),
  props: {
    onlineStatus: {
      type: Boolean,
    },
    serverVersion: {
      type: String,
      default: null,
    },
  },
  methods: {
    load() {
      if (this.$store.state.loggedIn) {
        AuthService.getUserInfo()
          .then((user) => {
            this.user = user;
            this.loadProfileImage();
          })
          .catch(() => {});

        if (this.$store.state.clubId) {
          ClubService.getById(this.$store.state.clubId)
            .then((club) => {
              this.teams = club?.Teams || [];
              this.choreos = this.teams
                .map((t) => t.SeasonTeams.map((st) => st.Choreos))
                .flat(Infinity);
            })
            .catch(() => {});
        }

        ClubService.getAll()
          .then((clubList) => {
            this.clubs = clubList;
            const club = clubList[0];
            if (!club) return;
            if (!this.$store.state.clubId)
              this.$store.commit("setClubId", club.id);
            this.teams = club?.Teams || [];
            this.choreos = this.teams.map((t) => t.Choreos).flat();
          })
          .catch(() => {});

        this.loadNotifications();
      }
    },
    loadNotifications() {
      if (this.$store.state.loggedIn)
        NotificationService.getAll()
          .then((notifications) => {
            this.notifications = notifications;
          })
          .catch(() => {});
    },
    checkEmailConfirmation() {
      if (this.user?.email && !this.user?.emailConfirmed) {
        MessagingService.showWarning(
          this.$t("nav.checkEmail.text"),
          this.$t("nav.checkEmail.title"),
          { autoHideDelay: 10_000 }
        );
      }
    },
    logout() {
      AuthService.logout();
    },
    selectCurrentClub(id) {
      this.$store.commit("setClubId", id);
    },
    onTeamCreated(team) {
      this.teams.push(team);
      this.$router.push({
        name: "Team",
        params: { teamId: team.id, locale: this.$root.$i18n.locale },
      });
    },
    reloadPage() {
      location.reload();
    },
    share() {
      navigator.share(this.shareData);
    },
    loadProfileImage() {
      if (this.user?.profilePictureExtension == null)
        this.currentProfilePictureBlob = null;
      else
        AuthService.getProfileImage(
          this.user.id,
          this.user.profilePictureExtension
        ).then((response) => {
          this.currentProfilePictureBlob = URL.createObjectURL(response.data);
        });
    },
    toTimeAgo,
    markNotificationAsNotRead(notificationId) {
      NotificationService.markAsNotRead(notificationId).then(() => {
        this.loadNotifications();
      });
    },
    markNotificationAsRead(notificationId) {
      NotificationService.markAsRead(notificationId).then(() => {
        this.loadNotifications();
      });
    },
    deleteNotification(notificationId) {
      NotificationService.delete(notificationId).then(() => {
        this.loadNotifications();
      });
    },
  },
  watch: {
    "$store.state.loggedIn": {
      handler() {
        this.load();
      },
      immediate: true,
    },
    "$store.state.clubId": {
      handler() {
        this.load();
      },
      immediate: true,
    },
  },
  created() {
    this.load();
    setTimeout(this.checkEmailConfirmation, 1000);
    this.loadInterval = setInterval(this.load, 60_000);
    this.loadNotificationsInterval = setInterval(
      this.loadNotifications,
      10_000
    );
  },
  mounted() {
    if (navigator.canShare && navigator.share)
      this.shareable = navigator.canShare(this.shareData);
  },
  beforeUnmount() {
    if (this.loadInterval) clearInterval(this.loadInterval);
    if (this.loadNotificationsInterval)
      clearInterval(this.loadNotificationsInterval);
  },
  computed: {
    shareData() {
      return {
        url: window.location.href,
        title: document.title,
        text: this.$t("nav.schau-dir-das-an"),
      };
    },
  },
};
</script>

<style lang="scss" scoped>
.dropdown-submenu:hover:not(:has(div.collapse:hover)) {
  color: #16181b;
  background-color: #e9ecef;
}

.b-dropdown-text {
  font-weight: initial;
}
</style>

<style lang="scss">
.notification-card-text > p {
  margin: 0;
}
</style>
