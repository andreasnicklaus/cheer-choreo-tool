<template>
  <b-container id="helpView" data-view>
    <h1 class="mb-4">{{ $t("datenschutz.datenschutzerklaerung") }}</h1>
    <h2>1. {{ $t("datenschutz.allgemeine-hinweise") }}</h2>
    <p>
      {{ $t("datenschutz.allgemeine-hinweise-text") }}
    </p>
    <h2>2. {{ $t("datenschutz.verantwortlicher") }}</h2>
    <p>
      {{ $t("datenschutz.verantwortlich-fuer-die-datenverarbeitung") }}: <br />
      Andreas Nicklaus <br />
      E-Mail:
      <a href="mailto:info@choreo-planer.de"> info@choreo-planer.de </a>
    </p>
    <h2>3. {{ $t("datenschutz.verarbeitung-personenbezogener-daten") }}</h2>
    <ol class="ml-3">
      <li>
        {{ $t("datenschutz.verarbeitung-personenbezogener-daten-text-1") }}
      </li>
      <li>
        {{ $t("datenschutz.verarbeitung-personenbezogener-daten-text-2") }}
      </li>
      <li>
        {{ $t("datenschutz.verarbeitung-personenbezogener-daten-text-3") }}
      </li>
    </ol>
    <h2>4. {{ $t("datenschutz.weitergabe-von-daten-an-dritte") }}</h2>
    <p>
      {{ $t("datenschutz.weitergabe-von-daten-an-dritte-text") }}
    </p>
    <h2>5. {{ $t("datenschutz.ihre-rechte") }}</h2>
    <p>
      {{ $t("datenschutz.ihre-rechte-text") }} <br />
      E-Mail:
      <a href="mailto:info@choreo-planer.de"> info@choreo-planer.de </a>
    </p>
    <h2>6. {{ $t("datenschutz.sicherheit-der-datenverarbeitung") }}</h2>
    <p>
      {{ $t("datenschutz.sicherheit-der-datenverarbeitung-text") }}
    </p>
    <h2>7. {{ $t("datenschutz.aenderungen-der-datenschutzerklaerung") }}</h2>
    <p>
      {{ $t("datenschutz.aenderungen-der-datenschutzerklaerung-text") }}
    </p>
    <h2>8. {{ $t("datenschutz.kontakt") }}</h2>
    <p>
      {{ $t("datenschutz.kontakt-text") }} <br />
      Andreas Nicklaus <br />
      E-Mail:
      <a href="mailto:info@choreo-planer.de"> info@choreo-planer.de </a>
    </p>
  </b-container>
</template>

<script>
export default {
  name: "DatenschutzView",
  metaInfo() {
    return {
      title: this.$t("navigation.datenschutz"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.datenschutz.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.datenschutz.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.datenschutz.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("navigation.datenschutz")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("navigation.datenschutz")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>
