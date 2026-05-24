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
    <h3>4.1 {{ $t("datenschutz.social-login") }}</h3>
    <p>
      {{ $t("datenschutz.social-login-text") }}
    </p>
    <h4>{{ $t("datenschutz.social-login-daten") }}</h4>
    <ol>
      <li>
        {{ $t("datenschutz.social-login-daten-text-1") }}
      </li>
      <li>
        {{ $t("datenschutz.social-login-daten-text-2") }}
      </li>
    </ol>
    <h4>{{ $t("datenschutz.social-login-zweck") }}</h4>
    <p>
      {{ $t("datenschutz.social-login-zweck-text") }}
    </p>
    <h4>{{ $t("datenschutz.social-login-anbieter") }}</h4>
    <p>
      {{ $t("datenschutz.social-login-anbieter-text") }}
    </p>
    <ol>
      <li>
        Google:
        <a href="https://policies.google.com/privacy" target="_blank"
          >https://policies.google.com/privacy</a
        >
      </li>
      <li>
        GitHub:
        <a
          :href="
            $i18n.locale === 'en'
              ? 'https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement'
              : 'https://docs.github.com/de/site-policy/privacy-policies/github-privacy-statement'
          "
          target="_blank"
        >
          {{
            $i18n.locale === "en"
              ? "https://docs.github.com/en/site-policy/privacy-policies/github-privacy-statement"
              : "https://docs.github.com/de/site-policy/privacy-policies/github-privacy-statement"
          }}
        </a>
      </li>
      <li>
        Facebook:
        <a href="https://www.facebook.com/about/privacy" target="_blank"
          >https://www.facebook.com/about/privacy</a
        >
      </li>
    </ol>
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
/**
 * @vue-computed {MetaInfo} metaInfo
 */
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
