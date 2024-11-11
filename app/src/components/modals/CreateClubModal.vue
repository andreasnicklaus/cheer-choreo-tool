<template>
  <b-modal
    :id="`modal-newClub-${id}`"
    title="Neuer Verein"
    centered
    @show="resetClubModal"
    @ok="createAndSelectClub"
    @close="
      (event) => {
        if (preventClosing) event.preventDefault();
      }
    "
    :no-close-on-backdrop="preventClosing"
    :no-close-on-esc="preventClosing"
    :hide-header-close="preventClosing"
  >
    <b-form>
      <b-form-group
        label="Vereinsname"
        :state="newClubNameIsValid"
        :invalid-feedback="newClubNameStateFeedback"
        valid-feedback="Gültig!"
      >
        <b-form-input
          v-model="newClubName"
          :state="newClubNameIsValid"
          required
          placeholder="TSG Salach e.V., Glamorous Cheerleader, ..."
          autofocus
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success" :disabled="!newClubNameIsValid">
        Erstellen
      </b-button>
      <b-button v-if="!preventClosing" @click="cancel" variant="danger">
        Abbrechen
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import ClubService from "@/services/ClubService";

export default {
  name: "CreateClubModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newClubName: null,
  }),
  props: {
    preventClosing: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-newClub-${this.id}`);
    },
    close() {
      this.$bvModal.hide(`modal-newClub-${this.id}`);
    },
    resetClubModal() {
      this.newClubName = null;
    },
    createAndSelectClub() {
      ClubService.create(this.newClubName).then((club) => {
        this.$store.commit("setClubId", club.id);
        this.$emit("clubCreated", club);
      });
    },
  },
  computed: {
    newClubNameIsValid() {
      return this.newClubName != null && this.newClubName.length >= 3;
    },
    newClubNameStateFeedback() {
      if (!this.newClubName) return "Erforderlich";
      if (this.newClubName.length < 3) return "Min. 3 Zeichen";
      return null;
    },
  },
};
</script>
