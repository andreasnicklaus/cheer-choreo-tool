<template>
  <BAlert
    :model-value="Boolean(installationPrompt)"
    class="m-0 py-2 px-3"
    fade
    variant="info"
    body-class="w-100 me-2"
  >
    <BRow
      class="align-items-center justify-content-between"
      :style="{ rowGap: '0.5rem' }"
    >
      <BCol cols="12" md="auto" class="py-0">
        <h5 class="mb-0 fs-6">{{ $t("app-install.app-herunterladen") }}</h5>
        <small class="d-block">{{ $t("app-install.install-info") }}</small>
      </BCol>
      <BCol cols="auto" class="py-0">
        <BButton variant="link" size="sm" class="me-2" @click="dismiss">
          <u>{{ $t("app-install.nein-danke") }}</u>
        </BButton>
        <BButton
          variant="primary"
          size="sm"
          class="text-white"
          @click="install"
        >
          <IBiDownload class="me-1" />
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
 * Compact top banner (info variant) that offers to install the PWA. It still
 * occupies space in the layout (shifts content down) instead of overlaying it.
 *
 * @vue-data {Object|null} installationPrompt=null - The installation prompt event, if available.
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

      // "install-dismissed": true = dismissed, false/null = not dismissed.
      const cookie = Cookies.get(cookieName);
      if (cookie === "true") {
        this.installationPrompt = null;
        return;
      }

      // First visit: persist "not dismissed" so subsequent visits behave consistently.
      if (cookie == null) {
        Cookies.set(cookieName, "false", { expires: 30 });
      }

      this.installationPrompt = e;
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
      this.installationPrompt = null;
    },
  },
});
</script>
