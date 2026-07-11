<template>
  <BModal
    :id="`modal-deleteMember-${id}`"
    ref="modal"
    :title="$t('modals.delete-member.teilnehmer-loeschen')"
    centered
    @hidden="resetMemberDeleteModal"
    @ok="deleteMember"
  >
    <p class="m-0">{{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}</p>
    <template #footer="{ ok, cancel }">
      <BButton variant="danger" @click="ok">{{ $t("loeschen") }}</BButton>
      <BButton variant="light" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import MemberService from "@/services/MemberService";
import { defineComponent } from "vue";
import { BModal } from "bootstrap-vue-next";

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
export default defineComponent({
  name: "DeleteMemberModal",
  emits: ["memberDeleted"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    deleteMemberId: null as string | null,
  }),
  methods: {
    open(deleteMemberId: string) {
      this.deleteMemberId = deleteMemberId;
      (this.$refs.modal as InstanceType<typeof BModal>).show();
    },
    resetMemberDeleteModal() {
      this.deleteMemberId = null;
    },
    deleteMember() {
      MemberService.remove(this.deleteMemberId!).then(() => {
        this.$emit("memberDeleted", this.deleteMemberId);
      });
    },
  },
});
</script>
