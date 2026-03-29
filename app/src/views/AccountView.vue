<template>
  <BContainer id="AccountView" data-view>
    <BRow align-v="center" align-h="between" class="mb-4">
      <BCol cols="12" md="auto" class="text-center">
        <BPlaceholderWrapper :loading="loading">
          <template #loading>
            <BPlaceholder type="avatar" height="120px" width="120px" animation="wave" />
          </template>
          <BAvatar
            variant="primary"
            size="120px"
            :src="currentProfilePictureBlob"
          />
        </BPlaceholderWrapper>
      </BCol>
      <BCol class="text-md-left">
        <BPlaceholderWrapper :loading="loading">
          <template #loading>
            <BPlaceholder width="35%" height="40px" class="mb-2" animation="wave"></BPlaceholder>
            <BPlaceholder width="85%" height="24px" class="mb-3" animation="wave"></BPlaceholder>
            <BPlaceholder width="50%" height="24px" animation="wave" />
            <BPlaceholder width="50%" height="24px" animation="wave" />
          </template>
          <h1>{{ user?.username }}</h1>
          <p class="text-muted">
            <span class="d-block d-md-inline me-2">
              {{ user?.email }}
            </span>
            <BBadge v-if="!user?.email" variant="secondary">
              {{ $t("accountView.no-email") }}
            </BBadge>
            <BBadge
              v-else-if="!user?.emailConfirmed"
              variant="danger"
              v-b-tooltip.hover="$t('accountView.check-email')"
              class="d-inline-flex align-items-center px-2"
            >
              <IBiExclamationTriangle class="me-2" font-scale="1.2" />
              {{ $t("accountView.nicht-bestaetigt") }}</BBadge
            >
            <BBadge
              v-else
              variant="success"
              v-b-tooltip.hover="$t('accountView.bereits-bestaetigt')"
              class="d-inline-flex align-items-center px-2"
            >
              <IBiCheckCircle class="me-2" font-scale="1.2" />
              {{ $t("accountView.bestaetigt") }}
            </BBadge>
          </p>
          <BRow v-show="user" class="text-muted text-start">
            <BCol cols="6" md="4"> {{ $t("accountView.erstellt-am") }}: </BCol>
            <BCol v-if="user" cols="6" md="8">
              {{ toTimeAgo(user?.createdAt) }}
            </BCol>
            <BCol cols="6" md="4">
              {{ $t("accountView.zuletzt-geaendert-am") }}:
            </BCol>
            <BCol v-if="user" cols="6" md="8">
              {{ toTimeAgo(user?.createdAt) }}
            </BCol>
          </BRow>
        </BPlaceholderWrapper>
      </BCol>
    </BRow>

    <BTabs
      content-class="my-3"
      class="my-3"
      lazy
      :small="$store.state.isMobile"
    >
      <BTab :title="$t('konto')">
        <BForm @submit.prevent="saveUserInfo" @reset.prevent="resetUserInfo">
          <BFormGroup
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('accountView.profilbild')"
            label-class="label-with-colon"
            :description="
              $t('accountView.lade-ein-bild-hoch-max-mb', [MAX_IMAGE_MB])
            "
          >
            <BRow align-v="center" align-h="around">
              <BCol cols="auto" class="text-center mb-2 mb-md-0">
                <BPlaceholderWrapper :loading="loading">
                  <template #loading>
                    <BPlaceholder type="avatar" width="80px" height="80px" animation="wave" />
                  </template>
                  <div id="profilePictureUpload" ref="profilePictureUploadRef">
                    <BOverlay
                      :show="profilePictureIsHovered"
                      rounded="circle"
                      variant="dark"
                    >
                      <BAvatar
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
                        <IBiCloudUpload variant="light" font-scale="2" />
                      </template>
                    </BOverlay>
                  </div>
                </BPlaceholderWrapper>
              </BCol>
              <BCol cols="12" md="9">
                <div class="d-grid">
                  <BButton
                    variant="outline-secondary"
                    :disabled="
                      profilePictureDeletion ||
                      (!newProfilePicture && !currentProfilePictureBlob)
                    "
                    @click="
                      newProfilePicture = null;
                      profilePictureDeletion = true;
                    "
                  >
                    <IBiX />
                    {{ $t("accountView.bild-entfernen") }}
                  </BButton>
                </div>
              </BCol>
            </BRow>
            <BAlert
              :show="!newProfilePictureIsValid"
              class="my-1"
              variant="danger"
            >
              {{ newProfilePictureError }}
            </BAlert>
          </BFormGroup>

          <BFormGroup
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('username')"
            label-class="label-with-colon"
            :state="loading || usernameIsValid"
            :invalid-feedback="usernameError"
            class="mb-2"
          >
            <BPlaceholderWrapper :loading="loading">
              <template #loading>
                <BPlaceholder type="input" animation="wave" />
              </template>
              <BFormInput
                v-model="username"
                :placeholder="$t('username')"
                :state="usernameIsValid"
              />
            </BPlaceholderWrapper>
          </BFormGroup>
          <BFormGroup
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('e-mail-adresse')"
            label-class="label-with-colon"
            :state="loading || emailIsValid"
            :invalid-feedback="emailError"
            class="mb-2"
          >
            <BPlaceholderWrapper :loading="loading">
              <template #loading>
                <BPlaceholder type="input" animation="wave" />
              </template>
              <BInputGroup>
                <BFormInput
                  v-model="email"
                  :placeholder="$t('e-mail-adresse')"
                  :state="emailIsValid"
                />
                <template #append>
                  <BInputGroupText
                    v-if="
                      user?.email &&
                      !user?.emailConfirmed &&
                      email == user?.email
                    "
                    v-b-tooltip.hover="$t('accountView.check-email')"
                  >
                    <IBiExclamationTriangleFill
                      variant="danger"
                      font-scale="1.2"
                    />
                  </BInputGroupText>
                  <BInputGroupText
                    v-else-if="
                      user?.email &&
                      user?.emailConfirmed &&
                      email == user?.email
                    "
                    v-b-tooltip.hover="$t('accountView.bereits-bestaetigt')"
                  >
                    <IBiCheckCircleFill variant="success" font-scale="1.2" />
                  </BInputGroupText>
                  <BInputGroupText
                    v-else-if="email && email != user?.email"
                    v-b-tooltip.hover="$t('accountView.save-new-email-info')"
                  >
                    <IBiExclamationTriangleFill
                      variant="warning"
                      font-scale="1.2"
                    />
                  </BInputGroupText>
                  <BInputGroupText
                    v-else-if="!user?.email"
                    v-b-tooltip.hover="$t('accountView.no-email-info')"
                  >
                    <IBiInfo font-scale="1.2" />
                  </BInputGroupText>
                </template>
              </BInputGroup>

              <BAlert
                show
                variant="warning"
                v-if="
                  user?.email && !user?.emailConfirmed && email == user?.email
                "
              >
                <p>
                  {{ $t("account.email-confirmation-warning") }}
                </p>
                <BButton variant="link" @click="resendEmailConfirmationLink">{{
                  $t("account.link-nochmal-senden")
                }}</BButton>
              </BAlert>
            </BPlaceholderWrapper>
          </BFormGroup>

          <BRow>
            <BCol class="mb-2 mb-md-0">
              <div class="d-grid">
                <BButton
                  type="submit"
                  variant="success"
                  :disabled="
                    !usernameIsValid ||
                    !emailIsValid ||
                    !newProfilePictureIsValid ||
                    (username == user?.username &&
                      email == user?.email &&
                      !profilePictureDeletion &&
                      newProfilePicture == null)
                  "
                  >{{ $t("speichern") }}</BButton
                >
              </div>
            </BCol>
            <BCol cols="12" md="auto">
              <div class="d-grid">
                <BButton
                  type="reset"
                  variant="outline-secondary"
                  :disabled="
                    username == user?.username &&
                    email == user?.email &&
                    !profilePictureDeletion &&
                    newProfilePicture == null
                  "
                  >{{ $t("zuruecksetzen") }}</BButton
                >
              </div>
            </BCol>
          </BRow>
        </BForm>
      </BTab>
      <BTab :title="$t('verein', 2)">
        <BTabs
          :index="clubTabIndex"
          @update:index="updateClubTabIndex"
          content-class="mt-3 mt-md-0 flex-grow-1"
          :vertical="!$store.state.isMobile"
          :small="$store.state.isMobile"
          justified
          nav-item-class="text-start"
          pills
        >
          <BTab v-for="club in user?.Clubs" :key="club.id" :title="club.name">
            <template #title>
              {{ club.name }}
              <IBiCheckCircleFill
                v-if="$store.state.clubId == club.id"
                :class="{
                  'text-success': club.id != currentClub?.id,
                  'ms-1': true,
                }"
                v-b-tooltip.hover="$t('start.aktiver-verein')"
              />
            </template>
            <BForm @submit.prevent="onClubSave" @reset.prevent="onClubReset">
              <BFormGroup
                label-cols="12"
                label-cols-md="4"
                label-cols-lg="2"
                :label="$t('accountView.vereinslogo')"
                label-class="label-with-colon"
                :description="
                  $t('accountView.lade-ein-bild-hoch-max-mb', [MAX_IMAGE_MB])
                "
                class="mb-2"
              >
                <BRow align-v="center" align-h="around">
                  <BCol cols="auto" class="text-center mb-2 mb-md-0">
                    <div id="clubLogoUpload" ref="clubLogoUploadRef">
                      <BOverlay
                        :show="clubLogoIsHovered"
                        rounded="circle"
                        variant="dark"
                      >
                        <BAvatar
                          variant="primary"
                          size="80px"
                          :src="
                            clubLogoDeletion
                              ? null
                              : newClubLogoBlob || currentClubLogoBlob
                          "
                        >
                          <IBiHouseFill
                            v-if="
                              !clubLogoDeletion &&
                              !(newClubLogoBlob || currentClubLogoBlob)
                            "
                            font-scale="1.5"
                          />
                        </BAvatar>
                        <template #overlay>
                          <input
                            :style="{ width: '80px', height: '80px' }"
                            type="file"
                            @change="() => submitClubLogo(club.id)"
                            accept="image/*"
                            class="input-file"
                            :ref="`clubLogoFile-${club.id}`"
                          />
                          <IBiCloudUpload variant="light" font-scale="2" />
                        </template>
                      </BOverlay>
                    </div>
                  </BCol>
                  <BCol cols="12" md="8">
                    <div class="d-grid">
                      <BButton
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
                        <IBiX />
                        {{ $t("accountView.bild-entfernen") }}
                      </BButton>
                    </div>
                  </BCol>
                </BRow>
                <BAlert
                  :show="!newClubLogoIsValid"
                  variant="danger"
                  class="my-1"
                >
                  {{ newClubLogoError }}
                </BAlert>
              </BFormGroup>
              <BFormGroup
                label-cols="12"
                label-cols-md="4"
                label-cols-lg="2"
                :label="$t('modals.create-club.vereinsname')"
                label-class="label-with-colon"
                :state="loading || clubNameIsValid"
                :invalid-feedback="clubNameError"
                class="mb-2"
              >
                <BFormInput
                  v-model="clubName"
                  :placeholder="$t('name')"
                  :state="clubNameIsValid"
                />
              </BFormGroup>

              <BPlaceholderWrapper :loading="loading">
                <template #loading>
                  <BPlaceholder animation="wave" />
                  <BPlaceholder animation="wave" />
                </template>
                <BRow class="text-muted mb-4">
                  <BCol cols="6" md="4">
                    {{ $t("accountView.erstellt-am") }}:
                  </BCol>
                  <BCol cols="6" md="8">
                    {{ toTimeAgo(club?.createdAt) }}
                  </BCol>
                  <BCol cols="6" md="4">
                    {{ $t("accountView.zuletzt-geaendert-am") }}:
                  </BCol>
                  <BCol cols="6" md="8">
                    {{ toTimeAgo(club?.updatedAt) }}
                  </BCol>
                </BRow>
              </BPlaceholderWrapper>

              <BRow>
                <BCol class="mb-2 mb-md-0">
                  <div class="d-grid">
                    <BButton
                      type="submit"
                      variant="success"
                      :disabled="
                        !clubNameIsValid ||
                        !newClubLogoIsValid ||
                        (clubName == club.name &&
                          !clubLogoDeletion &&
                          newClubLogo == null)
                      "
                      >{{ $t("speichern") }}</BButton
                    >
                  </div>
                </BCol>
                <BCol cols="12" md="auto">
                  <BButton
                    type="reset"
                    variant="outline-secondary"
                    :disabled="
                      clubName == club.name &&
                      !clubLogoDeletion &&
                      newClubLogo == null
                    "
                    >{{ $t("zuruecksetzen") }}</BButton
                  >
                </BCol>
              </BRow>

              <div class="d-grid">
                <BButton
                  variant="outline-primary"
                  class="mt-2"
                  :disabled="$store.state.clubId == club.id"
                  @click="selectCurrentClub(club.id)"
                >
                  <IBiCheck />
                  {{ $t("accountView.als-aktiven-verein-auswaehlen") }}
                </BButton>
              </div>
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
            </BForm>

            <span
              v-b-tooltip.hover="
                user?.Clubs.length <= 1
                  ? $t('accountView.cant-delete-only-club')
                  : $store.state.clubId == club.id
                    ? $t('accountView.cant-delete-active-club')
                    : false
              "
              class="d-grid"
            >
              <BButton
                variant="outline-danger"
                :disabled="
                  user?.Clubs.length <= 1 || $store.state.clubId == club.id
                "
                class="mt-2"
                @click="
                  () =>
                    currentClub && $refs.deleteClubModal.open(currentClub.id)
                "
              >
                <IBiExclamationTriangleFill />
                {{ $t("accountView.verein-loeschen") }}
              </BButton>
            </span>
          </BTab>
          <template #tabs-end>
            <hr />
            <BPlaceholder v-if="loading" type="input" animation="wave" />

            <BButton
              variant="link"
              class="text-success text-start"
              @click="() => $refs.createClubModal.open()"
            >
              <IBiPlus /> {{ $t("modals.create-club.neuer-verein") }}
            </BButton>
          </template>
        </BTabs>
      </BTab>
      <BTab>
        <template #title>
          {{ $t("account.settings") }}
          <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
        </template>
        <BForm @submit.prevent="saveSettings" @reset.prevent="resetSettings">
          <BFormGroup
            label-cols="12"
            label-cols-md="4"
            label-cols-lg="2"
            :label="$t('account.tracking-opt-out')"
            label-class="label-with-colon"
            :description="$t('account.tracking-info')"
            class="mb-2"
          >
            <BFormCheckbox id="tracking" class="py-1" switch v-model="tracking">
              {{ $t("account.tracking-description") }}
            </BFormCheckbox>
          </BFormGroup>

          <BAlert :show="tracking" variant="warning" v-if="tracking">
            <h4 class="alert-heading">{{ $t("account.achtung") }}</h4>
            <p>
              {{ $t("account.tracking-warning") }}
            </p>
            <BButton variant="success" @click="tracking = false">
              <IBiArrowCounterclockwise class="me-2" />
              {{ $t("account.rueckgaengig-machen") }}
            </BButton>
          </BAlert>

          <BRow>
            <BCol class="mb-2 mb-md-0">
              <div class="d-grid">
                <BButton
                  type="submit"
                  variant="success"
                  :disabled="tracking == trackingConsent"
                  >{{ $t("speichern") }}</BButton
                >
              </div>
            </BCol>
            <BCol cols="12" md="auto">
              <div class="d-grid">
                <BButton
                  type="reset"
                  variant="outline-secondary"
                  :disabled="tracking == trackingConsent"
                  >{{ $t("zuruecksetzen") }}</BButton
                >
              </div>
            </BCol>
          </BRow>
        </BForm>
      </BTab>
      <BTab>
        <template #title>
          <span class="text-danger me-1">{{
            $t("accountView.gefahrenbereich")
          }}</span>
          <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
        </template>
        <BFormGroup
          label-cols="12"
          label-cols-md="4"
          label-cols-lg="2"
          :label="$t('accountView.passwort-aendern')"
          label-class="label-with-colon"
          :description="$t('account.reset-password-description')"
          class="mb-2"
        >
          <BButton
            variant="warning"
            @click="() => $refs.changePasswordModal.open()"
            class="d-block"
          >
            <IBiKey />
            {{ $t("accountView.passwort-aendern") }}
          </BButton>
        </BFormGroup>
        <BFormGroup
          label-cols="12"
          label-cols-md="4"
          label-cols-lg="2"
          :label="$t('accountView.konto-loeschen')"
          label-class="label-with-colon"
          :description="$t('accountView.konto-loeschen-descriptions')"
        >
          <BButton
            variant="danger"
            @click="() => $refs.deleteAccountModal.open()"
            class="d-block"
          >
            <IBiTrash />
            {{ $t("accountView.konto-loeschen") }}
          </BButton>
        </BFormGroup>
      </BTab>
    </BTabs>

    <CreateClubModal ref="createClubModal" @clubCreated="init" />
    <DeleteClubModal ref="deleteClubModal" @clubDeleted="init" />

    <ChangePasswordModal ref="changePasswordModal" />

    <DeleteAccountModal ref="deleteAccountModal" />
  </BContainer>
