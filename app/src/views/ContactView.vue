<template>
  <BContainer
    id="ContactView"
    data-view
    style="display: grid; place-items: center"
  >
    <BRow align-h="center">
      <BCol cols="6" class="text-center mb-4">
        <h1 class="font-weight-bold">{{ $t("contact.got-questions") }}</h1>
        <p class="text-muted">
          {{ $t("contact.you-can-reach-us-at") }}
          <a href="mailto:info@choreo-planer.de">{{
            $t("general.contact-email")
          }}</a
          >. {{ $t("contact.well-get-back-to-you") }}
        </p>
      </BCol>
      <BCol cols="12">
        <BRow class="row-cols-1 row-cols-md-3 g-4">
          <BCol v-show="showContactCallout">
            <BCard
              footer-bg-variant="transparent"
              footer-border-variant="white"
              class="h-100"
            >
              <BCardTitle>
                <IBiChatRightText />
                {{ $t("contact.send-a-message") }}
              </BCardTitle>
              <BCardText class="text-muted">
                {{ $t("contact.fill-out-our-contact-form") }}
              </BCardText>
              <template #footer>
                <div class="d-grid">
                  <BButton pill variant="primary" @click="openContactForm">{{
                    $t("contact.send-a-message")
                  }}</BButton>
                </div>
              </template>
            </BCard>
          </BCol>
          <BCol v-show="showEmailCallout">
            <BCard
              footer-bg-variant="transparent"
              footer-border-variant="white"
              class="h-100"
            >
              <BCardTitle>
                <IBiEnvelope />
                {{ $t("contact.write-an-email") }}
              </BCardTitle>
              <BCardSubtitle class="my-4">
                {{ $t("contact.compose-an-email-to-our-support-team") }}
              </BCardSubtitle>
              <template #footer>
                <div class="d-grid">
                  <BButton
                    pill
                    variant="primary"
                    href="mailto:info@choreo-planer.de"
                    >{{ $t("contact.send-an-email") }}</BButton
                  >
                </div>
              </template>
            </BCard>
          </BCol>
          <BCol>
            <BCard
              footer-bg-variant="transparent"
              footer-border-variant="white"
              class="h-100"
            >
              <BCardTitle>
                <IBiBook />
                {{ $t("contact.documentation-and-faq") }}
              </BCardTitle>
              <BCardSubtitle class="my-4">
                {{ $t("contact.learn-about-the-choreo-planer") }}
              </BCardSubtitle>
              <template #footer>
                <div class="d-grid">
                  <BButton
                    pill
                    variant="primary"
                    :to="{
                      name: 'Help',
                      params: { locale: $i18n.locale },
                    }"
                    >{{ $t("contact.help-and-quick-fixes") }}</BButton
                  >
                </div>
              </template>
            </BCard>
          </BCol>
        </BRow>
      </BCol>
      <BCol v-show="showLoginSuggestion">
        <p class="text-muted text-center mt-4">
          {{ $t("contact.looking-for-a-contact-form") }}
          <router-link
            :to="{ name: 'Login', params: { locale: $i18n.locale } }"
            >{{ $t("anmelden") }}</router-link
          >
          {{ $t("contact.to-write-a-direct-message-to-the-developer-team") }}
        </p>
      </BCol>
    </BRow>

    <ContactModal ref="contactModal" />
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed, getCurrentInstance } from "vue";
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

    const { proxy } = getCurrentInstance();

    useHead({
      title: computed(() => proxy.$t("contact.help-and-support")),
      meta: [
        {
          name: "description",
          content: computed(() => proxy.$t("meta.contact.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => proxy.$t("meta.contact.description")),
        },
        {
          property: "og:description",
          content: computed(() => proxy.$t("meta.contact.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${proxy.$t("contact.contact")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${proxy.$t("contact.contact")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
      ],
    });
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
};
</script>

<style lang="scss" scoped></style>
