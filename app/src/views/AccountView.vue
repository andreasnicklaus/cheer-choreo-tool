<template>
  <b-container id="AccountView" data-view>
    <b-row align-v="center" align-h="between" class="mb-4">
      <b-col cols="12" md="auto" class="text-center">
        <b-skeleton-wrapper :loading="loading">
          <template #loading>
            <b-skeleton type="avatar" height="120px" width="120px" />
          </template>
          <b-avatar
            variant="primary"
            size="120px"
            :src="currentProfilePictureBlob"
          />
        </b-skeleton-wrapper>
      </b-col>
      <b-col class="text-center text-md-left">
        <b-skeleton-wrapper :loading="loading">
          <template #loading>
            <b-skeleton width="35%" height="40px" class="mb-2"></b-skeleton>
            <b-skeleton width="85%" height="24px" class="mb-3"></b-skeleton>
            <b-skeleton width="50%" height="24px" />
            <b-skeleton width="50%" height="24px" />
          </template>
          <h1>{{ user?.username }}</h1>
          <p class="text-muted">
            <span class="d-block d-md-inline">
              {{ user?.email }}
            </span>
            <b-badge v-if="!user?.email" variant="secondary">
              {{ $t("accountView.no-email") }}
            </b-badge>
            <b-badge
              v-else-if="!user?.emailConfirmed"
              variant="danger"
              v-b-tooltip.hover
              :title="$t('accountView.check-email')"
              class="d-inline-flex align-items-center px-2"
            >
              <b-icon-exclamation-triangle class="mr-2" font-scale="1.2" />
              {{ $t("accountView.nicht-bestaetigt") }}</b-badge
            >
            <b-badge
              v-else
              variant="success"
              v-b-tooltip.hover
              :title="$t('accountView.bereits-bestaetigt')"
              class="d-inline-flex align-items-center px-2"
            >
              <b-icon-check-circle class="mr-2" font-scale="1.2" />
              {{ $t("accountView.bestaetigt") }}
            </b-badge>
          </p>
          <b-row v-show="user" class="text-muted text-left">
            <b-col cols="6" md="4">
              {{ $t("accountView.erstellt-am") }}:
            </b-col>
            <b-col v-if="user" cols="6" md="8">
              {{ toTimeAgo(user?.createdAt) }}
            </b-col>
            <b-col cols="6" md="4">
              {{ $t("accountView.zuletzt-geaendert-am") }}:
            </b-col>
            <b-col v-if="user" cols="6" md="8">
              {{ toTimeAgo(user?.createdAt) }}
            </b-col>
          </b-row>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>

    <b-tabs
      content-class="my-3"
      class="my-3"
      lazy
      :small="$store.state.isMobile"
    >
      <b-tab :title="$t('konto')">
        <b-form
          @submit="
            (event) => {
              event.preventDefault();
              this.saveUserInfo();
            }
          "
          @reset="
            (event) => {
              event.preventDefault();
              this.resetUserInfo();
            }
          "
        >
          <b-form-group
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('accountView.profilbild')"
            label-class="label-with-colon"
            :description="
              $t('accountView.lade-ein-bild-hoch-max-mb', [MAX_IMAGE_MB])
            "
          >
            <b-row align-v="center" align-h="around">
              <b-col cols="auto" class="text-center mb-2 mb-md-0">
                <b-skeleton-wrapper :loading="loading">
                  <template #loading>
                    <b-skeleton type="avatar" width="80px" height="80px" />
                  </template>
                  <div
                    id="profilePictureUpload"
                    v-b-hover="hoverProfilePicture"
                  >
                    <b-overlay
                      :show="profilePictureIsHovered"
                      rounded="circle"
                      variant="dark"
                    >
                      <b-avatar
                        variant="primary"
                        size="80px"
                        :src="
                          profilePictureDeletion
                            ? null
                            : newProfilePictureBlob || currentProfilePictureBlob
                        "
                      />
                      <template #overlay>
                        <input
                          :style="{ width: '80px', height: '80px' }"
                          type="file"
                          @change="submitProfilePicture"
                          accept="image/*"
                          class="input-file"
                          ref="profilePictureFile"
                        />
                        <b-icon-cloud-upload variant="light" font-scale="2" />
                      </template>
                    </b-overlay>
                  </div>
                </b-skeleton-wrapper>
              </b-col>
              <b-col cols="12" md="9">
                <b-button
                  variant="outline-secondary"
                  block
                  :disabled="
                    profilePictureDeletion ||
                    (!newProfilePicture && !currentProfilePictureBlob)
                  "
                  @click="
                    newProfilePicture = null;
                    profilePictureDeletion = true;
                  "
                >
                  <b-icon-x />
                  {{ $t("accountView.bild-entfernen") }}
                </b-button>
              </b-col>
            </b-row>
            <b-alert
              :show="!newProfilePictureIsValid"
              class="my-1"
              variant="danger"
            >
              {{ newProfilePictureError }}
            </b-alert>
          </b-form-group>

          <b-form-group
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('username')"
            label-class="label-with-colon"
            :state="loading || usernameIsValid"
            :invalid-feedback="usernameError"
          >
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-skeleton type="input" />
              </template>
              <b-form-input
                v-model="username"
                :placeholder="$t('username')"
                :state="usernameIsValid"
              />
            </b-skeleton-wrapper>
          </b-form-group>
          <b-form-group
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('e-mail-adresse')"
            label-class="label-with-colon"
            :state="loading || emailIsValid"
            :invalid-feedback="emailError"
          >
            <b-skeleton-wrapper :loading="loading">
              <template #loading>
                <b-skeleton type="input" />
              </template>
              <b-input-group>
                <b-form-input
                  v-model="email"
                  :placeholder="$t('e-mail-adresse')"
                  :state="emailIsValid"
                />
                <b-input-group-append>
                  <b-input-group-text
                    v-if="
                      user?.email &&
                      !user?.emailConfirmed &&
                      email == user?.email
                    "
                    v-b-tooltip.hover
                    :title="$t('accountView.check-email')"
                  >
                    <b-icon-exclamation-triangle-fill
                      variant="danger"
                      font-scale="1.2"
                    />
                  </b-input-group-text>
                  <b-input-group-text
                    v-else-if="
                      user?.email &&
                      user?.emailConfirmed &&
                      email == user?.email
                    "
                    v-b-tooltip.hover
                    :title="$t('accountView.bereits-bestaetigt')"
                  >
                    <b-icon-check-circle-fill
                      variant="success"
                      font-scale="1.2"
                    />
                  </b-input-group-text>
                  <b-input-group-text
                    v-else-if="email && email != user?.email"
                    v-b-tooltip.hover
                    :title="$t('accountView.save-new-email-info')"
                  >
                    <b-icon-exclamation-triangle-fill
                      variant="warning"
                      font-scale="1.2"
                    />
                  </b-input-group-text>
                  <b-input-group-text
                    v-else-if="!user?.email"
                    v-b-tooltip.hover
                    :title="$t('accountView.no-email-info')"
                  >
                    <b-icon-info font-scale="1.2" />
                  </b-input-group-text>
                </b-input-group-append>
              </b-input-group>

              <b-alert
                show
                variant="warning"
                v-if="
                  user?.email && !user?.emailConfirmed && email == user?.email
                "
              >
                <p>
                  {{ $t("account.email-confirmation-warning") }}
                </p>
                <b-button variant="link" @click="resendEmailConfirmationLink">{{
                  $t("account.link-nochmal-senden")
                }}</b-button>
              </b-alert>
            </b-skeleton-wrapper>
          </b-form-group>

          <b-row>
            <b-col class="mb-2 mb-md-0">
              <b-button
                type="submit"
                variant="success"
                block
                :disabled="
                  !usernameIsValid ||
                  !emailIsValid ||
                  !newProfilePictureIsValid ||
                  (username == user?.username &&
                    email == user?.email &&
                    !profilePictureDeletion &&
                    newProfilePicture == null)
                "
                >{{ $t("speichern") }}</b-button
              >
            </b-col>
            <b-col cols="12" md="auto">
              <b-button
                type="reset"
                variant="outline-secondary"
                :disabled="
                  username == user?.username &&
                  email == user?.email &&
                  !profilePictureDeletion &&
                  newProfilePicture == null
                "
                block
                >{{ $t("zuruecksetzen") }}</b-button
              >
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab :title="$tc('verein', 2)">
        <b-tabs
          v-model="clubTabIndex"
          content-class="ml-3 mt-3 mt-md-0"
          :vertical="!$store.state.isMobile"
          :small="$store.state.isMobile"
          pills
        >
          <b-tab v-for="club in user?.Clubs" :key="club.id" :title="club.name">
            <template #title>
              {{ club.name }}
              <b-icon-check-circle-fill
                v-if="$store.state.clubId == club.id"
                :class="{
                  'text-success': club.id != currentClub.id,
                }"
                v-b-tooltip.hover
                :title="$t('start.aktiver-verein')"
              />
            </template>
            <b-form @submit="onClubSave" @reset="onClubReset">
              <b-form-group
                label-cols="12"
                label-cols-md="4"
                label-cols-lg="2"
                :label="$t('accountView.vereinslogo')"
                label-class="label-with-colon"
                :description="
                  $t('accountView.lade-ein-bild-hoch-max-mb', [MAX_IMAGE_MB])
                "
              >
                <b-row align-v="center" align-h="around">
                  <b-col cols="auto" class="text-center mb-2 mb-md-0">
                    <div id="profilePictureUpload" v-b-hover="hoverClubLogo">
                      <b-overlay
                        :show="clubLogoIsHovered"
                        rounded="circle"
                        variant="dark"
                      >
                        <b-avatar
                          variant="primary"
                          size="80px"
                          :src="
                            clubLogoDeletion
                              ? null
                              : newClubLogoBlob || currentClubLogoBlob
                          "
                        >
                          <b-icon-house-fill
                            v-if="
                              !clubLogoDeletion &&
                              !(newClubLogoBlob || currentClubLogoBlob)
                            "
                            font-scale="1.5"
                          />
                        </b-avatar>
                        <template #overlay>
                          <input
                            :style="{ width: '80px', height: '80px' }"
                            type="file"
                            @change="() => submitClubLogo(club.id)"
                            accept="image/*"
                            class="input-file"
                            :ref="`clubLogoFile-${club.id}`"
                          />
                          <b-icon-cloud-upload variant="light" font-scale="2" />
                        </template>
                      </b-overlay>
                    </div>
                  </b-col>
                  <b-col cols="12" md="8">
                    <b-button
                      block
                      variant="outline-secondary"
                      :disabled="
                        clubLogoDeletion ||
                        (!newClubLogo && !currentClubLogoBlob)
                      "
                      @click="
                        newClubLogo = null;
                        clubLogoDeletion = true;
                      "
                    >
                      <b-icon-x />
                      {{ $t("accountView.bild-entfernen") }}
                    </b-button>
                  </b-col>
                </b-row>
                <b-alert
                  :show="!newClubLogoIsValid"
                  variant="danger"
                  class="my-1"
                >
                  {{ newClubLogoError }}
                </b-alert>
              </b-form-group>
              <b-form-group
                label-cols="12"
                label-cols-md="4"
                label-cols-lg="2"
                :label="$t('modals.create-club.vereinsname')"
                label-class="label-with-colon"
                :state="loading || clubNameIsValid"
                :invalid-feedback="clubNameError"
              >
                <b-form-input
                  v-model="clubName"
                  :placeholder="$t('name')"
                  :state="clubNameIsValid"
                />
              </b-form-group>

              <b-skeleton-wrapper :loading="loading">
                <template #loading>
                  <b-skeleton />
                  <b-skeleton />
                </template>
                <b-row class="text-muted mb-2">
                  <b-col cols="6" md="4">
                    {{ $t("accountView.erstellt-am") }}:
                  </b-col>
                  <b-col cols="6" md="8">
                    {{ toTimeAgo(club?.createdAt) }}
                  </b-col>
                  <b-col cols="6" md="4">
                    {{ $t("accountView.zuletzt-geaendert-am") }}:
                  </b-col>
                  <b-col cols="6" md="8">
                    {{ toTimeAgo(club?.updatedAt) }}
                  </b-col>
                </b-row>
              </b-skeleton-wrapper>

              <b-row>
                <b-col class="mb-2 mb-md-0">
                  <b-button
                    type="submit"
                    variant="success"
                    block
                    :disabled="
                      !clubNameIsValid ||
                      !newClubLogoIsValid ||
                      (clubName == club.name &&
                        !clubLogoDeletion &&
                        newClubLogo == null)
                    "
                    >{{ $t("speichern") }}</b-button
                  >
                </b-col>
                <b-col cols="12" md="auto">
                  <b-button
                    type="reset"
                    variant="outline-secondary"
                    :disabled="
                      clubName == club.name &&
                      !clubLogoDeletion &&
                      newClubLogo == null
                    "
                    block
                    >{{ $t("zuruecksetzen") }}</b-button
                  >
                </b-col>
              </b-row>

              <b-button
                block
                variant="outline-primary"
                class="mt-2"
                :disabled="$store.state.clubId == club.id"
                @click="selectCurrentClub(club.id)"
              >
                <b-icon-check />
                {{ $t("accountView.als-aktiven-verein-auswaehlen") }}
              </b-button>
              <p
                class="text-muted text-center"
                v-show="$store.state.clubId == club.id"
              >
                <small>
                  {{
                    $t(
                      "accountView.du-hast-diesen-verein-als-aktiven-verein-ausgewaehlt"
                    )
                  }}
                </small>
              </p>
            </b-form>

            <span
              v-b-tooltip.hover
              :title="
                user?.Clubs.length <= 1
                  ? $t('accountView.cant-delete-only-club')
                  : $store.state.clubId == club.id
                  ? $t('accountView.cant-delete-active-club')
                  : null
              "
            >
              <b-button
                variant="outline-danger"
                :disabled="
                  user?.Clubs.length <= 1 || $store.state.clubId == club.id
                "
                block
                class="mt-2"
                @click="() => $refs.deleteClubMOdal.open(currentClub.id)"
              >
                <b-icon-exclamation-triangle-fill />
                {{ $t("accountView.verein-loeschen") }}
              </b-button>
            </span>
          </b-tab>
          <template #tabs-end>
            <b-skeleton v-if="loading" type="input" />

            <b-button
              variant="link"
              class="text-success"
              @click="() => $refs.createClubModal.open()"
            >
              <b-icon-plus /> {{ $t("modals.create-club.neuer-verein") }}
            </b-button>
          </template>
        </b-tabs>
      </b-tab>
      <b-tab>
        <template #title>
          {{ $t("account.settings") }}
          <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
        </template>
        <b-form
          @submit="
            (event) => {
              event.preventDefault();
              this.saveSettings();
            }
          "
          @reset="
            (event) => {
              event.preventDefault();
              this.resetSettings();
            }
          "
        >
          <b-form-group
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('account.tracking-opt-out')"
            label-class="label-with-colon"
            :description="$t('account.tracking-info')"
          >
            <b-form-checkbox
              id="tracking"
              class="py-1"
              switch
              v-model="tracking"
            >
              {{ $t("account.tracking-description") }}
            </b-form-checkbox>
          </b-form-group>

          <b-alert :show="tracking" variant="warning" v-if="tracking">
            <h4 class="alert-heading">{{ $t("account.achtung") }}</h4>
            <p>
              {{ $t("account.tracking-warning") }}
            </p>
            <b-button variant="success" @click="tracking = false">
              <b-icon-arrow-counterclockwise class="mr-2" />
              {{ $t("account.rueckgaengig-machen") }}
            </b-button>
          </b-alert>

          <b-row>
            <b-col class="mb-2 mb-md-0">
              <b-button
                type="submit"
                variant="success"
                block
                :disabled="tracking == Boolean($cookie.get('mtm_consent'))"
                >{{ $t("speichern") }}</b-button
              >
            </b-col>
            <b-col cols="12" md="auto">
              <b-button
                type="reset"
                variant="outline-secondary"
                :disabled="tracking == Boolean($cookie.get('mtm_consent'))"
                block
                >{{ $t("zuruecksetzen") }}</b-button
              >
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab>
        <template #title>
          <span class="text-danger mr-1">{{
            $t("accountView.gefahrenbereich")
          }}</span>
          <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
        </template>
        <b-form-group
          label-cols="12"
          label-cols-md="4"
          label-cols-lg="2"
          :label="$t('accountView.passwort-aendern')"
          label-class="label-with-colon"
          :description="$t('account.reset-password-description')"
        >
          <b-button
            variant="warning"
            @click="() => $refs.changePasswordModal.open()"
          >
            <b-icon-key />
            {{ $t("accountView.passwort-aendern") }}
          </b-button>
        </b-form-group>
        <b-form-group
          label-cols="12"
          label-cols-md="4"
          label-cols-lg="2"
          :label="$t('accountView.konto-loeschen')"
          label-class="label-with-colon"
          :description="$t('accountView.konto-loeschen-descriptions')"
        >
          <b-button
            variant="danger"
            @click="() => $refs.deleteAccountModal.open()"
          >
            <b-icon-trash />
            {{ $t("accountView.konto-loeschen") }}
          </b-button>
        </b-form-group>
      </b-tab>
    </b-tabs>

    <CreateClubModal ref="createClubModal" @clubCreated="init" />
    <DeleteClubModal ref="deleteClubMOdal" @clubDeleted="init" />

    <ChangePasswordModal ref="changePasswordModal" />

    <DeleteAccountModal ref="deleteAccountModal" />
  </b-container>
