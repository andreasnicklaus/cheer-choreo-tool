<template>
  <b-modal
    :id="`deleteModal-${id}`"
    centered
    @ok="removeChoreo"
    :title="$t('bist-du-sicher')"
  >
    {{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger">{{ $t("loeschen") }}</b-button>
      <b-button @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";

export default {
  name: "DeleteChoreoModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    choreoId: {
      type: String,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`deleteModal-${this.id}`);
    },
    removeChoreo() {
      ChoreoService.remove(this.choreoId).then(() => {
        this.$router
          .push({
            name: "Start",
            params: { locale: this.$root.$i18n.locale },
          })
          .catch(() => {});
      });
    },
  },
};
</script>
