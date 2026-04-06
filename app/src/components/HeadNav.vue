<template>
  <BNavbar toggleable="sm" class="me-2" no-auto-close>
    <BNavbarBrand :to="{ name: 'Home', params: { locale: $i18n.locale } }">
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
    </BNavbarBrand>

    <BNavbarToggle target="nav-collapse"></BNavbarToggle>

    <BCollapse id="nav-collapse" is-nav>
      <BNavbarNav>
        <BNavItem
          :to="{ name: 'Home', params: { locale: $i18n.locale } }"
          :active-class="$route.name == 'Home' ? 'router-link-active' : ''"
        >
          <IBiHouseFill class="me-1" />
          {{ $t("nav.start") }}
        </BNavItem>
        <BNavItem
          :to="{ name: 'Start', params: { locale: $i18n.locale } }"
          :disabled="!$store.state.loggedIn"
        >
          {{ $t("nav.uebersicht") }}
        </BNavItem>

        <BNavItemDropdown
          :disabled="!$store.state.loggedIn"
          auto-close="outside"
        >
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Choreo' }">
              {{ $t("choreo", 2) }}
            </span>
          </template>
          <BDropdownGroup
            v-for="team in teams.filter((t) =>
              t.SeasonTeams.some((st) => st.Choreos?.length > 0)
            )"
            :key="team.id"
            :header="team.name"
          >
            <BDropdownText
              v-for="seasonTeam in team.SeasonTeams.filter(
                (st) => st.Choreos?.length > 0
              )"
              :key="seasonTeam.id"
              v-b-toggle="`collapse-${seasonTeam.id}`"
              class="dropdown-submenu"
            >
              <span class="d-flex justify-content-between align-items-center">
                {{ seasonTeam.Season.name }}
                <IBiCaretDownFill class="ms-auto" variant="secondary" />
              </span>
              <BCollapse :id="`collapse-${seasonTeam.id}`">
                <BDropdownItem
                  v-for="choreo in seasonTeam.Choreos"
                  :key="choreo.id"
                  :to="{
                    name: 'Choreo',
                    params: {
                      choreoId: choreo.id,
                      locale: $i18n.locale,
                    },
                  }"
                >
                  {{ choreo.name }}
                </BDropdownItem>
              </BCollapse>
            </BDropdownText>
            <BDropdownDivider />
          </BDropdownGroup>
          <BDropdownItem
            v-show="$store.state.clubId"
            variant="success"
            @click="() => $refs.createChoreoModal.open()"
          >
            <IBiPlus />
            {{ $t("nav.neue-choreo") }}
          </BDropdownItem>
        </BNavItemDropdown>
        <BNavItemDropdown :disabled="!$store.state.loggedIn">
          <template #button-content>
            <span :class="{ 'router-link-active': $route.name == 'Team' }">
              {{ $t("team", 2) }}
            </span>
          </template>
          <BDropdownItem
            v-for="team in teams"
            :key="team.id"
            :to="{
              name: 'Team',
              params: { teamId: team.id, locale: $i18n.locale },
            }"
          >
            {{ team.name }}
          </BDropdownItem>
          <BDropdownDivider v-show="teams && teams.length > 0" />
          <BDropdownItem
            v-show="$store.state.clubId"
            variant="success"
            @click="() => $refs.createTeamModal.open()"
          >
            <IBiPlus />
            {{ $t("nav.neues-team") }}
          </BDropdownItem>
        </BNavItemDropdown>
      </BNavbarNav>

      <BNavbarNav class="ms-auto align-items-sm-center">
        <BNavItemDropdown
          v-show="$store.state.loggedIn && !$store.state.isMobile"
          no-caret
          right
          :class="{ 'me-3': $store.state.isMobile }"
          data-testid="notification-button"
        >
          <template #button-content>
            <IBiBell />
            <span v-show="$store.state.isMobile" class="ms-2">{{
              $t("nav.benachrichtigungen")
            }}</span>
            <BBadge
              v-show="notifications.filter((n) => !n.read).length > 0"
              pill
              variant="danger"
              :style="{
                position: 'absolute',
                right: 0,
                top: $store.state.isMobile ? null : 0,
              }"
              >{{ notifications.filter((n) => !n.read).length }}</BBadge
            >
          </template>
          <BDropdownText
            v-show="
              notifications.filter((n) => showAllNotifications || !n.read)
                .length == 0
            "
            style="width: 400px"
            class="text-center"
          >
            <IBiBell />
            {{ $t("nav.du-hast-noch-keine-benachrichtigungen-erhalten") }}
          </BDropdownText>
          <BDropdownText
            v-for="notification in notifications.filter(
              (n) => showAllNotifications || !n.read
            )"
            :key="notification.id"
            style="width: 400px"
            text-class="p-0"
          >
            <BCard border-variant="light" class="notification-card" @click.stop>
              <BRow>
                <BCol>
                  <BCardSubtitle>
                    <BBadge
                      v-show="!notification.read"
                      pill
                      variant="success"
                      class="me-1"
                      >{{ $t("nav.neu-0") }}</BBadge
                    >
                    <BBadge pill variant="primary">{{
                      toTimeAgo(notification.createdAt)
                    }}</BBadge>
                  </BCardSubtitle>
                  <BCardTitle class="mt-1 mb-2">
                    <Markdown
                      :source="notification.title.replace(/  +/g, ' ')"
                      :breaks="false"
                      :html="true"
                      class="notification-card-text"
                      :anchor-attributes="{ target: '_blank' }"
                    />
                  </BCardTitle>
                </BCol>
                <BCol cols="auto" @click.stop>
                  <BButton
                    variant="link"
                    data-testid="toggleReadStatus-button"
                    @click.stop="
                      () =>
                        notification.read
                          ? markNotificationAsNotRead(notification.id)
                          : markNotificationAsRead(notification.id)
                    "
                  >
                    <IBiEnvelope v-show="notification.read" />
                    <IBiEnvelopeOpen v-show="!notification.read" />
                  </BButton>
                  <BButton
                    variant="link"
                    @click.stop="() => deleteNotification(notification.id)"
                  >
                    <IBiTrash variant="danger" />
                  </BButton>
                </BCol>
              </BRow>
              <Markdown
                :breaks="false"
                class="notification-card-text"
                :anchor-attributes="{ target: '_blank' }"
                :source="notification.message.replace(/  +/g, ' ')"
                :html="true"
              />
            </BCard>
          </BDropdownText>
          <BDropdownText v-if="!showAllNotifications" class="d-grid">
            <BButton
              variant="link"
              :disabled="notifications.length == 0"
              @click.stop="() => (showAllNotifications = true)"
              >{{ $t("nav.alte-nachrichten-anzeigen") }}</BButton
            ></BDropdownText
          >
          <BDropdownText v-else class="d-grid">
            <BButton
              variant="link"
              :disabled="notifications.length == 0"
              @click.stop="() => (showAllNotifications = false)"
              >{{ $t("nav.alte-nachrichten-ausblenden") }}</BButton
            >
          </BDropdownText>
        </BNavItemDropdown>

        <BNavItemDropdown variant="link" no-caret data-testid="locale-switch">
          <template #button-content>
            <CountryFlag
              :iso="flags.find((f) => f.lang == $i18n.locale)?.flag"
              mode="rounded"
            />

            <span v-show="$store.state.isMobile" class="ms-2">
              {{ flags.find((f) => f.lang == $i18n.locale)?.localName }}
            </span>
          </template>
          <BDropdownItem
            v-for="({ lang, flag, localName }, i) in flags"
            :key="`lang${i}`"
            :value="lang"
            @click="() => LanguageService.setLanguage(lang)"
          >
            <CountryFlag :iso="flag" mode="rounded" class="me-1" />
            <span>{{ localName }}</span>
          </BDropdownItem>
        </BNavItemDropdown>

        <BNavItem
          v-show="shareable"
          v-b-tooltip.hover.bottom="$t('nav.teilen')"
          @click="share"
        >
          <IBiShare />
          <span class="d-sm-none ms-2">{{ $t("nav.teilen") }}</span>
        </BNavItem>

        <BNavItem
          v-show="onlineStatus != null"
          v-b-tooltip.hover.bottom="
            onlineStatus == true
              ? $t('nav.server-sind-online') +
                (serverVersion && ` (${serverVersion || $t('errors.unknown')})`)
              : $t('nav.server-sind-offline')
          "
          class="d-sm-block d-none"
          data-testid="serverStatus"
        >
          <IBiCheckCircle v-show="onlineStatus === true" class="text-success" />
          <IBiXCircle v-show="onlineStatus === false" class="text-danger" />
        </BNavItem>
        <BNavItem
          v-b-tooltip.hover.bottom="$t('general.help')"
          :to="{ name: 'Help', params: { locale: $i18n.locale } }"
        >
          <IBiQuestionCircle />
          <span class="d-sm-none ms-2">{{ $t("general.help") }}</span>
        </BNavItem>
        <BButton
          v-if="!$store.state.loggedIn"
          variant="primary"
          :style="{ color: 'white' }"
          :to="
            $store.state.loggedIn
              ? null
              : { name: 'Login', params: { locale: $i18n.locale } }
          "
        >
          {{ $t("anmelden") }}
        </BButton>
        <BDropdown
          v-if="$store.state.loggedIn && !$store.state.isMobile"
          :variant="$store.state.isMobile ? 'outline-secondary' : 'light'"
          data-testid="account-dropdown"
          class="d-sm-block d-none"
          placement="bottom-start"
        >
          <template #button-content>
            <BAvatar
              size="25px"
              variant="light"
              :src="currentProfilePictureBlob"
            />
            <span v-show="$store.state.isMobile" class="mx-2">{{
              user?.username
            }}</span>
          </template>
          <BDropdownGroup :header="$t('konto')">
            <BDropdownItem
              :to="{
                name: 'Account',
                params: { locale: $i18n.locale },
              }"
            >
              <BAvatar
                size="25px"
                class="me-2"
                variant="primary"
                :src="currentProfilePictureBlob"
              />
              {{ user?.username }}
            </BDropdownItem>
          </BDropdownGroup>

          <BDropdownDivider />

          <BDropdownGroup :header="$t('nav.vereine')">
            <BDropdownItem
              v-for="club in clubs"
              :key="club.id"
              :variant="club.id == $store.state.clubId ? 'primary' : null"
              @click="selectCurrentClub(club.id)"
            >
              {{ club.name }}
            </BDropdownItem>
          </BDropdownGroup>
          <BDropdownItem
            variant="success"
            @click="() => $refs.createClubModal.open()"
          >
            <IBiPlus />
            {{ $t("nav.neuer-verein") }}
          </BDropdownItem>
          <BDropdownDivider />
          <BDropdownItem
            variant="danger"
            data-testid="logout-button"
            @click="logout"
          >
            <IBiDoorOpen class="me-2" />
            {{ $t("nav.ausloggen") }}
          </BDropdownItem>
        </BDropdown>
        <div v-if="$store.state.loggedIn && $store.state.isMobile">
          <hr />
          <p class="text-muted fs-7 mb-0">{{ $t("konto") }}</p>
          <BNavItem
            v-show="$store.state.loggedIn && $store.state.isMobile"
            :to="{
              name: 'Account',
              params: { locale: $i18n.locale },
            }"
          >
            <BAvatar
              size="25px"
              class="me-2"
              variant="primary"
              :src="currentProfilePictureBlob"
            />
            {{ user?.username }}
          </BNavItem>
          <hr />
          <p class="text-muted fs-7 mb-0">{{ $t("nav.vereine") }}</p>
          <BNavItem
            v-for="club in clubs"
            :key="club.id"
            :variant="club.id == $store.state.clubId ? 'primary' : null"
            @click="selectCurrentClub(club.id)"
          >
            {{ club.name }}
          </BNavItem>
          <BNavItem
            variant="success"
            @click="() => $refs.createClubModal.open()"
          >
            <IBiPlus />
            {{ $t("nav.neuer-verein") }}
          </BNavItem>
          <hr />
          <BNavItem
            variant="danger"
            data-testid="logout-button"
            @click="logout"
          >
            <IBiDoorOpen class="me-2" />
            {{ $t("nav.ausloggen") }}
          </BNavItem>
        </div>
      </BNavbarNav>
    </BCollapse>

    <CreateClubModal ref="createClubModal" @club-created="reloadPage" />

    <CreateChoreoModal
      ref="createChoreoModal"
      :teams="teams"
      @add-choreo="reloadPage"
    />

    <CreateTeamModal
      v-if="$store.state.loggedIn"
      ref="createTeamModal"
      @team-created="onTeamCreated"
    />
  </BNavbar>
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
import toTimeAgo from "@/utils/time";
import { error, warn } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import CountryFlag from "vue3-country-flag-icon";
import Markdown from "vue3-markdown-it";