</template>

<script>
import Cookies from "js-cookie";
import { useElementHover } from "@vueuse/core";

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
import { useHead } from "@unhead/vue";
import { useI18n } from "vue-i18n";
import { emailRegex } from "@/utils/validation";

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
 * @vue-data {Boolean} profilePictureDeletion=false - Whether the profile picture is marked for deletion.
 * @vue-data {Boolean} clubLogoDeletion=false - Whether the club logo is marked for deletion.
 * @vue-data {Number} clubTabIndex=0 - The index of the currently selected club tab.
 * @vue-data {Ref|null} profilePictureElement=null - Template ref for profile picture upload.
 * @vue-data {Ref|null} clubLogoElement=null - Template ref for club logo upload.
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
  name: "AccountView",
  components: {
    ChangePasswordModal,
    DeleteAccountModal,
    CreateClubModal,
    DeleteClubModal,
    NewVersionBadge,
  },
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
      tracking: Boolean(Cookies.get("mtm_consent")),
      profilePictureDeletion: false,
      clubLogoDeletion: false,
      clubTabIndex: 0,
      profilePictureElement: null,
      clubLogoElement: null,
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  mounted() {
    this.profilePictureElement = this.$refs.profilePictureUploadRef;
    this.clubLogoElement = this.$refs.clubLogoUploadRef;

    if (this.profilePictureElement) {
      const profilePictureIsHovered = useElementHover(
        this.profilePictureElement
      );
      this.$root.profilePictureIsHovered = profilePictureIsHovered;
    }
    if (this.clubLogoElement) {
      const clubLogoIsHovered = useElementHover(this.clubLogoElement);
      this.$root.clubLogoIsHovered = clubLogoIsHovered;
    }

    useHead({
      title: `${this.t("konto")} - ${this.t("general.ChoreoPlaner")} | ${this.t("meta.defaults.title")}`,
      titleTemplate: null,
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.t("meta.account.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.t("meta.account.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.t("meta.account.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.t("konto")} - ${this.t("general.ChoreoPlaner")} | ${this.t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.t("konto")} - ${this.t("general.ChoreoPlaner")} | ${this.t("meta.defaults.title")}`,
        },
      ],
    });

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
        Cookies.remove("mtm_consent");
      } else {
        window._paq.push(["rememberConsentGiven"]);
      }
      MessagingService.showSuccess(
        this.$t("accountView.settings-saved"),
        this.$t("editView.gespeichert")
      );
    },
    resetSettings() {
      this.tracking = Boolean(Cookies.get("mtm_consent"));
    },
    submitProfilePicture() {
      this.newProfilePicture = this.$refs.profilePictureFile.files[0];
      this.profilePictureDeletion = false;
    },
    submitClubLogo(clubId) {
      this.newClubLogo = this.$refs[`clubLogoFile-${clubId}`][0].files[0];
      this.clubLogoDeletion = false;
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
    onClubReset() {
      this.resetClubInfo();
    },
    onClubSave() {
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
    updateClubTabIndex(index) {
      this.clubTabIndex = index;
    },
  },
  watch: {
    clubTabIndex() {
      this.resetClubInfo();
    },
  },
  computed: {
    trackingConsent() {
      return Boolean(Cookies.get("mtm_consent"));
    },
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
