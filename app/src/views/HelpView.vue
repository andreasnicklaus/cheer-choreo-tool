<template>
  <b-container id="helpView" data-view>
    <b-card
      :title="$t('HelpView.hilfe-bekommen')"
      border-variant="light"
      title-tag="h1"
    >
      <b-input
        type="text"
        :placeholder="$t('suchen')"
        class="mb-2"
        v-model="searchTerm"
      />
      <b-card
        v-for="(category, catId) in filteredFaqCategories"
        :key="category.name + category.order"
        border-variant="light"
      >
        <h5 class="ml-1 text-muted">{{ category.name }}</h5>
        <b-card
          no-body
          v-for="(faq, faqId) in category.faqs"
          :key="faq.title"
          border-variant="light"
        >
          <b-card-header class="p-1 border-0" role="tab">
            <b-button
              block
              v-b-toggle="`accordion-${catId}-${faqId}`"
              variant="outline-primary"
              class="text-left"
            >
              {{ faq.title }}
            </b-button>
          </b-card-header>
          <b-collapse
            :id="`accordion-${catId}-${faqId}`"
            :accordion="`faq-accordion-${catId}`"
            role="tabpanel"
            :ref="`accordion-${catId}-${faqId}`"
          >
            <b-card-body class="px-3 pb-0 pt-2">
              <b-card-text>
                <vue-markdown :breaks="false" class="mb-0">
                  {{ faq.markdown.replace(/  +/g, " ") }}
                </vue-markdown>
              </b-card-text>
            </b-card-body>
          </b-collapse>
        </b-card>
      </b-card>

      <p class="text-muted" v-if="filteredFaqCategories.length == 0">
        {{
          $t("HelpView.fuer-deine-suche-gibt-es-keine-ergebnisse", {
            searchTerm,
          })
        }}
      </p>

      <p>
        {{ $t("HelpView.nicht-die-richtige-antwort-dabei") }}
        <a href="mailto:info@choreo-planer.de">info@choreo-planer.de</a>
        {{ $t("HelpView.oder-auf-instagram") }}
        <a href="https://www.instagram.com/choreoplaner/" target="_blank"
          >@choreoplaner</a
        >
        {{ $t("HelpView.und-beschreibe-dein-problem") }}
      </p>
    </b-card>

    <script type="application/ld+json">
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
    </script>
  </b-container>
</template>

<script>
import VueMarkdown from "vue-markdown-v2";

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
    VueMarkdown,
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
  metaInfo() {
    return {
      title: this.$t("general.help"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.helpView.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.helpView.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.helpView.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("general.help")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          property: "twitter:title",
          content: `${this.$t("general.help")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>
