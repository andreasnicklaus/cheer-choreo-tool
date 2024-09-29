<template>
  <b-container class="team">
    <EditableNameHeading
      name="Team"
      :value="teams?.find((t) => t.id == teamId)?.name"
      class="mb-3"
      @input="onNameEdit"
    />

    <b-row align-h="between" class="px-3 mb-4">
      <b-dropdown
        :text="teams.find((t) => t.id == teamId)?.name || 'Wähle ein Team'"
        variant="outline-primary"
      >
        <b-dropdown-item
          v-for="team in teams"
          :key="team.id"
          :to="{ name: 'Team', params: { teamId: team.id } }"
          :variant="team.id == teamId ? 'primary' : 'outline-primary'"
        >
          {{ team.name }}
        </b-dropdown-item>
      </b-dropdown>

      <b-button-group>
        <b-button
          :variant="presentation == 'table' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'table')"
        >
          <b-icon-table />
        </b-button>
        <b-button
          :variant="presentation == 'list' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'list')"
        >
          <b-icon-list-ul />
        </b-button>
        <b-button
          :variant="presentation == 'grid' ? 'primary' : 'outline-primary'"
          @click="() => (presentation = 'grid')"
        >
          <b-icon-grid />
        </b-button>
      </b-button-group>
    </b-row>

    <b-table
      v-if="presentation == 'table'"
      :items="sortedMembersOfCurrentTeam.map((m) => ({ ...m, actions: null }))"
      :fields="tableFields"
    >
      <template #cell(color)="data">
        <b-form-input
          type="color"
          :value="data.value"
          @change="(value) => setColor(data.item.id, value)"
        />
      </template>
      <template #cell(actions)="data">
        <b-button-group>
          <b-button variant="outline-success" @click="editMember(data.item.id)">
            <b-icon-pen />
          </b-button>
          <b-button
            variant="outline-danger"
            @click="requestMemberRemoval(data.item.id)"
          >
            <b-icon-trash />
          </b-button>
        </b-button-group>
      </template>
    </b-table>

    <b-list-group v-if="presentation == 'list'">
      <b-list-group-item
        v-for="member in sortedMembersOfCurrentTeam"
        :key="member.id"
        class="d-flex justify-content-between align-items-center"
      >
        <div class="d-flex justify-content-between align-items-center">
          <div
            class="mr-2 d-inline-block"
            :style="{
              height: '24px',
              width: '24px',
              backgroundColor: member.color + '55',
              borderRadius: '50%',
              border: 'solid 2px ' + member.color,
            }"
          ></div>
          {{ member.name }} {{ member.nickname ? `(${member.nickname})` : "" }}
        </div>
        <b-badge v-if="member.abbreviation" variant="primary">{{
          member.abbreviation
        }}</b-badge>
      </b-list-group-item>
    </b-list-group>

    <b-row v-if="presentation == 'grid'">
      <b-col v-for="member in sortedMembersOfCurrentTeam" :key="member.id">
        <b-card variant="primary" :title="member.name" class="w-100 h-100">
          <b-card-text
            class="d-flex justify-content-between align-items-center"
          >
            <div class="d-flex justify-content-between align-items-center">
              <div
                class="mr-2 d-inline-block"
                :style="{
                  height: '24px',
                  width: '24px',
                  backgroundColor: member.color + '55',
                  borderRadius: '50%',
                  border: 'solid 2px ' + member.color,
                }"
              ></div>
              {{ member.nickname }}
            </div>
            <b-badge v-if="member.abbreviation" variant="primary">
              {{ member.abbreviation }}
            </b-badge>
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>

    <p
      class="text-muted text-center"
      v-if="sortedMembersOfCurrentTeam.length == 0"
    >
      Dieses Team hat noch keine Mitglieder...
    </p>

    <b-button
      block
      class="my-3"
      variant="outline-success"
      v-b-modal.modal-newMember
    >
      Hinzufügen
      <b-icon-plus />
    </b-button>

    <b-modal
      id="modal-newMember"
      title="Neues Mitglied"
      centered
      @show="resetMemberModal"
      @hidden="resetMemberModal"
      @ok="saveMember"
    >
      <b-form>
        <b-form-group
          label="Name:"
          :state="Boolean(newMemberName) && newMemberName.trim().length > 0"
          :invalid-feedback="'erforderlich'"
        >
          <b-form-input
            v-model="newMemberName"
            placeholder="Name"
            autofocus
            required
            :state="Boolean(newMemberName) && newMemberName.trim().length > 0"
          />
        </b-form-group>
        <b-form-group label="Spitzname:" :state="true">
          <b-form-input
            v-model="newMemberNickname"
            placeholder="Spitzname"
            :state="true"
          />
        </b-form-group>
        <b-form-group label="Abkürzung:" :state="abbreviationIsValid">
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
        <b-form-group label="Farbe:">
          <b-form-input v-model="newMemberColor" type="color" />
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
        <b-button @click="cancel" variant="danger">Abbrechen</b-button>
      </template>
    </b-modal>

    <b-modal
      id="modal-deleteMember"
      title="Teilnehmer löschen?"
      centered
      @hidden="resetMemberDeleteModal"
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
  </b-container>
