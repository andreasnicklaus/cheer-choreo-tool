<template>
  <b-container id="teamView" data-view>
    <EditableNameHeading
      name="Team"
      :value="teams?.find((t) => t.id == teamId)?.name"
      class="mb-3"
      @input="onNameEdit"
    />

    <b-row align-h="between" class="px-3 mb-4">
      <b-col>
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
      </b-col>
      <b-col cols="auto">
        <b-button-group>
          <b-button
            :variant="presentation == 'table' ? 'primary' : 'outline-primary'"
            @click="() => (presentation = 'table')"
            v-b-tooltip.hover
            title="Tabelle"
          >
            <b-icon-table />
          </b-button>
          <b-button
            :variant="presentation == 'list' ? 'primary' : 'outline-primary'"
            @click="() => (presentation = 'list')"
            v-b-tooltip.hover
            title="Liste"
          >
            <b-icon-list-ul />
          </b-button>
        </b-button-group>

        <b-dropdown
          right
          no-caret
          variant="light"
          v-b-tooltip.hover
          title="Optionen"
          class="ml-2"
        >
          <template #button-content>
            <b-icon-three-dots-vertical />
          </template>
          <b-dropdown-item
            @click="
              () =>
                $refs.deleteSeasonTeamModal.open(
                  currentTeam.SeasonTeams[seasonTabIndex].id
                )
            "
            :disabled="!currentTeam"
          >
            <b-icon-trash class="mr-2" />
            Season löschen
          </b-dropdown-item>
          <b-dropdown-item
            @click="() => $refs.deleteTeamModal.open(teamId)"
            :disabled="!currentTeam"
            variant="danger"
          >
            <b-icon-trash class="mr-2" />
            Team löschen
          </b-dropdown-item>
        </b-dropdown>
      </b-col>
    </b-row>

    <b-tabs fill v-model="seasonTabIndex">
      <b-tab
        v-for="seasonTeam in currentTeam?.SeasonTeams"
        :key="seasonTeam.id"
        lazy
      >
        <template #title>
          {{ seasonTeam?.Season?.name }}
          <span class="text-muted ml-2">
            (<b-icon-person /> {{ seasonTeam.Members.length }})
          </span>
        </template>
        <b-table
          v-if="presentation == 'table'"
          :items="
            sortedMembersOfCurrentTeam.map((m) => ({ ...m, actions: null }))
          "
          :fields="tableFields"
          stacked="md"
        >
          <template #cell(actions)="data">
            <b-button-group>
              <b-button
                variant="outline-success"
                @click="editMember(data.item.id)"
              >
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
              {{ member.name }}
              {{ member.nickname ? `(${member.nickname})` : "" }}
            </div>
            <div>
              <b-badge
                v-if="member.abbreviation"
                variant="primary"
                class="mr-4"
              >
                {{ member.abbreviation }}
              </b-badge>
              <b-button-group>
                <b-button
                  variant="outline-success"
                  @click="editMember(member.id)"
                >
                  <b-icon-pen />
                </b-button>
                <b-button
                  variant="outline-danger"
                  @click="requestMemberRemoval(member.id)"
                >
                  <b-icon-trash />
                </b-button>
              </b-button-group>
            </div>
          </b-list-group-item>
        </b-list-group>

        <p
          class="text-muted text-center"
          v-if="sortedMembersOfCurrentTeam.length == 0"
        >
          Dieses Team hat noch keine Mitglieder...
        </p>

        <b-button
          block
          class="my-3"
          variant="success"
          @click="
            () => {
              editMemberId = null;
              openMemberModal();
            }
          "
        >
          <b-icon-plus />
          Hinzufügen
        </b-button>

        <b-button
          block
          class="my-3"
          variant="outline-success"
          @click="
            () => {
              $refs.importMemberModal.open();
            }
          "
        >
          <b-icon-box-arrow-in-right />
          Importieren
        </b-button>
      </b-tab>
      <template #tabs-end>
        <b-button
          v-b-tooltip.hover
          title="Neue Season anfangen"
          variant="success"
          @click="() => $refs.createSeasonModal.open(currentTeam.id)"
        >
          <b-icon-plus />
        </b-button>
      </template>
    </b-tabs>

    <CreateMemberModal
      ref="createMemberModal"
      :currentTeam="currentTeam"
      :editMemberId="editMemberId"
      :seasonTabIndex="seasonTabIndex"
      @memberCreated="onMemberCreation"
      @memberUpdated="onMemberUpdate"
    />

    <DeleteMemberModal
      ref="deleteMemberModal"
      @memberDeleted="onMemberDeletion"
    />

    <DeleteTeamModal ref="deleteTeamModal" @teamDeleted="onTeamDeletion" />

    <CreateSeasonModal
      ref="createSeasonModal"
      :teams="teams"
      @seasonTeamCreated="onSeasonTeamCreation"
    />

    <DeleteSeasonTeamModal
      ref="deleteSeasonTeamModal"
      @seasonTeamDeleted="onSeasonTeamDeletion"
    />

    <ImportMemberModal
      ref="importMemberModal"
      :teams="teams"
      :currentTeamId="teamId"
      :currentSeasonTeamId="currentTeam?.SeasonTeams[this.seasonTabIndex]?.id"
      @import="onMemberImport"
    />
  </b-container>
