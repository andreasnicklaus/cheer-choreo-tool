<template>
  <b-container
    id="ContactView"
    data-view
    style="display: grid; place-items: center"
  >
    <b-row align-h="center">
      <b-col cols="6" class="text-center mb-4">
        <h1 class="font-weight-bold">{{ $t("contact.got-questions") }}</h1>
        <p class="text-muted">
          {{ $t("contact.you-can-reach-us-at") }}
          <a href="mailto:info@choreo-planer.de">{{
            $t("general.contact-email")
          }}</a
          >. {{ $t("contact.well-get-back-to-you") }}
        </p>
      </b-col>
      <b-col cols="12">
        <b-card-group deck>
          <b-card
            v-show="showContactCallout"
            footer-bg-variant="transparent"
            footer-border-variant="white"
          >
            <b-card-title>
              <b-icon-chat-right-text />
              {{ $t("contact.send-a-message") }}
            </b-card-title>
            <b-card-text class="text-muted">
              {{ $t("contact.fill-out-our-contact-form") }}
            </b-card-text>
            <template #footer>
              <b-button block pill variant="primary" @click="openContactForm">{{
                $t("contact.send-a-message")
              }}</b-button>
            </template>
          </b-card>
          <b-card
            v-show="showEmailCallout"
            footer-bg-variant="transparent"
            footer-border-variant="white"
          >
            <b-card-title>
              <b-icon-envelope />
              {{ $t("contact.write-an-email") }}
            </b-card-title>
            <b-card-sub-title class="my-4">
              {{ $t("contact.compose-an-email-to-our-support-team") }}
            </b-card-sub-title>
            <template #footer>
              <b-button
                block
                pill
                variant="primary"
                href="mailto:info@choreo-planer.de"
                >{{ $t("contact.send-an-email") }}</b-button
              >
            </template>
          </b-card>
          <b-card footer-bg-variant="transparent" footer-border-variant="white">
            <b-card-title>
              <b-icon-book />
              {{ $t("contact.documentation-and-faq") }}
            </b-card-title>
            <b-card-sub-title class="my-4">
              {{ $t("contact.learn-about-the-choreo-planer") }}
            </b-card-sub-title>
            <template #footer>
              <b-button
                block
                pill
                variant="primary"
                :to="{
                  name: 'Help',
                  params: { locale: $root.$i18n.locale },
                }"
                >{{ $t("contact.help-and-quick-fixes") }}</b-button
              >
            </template>
          </b-card>
        </b-card-group>
      </b-col>
      <b-col v-show="showLoginSuggestion">
        <p class="text-muted text-center mt-4">
          {{ $t("contact.looking-for-a-contact-form") }}
          <router-link
            :to="{ name: 'Login', params: { locale: $root.$i18n.locale } }"
            >{{ $t("anmelden") }}</router-link
          >
          {{ $t("contact.to-write-a-direct-message-to-the-developer-team") }}
        </p>
      </b-col>
    </b-row>

    <ContactModal ref="contactModal" />
  </b-container>
</template>

<script>
import FeatureFlagService from "@/services/FeatureFlagService";
import { FeatureFlagKeys } from "@/services/FeatureFlagService";

import ContactModal from "@/components/modals/ContactModal.vue";

/**
 *
 *
 * @vue-computed {MetaInfo} metaInfo
 */

export default {
  components: { ContactModal },
  name: "ContactView",
  data: function () {
    return {
      showContactCallout: true,
      showLoginSuggestion: false,
      showEmailCallout: true,
    };
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      Promise.all([
        FeatureFlagService.isEnabled(FeatureFlagKeys.CONTACT_FORM_WITH_LOGIN),
        FeatureFlagService.isEnabled(
          FeatureFlagKeys.CONTACT_FORM_WITHOUT_LOGIN
        ),
      ]).then(([contactWithLogin, contactWithoutLogin]) => {
        this.showContactCallout =
          contactWithoutLogin ||
          (this.$store.state.loggedIn && contactWithLogin);
        this.showLoginSuggestion =
          !contactWithoutLogin &&
          contactWithLogin &&
          !this.$store.state.loggedIn;
      });
    },
    openContactForm() {
      this.$refs.contactModal.open();
    },
  },
  watch: {},
  computed: {},
  metaInfo() {
    return {
      title: this.$t("contact.help-and-support"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.contact.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.contact.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.contact.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("contact.contact")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("contact.contact")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>

<style lang="scss" scoped></style>
