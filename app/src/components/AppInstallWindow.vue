<template>
  <BAlert
    :model-value="Boolean(installationPrompt)"
    class="m-0 py-3 px-4"
    fade
    variant="light"
    body-class="w-100 me-2"
  >
    <BRow
      class="justify-content-end justify-content-md-between"
      align-v="center"
      :style="{ rowGap: '1rem' }"
    >
      <BCol cols="12" md="auto">
        <h4>{{ $t("app-install.app-herunterladen") }}</h4>
        {{ $t("app-install.install-info") }}
      </BCol>
      <BCol cols="auto">
        <BButton variant="link" class="me-2" @click="dismiss">
          <u>{{ $t("app-install.nein-danke") }}</u>
        </BButton>
        <BButton variant="success" class="text-white" @click="install">
          <IBiDownload class="me-2" />
          {{ $t("app-install.installieren") }}
        </BButton>
      </BCol>
    </BRow>
  </BAlert>
</template>

<script lang="ts">
import Cookies from "js-cookie";
import { defineComponent } from "vue";

const cookieName = "install-dismissed";

/**
 * @module Component:AppInstallWindow
 *
 * @vue-data {Object|null} installationPrompt=null - The installation prompt event, if available.
 *
 * @example
 * <AppInstallWindow />
 */
export default defineComponent({
  name: "AppInstallWindow",
  data: () => ({
    installationPrompt: null as (Event & { prompt?: () => void }) | null,
  }),
  mounted() {
    if (localStorage.getItem("isTestEnvironment")) {
      this.installationPrompt = new Event("beforeinstallprompt");
      this.installationPrompt.prompt = () => {
        this.installationPrompt = null;
      };
    }

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      const cookie = Cookies.get(cookieName);
      if (cookie == null) {
        this.installationPrompt = null;
        Cookies.set(cookieName, "false", { expires: 30 });
      }
      if (cookie == "false") {
        this.installationPrompt = e;
      } else this.installationPrompt = null;
    });
    window.addEventListener("appinstalled", () => {
      this.installationPrompt = null;
    });
  },
  methods: {
    async dismiss() {
      Cookies.set(cookieName, "true", { expires: 30 });
      this.installationPrompt = null;
    },
    async install() {
      if (this.installationPrompt?.prompt) {
        await this.installationPrompt.prompt();
      }
    },
  },
});
</script>
