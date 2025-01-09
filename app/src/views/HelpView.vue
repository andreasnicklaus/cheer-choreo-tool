<template>
  <b-container id="helpView" data-view>
    <b-card title="Hilfe bekommen" border-variant="light" title-tag="h1">
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
        <a href="mailto:info@choreo-planer.de">info@choreo-planer.de</a>
        oder auf Instagram
        <a href="https://www.instagram.com/choreoplaner/" target="_blank"
          >@choreoplaner</a
        >
        und beschreibe dein Problem.
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
            markdown: `Bitte ließ dir zu Fragen bzgl. des Datenschutzes die [Datenschutzerklärung](/datenschutz) durch.`,
          },
          {
            title: "Werden meine Daten an Dritte weitergegeben?",
            markdown: `**Nein!** Es gibt für uns keinen Anlass deine Daten an Dritte
            weiterzugeben. Die Absicherung der persönlichen Daten deiner
            Teammitglieder, insbesondere Minderjähriger, ist uns sehr wichtig.
            Daher werden deine Daten nicht an Dritte weitergegeben.

            Bitte ließ dir zu Fragen bzgl. des Datenschutzes die [Datenschutzerklärung](/datenschutz) durch.`,
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
            [info@choreo-planer.de](mailto:info@choreo-planer.de)
            oder als DM auf Instagram an
            <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a>
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
            [info@choreo-planer.de](mailto:info@choreo-planer.de)
            oder als DM auf Instagram an
            <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a>
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
            title: "Für wen ist der Choreo Planer gedacht?",
            markdown: `Der Choreo Planer ist für **Trainerinnen und Trainer von Cheerleading-Teams**.
            Die Endprodukte (Countsheets, Bilder und Videos) sollen an die Teams
            geteilt werden, um das Lernen der Choreos einfacher zu machen.`,
          },
          {
            title: "Was ist der Choreo Planer?",
            markdown: `Der Choreo Planer ist ein **kostenloses** Projekt, welches für Cheerleader
            entwickelt wird. Der Choreo Planer soll es ermöglichen, Choreos zu erstellen und
            diese mit anderen zu teilen.
            
            Der Choreo Planer soll es ermöglichen, die Planung von Choreos zu vereinfachen und
            zu digitalisieren. Vor allem soll es möglich sein, Choreos in einer vereinfachten Version
            den Teilnehmern beizubringen. Die Endprodukte (Countsheets, Bilder und Videos) sollen an
            die Teams verteilt werden, um das Lernen der Choreos einfacher zu machen.

            Damit wird dein Team zum **digitalen Team**. Das bedeutet, dass du dein Team nicht mehr
            mit Zetteln und Stiften arbeiten musst, sondern zu einem der Vorreiter der digitalen
            Welt wird.
            `,
          },
          {
            title: "Warum können die Server offline sein?",
            markdown: `Der Choreo Planer ist ein **kostenloses** Projekt. Daher kann es sein, dass die
            Server nicht immer erreichbar sind. Wir haben hier eine Liste an Gründen vorbereitet, warum du die Server nicht erreichen kannst:

            <ol class="ml-3">
              <li>
                
                Die Server werden von uns gewartet. In diesem Fall kannst du nichts machen, außer zu
                warten und hoffen, dass wir schnell fertig sind. Wenn du wissen möchtest, wann die Server
                wieder erreichbar sind, kannst du uns gerne eine Mail an
                [info@choreo-planer.de](mailto:info@choreo-planer.de) oder eine DM auf Instagram an
                <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a> schreiben.
                
              </li>
              <li>
            
                Unsere Internetverbindung ist ausgefallen. Da kein Budget zur Verfügung steht, um eine
                ausfallsichere Internetverbindung zu versichern, kann es vorkommen, dass unsere
                Internetverbindung ausfällt. In diesem Fall kannst du nichts machen, außer zu warten
                und hoffen, dass wir schnell fertig sind. Wenn du wissen möchtest, wann die Server 
                wieder erreichbar sind, kannst du uns gerne eine Mail an
                [info@choreo-planer.de](mailto:info@choreo-planer.de) oder eine DM auf Instagram an
                <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a> schreiben.
              
              </li>
              <li>
            
                Deine Internetverbindung ist ausgefallen. Wenn du unsere Webseite bereits einmal geladen
                hast, kannst du zwar die Webseite nochmal ohne Internetverbindung laden, aber du kannst keine
                neuen Daten laden. In diesem Fall kannst du selber versuchen, deine Internetverbindung
                wiederherzustellen. Wenn du dabei Hilfe brauchst, kannst du uns keine E-Mail schreiben, denn
                du hast ja kein Internet.
              
              </li>

            </ol>
            
            Wenn du den Choreo Planer gerne unterstützen möchtest, kannst du uns unterstützen, indem du
            an der Projektentwicklung mitwirkst oder eine Spende machst. Dafür haben wir noch keine
            Möglichkeit vorbereitet, aber wir arbeiten daran. Wenn du uns unterstützen möchtest, kannst
            du uns gerne eine Mail an [info@choreo-planer.de](mailto:info@choreo-planer.de)
            oder eine DM auf Instagram an
            <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a> schreiben.`,
          },
        ],
      },
      {
        name: "Funktionen & Features",
        order: 2,
        faqs: [
          {
            title: "Kann ich mir Funktionen wünschen?",
            markdown: `**Ja!** Wir freuen uns über jede Funktion, die wir in den Choreo Planer
            einbauen können. Wenn du eine Funktion wünschst, kannst du uns gerne eine Mail an
            [info@choreo-planer.de](mailto:info@choreo-planer.de) oder eine DM auf Instagram an
            <a href="https://www.instagram.com/choreoplaner/" target="_blank">@choreoplaner</a> schreiben. Wir werden uns dann
            dann überlegen, ob wir diese Funktion einbauen können. Wenn wir die Funktion einbauen,
            werden wir dich natürlich darüber informieren.
            `,
          },
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
        vmid: "description",
        name: "description",
        content:
          "Erhalte Infos über den Choreo Planer und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Choreo Planers.",
      },
      {
        vmid: "twitter:description",
        name: "twitter:description",
        content:
          "Erhalte Infos über den Choreo Planer und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Choreo Planers.",
      },
      {
        vmid: "og:description",
        property: "og:description",
        content:
          "Erhalte Infos über den Choreo Planer und Antworten auf deine Fragen und Probleme. In unserem FAQ beantworten alle häufig gestellten Fragen über die Nutzung und Funktionen des Choreo Planers.",
      },
      {
        vmid: "og:title",
        property: "og:title",
        content:
          "Hilfe - Choreo Planer | Das kostenlose Online-Tool für Choreo-Sport",
      },
      {
        vmid: "twitter:title",
        property: "twitter:title",
        content:
          "Hilfe - Choreo Planer | Das kostenlose Online-Tool für Choreo-Sport",
      },
    ],
  },
};
</script>
