<template>
  <b-container
    id="helpView"
    :style="{ minHeight: '90vh', placeItems: 'center', display: 'grid' }"
  >
    <b-card
      title="Der Choreo-Editor"
      class="w-75 mb-2"
      border-variant="primary"
    >
      <b-list-group flush>
        <b-list-group-item>
          <h5>Für wen ist der Editor gedacht?</h5>
          <p>
            Der Editor ist für Trainerinnen und Trainer für Cheerleading-Teams.
            Die Endprodukte (Countsheets, Bilder und Videos) sollen an die Teams
            geteilt werden, um das Einstudieren einfacher zu machen.
          </p>
        </b-list-group-item>
        <b-list-group-item>
          <h5>Kann ich mit anderen zusammenarbeiten?</h5>
          <p>
            Ein "Live-Sharing" wie es aus Google Docs oder ähnlichen
            Online-Tools bekannt ist, ist nicht geplant. Stattdessen ist es
            vorgesehen, dass Trainerinnen und Trainer eines Vereins sich
            <b>einen Zugang teilen</b>. Damit soll es dann auch einfach sein,
            Teilnehmer zwischen Teams zu verschieben.
          </p>
          <p>
            Ein mögliches "Extrazugang anlegen" für ein Konto ist geplant, aber
            noch nicht bereit.
          </p>
        </b-list-group-item>
        <b-list-group-item>
          <h5>Wie kann ich Probleme melden?</h5>
          <p>
            Probleme können zur Zeit nur per Mail an
            <a href="mailto:andreas.nicklaus@gmail.com">
              andreas.nicklaus@gmail.com
            </a>
            gemeldet werden. Ein Kontaktformular ist zwar geplant, aber noch
            nicht bereit.
          </p>
        </b-list-group-item>
        <b-list-group-item>
          <h5>Datenschutz</h5>
          <p>
            Die Nutzung von Daten, die zur Identifikation einer Person genutzt
            werden können, sind der Vereinsname, der Mannschaftsname, der Name
            und Spitzname einer Person und ggf. der Nutzername eines Kontos.
            Diese Daten werden nur zur Bereitstellung dieser Anwendung genutzt
            und sind auf Wunsch unmittelbar zu löschen. Dazu nimm bitte per Mail
            an
            <a href="mailto:andreas.nicklaus@gmail.com">
              andreas.nicklaus@gmail.com
            </a>
            Kontakt auf.
          </p>
        </b-list-group-item>
      </b-list-group>
    </b-card>
  </b-container>
</template>