</template>

<script>
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import ColorService from "@/services/ColorService";
import MemberService from "@/services/MemberService";
import TeamService from "@/services/TeamService";

export default {
  name: "TeamView",
  components: { EditableNameHeading },
  data: () => ({
    presentation: "table",
    teamId: null,
    teams: [],
    tableFields: [
      { key: "name", sortable: true },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "color", label: "Farbe" },
      { key: "actions", label: "" },
    ],
    newMemberName: null,
    newMemberNickname: null,
    newMemberAbbreviation: null,
    newMemberColor: null,
    editMemberId: null,
    deleteMemberId: null,
  }),
  mounted() {
    TeamService.getAll().then((teams) => {
      this.teams = teams;
    });
  },
  computed: {
    currentTeam() {
      if (!this.teamId || !this.teams) return null;

      return this.teams.find((t) => t.id == this.teamId);
    },
    sortedMembersOfCurrentTeam() {
      if (!this.currentTeam?.Members) return [];
      return [...this.currentTeam?.Members].sort((a, b) =>
        a.name.localeCompare(b.name)
      );
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
          !this.sortedMembersOfCurrentTeam
            .map((m) => m.abbreviation)
            .includes(proposal)
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
          ? !this.currentTeam.Members.filter((m) => m.id != this.editMemberId)
              .map((m) => m.abbreviation)
              .includes(this.newMemberAbbreviation)
          : this.proposedAbbreviation != -1
      );
    },
  },
  methods: {
    onNameEdit(nameNew) {
      this.currentTeam.name = nameNew;
      TeamService.setName(this.teamId, nameNew).then((team) => {
        const teamCopy = this.teams.filter((t) => t.id != this.currentTeam.id);
        teamCopy.push(team);
        this.teams = teamCopy;
      });
    },
    setColor(memberId, value) {
      this.currentTeam.Members.find((m) => m.id == memberId).color = value;
      MemberService.setColor(memberId, value);
    },
    resetMemberModal() {
      if (!this.editMemberId) {
        this.newMemberName = null;
        this.newMemberNickname = null;
        this.newMemberAbbreviation = null;
        this.newMemberColor = ColorService.getRandom();
      } else {
        const memberToUpdate = this.currentTeam.Members.find(
          (m) => m.id == this.editMemberId
        );
        this.newMemberName = memberToUpdate.name;
        this.newMemberNickname = memberToUpdate.nickname;
        this.newMemberAbbreviation = memberToUpdate.abbreviation;
        this.newMemberColor = memberToUpdate.color;
      }
    },
    saveMember() {
      if (!this.editMemberId)
        MemberService.create(
          this.newMemberName.trim(),
          this.newMemberNickname?.trim(),
          this.newMemberAbbreviation.trim() || this.proposedAbbreviation,
          this.newMemberColor || ColorService.getRandom(),
          this.teamId
        ).then((member) => {
          this.currentTeam.Members.push(member);
        });
      else {
        const data = {
          name: this.newMemberName.trim(),
          nickname: this.newMemberNickname?.trim(),
          abbreviation:
            this.newMemberAbbreviation.trim() || this.proposedAbbreviation,
          color: this.newMemberColor || ColorService.getRandom(),
        };
        MemberService.update(this.editMemberId, data).then((member) => {
          const membersCopy = this.currentTeam.Members.filter(
            (m) => m.id != this.editMemberId
          );
          membersCopy.push(member);
          this.currentTeam.Members = membersCopy;
        });
      }
    },
    requestMemberRemoval(id) {
      this.deleteMemberId = id;
      this.$bvModal.show("modal-deleteMember");
    },
    resetMemberDeleteModal() {
      this.deleteMemberId = null;
    },
    deleteMember() {
      MemberService.remove(this.deleteMemberId).then(() => {
        this.currentTeam.Members = this.currentTeam.Members.filter(
          (m) => m.id != this.deleteMemberId
        );
        this.deleteMemberId = null;
      });
    },
    editMember(id) {
      this.editMemberId = id;
      this.$bvModal.show("modal-newMember");
    },
  },
  watch: {
    "$route.params": {
      handler() {
        this.teamId = this.$route.params.teamId;
      },
      immediate: true,
    },
  },
};
</script>
