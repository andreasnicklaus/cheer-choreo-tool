<template>
  <b-modal
    :id="`modal-deleteMember-${id}`"
    :title="$t('modals.delete-member.teilnehmer-loeschen')"
    centered
    @show="resetMemberDeleteModal"
    @ok="deleteMember"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger">{{ $t("loeschen") }}</b-button>
      <b-button @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </b-button>
    </template>
  </b-modal>
</template>

<script>
import MemberService from "@/services/MemberService";

export default {
  name: "DeleteMemberModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteMemberId: null,
  }),
  methods: {
    open(deleteMemberId) {
      this.$bvModal.show(`modal-deleteMember-${this.id}`);
      this.deleteMemberId = deleteMemberId;
    },
    resetMemberDeleteModal() {
      this.deleteMemberId = null;
    },
    deleteMember() {
      MemberService.remove(this.deleteMemberId).then(() => {
        this.$emit("memberDeleted", this.deleteMemberId);
      });
    },
  },
};
</script>
