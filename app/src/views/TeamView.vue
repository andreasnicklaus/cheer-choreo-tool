<template>
  <BContainer id="teamView" data-view>
    <EditableNameHeading
      :name="$t('team')"
      :value="teams?.find((t) => t.id == teamId)?.name"
      class="mb-3"
      @input="onNameEdit"
    />

    <BRow align-h="between" class="px-3 mb-4">
      <BCol>
        <BDropdown
          :text="
            teams.find((t) => t.id == teamId)?.name ||
            $t('teamView.waehle-ein-team')
          "
          variant="outline-primary"
        >
          <BDropdownItem
            v-for="team in teams"
            :key="team.id"
            :to="{
              name: 'Team',
              params: { teamId: team.id, locale: $i18n.locale },
            }"
            :variant="team.id == teamId ? 'primary' : 'outline-primary'"
          >
            {{ team.name }}
          </BDropdownItem>
        </BDropdown>
      </BCol>
      <BCol cols="auto">
        <BButtonGroup>
          <BButton
            :variant="presentation == 'table' ? 'primary' : 'outline-primary'"
            @click="() => setPresentation('table')"
          >
            <IBiTable />
          </BButton>
          <BButton
            :variant="presentation == 'list' ? 'primary' : 'outline-primary'"
            @click="() => setPresentation('list')"
          >
            <IBiListUl />
          </BButton>
        </BButtonGroup>

        <BDropdown
          right
          no-caret
          variant="light"
          v-b-tooltip.hover="$t('optionen')"
          class="ms-2"
          :style="{ display: 'inline' }"
          data-testid="options-dropdown"
        >
          <template #button-content>
            <IBiThreeDotsVertical />
          </template>
          <BDropdownItem
            @click="
              () =>
                $refs.deleteSeasonTeamModal.open(
                  currentTeam.SeasonTeams[seasonTabIndex].id
                )
            "
            :disabled="!currentTeam"
          >
            <IBiTrash class="me-2" />
            {{ $t("teamView.season-loeschen") }}
          </BDropdownItem>
          <BDropdownItem
            @click="() => $refs.deleteTeamModal.open(teamId)"
            :disabled="!currentTeam"
            variant="danger"
          >
            <IBiTrash class="me-2" />
            {{ $t("teamView.team-loeschen") }}
          </BDropdownItem>
        </BDropdown>
      </BCol>
    </BRow>

    <BTabs
      v-if="currentTeam"
      fill
      :index="seasonTabIndex"
      @update:index="updateSeasonTabIndex"
    >
      <BTab v-for="seasonTeam in currentTeam?.SeasonTeams" :key="seasonTeam.id">
        <template #title>
          {{ seasonTeam?.Season?.name }}
          <span class="text-muted ms-2">
            (<IBiPerson /> {{ seasonTeam.Members.length }})
          </span>
        </template>
        <BTable
          v-if="presentation == 'table'"
          :key="`table-${seasonTabIndex}-${sortedMembersOfCurrentTeam.length}`"
          :items="
            sortedMembersOfCurrentTeam.map((m) => ({ ...m, actions: null }))
          "
          :fields="tableFields"
          stacked="md"
        >
          <template #cell(actions)="data">
            <BButtonGroup>
              <BButton
                variant="outline-success"
                @click="editMember(data.item.id)"
              >
                <IBiPen />
              </BButton>
              <BButton
                variant="outline-danger"
                @click="requestMemberRemoval(data.item.id)"
              >
                <IBiTrash />
              </BButton>
            </BButtonGroup>
          </template>
        </BTable>

        <BListGroup
          v-if="presentation == 'list'"
          :key="`list-${seasonTabIndex}-${sortedMembersOfCurrentTeam.length}`"
        >
          <BListGroupItem
            v-for="member in sortedMembersOfCurrentTeam"
            :key="member.id"
            class="d-flex justify-content-between align-items-center"
          >
            <div class="d-flex justify-content-between align-items-center">
              {{ member.name }}
              {{ member.nickname ? `(${member.nickname})` : "" }}
            </div>
            <div>
              <BBadge v-if="member.abbreviation" variant="primary" class="me-4">
                {{ member.abbreviation }}
              </BBadge>
              <BButtonGroup>
                <BButton
                  variant="outline-success"
                  @click="editMember(member.id)"
                >
                  <IBiPen />
                </BButton>
                <BButton
                  variant="outline-danger"
                  @click="requestMemberRemoval(member.id)"
                >
                  <IBiTrash />
                </BButton>
              </BButtonGroup>
            </div>
          </BListGroupItem>
        </BListGroup>

        <p
          class="text-muted text-center"
          v-if="sortedMembersOfCurrentTeam.length == 0"
        >
          {{ $t("teamView.dieses-team-hat-noch-keine-mitglieder") }}
        </p>

        <div class="d-grid gap-2">
          <BButton
            class="my-3"
            variant="success"
            @click="
              () => {
                editMemberId = null;
                openMemberModal();
              }
            "
          >
            <IBiPlus />
            {{ $t("teamView.hinzufuegen") }}
          </BButton>

          <BButton
            class="my-3"
            variant="outline-success"
            @click="
              () => {
                $refs.importMemberModal.open();
              }
            "
          >
            <IBiBoxArrowInRight />
            {{ $t("teamView.importieren") }}
          </BButton>
        </div>
      </BTab>
      <template #tabs-end>
        <BButton
          v-b-tooltip.hover="$t('teamView.neue-season-anfangen')"
          variant="success"
          @click="() => $refs.createSeasonModal.open(currentTeam.id)"
        >
          <IBiPlus />
        </BButton>
      </template>
    </BTabs>

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
      :currentSeasonTeamId="currentTeam?.SeasonTeams[seasonTabIndex]?.id"
      @import="onMemberImport"
    />
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import CreateMemberModal from "@/components/modals/CreateMemberModal.vue";
import CreateSeasonModal from "@/components/modals/CreateSeasonModal.vue";
import DeleteMemberModal from "@/components/modals/DeleteMemberModal.vue";
import DeleteSeasonTeamModal from "@/components/modals/DeleteSeasonTeamModal.vue";
import DeleteTeamModal from "@/components/modals/DeleteTeamModal.vue";
import ImportMemberModal from "@/components/modals/ImportMemberModal.vue";
import TeamService from "@/services/TeamService";
import ERROR_CODES from "@/utils/error_codes";
import { error } from "@/utils/logging";