</template>

<script>
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import CreateMemberModal from "@/components/modals/CreateMemberModal.vue";
import CreateSeasonModal from "@/components/modals/CreateSeasonModal.vue";
import DeleteMemberModal from "@/components/modals/DeleteMemberModal.vue";
import DeleteSeasonTeamModal from "@/components/modals/DeleteSeasonTeamModal.vue";
import DeleteTeamModal from "@/components/modals/DeleteTeamModal.vue";
import ImportMemberModal from "@/components/modals/ImportMemberModal.vue";
import TeamService from "@/services/TeamService";

export default {
  name: "TeamView",
  components: {
    EditableNameHeading,
    CreateMemberModal,
    DeleteMemberModal,
    DeleteTeamModal,
    CreateSeasonModal,
    DeleteSeasonTeamModal,
    ImportMemberModal,
  },
  data: () => ({
    presentation: "table",
    teamId: null,
    teams: [],
    seasonTabIndex: 0,
    tableFields: [
      { key: "name", sortable: true },
      { key: "nickname", label: "Spitzname", sortable: true },
      { key: "abbreviation", label: "Abkürzung", sortable: true },
      { key: "actions", label: "", class: "text-right" },
    ],
    editMemberId: null,
  }),
  mounted() {
    this.load();
  },
  computed: {
    currentTeam() {
      if (!this.teamId || !this.teams) return null;

      return this.teams.find((t) => t.id == this.teamId);
    },
    sortedMembersOfCurrentTeam() {
      if (!this.currentTeam?.SeasonTeams[this.seasonTabIndex]?.Members)
        return [];
      return [
        ...this.currentTeam?.SeasonTeams[this.seasonTabIndex].Members,
      ].sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  methods: {
    load() {
      return TeamService.getAll().then((teams) => {
        this.teams = teams.map((t) => ({
          ...t,
          SeasonTeams: t.SeasonTeams.sort(
            (a, b) => b.Season.year - a.Season.year
          ),
        }));
      });
    },
    onNameEdit(nameNew) {
      this.currentTeam.name = nameNew;
      TeamService.setName(this.teamId, nameNew).then((team) => {
        const teamCopy = this.teams.filter((t) => t.id != this.currentTeam.id);
        teamCopy.push(team);
        this.teams = teamCopy;
      });
    },
    onMemberCreation(member) {
      this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.push(member);
      this.editMemberId = null;
    },
    onMemberUpdate(member) {
      const membersCopy = this.currentTeam.SeasonTeams[
        this.seasonTabIndex
      ].Members.filter((m) => m.id != this.editMemberId);
      membersCopy.push(member);
      this.currentTeam.SeasonTeams[this.seasonTabIndex].Members = membersCopy;
      this.editMemberId = null;
    },
    requestMemberRemoval(id) {
      this.$refs.deleteMemberModal.open(id);
    },
    onMemberDeletion(memberId) {
      this.currentTeam.SeasonTeams[this.seasonTabIndex].Members =
        this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.filter(
          (m) => m.id != memberId
        );
    },
    editMember(id) {
      this.editMemberId = id;
      this.openMemberModal();
    },
    openMemberModal() {
      this.$nextTick(() => {
        this.$refs.createMemberModal.open();
      });
    },
    onTeamDeletion(teamId) {
      this.teams = this.teams.filter((t) => t.id != teamId);
      if (this.teams.length > 0)
        this.$router
          .push({
            name: "Team",
            params: { teamId: this.teams[0].id },
          })
          .catch(() => {});
      else this.$router.push({ name: "Start" }).catch(() => {});
    },
    onSeasonTeamCreation() {
      this.load();
    },
    onSeasonTeamDeletion() {
      this.load();
    },
    onMemberImport(newMembers) {
      console.table(newMembers);
      this.currentTeam?.SeasonTeams[this.seasonTabIndex]?.Members.push(
        ...newMembers
      );
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
  metaInfo() {
    return {
      title: this.currentTeam?.name || "Team",
      meta: [
        {
          vmid: "description",
          name: "description",
          content: "Bearbeite deine Teams und deren Mitglieder!",
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: "Bearbeite deine Teams und deren Mitglieder!",
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: "Bearbeite deine Teams und deren Mitglieder!",
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: (this.currentTeam?.name || "Team") + " - Choreo Planer | Das kostenlose Online-Tool für Choreo-Sport",
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: (this.currentTeam?.name || "Team") + " - Choreo Planer | Das kostenlose Online-Tool für Choreo-Sport",
        },
      ],
    };
  },
};
</script>