</template>

<script>
import AuthService from "@/services/AuthService";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal.vue";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal.vue";
import DeleteClubModal from "@/components/modals/DeleteClubModal.vue";
import toTimeAgo from "@/utils/time";
import ClubService from "@/services/ClubService";
import CreateClubModal from "@/components/modals/CreateClubModal.vue";
import MessagingService from "@/services/MessagingService";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import { error, log } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;
const MB = 1_048_576;
const MAX_IMAGE_MB = 2;

/**
 * @vue-data {Number} MAX_IMAGE_MB=2 - Maximum size for profile and club images in MB.
 * @vue-data {Boolean} loading=true - Indicates if the view is loading.
 * @vue-data {Object} user=null - The user object containing user information.
 * @vue-data {string|null} newProfilePicture=null - The new profile picture file to be uploaded.
 * @vue-data {Blob|null} currentProfilePictureBlob=null - The current profile picture as a Blob.
 * @vue-data {string|null} username=null - The username of the user.
 * @vue-data {string|null} email=null - The email address of the user.
 * @vue-data {string|null} newClubLogo=null - The new club logo file to be uploaded.
 * @vue-data {Blob|null} currentClubLogoBlob=null - The current club logo as a Blob.
 * @vue-data {string|null} clubName=null - The name of the club.
 * @vue-data {Boolean} tracking=false - Indicates if tracking is enabled.
 * @vue-data {Boolean} profilePictureIsHovered=false - Whether the profile picture is hovered.
 * @vue-data {Boolean} clubLogoIsHovered=false - Whether the club logo is hovered.
 * @vue-data {Boolean} profilePictureDeletion=false - Whether the profile picture is marked for deletion.
 * @vue-data {Boolean} clubLogoDeletion=false - Whether the club logo is marked for deletion.
 * @vue-data {Number} clubTabIndex=0 - The index of the currently selected club tab.
 *
 * @vue-computed {Blob|null} newProfilePictureBlob - The new profile picture as a Blob.
 * @vue-computed {Object} currentClub - The currently selected club object.
 * @vue-computed {Blob|null} newClubLogoBlob - The new club logo as a Blob.
 * @vue-computed {Boolean} usernameIsValid - Whether the username is valid.
 * @vue-computed {string|null} usernameError - Error message for username validation.
 * @vue-computed {Boolean} emailIsValid - Whether the email is valid.
 * @vue-computed {string|null} emailError - Error message for email validation.
 * @vue-computed {Boolean} clubNameIsValid - Whether the club name is valid.
 * @vue-computed {string|null} clubNameError - Error message for club name validation.
 * @vue-computed {Boolean} newProfilePictureIsValid - Whether the new profile picture is valid.
 * @vue-computed {string|null} newProfilePictureError - Error message for new profile picture validation.
 * @vue-computed {Boolean} newClubLogoIsValid - Whether the new club logo is valid.
 * @vue-computed {string|null} newClubLogoError - Error message for new club logo validation.
 *
 * @vue-computed {MetaInfo} metaInfo
 */

