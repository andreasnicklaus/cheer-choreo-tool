<template>
  <BContainer id="helpView" data-view>
    <BCard
      :title="$t('HelpView.hilfe-bekommen')"
      border-variant="light"
      title-tag="h1"
    >
      <BInput
        v-model="searchTerm"
        type="text"
        :placeholder="$t('suchen')"
        class="mb-4 mt-2"
      />
      <BCard
        v-for="(category, catId) in filteredFaqCategories"
        :key="category.name + category.order"
        border-variant="light"
      >
        <h5 class="ms-1">{{ category.name }}</h5>
        <BAccordion flush>
          <BAccordionItem
            v-for="(faq, faqId) in category.faqs"
            :id="`accordion-${catId}-${faqId}`"
            :key="`accordion-${catId}-${faqId}`"
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

      <p v-if="filteredFaqCategories.length == 0" class="text-muted">
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

<script lang="ts" setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useHead({
  title: computed(() => t("general.help")),
  meta: [
    {
      name: "description",
      content: computed(() => t("meta.helpView.description")),
    },
    {
      name: "twitter:description",
      content: computed(() => t("meta.helpView.description")),
    },
    {
      property: "og:description",
      content: computed(() => t("meta.helpView.description")),
    },
    {
      property: "og:title",
      content: computed(
        () =>
          `${t("general.help")} - ${t(
            "general.ChoreoPlaner"
          )} | ${t("meta.defaults.title")}`
      ),
    },
    {
      name: "twitter:title",
      content: computed(
        () =>
          `${t("general.help")} - ${t(
            "general.ChoreoPlaner"
          )} | ${t("meta.defaults.title")}`
      ),
    },
  ],
});
</script>

<script lang="ts">
import Markdown from "vue3-markdown-it";
import { defineComponent } from "vue";

/**
 * @vue-data {string} searchTerm - The search term entered by the user.
 *
 * @vue-computed {Array} faqCategories - An array of FAQ categories, each containing a name, order, and an array of FAQs.
 * @vue-computed {Array} filteredFaqCategories - An array of FAQ categories filtered by the search term.
 *
 * @vue-computed {MetaInfo} metaInfo
 */
export default defineComponent({
  name: "HelpView",
  components: {
    Markdown,
  },
  data: function () {
    return {
      searchTerm: null as string | null,
    };
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
          order: 6,
          faqs: [
            {
              title: this.$t("faq.probleme-melden.question"),
              markdown: this.$t("faq.probleme-melden.answer"),
            },
            {
              title: this.$t("faq.versehentlich-geloescht.question"),
              markdown: this.$t("faq.versehentlich-geloescht.answer"),
            },
            {
              title: this.$t("faq.video-export-langsam.question"),
              markdown: this.$t("faq.video-export-langsam.answer"),
            },
            {
              title: this.$t("faq.warum-offline.question"),
              markdown: this.$t("faq.warum-offline.answer"),
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
              title: this.$t("faq.anmeldung.question"),
              markdown: this.$t("faq.anmeldung.answer"),
            },
            {
              title: this.$t("faq.erste-choreo.question"),
              markdown: this.$t("faq.erste-choreo.answer"),
            },
            {
              title: this.$t("faq.app-installieren.question"),
              markdown: this.$t("faq.app-installieren.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.editor"),
          order: 3,
          faqs: [
            {
              title: this.$t("faq.aufstellung-bauen.question"),
              markdown: this.$t("faq.aufstellung-bauen.answer"),
            },
            {
              title: this.$t("faq.counts-und-achter.question"),
              markdown: this.$t("faq.counts-und-achter.answer"),
            },
            {
              title: this.$t("faq.choreo-abspielen.question"),
              markdown: this.$t("faq.choreo-abspielen.answer"),
            },
            {
              title: this.$t("faq.positionsvorschlaege.question"),
              markdown: this.$t("faq.positionsvorschlaege.answer"),
            },
            {
              title: this.$t("faq.laenge-und-matte.question"),
              markdown: this.$t("faq.laenge-und-matte.answer"),
            },
            {
              title: this.$t("faq.farbe-zuweisen.question"),
              markdown: this.$t("faq.farbe-zuweisen.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.countsheets"),
          order: 4,
          faqs: [
            {
              title: this.$t("faq.eintrag-anlegen.question"),
              markdown: this.$t("faq.eintrag-anlegen.answer"),
            },
            {
              title: this.$t("faq.countsheet-ansicht.question"),
              markdown: this.$t("faq.countsheet-ansicht.answer"),
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
              title: this.$t("faq.kader-verwalten.question"),
              markdown: this.$t("faq.kader-verwalten.answer"),
            },
            {
              title: this.$t("faq.teilnehmer-importieren.question"),
              markdown: this.$t("faq.teilnehmer-importieren.answer"),
            },
            {
              title: this.$t("faq.vereine-und-logo.question"),
              markdown: this.$t("faq.vereine-und-logo.answer"),
            },
            {
              title: this.$t("faq.zusammenarbeiten.question"),
              markdown: this.$t("faq.zusammenarbeiten.answer"),
            },
            {
              title: this.$t("faq.ki-nutzen.question"),
              markdown: this.$t("faq.ki-nutzen.answer"),
            },
          ],
        },
        {
          name: this.$t("faq.exportieren"),
          order: 5,
          faqs: [
            {
              title: this.$t("faq.countsheet-als-pdf.question"),
              markdown: this.$t("faq.countsheet-als-pdf.answer"),
            },
            {
              title: this.$t("faq.choreo-video.question"),
              markdown: this.$t("faq.choreo-video.answer"),
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
          faqs: fc.faqs.filter((f) => {
            const term = this.searchTerm!.toLowerCase();
            return (
              fc.name.toLowerCase().includes(term) ||
              f.title.toLowerCase().includes(term) ||
              f.markdown.toLowerCase().includes(term)
            );
          }),
        }))
        .filter((fc) => fc.faqs.length > 0);
    },
  },
});
</script>
