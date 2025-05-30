<template>
  <b-modal
    :id="`modal-newClub-${id}`"
    :title="$t('modals.create-club.neuer-verein')"
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
        :label="$t('modals.create-club.vereinsname')"
        label-class="label-with-colon"
        :state="newClubNameIsValid"
        :invalid-feedback="newClubNameStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <b-form-input
          v-model="newClubName"
          :state="newClubNameIsValid"
          required
          :placeholder="$t('modals.create-club.example-team-names')"
          autofocus
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="success" :disabled="!newClubNameIsValid">
        {{ $t("erstellen") }}
      </b-button>
      <b-button v-if="!preventClosing" @click="cancel" variant="danger">
        {{ $t("abbrechen") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import ClubService from "@/services/ClubService";

/**
 * @module Modal:CreateClubModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newClubName=null
 *
 * @vue-props {Boolean} preventClosing=false
 *
 * @vue-computed {Boolean} newClubNameIsValid
 * @vue-computed {String|null} newClubNameStateFeedback
 *
 * @vue-events {string} clubCreated
 */
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
      if (!this.newClubName) return this.$t("erforderlich");
      if (this.newClubName.length < 3)
        return this.$t("modals.create-club.min-vereinsname-length");
      return null;
    },
  },
};
</script>
