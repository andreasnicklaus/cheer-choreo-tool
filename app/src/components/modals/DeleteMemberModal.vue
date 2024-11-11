<template>
  <b-modal
    :id="`modal-deleteMember-${id}`"
    title="Teilnehmer löschen?"
    centered
    @show="resetMemberDeleteModal"
    @ok="deleteMember"
  >
    <p class="m-0">Du kannst das nicht rückgängig machen.</p>
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger"> Löschen </b-button>
      <b-button @click="cancel" variant="outline-secondary">
        Abbrechen
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
