<template>
  <BModal
    :id="`mcpInfoModal-${id}`"
    ref="modal"
    :title="$t('modals.mcp-info.title')"
    size="xl"
    centered
  >
    <p>{{ $t("modals.mcp-info.description") }}</p>

    <h5>{{ $t("modals.mcp-info.server-url") }}</h5>
    <p>{{ $t("modals.mcp-info.server-url-description") }}</p>
    <div class="d-flex align-items-center gap-2 mb-4">
      <BFormInput :model-value="mcpUrl" readonly class="font-monospace" />
      <BButton variant="outline-secondary" @click="copyToClipboard(mcpUrl)">
        <IBiCheck v-if="urlCopied" />
        <IBiCopy v-else />
      </BButton>
    </div>

    <h5>{{ $t("modals.mcp-info.authentication") }}</h5>
    <p>{{ $t("modals.mcp-info.authentication-description") }}</p>

    <div class="d-flex gap-2 align-items-center mb-3">
      <BFormSelect
        v-model="tokenExpiry"
        :options="tokenExpiryOptions"
        class="w-auto"
      />
      <BButton
        variant="warning"
        :disabled="tokenLoading"
        @click="generateToken"
      >
        <IBiKey />
        {{ $t("modals.mcp-info.generate-token") }}
      </BButton>
    </div>

    <div v-if="token" class="mb-4">
      <BAlert :model-value="true" variant="success" dismissible>
        {{ $t("modals.mcp-info.token-success") }}
      </BAlert>
      <div class="d-flex gap-2">
        <BFormInput :model-value="token" readonly class="font-monospace" />
        <BButton variant="outline-secondary" @click="copyToken">
          <IBiCheck v-if="tokenCopied" />
          <IBiCopy v-else />
        </BButton>
      </div>
    </div>

    <BAlert :model-value="true" variant="warning" class="mt-2 mb-4">
      {{ $t("modals.mcp-info.security-description") }}
    </BAlert>

    <h5 class="mt-4">{{ $t("modals.mcp-info.configuration") }}</h5>
    <p>{{ $t("modals.mcp-info.configuration-description") }}</p>

    <BTabs>
      <BTab :title="$t('modals.mcp-info.claude-desktop')">
        <pre class="bg-light p-3 rounded"><code>{{ claudeConfig }}</code></pre>
      </BTab>
      <BTab :title="$t('modals.mcp-info.opencode')">
        <pre
          class="bg-light p-3 rounded"
        ><code>{{ opencodeConfig }}</code></pre>
      </BTab>
      <BTab :title="$t('modals.mcp-info.cursor')">
        <pre class="bg-light p-3 rounded"><code>{{ cursorConfig }}</code></pre>
      </BTab>
      <BTab :title="$t('modals.mcp-info.generic')">
        <pre class="bg-light p-3 rounded"><code>{{ genericConfig }}</code></pre>
      </BTab>
    </BTabs>

    <template #footer="{ cancel }">
      <BButton variant="primary" @click="cancel">
        {{ $t("schliessen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";
import { getApiDomain } from "@/services/RequestService";
import AuthService from "@/services/AuthService";
import { error } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

export default defineComponent({
  name: "McpInfoModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    urlCopied: false,
    token: null as string | null,
    tokenLoading: false,
    tokenCopied: false,
    tokenExpiry: "30d",
  }),
  computed: {
    tokenExpiryOptions(): Array<{ value: string; text: string }> {
      return [
        { value: "7d", text: this.$t("accountView.mcp-token-expiry-7d") },
        { value: "30d", text: this.$t("accountView.mcp-token-expiry-30d") },
        { value: "90d", text: this.$t("accountView.mcp-token-expiry-90d") },
        { value: "365d", text: this.$t("accountView.mcp-token-expiry-365d") },
      ];
    },
    mcpUrl(): string {
      return `${getApiDomain()}mcp`;
    },
    bearerToken(): string {
      return this.token ? `Bearer ${this.token}` : "Bearer YOUR_TOKEN_HERE";
    },
    claudeConfig(): string {
      return JSON.stringify(
        {
          mcpServers: {
            "choreo-planer": {
              url: this.mcpUrl,
              headers: {
                Authorization: this.bearerToken,
              },
            },
          },
        },
        null,
        2
      );
    },
    opencodeConfig(): string {
      return JSON.stringify(
        {
          mcp: {
            "choreo-planer": {
              type: "remote",
              url: this.mcpUrl,
              headers: {
                Authorization: this.bearerToken,
              },
              requestOptions: {
                timeout: 3600000,
              },
            },
          },
        },
        null,
        2
      );
    },
    cursorConfig(): string {
      return JSON.stringify(
        {
          mcpServers: {
            "choreo-planer": {
              url: this.mcpUrl,
              headers: {
                Authorization: this.bearerToken,
              },
            },
          },
        },
        null,
        2
      );
    },
    genericConfig(): string {
      return `POST ${this.mcpUrl}
Content-Type: application/json
Authorization: ${this.bearerToken}

{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "tools/list"
}`;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    copyToClipboard(text: string) {
      navigator.clipboard.writeText(text);
      this.urlCopied = true;
      setTimeout(() => {
        this.urlCopied = false;
      }, 1000);
    },
    async generateToken() {
      this.tokenLoading = true;
      this.token = null;
      try {
        const result = await AuthService.generateMcpToken(this.tokenExpiry);
        this.token = result.token;
      } catch (e: unknown) {
        error(e, ERROR_CODES.UNKNOWN);
      } finally {
        this.tokenLoading = false;
      }
    },
    copyToken() {
      if (this.token) {
        navigator.clipboard.writeText(this.token);
        this.tokenCopied = true;
        setTimeout(() => {
          this.tokenCopied = false;
        }, 1000);
      }
    },
  },
});
</script>
