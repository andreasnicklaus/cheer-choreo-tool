<template>
  <BModal
    :id="`modal-newMember-${id}`"
    ref="modal"
    :title="
      editMemberId
        ? $t('modals.create-member.mitglied-bearbeiten')
        : $t('modals.create-member.neues-mitglied')
    "
    centered
    @show="resetMemberModal"
    @hidden="resetMemberModal"
    @ok="saveMember"
  >
    <BForm>
      <BRow>
        <BCol cols="7">
          <BFormGroup
            :label="$t('name')"
            label-class="label-with-colon"
            :state="newMemberNameIsValid"
            :invalid-feedback="newMemberNameStateFeedback"
          >
            <BFormInput
              v-model="newMemberName"
              :placeholder="$t('name')"
              autofocus
              required
              :state="newMemberNameIsValid"
            />
          </BFormGroup>
        </BCol>
        <BCol>
          <BFormGroup
            :label="$t('abkuerzung')"
            label-class="label-with-colon"
            :state="abbreviationIsValid"
            :invalid-feedback="abbreviationStateFeedback"
          >
            <BFormInput
              v-model="newMemberAbbreviation"
              :placeholder="
                proposedAbbreviation == -1 || !proposedAbbreviation
                  ? $t('abkuerzung')
                  : proposedAbbreviation
              "
              :state="abbreviationIsValid"
            />
          </BFormGroup>
        </BCol>
      </BRow>
      <BFormGroup
        :label="$t('spitzname')"
        label-class="label-with-colon"
        :state="true"
      >
        <BFormInput
          v-model="newMemberNickname"
          :placeholder="$t('spitzname')"
          :state="true"
        />
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="success"
        :disabled="!newMemberName || !abbreviationIsValid"
        @click="ok"
      >
        {{ $t("speichern") }}
      </BButton>
      <BButton variant="danger" @click="cancel">{{ $t("abbrechen") }}</BButton>
    </template>
  </BModal>
</template>

<script>
import MemberService from "@/services/MemberService";

/**
 * @module Modal:CreateMemberModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newMemberName=null
 * @vue-data {String|null} newMemberNickname=null
 * @vue-data {String|null} newMemberAbbreviation=null
 *
 * @vue-prop {Object} currentTeam
 * @vue-prop {String} editMemberId
 * @vue-prop {Number} [seasonTabIndex=0]
 *
 * @vue-computed {Boolean} newMemberNameIsValid
 * @vue-computed {String|null} newMemberNameStateFeedback
 * @vue-computed {String|null} proposedAbbreviation
 * @vue-computed {Boolean} abbreviationIsValid
 * @vue-computed {String|null} abbreviationStateFeedback
 *
 * @vue-event {Object} memberCreated
 * @vue-event {Object} memberUpdated
 *
 * @example
 * <template>
 *  <CreateMemberModal :currentTeam="team" :editMemberId="'memberId'" @memberCreated="handler" @memberUpdated="handler" />
 *  <Button @click="() => $refs.createMemberModal.open()" />
 * </template>
 * @example
 * <template>
 *  <CreateMemberModal ref="createMemberModal" :currentTeam="team" :editMemberId="'memberId'" :seasonTeamIndex="0" @memberCreated="handler" @memberUpdated="handler" />
 *  <Button @click="() => $refs.createMemberModal.open()" />
 * </template>
 */
export default {
  name: "CreateMemberModal",
  props: {
    currentTeam: {
      type: Object,
      default: null,
    },
    editMemberId: {
      type: String,
      default: null,
    },
    seasonTabIndex: {
      type: Number,
      default: 0,
    },
  },
  emits: ["memberCreated", "memberUpdated"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newMemberName: null,
    newMemberNickname: null,
    newMemberAbbreviation: null,
  }),
  computed: {
    newMemberNameIsValid() {
      return (
        Boolean(this.newMemberName) && this.newMemberName.trim().length > 0
      );
    },
    newMemberNameStateFeedback() {
      if (!this.newMemberName || this.newMemberName.trim().length <= 0)
        return this.$t("erforderlich");
      return null;
    },
    proposedAbbreviation() {
      if (!this.newMemberName) return null;
      let abbreviationFound = false;
      let result = null;
      let substringLength = 1;
      while (!abbreviationFound) {
        const proposal = this.newMemberName
          .split(" ")
          .filter((s) => s)
          .map((s) => s.substring(0, substringLength).toUpperCase())
          .join("");
        if (
          !this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.map(
            (m) => m.abbreviation
          ).includes(proposal)
        ) {
          result = proposal;
          abbreviationFound = true;
        } else if (proposal.length <= substringLength) {
          result = -1;
          abbreviationFound = true;
        } else substringLength++;
      }
      return result;
    },
    abbreviationIsValid() {
      return Boolean(
        this.newMemberAbbreviation
          ? !this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.filter(
              (m) => m.id != this.editMemberId
            )
              .map((m) => m.abbreviation)
              .includes(this.newMemberAbbreviation)
          : this.proposedAbbreviation != -1
      );
    },
    abbreviationStateFeedback() {
      if (!this.newMemberAbbreviation && this.proposedAbbreviation == -1)
        return this.$t(
          "modals.create-member.es-konnte-keine-abkuerzung-automatisch-erstellt-werden"
        );
      if (
        this.newMemberAbbreviation &&
        this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.filter(
          (m) => m.id != this.editMemberId
        )
          .map((m) => m.abbreviation)
          .includes(this.newMemberAbbreviation)
      )
        return this.$t(
          "modals.create-member.es-existiert-bereits-ein-mitglied-mit-dieser-abkuerzung"
        );
      return null;
    },
  },
  methods: {
    open() {
      this.$refs.modal.show();
    },
    resetMemberModal() {
      if (!this.editMemberId) {
        this.newMemberName = null;
        this.newMemberNickname = null;
        this.newMemberAbbreviation = null;
      } else {
        const memberToUpdate = this.currentTeam.SeasonTeams[
          this.seasonTabIndex
        ].Members.find((m) => m.id == this.editMemberId);
        this.newMemberName = memberToUpdate.name;
        this.newMemberNickname = memberToUpdate.nickname;
        this.newMemberAbbreviation = memberToUpdate.abbreviation;
      }
    },
    saveMember() {
      if (!this.editMemberId)
        MemberService.create(
          this.newMemberName?.trim(),
          this.newMemberNickname?.trim(),
          this.newMemberAbbreviation?.trim() || this.proposedAbbreviation,
          this.currentTeam.SeasonTeams[this.seasonTabIndex].id
        ).then((member) => {
          this.$emit("memberCreated", member);
        });
      else {
        const data = {
          name: this.newMemberName.trim(),
          nickname: this.newMemberNickname?.trim(),
          abbreviation:
            this.newMemberAbbreviation?.trim() || this.proposedAbbreviation,
        };
        MemberService.update(this.editMemberId, data).then((member) => {
          this.$emit("memberUpdated", member);
        });
      }
    },
  },
};
</script>
