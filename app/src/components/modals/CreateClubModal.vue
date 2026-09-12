<template>
  <BModal
    :id="`modal-newClub-${id}`"
    ref="modal"
    :title="$t('modals.create-club.neuer-verein')"
    scrollable
    :no-close-on-backdrop="preventClosing && pendingInvites.length === 0"
    :no-close-on-esc="preventClosing && pendingInvites.length === 0"
    :no-header-close="preventClosing && pendingInvites.length === 0"
    @show="resetClubModal"
    @ok="createAndSelectClub"
    @close="
      (event) => {
        if (preventClosing && pendingInvites.length === 0)
          event.preventDefault();
      }
    "
  >
    <div v-if="preventClosing && pendingInvites.length > 0" class="mb-3">
      <h6>{{ $t("modals.create-club.ausstehende-einladungen") }}</h6>
      <BListGroup>
        <BListGroupItem
          v-for="invite in pendingInvites"
          :key="invite.id"
          class="d-flex justify-content-between align-items-center"
        >
          <div>
            <strong>{{
              invite.owner?.username ||
              invite.owner?.email ||
              invite.ownerUserId
            }}</strong>
            <BBadge variant="info" class="ms-1">{{
              $t("accountView.role." + invite.role)
            }}</BBadge>
          </div>
          <BButton variant="success" size="sm" @click="acceptInvite(invite.id)">
            {{ $t("accountView.annehmen") }}
          </BButton>
        </BListGroupItem>
      </BListGroup>
      <hr />
      <p class="text-muted small mb-0">
        {{ $t("modals.create-club.oder-neuen-verein-erstellen") }}
      </p>
    </div>
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
      <BFormGroup
        v-if="showOwnerSelect"
        :label="$t('accountView.owner')"
        label-class="label-with-colon"
        :state="selectedOwnerIsValid"
        :invalid-feedback="newClubOwnerStateFeedback"
      >
        <BFormSelect
          v-model="selectedOwnerId"
          :state="selectedOwnerIsValid"
          :options="ownerOptions"
          :placeholder="$t('accountView.owner')"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        v-if="preventClosing"
        variant="link"
        @click="routeToUserSettings"
      >
        <IBiGearWideConnected class="me-1" />{{
          $t("modals.create-club.go-to-settings")
        }}
      </BButton>
      <BButton variant="success" :disabled="!newClubNameIsValid" @click="ok">
        {{ $t("erstellen") }}
      </BButton>
      <BButton
        v-if="!preventClosing || pendingInvites.length > 0"
        variant="outline-danger"
        @click="cancel"
      >
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import ClubService from "@/services/ClubService";
import UserAccessService from "@/services/UserAccessService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";
import type { OwnerAccess } from "@/types";

/**
 * @module Modal:CreateClubModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newClubName=null
 * @vue-data {String|null} selectedOwnerId=null
 *
 * @vue-prop {Boolean} [preventClosing=false]
 *
 * @vue-computed {Boolean} newClubNameIsValid
 * @vue-computed {String|null} newClubNameStateFeedback
 * @vue-computed {Array} ownerOptions
 * @vue-computed {Boolean} showOwnerSelect
 * @vue-computed {Array} pendingInvites
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
export default defineComponent({
  name: "CreateClubModal",
  props: {
    preventClosing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ["clubCreated"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newClubName: undefined as string | undefined,
    selectedOwnerId: undefined as string | undefined,
  }),
  computed: {
    newClubNameIsValid() {
      return this.newClubName != null && this.newClubName.length >= 3;
    },
    newClubNameStateFeedback() {
      if (!this.newClubName) return this.$t("erforderlich");
      if (this.newClubName.length < 3)
        return this.$t("modals.create-club.min-vereinsname-length");
      return undefined;
    },
    ownerOptions() {
      const options = this.$store.state.owners.map((o: OwnerAccess) => {
        const baseText = o.owner?.username || o.owner?.email || o.ownerUserId;
        const isYou =
          this.$store.state.me && o.ownerUserId === this.$store.state.me.id;
        return {
          value: o.ownerUserId,
          text: isYou ? `${baseText} (you)` : baseText,
        };
      });

      if (
        this.$store.state.me &&
        !options.some(
          (o: { value: string; text: string }) =>
            o.value === this.$store.state.me.id
        )
      ) {
        options.push({
          value: this.$store.state.me.id,
          text: `${this.$store.state.me.username || this.$store.state.me.email || this.$store.state.me.id} (you)`,
        });
      }

      return options;
    },
    showOwnerSelect() {
      return this.$store.state.owners.length > 0;
    },
    pendingInvites() {
      return (
        this.$store.state.me?.childAccess?.filter(
          (a: any) => !a.accepted && a.enabled
        ) || []
      );
    },
    selectedOwnerIsValid() {
      return (
        this.selectedOwnerId != null &&
        (this.$store.state.owners
          .map((o: OwnerAccess) => o.ownerUserId)
          .includes(this.selectedOwnerId) ||
          this.selectedOwnerId === this.$store.state.me?.id)
      );
    },
    newClubOwnerStateFeedback() {
      if (!this.selectedOwnerId) return this.$t("erforderlich");
      if (
        !this.$store.state.owners
          .map((o: OwnerAccess) => o.ownerUserId)
          .includes(this.selectedOwnerId) &&
        this.selectedOwnerId !== this.$store.state.me?.id
      )
        return this.$t("errors.unerwarteter-fehler");
      return undefined;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
      if (this.$store.state.me?.id) {
        this.selectedOwnerId = this.$store.state.me?.id;
      }
    },
    close() {
      (this.$refs.modal as InstanceType<typeof BModal>).hide();
    },
    resetClubModal() {
      this.newClubName = undefined;
      this.selectedOwnerId = undefined;
    },
    createAndSelectClub() {
      const ownerId = this.selectedOwnerId || null;
      ClubService.create(this.newClubName as string, ownerId).then((club) => {
        this.$store.commit("setClubId", club.id);
        this.$emit("clubCreated", club);
      });
    },
    acceptInvite(id: string) {
      UserAccessService.accept(id)
        .then(() => this.$store.dispatch("loadUserInfo"))
        .then(() => ClubService.getAll())
        .then((clubList) => {
          if (clubList.length > 0) {
            this.$store.commit("setClubId", clubList[0]?.id ?? "");
            this.$emit("clubCreated", clubList[0]);
            this.close();
          }
        });
    },
    routeToUserSettings() {
      this.close();
      this.$router.push({
        name: "Account",
        params: { locale: this.$i18n.locale },
      });
    },
  },
});
</script>
