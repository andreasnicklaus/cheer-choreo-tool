<template>
  <BBadge
    v-if="show"
    variant="success"
    class="newVersionBadge d-inline-flex gap-1 align-items-center"
  >
    <IBiPatchExclamationFill />{{ $t("neu").toUpperCase() }}</BBadge
  >
</template>

<script lang="ts">
import VersionService from "@/services/VersionService";
import { defineComponent, PropType } from "vue";

/**
 * @module Component:NewVersionBadge
 *
 * @vue-data {Boolean} show=false
 *
 * @vue-prop {String} [version] - The specific version to check for newness.
 * @vue-prop {string[]} [versions] - An array of versions to check for newness.
 *
 * @example <NewVersionBadge />
 * @example <NewVersionBadge version="1.2.3" />
 * @example <NewVersionBadge :versions="['1.2.3', '1.2.4']" />
 */

export default defineComponent({
  name: "NewVersionBadge",
  props: {
    version: {
      type: String,
      default: "",
    },
    versions: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
  },
  data: () => ({
    show: false,
  }),

  mounted() {
    this.init();
  },
  methods: {
    init() {
      if (this.version) this.show = VersionService.isVersionNew(this.version);
      else
        this.show = this.versions.some((version) =>
          VersionService.isVersionNew(version)
        );
    },
  },
});
</script>

<style lang="scss" scoped>
.newVersionBadge {
  background-color: var(--color-accent);
}
</style>
