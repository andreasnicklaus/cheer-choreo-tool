<template>
  <b-modal
    :id="`mobile-choreoEdit-modal-${id}`"
    centered
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    @close="(event) => event.preventDefault()"
    title="Am Handy nicht möglich"
  >
    <p class="text-muted">
      Du kannst aktuell nicht alle Funktionen am Handy nutzen. Choreos zu
      bearbeiten gehört dazu.
    </p>
    <p class="text-muted">
      Bitte logge dich an einem Gerät mit größerem Display an, um deine Choreo
      zu bearbeiten.
    </p>
    <b-row :style="{ gap: '10px' }">
      <b-col>
        <b-button :to="{ name: 'PDF', params: { choreoId } }" variant="success">
          <b-icon-file-pdf class="mr-2" />
          Countsheet als PDF
        </b-button>
      </b-col>
      <b-col>
        <b-button
          :to="{ name: 'Video', params: { choreoId } }"
          variant="success"
        >
          <b-icon-film class="mr-2" />
          Video exportieren
        </b-button>
      </b-col>
    </b-row>
    <template #modal-footer="{ cancel }">
      <b-button
        @click="cancel"
        :to="{ name: 'Start' }"
        variant="outline-secondary"
      >
        Zur Startseite
      </b-button>
    </template>
  </b-modal>
</template>

<script>
export default {
  name: "MobileChoreoEditModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    choreoId: {
      type: String,
      required: true,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`mobile-choreoEdit-modal-${this.id}`);
    },
    close() {
      this.$bvModal.hide(`mobile-choreoEdit-modal-${this.id}`);
    },
  },
};
</script>
