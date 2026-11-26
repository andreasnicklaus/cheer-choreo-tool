<template>
  <BContainer id="aboutView" data-view class="mt-5 mb-5">
    <BRow class="mb-4">
      <BCol cols="12" lg="8">
        <h1 class="mb-2">{{ $t("aboutView.title") }}</h1>
      </BCol>
    </BRow>

    <BRow class="g-4">
      <BCol cols="12" lg="8">
        <BCard class="mb-4">
          <BCardTitle>{{ $t("aboutView.what-is-heading") }}</BCardTitle>
          <BCardText class="mb-0">{{ $t("aboutView.what-is-text") }}</BCardText>
          <hr class="my-4" />
          <BCardTitle>{{ $t("aboutView.who-for-heading") }}:</BCardTitle>
          <BCardText class="mb-0">{{ $t("aboutView.who-for-text") }}</BCardText>
        </BCard>

        <BCard class="mb-4">
          <BCardTitle>{{ $t("aboutView.updates-heading") }}</BCardTitle>
          <BCardText>{{ $t("aboutView.updates-text") }}</BCardText>
          <BButton
            variant="outline-secondary"
            size="sm"
            href="https://github.com/andreasnicklaus/cheer-choreo-tool#sparkles-version-history"
            target="_blank"
            rel="noopener"
          >
            GitHub changelog
          </BButton>
          <hr class="my-4" />
          <BCardTitle>{{ $t("aboutView.roadmap-heading") }}</BCardTitle>
          <BCardText>{{ $t("aboutView.roadmap-text") }}</BCardText>
          <BButton
            variant="outline-secondary"
            size="sm"
            href="https://github.com/users/andreasnicklaus/projects/2/views/1"
            target="_blank"
            rel="noopener"
          >
            {{ $t("aboutView.roadmap-link") }}
          </BButton>
        </BCard>

        <BCard class="mb-4">
          <BCardTitle>{{ $t("aboutView.contact-heading") }}</BCardTitle>
          <BCardText>{{ $t("aboutView.contact-text") }}</BCardText>
          <BButton
            variant="primary"
            size="sm"
            :to="{ name: 'Contact', params: { locale: $i18n.locale } }"
          >
            {{ $t("contact.contact-and-support") }}
          </BButton>
        </BCard>
      </BCol>

      <BCol cols="12" lg="4">
        <BCard class="mb-4 text-center">
          <BAvatar size="5rem" variant="primary" class="mb-3" text="AN" />
          <p class="text-muted small mb-1">{{ $t("aboutView.maintainer") }}</p>
          <p class="fs-4 fw-bold mb-3">Andreas Nicklaus</p>
          <BButtonGroup>
            <BButton
              href="https://www.instagram.com/choreoplaner/"
              target="_blank"
              rel="noopener"
              size="sm"
            >
              Instagram
            </BButton>
            <BButton
              variant="outline-secondary"
              href="https://github.com/andreasnicklaus/cheer-choreo-tool"
              target="_blank"
              rel="noopener"
              size="sm"
            >
              GitHub
            </BButton>
            <BButton
              variant="outline-secondary"
              href="https://www.linkedin.com/in/andreasnicklaus/"
              target="_blank"
              rel="noopener"
              size="sm"
            >
              LinkedIn
            </BButton>
          </BButtonGroup>
        </BCard>

        <BCard class="mb-4">
          <BCardTitle>{{ $t("aboutView.highlights-heading") }}</BCardTitle>
          <BListGroup flush class="mt-3">
            <BListGroupItem
              v-for="highlight in aboutHighlights"
              :key="highlight"
            >
              <IBiCheckCircleFill
                class="text-success me-2"
                aria-hidden="true"
              />
              {{ highlight }}
            </BListGroupItem>
          </BListGroup>

          <hr class="my-4" />

          <BCardTitle>{{ $t("aboutView.links-heading") }}</BCardTitle>
          <BListGroup flush class="mt-3">
            <BListGroupItem>
              <BLink
                href="https://github.com/andreasnicklaus/cheer-choreo-tool"
                target="_blank"
                rel="noopener"
              >
                {{ $t("aboutView.link-github") }}
              </BLink>
            </BListGroupItem>
            <BListGroupItem>
              <BLink
                href="https://github.com/andreasnicklaus/cheer-choreo-tool#sparkles-version-history"
                target="_blank"
                rel="noopener"
              >
                {{ $t("aboutView.link-changelog") }}
              </BLink>
            </BListGroupItem>
            <BListGroupItem>
              <BLink
                href="https://github.com/users/andreasnicklaus/projects/2/views/1"
                target="_blank"
                rel="noopener"
              >
                {{ $t("aboutView.link-roadmap") }}
              </BLink>
            </BListGroupItem>
          </BListGroup>
        </BCard>
      </BCol>
    </BRow>
  </BContainer>
</template>

<script lang="ts">
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { defineComponent } from "vue";

export default defineComponent({
  name: "AboutView",
  setup() {
    const { t } = useI18n();
    return { t };
  },
  computed: {
    aboutHighlights() {
      return [
        this.$t("aboutView.highlight-choreography"),
        this.$t("aboutView.highlight-formations"),
        this.$t("aboutView.highlight-video"),
        this.$t("aboutView.highlight-export"),
        this.$t("aboutView.highlight-api"),
      ];
    },
  },
  mounted() {
    useHead({
      title: computed(() => this.t("aboutView.title")),
      meta: [
        {
          name: "description",
          content: computed(() => this.t("meta.defaults.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => this.t("meta.defaults.description")),
        },
        {
          property: "og:description",
          content: computed(() => this.t("meta.defaults.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${this.t("aboutView.title")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${this.t("aboutView.title")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
      ],
    });
  },
});
</script>