export default {
  components: {
    ChangePasswordModal,
    DeleteAccountModal,
    CreateClubModal,
    DeleteClubModal,
    NewVersionBadge,
  },
  name: "AccountView",
  data: function () {
    return {
      MAX_IMAGE_MB,
      loading: true,
      user: null,
      newProfilePicture: null,
      currentProfilePictureBlob: null,
      username: null,
      email: null,
      newClubLogo: null,
      currentClubLogoBlob: null,
      clubName: null,
      tracking: Boolean(this.$cookie.get("mtm_consent")),
      profilePictureIsHovered: false,
      clubLogoIsHovered: false,
      profilePictureDeletion: false,
      clubLogoDeletion: false,
      clubTabIndex: 0,
    };
  },
  mounted() {
    this.loading = true;
    this.init().then(() => {
      this.loading = false;
      if (this.$store.state.clubId) {
        this.clubTabIndex = this.user.Clubs.indexOf(
          this.user.Clubs.find((club) => club.id == this.$store.state.clubId)
        );
      }
    });
  },
  methods: {
    toTimeAgo,
    init() {
      return AuthService.getUserInfo()
        .then((user) => {
          this.user = user;
          this.loadUserSettings();
          this.loadProfileImage();
        })
        .catch(() => {
          error("Cannot get user info", ERROR_CODES.USER_INFO_QUERY_FAILED);
          MessagingService.showError(
            this.$t("accountView.unbekannter-fehler"),
            this.$t("accountView.das-hat-nicht-funktioniert")
          );
        });
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
    loadClubLogo() {
      if (this.currentClub?.logoExtension == null)
        this.currentClubLogoBlob = null;
      else
        ClubService.getClubLogo(
          this.currentClub.id,
          this.currentClub.logoExtension
        ).then((response) => {
          this.currentClubLogoBlob = URL.createObjectURL(response.data);
        });
    },
    loadUserSettings() {
      this.resetUserInfo();
      this.resetClubInfo();
      this.resetSettings();
    },
    selectCurrentClub(id) {
      this.$store.commit("setClubId", id);
    },
    saveSettings() {
      if (!this.tracking) {
        window._paq.push(["forgetConsentGiven"]);
        this.$cookie.delete("mtm_consent");
      } else {
        window._paq.push(["rememberConsentGiven"]);
      }
      MessagingService.showSuccess(
        this.$t("accountView.settings-saved"),
        this.$t("editView.gespeichert")
      );
    },
    resetSettings() {
      this.tracking = Boolean(this.$cookie.get("mtm_consent"));
    },
    submitProfilePicture() {
      this.newProfilePicture = this.$refs.profilePictureFile.files[0];
      this.profilePictureDeletion = false;
    },
    submitClubLogo() {
      this.newClubLogo =
        this.$refs[`clubLogoFile-${this.currentClub.id}`][0].files[0];
      this.clubLogoDeletion = false;
    },
    hoverProfilePicture(isHovered) {
      this.profilePictureIsHovered = isHovered;
    },
    hoverClubLogo(isHovered) {
      this.clubLogoIsHovered = isHovered;
    },
    saveUserInfo() {
      const queries = [];
      if (this.profilePictureDeletion) {
        queries.push(AuthService.deleteProfilePicture());
      } else if (this.newProfilePicture)
        queries.push(AuthService.updateProfilePicture(this.newProfilePicture));

      queries.push(AuthService.updateUserInfo(this.username, this.email));

      Promise.all(queries)
        .then(() => {
          this.init();

          log("Your user information was saved!");
          MessagingService.showSuccess(
            this.$t("accountView.deine-nutzerinformationen-wurden-gespeichert"),
            this.$t("editView.gespeichert")
          );
        })
        .catch((e) => {
          error(e, ERROR_CODES.USER_UPDATE_FAILED);
          MessagingService.showError(
            this.$t("accountView.unbekannter-fehler"),
            this.$t("accountView.das-hat-nicht-funktioniert")
          );
        });
    },
    resetUserInfo() {
      this.newProfilePicture = null;
      this.profilePictureDeletion = false;
      this.username = this.user?.username;
      this.email = this.user?.email;
    },
    saveClubInfo() {
      const queries = [];
      if (this.clubLogoDeletion) {
        queries.push(ClubService.deleteClubLogo(this.currentClub.id));
      } else if (this.newClubLogo) {
        queries.push(
          ClubService.updateClubLogo(this.currentClub.id, this.newClubLogo)
        );
      }
      queries.push(
        ClubService.update(this.currentClub.id, {
          name: this.clubName,
        })
      );

      Promise.all(queries)
        .then(() => {
          this.init();

          log("Your club information was saved!");
          MessagingService.showSuccess(
            this.$t(
              "accountView.deine-vereinsinformationen-wurden-gespeichert"
            ),
            this.$t("editView.gespeichert")
          );
        })
        .catch((e) => {
          error(e, ERROR_CODES.CLUB_UPDATE_FAILED);
          MessagingService.showError(
            this.$t("accountView.unbekannter-fehler"),
            this.$t("accountView.das-hat-nicht-funktioniert")
          );
        });
    },
    resetClubInfo() {
      this.clubName = this.user?.Clubs[this.clubTabIndex]?.name;
      this.clubLogoDeletion = false;
      this.newClubLogo = null;
      this.loadClubLogo();
    },
    onClubReset(event) {
      event.preventDefault();
      this.resetClubInfo();
    },
    onClubSave(event) {
      event.preventDefault();
      this.saveClubInfo();
    },
    resendEmailConfirmationLink() {
      return AuthService.resendEmailConfirmationLink().then(() => {
        log("An email was sent with a link to confirm your email address.");
        MessagingService.showSuccess(
          this.$t(
            "accountView.die-e-mail-zur-bestaetigung-deiner-e-mail-adresse-wurde-erneut-verschickt-check-dein-postfach"
          ),
          this.$t("accountView.e-mail-versandt")
        );
      });
    },
  },
  watch: {
    clubTabIndex() {
      this.resetClubInfo();
    },
  },
  computed: {
    newProfilePictureBlob() {
      if (this.profilePictureDeletion) return null;
      return this.newProfilePicture
        ? URL.createObjectURL(this.newProfilePicture)
        : this.currentProfilePictureBlob;
    },
    currentClub() {
      return this.user?.Clubs[this.clubTabIndex];
    },
    newClubLogoBlob() {
      if (this.clubLogoDeletion) return null;
      return this.newClubLogo
        ? URL.createObjectURL(this.newClubLogo)
        : this.currentClubLogoBlob;
    },

    usernameIsValid() {
      return this.username != null && this.username.length >= 6;
    },
    usernameError() {
      if (this.username == null || this.username.length == 0)
        return this.$t("login.bitte-angeben");
      else if (this.username.length < 6)
        return this.$t("login.benutzername-mindestens-laenge");
      else return null;
    },

    emailIsValid() {
      return this.email != null && this.email.match(emailRegex)?.length > 0;
    },
    emailError() {
      if (this.email == null || this.email.length == 0)
        return this.$t("login.bitte-angeben");
      const emailRegexMatches = this.email.match(emailRegex);
      if (!emailRegexMatches || emailRegexMatches.length <= 0)
        return this.$t("login.echte-email");
      else return null;
    },

    clubNameIsValid() {
      return this.clubName != null && this.clubName.length >= 3;
    },
    clubNameError() {
      if (this.clubName == null || this.clubName.length == 0)
        return this.$t("login.bitte-angeben");
      else if (this.clubName.length < 3)
        return this.$t("modals.create-club.min-vereinsname-length");
      else return null;
    },
    newProfilePictureIsValid() {
      if (!this.newProfilePicture) return true;
      else {
        if (this.newProfilePicture.size > MAX_IMAGE_MB * MB) return false;
      }
      return true;
    },
    newProfilePictureError() {
      if (!this.newProfilePicture) return null;
      else {
        if (this.newProfilePicture.size > MAX_IMAGE_MB * MB)
          return this.$t(
            "accountView.es-ist-nicht-moeglich-bilder-hochzuladen-die-groesser-al-mb-gross-sind",
            [MAX_IMAGE_MB]
          );
      }
      return null;
    },
    newClubLogoIsValid() {
      if (!this.newClubLogo) return true;
      else {
        if (this.newClubLogo.size > MAX_IMAGE_MB * MB) return false;
      }
      return true;
    },
    newClubLogoError() {
      if (!this.newClubLogo) return null;
      else {
        if (this.newClubLogo.size > MAX_IMAGE_MB * MB)
          return this.$t(
            "accountView.es-ist-nicht-moeglich-bilder-hochzuladen-die-groesser-al-mb-gross-sind",
            [MAX_IMAGE_MB]
          );
      }
      return null;
    },
  },
  metaInfo() {
    return {
      title: this.$t("konto"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.account.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.account.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.account.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("konto")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("konto")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped>
.input-file {
  opacity: 0;
  cursor: pointer;
  border-radius: 999px;
  position: absolute;

  transform: translateX(-30%) translateY(-30%);
}

#profilePictureUpload:hover {
  cursor: pointer;
}
</style>
