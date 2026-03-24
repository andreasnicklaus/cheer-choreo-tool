<template>
  <BContainer id="helpView" data-view>
    <BCard
      :title="$t('HelpView.hilfe-bekommen')"
      border-variant="light"
      title-tag="h1"
    >
      <BInput
        type="text"
        :placeholder="$t('suchen')"
        class="mb-2"
        v-model="searchTerm"
      />
      <BCard
        v-for="(category, catId) in filteredFaqCategories"
        :key="category.name + category.order"
        border-variant="light"
      >
        <h5 class="ms-1 text-muted">{{ category.name }}</h5>
        <BAccordion flush>
          <BAccordionItem
            v-for="(faq, faqId) in category.faqs"
            :key="`accordion-${catId}-${faqId}`"
            :id="`accordion-${catId}-${faqId}`"
            :title="faq.title"
          >
            <Markdown
              :source="faq.markdown.replace(/  +/g, ' ')"
              :breaks="false"
              class="mb-0"
              :html="true"
            />
          </BAccordionItem>
        </BAccordion>
      </BCard>

      <p class="text-muted" v-if="filteredFaqCategories.length == 0">
        {{
          $t("HelpView.fuer-deine-suche-gibt-es-keine-ergebnisse", {
            searchTerm,
          })
        }}
      </p>

      <p class="mt-4">
        {{ $t("HelpView.nicht-die-richtige-antwort-dabei") }}
        <a href="mailto:info@choreo-planer.de">info@choreo-planer.de</a>
        {{ $t("HelpView.oder-auf-instagram") }}
        <a href="https://www.instagram.com/choreoplaner/" target="_blank"
          >@choreoplaner</a
        >
        {{ $t("HelpView.und-beschreibe-dein-problem") }}
      </p>
      <I18n-t keypath="HelpView.documentation-text" tag="p">
        <a href="/docs/" target="_blank">{{ $t("HelpView.documentation") }}</a>
      </I18n-t>
    </BCard>

    <!-- <script type="application/ld+json">
      {{ {
            "@context": "https://schema.org/",
            "@type": "FAQPage",
            mainEntity: faqCategories.map((category) => category.faqs.map((item) => ({
              "@type": "Question",
              name: item.title,
              acceptedAnswer: {
                "@type": "Answer",
                text: item.markdown
                .replace(/\[(.*)\]\((.*)\)/g, '<a href="$2">$1</a>')
                .replace(/\n/g, "")
                .replace(/ +/g, " ")
                .replace(/\\/g, "")
                .replace(/\*\*(.*)\*\*/g, "<b>$1</b>"),
              }
            }))).flat(Infinity)
          }
        }}
    </script> -->
  </BContainer>
</template>

<script setup>
import { useHead } from "@unhead/vue";
import { computed, getCurrentInstance } from "vue";

const { proxy } = getCurrentInstance();

useHead({
  title: computed(() => proxy.$t("general.help")),
  meta: [
    {
      name: "description",
      content: computed(() => proxy.$t("meta.helpView.description")),
    },
    {
      name: "twitter:description",
      content: computed(() => proxy.$t("meta.helpView.description")),
    },
    {
      property: "og:description",
      content: computed(() => proxy.$t("meta.helpView.description")),
    },
    {
      property: "og:title",
      content: computed(
        () =>
          `${proxy.$t("general.help")} - ${proxy.$t(
            "general.ChoreoPlaner"
          )} | ${proxy.$t("meta.defaults.title")}`
      ),
    },
    {
      name: "twitter:title",
      content: computed(
        () =>
          `${proxy.$t("general.help")} - ${proxy.$t(
            "general.ChoreoPlaner"
          )} | ${proxy.$t("meta.defaults.title")}`
      ),
    },
  ],
});
</script>

<script>
import Markdown from "vue3-markdown-it";

/**
 * @vue-data {string} searchTerm - The search term entered by the user.
 *
 * @vue-computed {Array} faqCategories - An array of FAQ categories, each containing a name, order, and an array of FAQs.
 * @vue-computed {Array} filteredFaqCategories - An array of FAQ categories filtered by the search term.
 *
 * @vue-computed {MetaInfo} metaInfo
 */
export default {
  name: "HelpView",
  data: function () {
    return {
      searchTerm: null,
    };
  },
  components: {
    Markdown,
  },
  computed: {
    faqCategories() {
      return [
        {
          name: this.$t("navigation.datenschutz"),
          order: 999,
          faqs: [
            {
              title: this.$t("navigation.datenschutz"),
              markdown: this.$t("faq.datenschutz.answer"),
            },
            {
              title: this.$t("faq.weitergabe-an-dritte.question"),
              markdown: this.$t("faq.weitergabe-an-dritte.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.probleme-loesen"),
          order: 3,
          faqs: [
            {
              title: this.$t("faq.probleme-melden.question"),
              markdown: this.$t("faq.probleme-melden.answer"),
            },
            {
              title: this.$t("faq.versehentlich-geloescht.question"),
              markdown: this.$t("faq.versehentlich-geloescht.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.allgemeines"),
          order: 1,
          faqs: [
            {
              title: this.$t("faq.zielgruppe.question"),
              markdown: this.$t("faq.zielgruppe.answer"),
            },
            {
              title: this.$t("faq.was-ist-choreo-planer.question"),
              markdown: this.$t("faq.was-ist-choreo-planer.answer"),
            },
            {
              title: this.$t("faq.warum-offline.question"),
              markdown: this.$t("faq.warum-offline.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.funktionen-and-features"),
          order: 2,
          faqs: [
            {
              title: this.$t("faq.funktionen-wuenschen.question"),
              markdown: this.$t("faq.funktionen-wuenschen.answer"),
            },
            {
              title: this.$t("faq.wie-viele-teams.question"),
              markdown: this.$t("faq.wie-viele-teams.answer"),
            },
            {
              title: this.$t("faq.neue-season.question"),
              markdown: this.$t("faq.neue-season.answer"),
            },
            {
              title: this.$t("faq.zusammenarbeiten.question"),
              markdown: this.$t("faq.zusammenarbeiten.answer"),
            },
          ],
        },
      ].sort((a, b) => a.order - b.order);
    },
    filteredFaqCategories() {
      if (!this.searchTerm) return this.faqCategories;
      return this.faqCategories
        .map((fc) => ({
          ...fc,
          faqs: fc.faqs.filter(
            (f) =>
              fc.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              f.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
              f.markdown.toLowerCase().includes(this.searchTerm.toLowerCase())
          ),
        }))
        .filter((fc) => fc.faqs.length > 0);
    },
  },
};
</script>
