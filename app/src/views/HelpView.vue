<template>
  <b-container id="helpView" data-view class="d-flex justify-content-center">
    <b-card title="Hilfe bekommen" class="w-75 mb-2" border-variant="light">
      <b-input
        type="text"
        placeholder="Suchen"
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
          class="mb-1"
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
        Für deine Suche "{{ searchTerm }}" gibt es keine Ergebnisse
      </p>

      <p>
        Nicht die richtige Antwort dabei gewesen? Kontaktiere uns unter
        <a href="mailto:andreas.nicklaus@gmail.com">
          andreas.nicklaus@gmail.com
        </a>
        und beschreibe dein Problem.
      </p>
    </b-card>
  </b-container>
</template>

<script>
import VueMarkdown from "vue-markdown-v2";

export default {
  name: "HelpView",
  data: () => ({
    searchTerm: null,
    faqCategories: [
      {
        name: "Datenschutz",
        order: 999,
        faqs: [
          {
            title: "Datenschutz",
            markdown: `Die Nutzung von Daten, die zur Identifikation einer Person genutzt
            werden können, sind der Vereinsname, der Mannschaftsname, der Name
            und Spitzname einer Person und ggf. der Nutzername eines Kontos.

            Diese Daten werden nur zur Bereitstellung dieser Anwendung genutzt
            und sind auf Wunsch unmittelbar zu löschen. Dazu nimm bitte per Mail
            an [andreas.nicklaus@gmail.com](mailto:andreas.nicklaus@gmail.com)
            Kontakt auf.`,
          },
        ],
      },
      {
        name: "Probleme lösen",
        order: 3,
        faqs: [
          {
            title: "Wie kann ich Probleme melden?",
            markdown: `Probleme können zur Zeit nur per Mail an
            [andreas.nicklaus@gmail.com](mailto:andreas.nicklaus@gmail.com)
            gemeldet werden. Ein Kontaktformular ist geplant.`,
          },
          {
            title:
              "Ich habe aus Versehen etwas gelöscht. Kann ich das rückgängig machen?",
            markdown: `Ja, aber nicht du selber! Du kannst dich jeder Zeit dazu an uns
            wenden. Dann können folgende Daten wiederhergestellt werden:

            <ul class="ml-3">
              <li>Nutzerkonten</li>
              <li>Vereine</li>
              <li>Teams</li>
              <li>Seasons</li>
              <li>Choreos</li>
              <li>Kader</li>
            </ul>

            Bitte beschreibe in deiner Kontaktaufnahme per Mail an
            [andreas.nicklaus@gmail.com](mailto:andreas.nicklaus@gmail.com)
            gleich das Datum und die Uhrzeit der Löschung, damit wir dein
            Problem schnell lösen können.`,
          },
        ],
      },
      {
        name: "Allgemeines",
        order: 1,
        faqs: [
          {
            title: "Für wen ist der Editor gedacht?",
            markdown: `Der Editor ist für Trainerinnen und Trainer für Cheerleading-Teams.
            Die Endprodukte (Countsheets, Bilder und Videos) sollen an die Teams
            geteilt werden, um das Lernen der Choreos einfacher zu machen.`,
          },
        ],
      },
      {
        name: "Funktionen & Features",
        order: 2,
        faqs: [
          {
            title: "Wie viele Teams kann ich verwalten?",
            markdown: `Kurz und knapp: So viele du willst! Es ist möglich, beliebig viele
            Vereine, Teams, Season, Choreos und Teilnehmer anzulegen.`,
          },
          {
            title: "Muss ich für jede Season ein neues Team anlegen?",
            markdown: `Nein! Du kannst ganz einfach mit deinem bestehenden Team eine neue
            Season anfangen und den Kader neu aufstellen. Dabei kannst du sogar
            Teilnehmer aus anderen Seasons oder sogar anderen Teams in die neue
            Season mitnehmen.`,
          },
          {
            title: "Kann ich mit anderen zusammenarbeiten?",
            markdown: `Ein "Live-Sharing" wie es aus Google Docs oder ähnlichen
            Online-Tools bekannt ist, ist nicht geplant. Stattdessen ist es
            vorgesehen, dass Trainerinnen und Trainer eines Vereins sich
            **einen Zugang teilen**. Damit soll es dann auch einfach sein,
            Teilnehmer zwischen Teams zu verschieben.

            Ein mögliches "Extrazugang anlegen" für ein Konto ist geplant.`,
          },
        ],
      },
    ].sort((a, b) => a.order - b.order),
  }),
  components: {
    VueMarkdown,
  },
  computed: {
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
  metaInfo: {
    title: "Hilfe",
    meta: [
      {
        name: "description",
        content:
          "Erhalte Infos über den Choreo Editor und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Editors.",
      },
      {
        name: "twitter:description",
        content:
          "Erhalte Infos über den Choreo Editor und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Editors.",
      },
      {
        name: "og:description",
        content:
          "Erhalte Infos über den Choreo Editor und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Editors.",
      },
    ],
  },
};
</script>
