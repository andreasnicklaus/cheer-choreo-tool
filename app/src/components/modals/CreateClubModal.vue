<template>
  <BModal
    ref="modal"
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
    :no-header-close="preventClosing"
  >
    <BForm>
      <BFormGroup
        :label="$t('modals.create-club.vereinsname')"
        label-class="label-with-colon"
        :state="newClubNameIsValid"
        :invalid-feedback="newClubNameStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <BFormInput
          v-model="newClubName"
          :state="newClubNameIsValid"
          required
          :placeholder="$t('modals.create-club.example-team-names')"
          autofocus
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton @click="ok" variant="success" :disabled="!newClubNameIsValid">
        {{ $t("erstellen") }}
      </BButton>
      <BButton v-if="!preventClosing" @click="cancel" variant="danger">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import ClubService from "@/services/ClubService";

/**
 * @module Modal:CreateClubModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newClubName=null
 *
 * @vue-prop {Boolean} [preventClosing=false]
 *
 * @vue-computed {Boolean} newClubNameIsValid
 * @vue-computed {String|null} newClubNameStateFeedback
 *
 * @vue-event {string} clubCreated
 *
 * @example
 * <template>
 *  <CreateClubModal ref="createClubModal" @clubCreated="handler" />
 *  <Button @click="() => $refs.createClubModal.open()" />
 * </template>
 * @example
 * <template>
 *  <CreateClubModal :preventClosing="true" ref="createClubModal" @clubCreated="handler" />
 *  <Button @click="() => $refs.createClubModal.open()" />
 * </template>
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
      this.$refs.modal.show();
    },
    close() {
      this.$refs.modal.hide();
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
