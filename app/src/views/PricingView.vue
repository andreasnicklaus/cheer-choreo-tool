<template>
  <BContainer id="pricingView" data-view class="mt-5 mb-5">
    <BRow class="mb-4 g-2">
      <BCol cols="12" lg="8">
        <h1 class="mb-2">{{ $t("pricingView.title") }}</h1>
        <p class="lead mb-0">{{ $t("pricingView.intro") }}</p>
        <BBadge variant="success" class="fs-5 mt-2">{{
          $t("pricingView.free-badge")
        }}</BBadge>
      </BCol>
      <BCol cols="12" lg="4" class="text-lg-end">
        <div class="d-flex gap-2 justify-content-lg-end flex-wrap">
          <BButton
            variant="primary"
            :to="{ name: 'Login', params: { locale: $i18n.locale } }"
            @click="trackRegisterClick"
          >
            {{ $t("pricingView.cta-register") }}
          </BButton>
          <BButton
            variant="outline-secondary"
            :to="{ name: 'Help', params: { locale: $i18n.locale } }"
          >
            {{ $t("pricingView.cta-help") }}
          </BButton>
        </div>
      </BCol>
    </BRow>

    <BAlert variant="success" show class="mb-2">
      {{ $t("pricingView.no-credit-card") }}
    </BAlert>

    <BRow class="g-4 mb-4">
      <BCol cols="12" md="6">
        <BCard class="h-100">
          <BCardTitle>{{ $t("pricingView.features-heading") }}</BCardTitle>
          <BListGroup flush class="mt-3">
            <BListGroupItem v-for="feature in pricingFeatures" :key="feature">
              <IBiCheckCircleFill
                class="text-success me-2"
                aria-hidden="true"
              />
              {{ feature }}
            </BListGroupItem>
          </BListGroup>
        </BCard>
      </BCol>
      <BCol cols="12" md="6">
        <BCard class="h-100">
          <BCardTitle>{{ $t("pricingView.why-free-heading") }}</BCardTitle>
          <BCardText>{{ $t("pricingView.why-free-text") }}</BCardText>
          <BCardTitle class="mt-4 h5">{{
            $t("pricingView.contact-heading")
          }}</BCardTitle>
          <BCardText class="mb-0">
            {{ $t("pricingView.contact-text") }}
            <a href="mailto:info@choreo-planer.de">info@choreo-planer.de</a>
          </BCardText>
        </BCard>
      </BCol>
    </BRow>

    <BCard class="mb-4">
      <BCardTitle>{{ $t("pricingView.faq-heading") }}</BCardTitle>
      <BAccordion flush class="mt-3">
        <BAccordionItem
          v-for="(faq, index) in pricingFaqs"
          :key="index"
          :title="faq.question"
        >
          <BCardText class="mb-0">{{ faq.answer }}</BCardText>
        </BAccordionItem>
      </BAccordion>
    </BCard>
  </BContainer>
</template>

<script lang="ts">
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { defineComponent } from "vue";

export default defineComponent({
  name: "PricingView",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data() {
    return {
      jsonld: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "Choreo Planer",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "EUR",
        },
      },
    };
  },
  computed: {
    pricingFeatures() {
      return [
        this.$t("pricingView.feature-choreos"),
        this.$t("pricingView.feature-teams"),
        this.$t("pricingView.feature-seasons"),
        this.$t("pricingView.feature-lineups"),
        this.$t("pricingView.feature-exports"),
        this.$t("pricingView.feature-api"),
        this.$t("pricingView.feature-export-content"),
      ];
    },
    pricingFaqs() {
      return [
        {
          question: this.$t("pricingView.faq-free-forever-q"),
          answer: this.$t("pricingView.faq-free-forever-a"),
        },
        {
          question: this.$t("pricingView.faq-data-export-q"),
          answer: this.$t("pricingView.faq-data-export-a"),
        },
        {
          question: this.$t("pricingView.faq-api-q"),
          answer: this.$t("pricingView.faq-api-a"),
        },
        {
          question: this.$t("pricingView.faq-support-q"),
          answer: this.$t("pricingView.faq-support-a"),
        },
      ];
    },
  },
  mounted() {
    useHead({
      title: computed(() => this.t("pricingView.title")),
      script: [
        {
          type: "application/ld+json" as "application/json",
          textContent: JSON.stringify(this.jsonld),
        },
      ],
      meta: [
        {
          name: "description",
          content: computed(() => this.t("meta.pricing.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => this.t("meta.pricing.description")),
        },
        {
          property: "og:description",
          content: computed(() => this.t("meta.pricing.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${this.t("pricingView.title")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${this.t("pricingView.title")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
      ],
    });
  },
  methods: {
    trackRegisterClick() {
      const paq = (window as any)?._paq;
      if (paq) paq.push(["trackEvent", "Pricing", "RegisterClick"]);
    },
  },
});
</script>
