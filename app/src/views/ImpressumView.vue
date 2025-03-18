<template>
  <b-container id="impressumView" data-view>
    <h1 class="mb-4">{{ $t("impressumView.impressum") }}</h1>
    <h2>{{ $t("impressumView.angaben-gemaess-5-tmg") }}</h2>
    <p>
      Andreas Nicklaus
      <br />
      E-Mail:
      <a href="mailto:info@choreo-planer.de"> info@choreo-planer.de </a>
    </p>
    <h2>{{ $t("impressumView.verantwortlich-fuer-den-inhalt") }}</h2>
    <p>Andreas Nicklaus</p>
    <h2>{{ $t("impressumView.haftung-fuer-inhalte") }}</h2>
    <p>
      {{ $t("impressumView.haftung-fuer-inhalte-text-1") }}
      <br />
      {{ $t("impressumView.haftung-fuer-inhalte-text-2") }}
    </p>
    <h2>{{ $t("impressumView.haftung-fuer-links") }}</h2>
    <p>
      {{ $t("impressumView.haftung-fuer-links-text") }}
    </p>
    <h2>{{ $t("impressumView.urheberrecht") }}</h2>
    <p>
      {{ $t("impressumView.urheberrecht-text") }}
    </p>
    <h2>{{ $t("impressumView.online-streitbeilegung") }}</h2>
    <p>
      {{ $t("impressumView.online-streitbeilegung-text-1") }}
      <a href="https://ec.europa.eu/consumers/odr" target="_blank">
        https://ec.europa.eu/consumers/odr </a
      >.
      <br />
      {{ $t("impressumView.online-streitbeilegung-text-2") }}
    </p>
  </b-container>
</template>

<script>
export default {
  name: "ImpressumView",
  metaInfo() {
    return {
      title: this.$t("impressumView.impressum"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.impressum.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.impressum.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.impressum.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${this.$t("impressumView.impressum")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${this.$t("impressumView.impressum")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>