/**
 * @vue-data {string} presentation=table - The current presentation mode, either 'table' or 'list'.
 * @vue-data {string|null} teamId=null - The ID of the currently selected team.
 * @vue-data {Array} teams - An array of all teams.
 * @vue-data {number} seasonTabIndex=0 - The index of the currently selected season tab.
 * @vue-data {Array} tableFields - The fields to display in the team members table.
 * @vue-data {number|null} editMemberId=null - The ID of the member currently being edited, or null if no member is being edited.
 *
 * @vue-computed {Object|null} currentTeam - The currently selected team based on `teamId`.
 * @vue-computed {Array} sortedMembersOfCurrentTeam - An array of members of the current team, sorted by name.
 *
 * @vue-computed {MetaInfo} metaInfo
 */

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
  data: function () {
    return {
      presentation: "table",
      teamId: null,
      teams: [],
      seasonTabIndex: 0,
      editMemberId: null,
    };
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  mounted() {
    this.load();

    useHead({
      title: computed(() => this.currentTeam?.name || this.t("team", 1)),
      meta: [
        {
          name: "description",
          content: computed(() => this.t("meta.teamView.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => this.t("meta.teamView.description")),
        },
        {
          property: "og:description",
          content: computed(() => this.t("meta.teamView.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              `${this.currentTeam?.name || "Team"} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              `${this.currentTeam?.name || "Team"} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
      ],
    });
  },
  computed: {
    tableFields() {
      return [
        { key: "name", sortable: true },
        { key: "nickname", label: this.$t("spitzname"), sortable: true },
        { key: "abbreviation", label: this.$t("abkuerzung"), sortable: true },
        { key: "actions", label: "", class: "text-right" },
      ];
    },
    currentTeam() {
      if (!this.teamId || !this.teams) return null;

      return this.teams.find((t) => t.id == this.teamId);
    },
    sortedMembersOfCurrentTeam() {
      // Explicitly access currentTeam to ensure Vue tracks it as a dependency
      const team = this.currentTeam;
      if (
        !team ||
        !team.SeasonTeams ||
        !team.SeasonTeams[this.seasonTabIndex]
      ) {
        return [];
      }

      const members = team.SeasonTeams[this.seasonTabIndex].Members;
      if (!members || members.length === 0) {
        return [];
      }

      // Create a new array and sort it
      return [...members].sort((a, b) => a.name.localeCompare(b.name));
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
        if (!team.SeasonTeams)
          team.SeasonTeams =
            this.teams.find((t) => t.id == team.id)?.SeasonTeams || [];
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
    onMemberDeletion(MemberId) {
      this.currentTeam.SeasonTeams[this.seasonTabIndex].Members =
        this.currentTeam.SeasonTeams[this.seasonTabIndex].Members.filter(
          (m) => m.id != MemberId
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
            params: {
              teamId: this.teams[0].id,
              locale: this.$i18n.locale,
            },
          })
          .catch(() => {
            error(
              "Redundant navigation to team",
              ERROR_CODES.REDUNDANT_ROUTING
            );
          });
      else
        this.$router
          .push({
            name: "Start",
            params: { locale: this.$i18n.locale },
          })
          .catch(() => {
            error(
              "Redundant navigation to start",
              ERROR_CODES.REDUNDANT_ROUTING
            );
          });
    },
    onSeasonTeamCreation() {
      this.load();
    },
    onSeasonTeamDeletion() {
      this.load();
    },
    onMemberImport(newMembers) {
      this.currentTeam?.SeasonTeams[this.seasonTabIndex]?.Members.push(
        ...newMembers
      );
    },
    updateSeasonTabIndex(newIndex) {
      this.seasonTabIndex = newIndex;
    },
    setPresentation(newPresentation) {
      this.presentation = newPresentation;
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
