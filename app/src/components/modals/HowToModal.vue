<template>
  <b-modal
    :id="`howToModal-${id}`"
    title="Anleitung"
    hide-footer
    scrollable
    size="xl"
  >
    <b-tabs fill>
      <b-tab title="Aufstellungen">
        <b-card title="Aufstellungen" border-variant="light">
          <b-card-text>
            <p>
              Aufstellungen definieren, wo sich die Teilnehmer deiner Choreo auf
              der Matte befinden. Jede Aufstellung besteht aus den Positionen
              für die Teilnehmer und einer Dauer, wie lange die Aufstellung
              gehalten wird.
            </p>
            <hr />
            <p>
              <b>Aufstellungen anlegen:</b> Um deine erste Aufstellung
              anzulegen, klicke einfach einen Teilnehmer auf der Matte an und
              platziere den Marker
              <span
                :style="{
                  height: '24px',
                  width: '24px !important',
                  backgroundColor: '#ffab0655',
                  borderRadius: '50%',
                  border: 'solid 2px #ffab06',
                  display: 'inline-block',
                }"
              />
              an die gewünschte Stelle. Es wird automatisch eine neue
              Aufstellung angelegt oder der Teilnehmer zu einer bestehenden
              Aufstellung hinzugefügt.
            </p>
            <hr />
            <p>
              <b>Aufstellungen aufteilen:</b> Wenn Aufstellungen nicht für alle
              gleich lang gelten, brauchst du auf denselben Count mehrere
              Aufstellungen. Entferne dafür ggf. Teilnehmer aus der Aufstellung,
              indem du in der Liste an Aufstellung und Countsheet-Einträgen auf
              <b-icon-pen /> klickst und die Häkchen bei den Teilnehmern
              entfernst. Klicke dann auf
              <b-button
                variant="light"
                disabled
                :style="{
                  display: 'inline-block',
                }"
              >
                <b-icon-plus />Aufstellung hinzufügen
              </b-button>
              , wähle die Teilnehmer für die zweite Gruppe aus und ziehe die
              Marker dann auf der Matte an die richtige Stelle.
            </p>
            <hr />
            <b-alert variant="warning" show>
              Wenn du Aufstellungen definierst, die sich für einen Teilnehmer
              überschneiden, werden Animationen nicht richtig angezeigt!
            </b-alert>
          </b-card-text>
        </b-card>
      </b-tab>
      <b-tab title="Countsheet">
        <b-card title="Countsheet" border-variant="light">
          <b-card-text>
            <p>
              Einträge im Countsheet werden durch den Count, an dem sie
              passieren, einem Namen und durch eine Liste an Teilnehmern
              definiert.
            </p>
            <hr />
            <p>
              <b>Einträge hinzufügen:</b> Klicke auf
              <b-button
                variant="outline-success"
                disabled
                :style="{
                  display: 'inline-block',
                }"
              >
                <b-icon-plus />Eintrag hinzufügen
              </b-button>
              oder nutze den Shortcuts
              <b-badge variant="light">H</b-badge> oder
              <b-badge variant="light">N</b-badge> oder mache einen
              <b> Doppelklick auf die Zelle </b>
              im Countsheet, um einen Neuen Eintrag anzulegen. Dabei kannst du
              den Namen festlegen und wählen, für wen dieser Eintrag gilt.
              Standardmäßig wird der Eintrag für den aktuellen Count angelegt.
            </p>
            <b-alert variant="info" show>
              Wenn du dir die Mühe machst anzugeben, für wen der Eintrag gilt,
              kannst du später persönliche Countsheets austeilen.
            </b-alert>
            <hr />
            <p>
              <b>Einträge bearbeiten:</b> Angelegte Einträge findest in der
              Liste an Aufstellung und Countsheet-Einträgen. Klicke auf
              <b-icon-pen /> neben dem Eintrag, den du bearbeiten willst oder
              nutze den Shortcut <b-badge variant="light">Ä</b-badge> und klicke
              nach dem Bearbeiten auf
              <b-button
                variant="success"
                disabled
                :style="{
                  display: 'inline-block',
                }"
              >
                <b-icon-check /> </b-button
              >, um deine Änderungen zu speichern.
            </p>
          </b-card-text>
        </b-card>
      </b-tab>
      <b-tab title="Steuerung">
        <b-card title="Steuerung" border-variant="light">
          <EditViewShortcutTutorial />
        </b-card>
      </b-tab>
      <b-tab title="Video und Countsheet downloaden">
        <b-card title="Video und Countsheet downloaden" border-variant="light">
          <b-card-text>
            <p>
              <b>Countsheet als PDF downloaden:</b> Klicke im Menü oben rechts
              auf
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-three-dots-vertical />
              </b-button>
              und wähle
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-file-pdf />
                Countsheet als PDF
              </b-button>
              aus, um das Countsheet zusammenzustellen und herunterzuladen.
            </p>
            <hr />
            <p>
              <b>Aufstellungen als Video downloaden:</b> Klicke im Menü oben
              rechts auf
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-three-dots-vertical />
              </b-button>
              und wähle
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-film />
                Video exportieren
              </b-button>
              aus, um dein Video zusammenzustellen und herunterzuladen.
            </p>
          </b-card-text>
        </b-card>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import EditViewShortcutTutorial from "../EditViewShortcutTutorial.vue";

export default {
  name: "HowToModal",
  components: { EditViewShortcutTutorial },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      this.$bvModal.show(`howToModal-${this.id}`);
    },
  },
};
</script>
