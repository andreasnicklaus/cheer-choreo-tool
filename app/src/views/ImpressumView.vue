<template>
  <BContainer id="impressumView" data-view class="mt-5 mb-5">
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
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed, getCurrentInstance } from "vue";

export default {
  name: "ImpressumView",
  mounted() {
    const { proxy } = getCurrentInstance();

    useHead({
      title: computed(() => proxy.$t("impressumView.impressum")),
      meta: [
        {
          name: "description",
          content: computed(() => proxy.$t("meta.impressum.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => proxy.$t("meta.impressum.description")),
        },
        {
          property: "og:description",
          content: computed(() => proxy.$t("meta.impressum.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${proxy.$t("impressumView.impressum")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${proxy.$t("impressumView.impressum")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
      ],
    });
  },
};
</script>
