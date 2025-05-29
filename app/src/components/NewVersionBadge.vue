<template>
  <b-badge v-show="show" variant="success" class="newVersionBadge px-2">{{
    $t("neu").toUpperCase()
  }}</b-badge>
</template>

<script>
import VersionService from "@/services/VersionService";

export default {
  name: "NewVersionBadge",
  data: () => ({
    show: false,
  }),
  props: {
    version: {
      type: String,
      required: false,
    },
    versions: {
      type: Array,
      required: false,
    },
  },

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
};
</script>

<style lang="scss" scoped>
.newVersionBadge {
  background: linear-gradient(
      to right,
      rgb(216, 0, 0) 0%,
      rgb(231, 139, 0) 10%,
      rgb(200, 214, 0) 20%,
      rgb(31, 220, 25) 30%,
      rgb(14, 211, 208) 40%,
      rgb(26, 198, 224) 50%,
      rgb(0, 97, 208) 60%,
      rgb(85, 0, 255) 70%,
      rgb(169, 0, 231) 80%,
      rgb(252, 0, 218) 90%,
      rgb(216, 0, 0) 100%
    )
    0 0/5000% 100%;
  animation: rainbow 20s linear infinite;
}

@keyframes rainbow {
  to {
    background-position: -500% 0;
  }
}
</style>
