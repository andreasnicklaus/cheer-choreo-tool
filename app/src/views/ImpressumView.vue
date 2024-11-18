<template>
  <b-container id="impressumView" data-view>
    <h1 class="mb-4">Impressum</h1>
    <h2>Angaben gemäß § 5 TMG</h2>
    <p>
      Andreas Nicklaus
      <br />
      E-Mail:
      <a href="mailto:info@choreo-planer.de"> info@choreo-planer.de </a>
    </p>
    <h2>Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV:</h2>
    <p>Andreas Nicklaus</p>
    <h2>Haftung für Inhalte</h2>
    <p>
      Als Diensteanbieter bin ich gemäß § 7 Abs.1 TMG für eigene Inhalte auf
      diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis
      10 TMG bin ich als Diensteanbieter jedoch nicht verpflichtet, übermittelte
      oder gespeicherte fremde Informationen zu überwachen oder nach Umständen
      zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
      <br />
      Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen
      nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine
      diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer
      konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden
      Rechtsverletzungen werde ich diese Inhalte umgehend entfernen.
    </p>
    <h2>Haftung für Links</h2>
    <p>
      Mein Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte
      ich keinen Einfluss habe. Deshalb kann ich für diese fremden Inhalte auch
      keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets
      der jeweilige Anbieter oder Betreiber der Seiten verantwortlich. Die
      verlinkten Seiten wurden zum Zeitpunkt der Verlinkung auf mögliche
      Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zum Zeitpunkt der
      Verlinkung nicht erkennbar. Eine permanente inhaltliche Kontrolle der
      verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte einer
      Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
      werde ich derartige Links umgehend entfernen.
    </p>
    <h2>Urheberrecht</h2>
    <p>
      Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen
      Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung,
      Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen
      des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen
      Autors bzw. Erstellers. Downloads und Kopien dieser Seite sind nur für den
      privaten, nicht kommerziellen Gebrauch gestattet. Soweit die Inhalte auf
      dieser Seite nicht vom Betreiber erstellt wurden, werden die Urheberrechte
      Dritter beachtet. Insbesondere werden Inhalte Dritter als solche
      gekennzeichnet. Sollten Sie trotzdem auf eine Urheberrechtsverletzung
      aufmerksam werden, bitte ich um einen entsprechenden Hinweis. Bei
      Bekanntwerden von Rechtsverletzungen werde ich derartige Inhalte umgehend
      entfernen.
    </p>
    <h2>Online-Streitbeilegung</h2>
    <p>
      Die Europäische Kommission stellt eine Plattform zur
      Online-Streitbeilegung (OS) bereit:
      <a href="https://ec.europa.eu/consumers/odr" target="_blank">
        https://ec.europa.eu/consumers/odr </a
      >.
      <br />
      Ich bin nicht verpflichtet, an Streitbeilegungsverfahren vor einer
      Verbraucherschlichtungsstelle teilzunehmen und nehme daran auch nicht
      teil.
    </p>
  </b-container>
</template>

<script>
export default {
  name: "ImpressumView",
  metaInfo: {
    title: "Impressum",
    meta: [
      {
        name: "description",
        content:
          "Das Impressum des Choreo Planer. Angaben und Informationen zur Kontaktaufnahme und Haftung bzgl. der Nutzung des Choreo Planers.",
      },
      {
        name: "twitter:description",
        content:
          "Das Impressum des Choreo Planer. Angaben und Informationen zur Kontaktaufnahme und Haftung bzgl. der Nutzung des Choreo Planers.",
      },
      {
        property: "og:description",
        content:
          "Das Impressum des Choreo Planer. Angaben und Informationen zur Kontaktaufnahme und Haftung bzgl. der Nutzung des Choreo Planers.",
      },
      {
        property: "og:title",
        content: "Impressum - Choreo Planer",
      },
      {
        name: "twitter:title",
        content: "Impressum - Choreo Planer",
      },
    ],
  },
};
</script>
