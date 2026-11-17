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
  </BContainer>
</template>

<script lang="ts" setup>
import { useHead } from "@unhead/vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import Markdown from "vue3-markdown-it";

const { t } = useI18n();
const searchTerm = ref<string | null>(null);

interface FaqItem {
  title: string;
  markdown: string;
}

interface FaqCategory {
  name: string;
  order: number;
  faqs: FaqItem[];
}

const faqCategories = computed<FaqCategory[]>(() =>
  [
    {
      name: t("navigation.datenschutz"),
      order: 999,
      faqs: [
        {
          title: t("navigation.datenschutz"),
          markdown: t("faq.datenschutz.answer"),
        },
        {
          title: t("faq.weitergabe-an-dritte.question"),
          markdown: t("faq.weitergabe-an-dritte.answer"),
        },
        {
          title: t("faq.datenschutz-faq.question"),
          markdown: t("faq.datenschutz-faq.answer"),
        },
      ],
    },
    {
      name: t("faq.probleme-loesen"),
      order: 6,
      faqs: [
        {
          title: t("faq.probleme-melden.question"),
          markdown: t("faq.probleme-melden.answer"),
        },
        {
          title: t("faq.versehentlich-geloescht.question"),
          markdown: t("faq.versehentlich-geloescht.answer"),
        },
        {
          title: t("faq.video-export-langsam.question"),
          markdown: t("faq.video-export-langsam.answer"),
        },
        {
          title: t("faq.warum-offline.question"),
          markdown: t("faq.warum-offline.answer"),
        },
        {
          title: t("faq.browser-geraete.question"),
          markdown: t("faq.browser-geraete.answer"),
        },
        {
          title: t("faq.offline-nutzung.question"),
          markdown: t("faq.offline-nutzung.answer"),
        },
      ],
    },
    {
      name: t("faq.allgemeines"),
      order: 1,
      faqs: [
        {
          title: t("faq.zielgruppe.question"),
          markdown: t("faq.zielgruppe.answer"),
        },
        {
          title: t("faq.kostenlos.question"),
          markdown: t("faq.kostenlos.answer"),
        },
        {
          title: t("faq.vs-tabellen.question"),
          markdown: t("faq.vs-tabellen.answer"),
        },
        {
          title: t("faq.was-ist-choreo-planer.question"),
          markdown: t("faq.was-ist-choreo-planer.answer"),
        },
        {
          title: t("faq.anmeldung.question"),
          markdown: t("faq.anmeldung.answer"),
        },
        {
          title: t("faq.erste-choreo.question"),
          markdown: t("faq.erste-choreo.answer"),
        },
        {
          title: t("faq.app-installieren.question"),
          markdown: t("faq.app-installieren.answer"),
        },
      ],
    },
    {
      name: t("faq.editor"),
      order: 3,
      faqs: [
        {
          title: t("faq.aufstellung-bauen.question"),
          markdown: t("faq.aufstellung-bauen.answer"),
        },
        {
          title: t("faq.counts-und-achter.question"),
          markdown: t("faq.counts-und-achter.answer"),
        },
        {
          title: t("faq.choreo-abspielen.question"),
          markdown: t("faq.choreo-abspielen.answer"),
        },
        {
          title: t("faq.positionsvorschlaege.question"),
          markdown: t("faq.positionsvorschlaege.answer"),
        },
        {
          title: t("faq.laenge-und-matte.question"),
          markdown: t("faq.laenge-und-matte.answer"),
        },
        {
          title: t("faq.farbe-zuweisen.question"),
          markdown: t("faq.farbe-zuweisen.answer"),
        },
      ],
    },
    {
      name: t("faq.countsheets"),
      order: 4,
      faqs: [
        {
          title: t("faq.eintrag-anlegen.question"),
          markdown: t("faq.eintrag-anlegen.answer"),
        },
        {
          title: t("faq.countsheet-ansicht.question"),
          markdown: t("faq.countsheet-ansicht.answer"),
        },
      ],
    },
    {
      name: t("faq.funktionen-and-features"),
      order: 2,
      faqs: [
        {
          title: t("faq.funktionen-wuenschen.question"),
          markdown: t("faq.funktionen-wuenschen.answer"),
        },
        {
          title: t("faq.wie-viele-teams.question"),
          markdown: t("faq.wie-viele-teams.answer"),
        },
        {
          title: t("faq.team-groesse.question"),
          markdown: t("faq.team-groesse.answer"),
        },
        {
          title: t("faq.neue-season.question"),
          markdown: t("faq.neue-season.answer"),
        },
        {
          title: t("faq.kader-verwalten.question"),
          markdown: t("faq.kader-verwalten.answer"),
        },
        {
          title: t("faq.teilnehmer-importieren.question"),
          markdown: t("faq.teilnehmer-importieren.answer"),
        },
        {
          title: t("faq.vereine-und-logo.question"),
          markdown: t("faq.vereine-und-logo.answer"),
        },
        {
          title: t("faq.zusammenarbeiten.question"),
          markdown: t("faq.zusammenarbeiten.answer"),
        },
        {
          title: t("faq.ki-nutzen.question"),
          markdown: t("faq.ki-nutzen.answer"),
        },
      ],
    },
    {
      name: t("faq.exportieren"),
      order: 5,
      faqs: [
        {
          title: t("faq.countsheet-als-pdf.question"),
          markdown: t("faq.countsheet-als-pdf.answer"),
        },
        {
          title: t("faq.choreo-video.question"),
          markdown: t("faq.choreo-video.answer"),
        },
        {
          title: t("faq.daten-export.question"),
          markdown: t("faq.daten-export.answer"),
        },
      ],
    },
  ].sort((a, b) => a.order - b.order)
);

const filteredFaqCategories = computed(() => {
  if (!searchTerm.value) return faqCategories.value;

  const term = searchTerm.value.toLowerCase();
  return faqCategories.value
    .map((category) => ({
      ...category,
      faqs: category.faqs.filter(
        (faq) =>
          category.name.toLowerCase().includes(term) ||
          faq.title.toLowerCase().includes(term) ||
          faq.markdown.toLowerCase().includes(term)
      ),
    }))
    .filter((category) => category.faqs.length > 0);
});

useHead({
  title: computed(() => t("general.help")),
  script: [
    {
      type: "application/ld+json" as "application/json",
      textContent: computed(() =>
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: faqCategories.value.flatMap((category) =>
            category.faqs.map((item) => ({
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
              },
            }))
          ),
        })
      ),
    },
  ],
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
          `${t("general.help")} - ${t("general.ChoreoPlaner")} | ${t(
            "meta.defaults.title"
          )}`
      ),
    },
    {
      name: "twitter:title",
      content: computed(
        () =>
          `${t("general.help")} - ${t("general.ChoreoPlaner")} | ${t(
            "meta.defaults.title"
          )}`
      ),
    },
  ],
});
</script>