/**
 * @module Component:HeadNav
 *
 * @vue-data {Array} teams - List of teams the user owns.
 * @vue-data {Array} choreos - List of choreographies associated with the user.
 * @vue-data {Array} clubs - List of clubs the user owns.
 * @vue-data {Object} user=null - The currently logged-in user object.
 * @vue-data {Boolean} shareable=false - Whether the current page can be shared using the Web Share API.
 * @vue-data {Array} flags - List of available languages with their flags and local names.
 * @vue-data {Object} currentProfilePictureBlob=null - Blob URL for the user's profile picture.
 * @vue-data {Object} loadInterval=null
 * @vue-data {Object} loadNotificationsInterval=null
 * @vue-data {Array} notifications
 * @vue-data {Boolean} showAllNotifications=false
 * @vue-data {Boolean} showNotificationsDropdown=false
 *
 * @vue-prop {Boolean} onlineStatus - Indicates if the server is online.
 * @vue-prop {String} [serverVersion=null] - The version of the server software.
 *
 * @vue-computed {Object} shareData - Data used for sharing the current page.
 *
 * @example <HeadNav :teams="teams" />
 */
export default {
  name: "HeadNav",
  components: {
    CreateChoreoModal,
    CreateClubModal,
    CreateTeamModal,
    Markdown,
    CountryFlag,
  },
  props: {
    onlineStatus: {
      type: Boolean,
    },
    serverVersion: {
      type: String,
      default: null,
    },
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
  computed: {
    shareData() {
      return {
        url: window.location.href,
        title: document.title,
        text: this.$t("nav.schau-dir-das-an"),
      };
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
  methods: {
    load() {
      if (this.$store.state.loggedIn) {
        AuthService.getUserInfo()
          .then((user) => {
            this.user = user;
            this.loadProfileImage();
          })
          .catch(() => {
            error(
              "Could not load user info",
              ERROR_CODES.USER_INFO_QUERY_FAILED
            );
          });

        if (this.$store.state.clubId) {
          ClubService.getById(this.$store.state.clubId)
            .then((club) => {
              this.teams = club?.Teams || [];
              this.choreos = this.teams
                .map((t) => t.SeasonTeams.map((st) => st.Choreos))
                .flat(Infinity);
            })
            .catch(() => {
              error(
                "Could not find club" + this.$store.state.clubId,
                ERROR_CODES.CLUB_QUERY_FAILED
              );
            });
        }

        ClubService.getAll()
          .then((clubList) => {
            this.clubs = clubList;
            const club = clubList[0];
            if (!club) return;
            if (!this.$store.state.clubId)
              this.$store.commit("setClubId", club.id);
            this.teams = club?.Teams || [];
            this.choreos = this.teams
              .map((t) => t.SeasonTeams.map((st) => st.Choreos))
              .flat(Infinity);
          })
          .catch(() => {
            error("Could not load clubs", ERROR_CODES.CLUB_QUERY_FAILED);
          });

        this.loadNotifications();
      }
    },
    loadNotifications() {
      if (this.$store.state.loggedIn)
        NotificationService.getAll()
          .then((notifications) => {
            this.notifications = notifications;
          })
          .catch(() => {
            error(
              "Could not load notifications",
              ERROR_CODES.NOTIFICATION_QUERY_FAILED
            );
          });
    },
    checkEmailConfirmation() {
      if (this.user?.email && !this.user?.emailConfirmed) {
        warn(
          "You logged into an account without email or without confirmed email address. Please add and confirm your email address to ensure that all features work properly."
        );
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
        params: { teamId: team.id, locale: this.$i18n.locale },
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
};
</script>

<style lang="scss" scoped>
.dropdown-submenu:hover:not(:has(div.collapse:hover)) {
  color: #16181b;
  background-color: #e9ecef;
}

.BDropdownText {
  font-weight: initial;
}
</style>

<style lang="scss">
.notification-card-text > p {
  margin: 0;
}
</style>
