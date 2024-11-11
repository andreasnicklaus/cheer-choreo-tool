<template>
  <b-modal
    :id="`deleteModal-${id}`"
    centered
    @ok="removeChoreo"
    title="Bist du sicher?"
  >
    Du kannst das nicht rückgängig machen.
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger"> Löschen </b-button>
      <b-button @click="cancel" variant="outline-secondary">
        Abbrechen
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
        this.$router.push({ name: "Start" }).catch(() => {});
      });
    },
  },
};
</script>
