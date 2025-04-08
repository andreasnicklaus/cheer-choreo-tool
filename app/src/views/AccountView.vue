<template>
  <b-container id="AccountView" class="w-75" data-view>
    <b-row align-v="center" align-h="between" class="mb-4">
      <b-col cols="auto">
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
      <b-col>
        <b-skeleton-wrapper :loading="loading">
          <template #loading>
            <b-skeleton width="35%" height="40px" class="mb-2"></b-skeleton>
            <b-skeleton width="85%" height="24px" class="mb-3"></b-skeleton>
            <b-skeleton width="50%" height="24px" />
            <b-skeleton width="50%" height="24px" />
          </template>
          <h1>{{ user?.username }}</h1>
          <p class="text-muted">
            {{ user?.email }}
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
          <b-row v-show="user" class="text-muted">
            <b-col cols="4"> {{ $t("accountView.erstellt-am") }}: </b-col>
            <b-col v-if="user" cols="8">
              {{ toTimeAgo(user?.createdAt) }}
            </b-col>
            <b-col cols="4">
              {{ $t("accountView.zuletzt-geaendert-am") }}:
            </b-col>
            <b-col v-if="user" cols="8">
              {{ toTimeAgo(user?.createdAt) }}
            </b-col>
          </b-row>
        </b-skeleton-wrapper>
      </b-col>
    </b-row>

    <b-tabs content-class="my-3" class="my-3" lazy>
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
            label-cols="4"
            label-cols-lg="2"
            :label="$t('accountView.profilbild')"
          >
            <b-row align-v="center">
              <b-col cols="auto">
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
              <b-col>
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
          </b-form-group>
          <b-form-group
            label-cols="4"
            label-cols-lg="2"
            :label="$t('username')"
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
            label-cols="4"
            label-cols-lg="2"
            label="E-Mail-Adresse:"
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
                    v-if="user?.email && !user?.emailConfirmed"
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
                v-if="user?.email && !user?.emailConfirmed"
              >
                <p>
                  {{ $t("account.email-confirmation-warning") }}
                </p>
                <b-button variant="link">{{
                  $t("account.link-nochmal-senden")
                }}</b-button>
              </b-alert>
            </b-skeleton-wrapper>
          </b-form-group>

          <b-row>
            <b-col>
              <b-button
                type="submit"
                variant="success"
                block
                :disabled="
                  !usernameIsValid ||
                  !emailIsValid ||
                  (username == user?.username &&
                    email == user?.email &&
                    !profilePictureDeletion &&
                    newProfilePicture == null)
                "
                >{{ $t("speichern") }}</b-button
              >
            </b-col>
            <b-col cols="auto">
              <b-button
                type="reset"
                variant="outline-secondary"
                :disabled="
                  username == user?.username &&
                  email == user?.email &&
                  !profilePictureDeletion &&
                  newProfilePicture == null
                "
                >{{ $t("zuruecksetzen") }}</b-button
              >
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab :title="$tc('verein', 2)">
        <b-tabs v-model="clubTabIndex" content-class="ml-3" vertical pills>
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
                label-cols="4"
                label-cols-lg="2"
                :label="$t('accountView.vereinslogo')"
              >
                <b-row align-v="center">
                  <b-col cols="auto">
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
                  <b-col>
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
              </b-form-group>
              <b-form-group
                label-cols="4"
                label-cols-lg="2"
                :label="$t('modals.create-club.vereinsname')"
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
                  <b-col cols="4"> {{ $t("accountView.erstellt-am") }}: </b-col>
                  <b-col cols="8">
                    {{ toTimeAgo(club?.createdAt) }}
                  </b-col>
                  <b-col cols="4">
                    {{ $t("accountView.zuletzt-geaendert-am") }}:
                  </b-col>
                  <b-col cols="8">
                    {{ toTimeAgo(club?.updatedAt) }}
                  </b-col>
                </b-row>
              </b-skeleton-wrapper>

              <b-row>
                <b-col>
                  <b-button
                    type="submit"
                    variant="success"
                    block
                    :disabled="
                      !clubNameIsValid ||
                      (clubName == club.name &&
                        !clubLogoDeletion &&
                        newClubLogo == null)
                    "
                    >{{ $t("speichern") }}</b-button
                  >
                </b-col>
                <b-col cols="auto">
                  <b-button
                    type="reset"
                    variant="outline-secondary"
                    :disabled="
                      clubName == club.name &&
                      !clubLogoDeletion &&
                      newClubLogo == null
                    "
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
                  ? this.$t('accountView.cant-delete-only-club')
                  : $store.state.clubId == club.id
                  ? this.$t('accountView.cant-delete-active-club')
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
      <b-tab :title="$t('account.settings')">
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
            label-cols="4"
            label-cols-lg="2"
            :label="$t('account.tracking-opt-out')"
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
            <b-col>
              <b-button
                type="submit"
                variant="success"
                block
                :disabled="tracking == Boolean($cookie.get('mtm_consent'))"
                >{{ $t("speichern") }}</b-button
              >
            </b-col>
            <b-col cols="auto">
              <b-button
                type="reset"
                variant="outline-secondary"
                :disabled="tracking == Boolean($cookie.get('mtm_consent'))"
                >{{ $t("zuruecksetzen") }}</b-button
              >
            </b-col>
          </b-row>
        </b-form>
      </b-tab>
      <b-tab>
        <template #title>
          <span class="text-danger">{{
            $t("accountView.gefahrenbereich")
          }}</span>
        </template>
        <b-form-group
          label-cols="4"
          label-cols-lg="2"
          :label="$t('account.reset-password')"
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
          label-cols="4"
          label-cols-lg="2"
          :label="$t('accountView.konto-loeschen')"
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

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

export default {
  components: {
    ChangePasswordModal,
    DeleteAccountModal,
    CreateClubModal,
    DeleteClubModal,
  },
  name: "AccountView",
  data: function () {
    return {
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
          user.emailConfirmed = true;
          this.user = user;
          this.loadUserSettings();
          this.loadProfileImage();
        })
        .catch(() => {
          this.$bvToast.toast(this.$t("accountView.unbekannter-fehler"), {
            variant: "danger",
            title: this.$t("accountView.das-hat-nicht-funktioniert"),
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
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

          this.$bvToast.toast(
            this.$t("accountView.deine-nutzerinformationen-wurden-gespeichert"),
            {
              variant: "success",
              title: this.$t("editView.gespeichert"),
              autoHideDelay: 3000,
              appendToast: true,
              solid: true,
            }
          );
        })
        .catch(() => {
          this.$bvToast.toast(this.$t("accountView.unbekannter-fehler"), {
            variant: "danger",
            title: this.$t("accountView.das-hat-nicht-funktioniert"),
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
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
          this.$bvToast.toast(
            this.$t(
              "accountView.deine-vereinsinformationen-wurden-gespeichert"
            ),
            {
              variant: "success",
              title: this.$t("editView.gespeichert"),
              autoHideDelay: 3000,
              appendToast: true,
              solid: true,
            }
          );
        })
        .catch(() => {
          this.$bvToast.toast(this.$t("accountView.unbekannter-fehler"), {
            variant: "danger",
            title: this.$t("accountView.das-hat-nicht-funktioniert"),
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
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
