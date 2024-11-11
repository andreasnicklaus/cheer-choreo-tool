<template>
  <b-modal
    :id="`modal-newMember-${id}`"
    :title="editMemberId ? 'Mitglied bearbeiten' : 'Neues Mitglied'"
    centered
    @show="resetMemberModal"
    @hidden="resetMemberModal"
    @ok="saveMember"
  >
    <b-form>
      <b-row>
        <b-col cols="7">
          <b-form-group
            label="Name:"
            :state="newMemberNameIsValid"
            :invalid-feedback="newMemberNameStateFeedback"
          >
            <b-form-input
              v-model="newMemberName"
              placeholder="Name"
              autofocus
              required
              :state="newMemberNameIsValid"
            />
          </b-form-group>
        </b-col>
        <b-col>
          <b-form-group
            label="Abkürzung:"
            :state="abbreviationIsValid"
            :invalid-feedback="abbreviationStateFeedback"
          >
            <b-form-input
              v-model="newMemberAbbreviation"
              :placeholder="
                proposedAbbreviation == -1 || !proposedAbbreviation
                  ? 'Abkürzung'
                  : proposedAbbreviation
              "
              :state="abbreviationIsValid"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-form-group label="Spitzname:" :state="true">
        <b-form-input
          v-model="newMemberNickname"
          placeholder="Spitzname"
          :state="true"
        />
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        type="submit"
        @click="ok"
        variant="success"
        :disabled="!newMemberName || !abbreviationIsValid"
      >
        Speichern
      </b-button>
      <b-button @click="cancel" variant="danger"> Abbrechen </b-button>
    </template>
  </b-modal>
</template>

<script>
import MemberService from "@/services/MemberService";

export default {
  name: "CreateMemberModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newMemberName: null,
    newMemberNickname: null,
    newMemberAbbreviation: null,
  }),
  props: {
    currentTeam: {
      type: Object,
    },
    editMemberId: {
      type: String,
    },
    seasonTabIndex: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-newMember-${this.id}`);
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
  computed: {
    newMemberNameIsValid() {
      return (
        Boolean(this.newMemberName) && this.newMemberName.trim().length > 0
      );
    },
    newMemberNameStateFeedback() {
      if (!this.newMemberName || this.newMemberName.trim().length <= 0)
        return "Erforderlich";
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
        return "Es konnte keine Abkürzung automatisch erstellt werden.";
      if (
        this.newMemberAbbreviation &&
        this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.filter(
          (m) => m.id != this.editMemberId
        )
          .map((m) => m.abbreviation)
          .includes(this.newMemberAbbreviation)
      )
        return "Es existiert bereits ein Mitglied mit dieser Abkürzung.";
      return null;
    },
  },
};
</script>
