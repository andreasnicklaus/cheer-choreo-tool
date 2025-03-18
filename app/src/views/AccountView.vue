<template>
  <b-container id="AccountView" class="w-75" data-view>
    <b-row align-v="center" align-h="between">
      <b-col cols="auto">
        <b-avatar variant="primary" size="120px" />
      </b-col>
      <b-col>
        <editable-name-heading
          :name="''"
          :value="user?.username"
          @input="onNameEdit"
          :placeholder="`${$t('loading')}...`"
        />
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
            >{{ $t("accountView.nicht-bestaetigt") }}</b-badge
          >
          <b-badge
            v-else
            variant="success"
            v-b-tooltip.hover
            :title="$t('accountView.bereits-bestaetigt')"
            >{{ $t("accountView.bestaetigt") }}</b-badge
          >
        </p>
      </b-col>
    </b-row>
    <hr />
    <p class="text-muted m-0">
      {{ $t("accountView.erstellt-am") }}:
      {{ $d(new Date(user?.createdAt), "date") }},
      {{ $d(new Date(user?.createdAt), "time") }}
    </p>
    <p class="text-muted">
      {{ $t("accountView.zuletzt-geaendert-am") }}:
      {{ $d(new Date(user?.updatedAt), "date") }},
      {{ $d(new Date(user?.updatedAt), "time") }}
    </p>
    <b-row align-v="center" align-h="between" class="mt-3">
      <b-col cols="auto">
        <b-button-group>
          <b-button
            variant="warning"
            @click="() => $refs.changePasswordModal.open()"
          >
            <b-icon-key />
            {{ $t("accountView.passwort-aendern") }}
          </b-button>
          <b-button
            variant="danger"
            @click="() => $refs.deleteAccountModal.open()"
          >
            <b-icon-trash />
            {{ $t("accountView.konto-loeschen") }}
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>

    <ChangePasswordModal ref="changePasswordModal" />

    <DeleteAccountModal ref="deleteAccountModal" />
  </b-container>
</template>

<script>
import AuthService from "@/services/AuthService";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import ChangePasswordModal from "@/components/modals/ChangePasswordModal.vue";
import DeleteAccountModal from "@/components/modals/DeleteAccountModal.vue";

export default {
  components: { EditableNameHeading, ChangePasswordModal, DeleteAccountModal },
  name: "AccountView",
  data: () => ({
    user: null,
  }),
  mounted() {
    AuthService.getUserInfo()
      .then((user) => {
        this.user = user;
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
  methods: {
    onNameEdit(username) {
      AuthService.changeUsername(username)
        .then((user) => {
          this.user = user;
        })
        .catch(() => {
          this.$bvToast.toast(this.$t("accountView.nutzername-nicht-erlaubt"), {
            variant: "danger",
            title: this.$t("accountView.das-hat-nicht-funktioniert"),
            autoHideDelay: 3000,
            appendToast: true,
            solid: true,
          });
        });
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
