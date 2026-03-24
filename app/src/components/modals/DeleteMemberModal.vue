<template>
  <BModal
    ref="modal"
    :id="`modal-deleteMember-${id}`"
    :title="$t('modals.delete-member.teilnehmer-loeschen')"
    centered
    @show="resetMemberDeleteModal"
    @ok="deleteMember"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #footer="{ ok, cancel }">
      <BButton @click="ok" variant="danger">{{ $t("loeschen") }}</BButton>
      <BButton @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import MemberService from "@/services/MemberService";

/**
 * @module Modal:DeleteMemberModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} deleteMemberId=null
 *
 * @vue-event {string} memberDeleted
 *
 * @example
 * <template>
 *  <DeleteMemberModal ref="deleteMemberModal" @memberDeleted="handler" />
 *  <Button @click="() => $refs.deleteMemberModal.open('abc')" />
 * </template>
 */
export default {
  name: "DeleteMemberModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteMemberId: null,
  }),
  methods: {
    open(deleteMemberId) {
      this.deleteMemberId = deleteMemberId;
      this.$refs.modal.show();
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
