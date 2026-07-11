<template>
  <BContainer id="teamView" data-view>
    <EditableNameHeading
      :name="$t('team')"
      :value="teams?.find((t) => t.id == teamId)?.name"
      :class="me?.id != currentTeam?.UserId ? 'mb-0' : 'mb-3'"
      @input="onNameEdit"
    />
    <BPlaceholderWrapper :loading="!currentTeam">
      <template #loading>
        <BPlaceholder width="25%" class="mb-4" animation="wave" />
      </template>
      <p
        v-show="accessSharingEnabled && me?.id != currentTeam?.UserId"
        class="text-muted mb-4 fw-light"
        data-testid="owner-display"
      >
        {{ $t("general.shared-with-you-by") }}
        {{ currentTeam?.User?.username || "unknown" }}
      </p>
    </BPlaceholderWrapper>

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
            :variant="ddVariant(team.id == teamId)"
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
          v-if="
            canDeleteTeam ||
            (me?.id &&
              (currentTeam?.creator?.username ||
                currentTeam?.updater?.username))
          "
          v-b-tooltip.hover="$t('optionen')"
          right
          no-caret
          variant="light"
          class="ms-2"
          :style="{ display: 'inline' }"
          data-testid="options-dropdown"
        >
          <template #button-content>
            <IBiThreeDotsVertical />
          </template>
          <BDropdownItem
            v-if="canDeleteTeam"
            :disabled="!currentTeam"
            @click="openDeleteSeasonTeamModal"
          >
            <IBiTrash class="me-2" />
            {{ $t("teamView.season-loeschen") }}
          </BDropdownItem>
          <BDropdownItem
            v-if="canDeleteTeam"
            :disabled="!currentTeam"
            variant="danger"
            @click="openDeleteTeamModal"
          >
            <IBiTrash class="me-2" />
            {{ $t("teamView.team-loeschen") }}
          </BDropdownItem>
          <BDropdownDivider
            v-if="
              accessSharingEnabled &&
              canDeleteTeam &&
              me?.id &&
              (currentTeam?.creator?.username || currentTeam?.updater?.username)
            "
          />
          <BDropdownText
            v-if="
              accessSharingEnabled && currentTeam?.creator?.username && me?.id
            "
            class="text-muted fw-light text-nowrap"
            data-testid="creator-display"
            @click.stop
          >
            {{ $t("general.created-by") }}
            {{
              currentTeam.creatorId != me.id
                ? currentTeam?.creator?.username
                : $t("general.you")
            }}
          </BDropdownText>
          <BDropdownText
            v-if="
              accessSharingEnabled && currentTeam?.updater?.username && me?.id
            "
            class="text-muted fw-light text-nowrap"
            data-testid="updater-display"
            @click.stop
          >
            {{ $t("general.last-updated-by") }}
            {{
              currentTeam.updaterId != me.id
                ? currentTeam?.updater?.username
                : $t("general.you")
            }}
          </BDropdownText>
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
                v-if="canEditMember"
                variant="outline-success"
                @click="editMember(data.item.id)"
              >
                <IBiPen />
              </BButton>
              <BButton
                v-if="canDeleteMember"
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
                  v-if="canEditMember"
                  variant="outline-success"
                  @click="editMember(member.id)"
                >
                  <IBiPen />
                </BButton>
                <BButton
                  v-if="canDeleteMember"
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
          v-if="sortedMembersOfCurrentTeam.length == 0"
          class="text-muted text-center"
        >
          {{ $t("teamView.dieses-team-hat-noch-keine-mitglieder") }}
        </p>

        <div class="d-grid gap-2">
          <BButton
            v-if="canEditTeam"
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
            v-if="canEditTeam"
            class="my-3"
            variant="outline-success"
            @click="openImportMemberModal"
          >
            <IBiBoxArrowInRight />
            {{ $t("teamView.importieren") }}
          </BButton>
        </div>
      </BTab>
      <template #tabs-end>
        <BButton
          v-if="canEditTeam"
          v-b-tooltip.hover="$t('teamView.neue-season-anfangen')"
          variant="success"
          data-testid="create-season-button"
          @click="openCreateSeasonModal"
        >
          <IBiPlus />
        </BButton>
      </template>
    </BTabs>

    <CreateMemberModal
      ref="createMemberModal"
      :current-team="currentTeam ?? undefined"
      :edit-member-id="editMemberId ?? undefined"
      :season-tab-index="seasonTabIndex"
      @member-created="onMemberCreation"
      @member-updated="onMemberUpdate"
    />

    <DeleteMemberModal
      ref="deleteMemberModal"
      @member-deleted="onMemberDeletion"
    />

    <DeleteTeamModal ref="deleteTeamModal" @team-deleted="onTeamDeletion" />

    <CreateSeasonModal
      ref="createSeasonModal"
      :teams="teams"
      :me="me ?? undefined"
      @season-team-created="onSeasonTeamCreation"
    />

    <DeleteSeasonTeamModal
      ref="deleteSeasonTeamModal"
      @season-team-deleted="onSeasonTeamDeletion"
    />

    <ImportMemberModal
      ref="importMemberModal"
      :teams="teams"
      :current-team-id="teamId ?? undefined"
      :current-season-team-id="
        (currentTeam?.SeasonTeams ?? [])[seasonTabIndex]?.id ?? undefined
      "
      @import="onMemberImport"
    />
  </BContainer>
</template>

<script lang="ts">
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
import { canWrite, canDelete } from "@/utils/permissions";
import { defineComponent } from "vue";
import FeatureFlagService, {
  FeatureFlagKeys,
} from "@/services/FeatureFlagService";
import type { User, UserAccess, SeasonTeam, Season, Member } from "@/types";
import type { Team } from "@/types";

interface ExtendedSeasonTeam extends SeasonTeam {
  Members: Member[];
  Season: Season;
}

interface ExtendedTeam extends Team {
  UserId?: string;
  User?: User;
  SeasonTeams: ExtendedSeasonTeam[];
  updater?: User;
  creator?: User;
  updaterId?: string;
  creatorId?: string;
}

type OwnerAccess = { ownerUserId: string; role: string; enabled?: boolean };

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

export default defineComponent({
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
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data: function () {
    return {
      presentation: "table",
      teamId: null as string | null,
      teams: [] as ExtendedTeam[],
      seasonTabIndex: 0,
      editMemberId: null as string | null,
      accessSharingEnabled: true,
    };
  },
  computed: {
    owners(): OwnerAccess[] {
      return this.$store.state.owners;
    },
    me(): User | null {
      return this.$store.state.me;
    },
    canEditTeam() {
      return canWrite(this.owners, this.me?.id!, this.currentTeam?.UserId!);
    },
    canDeleteTeam() {
      return canDelete(this.owners, this.me?.id!, this.currentTeam?.UserId!);
    },
    canEditMember() {
      return this.canEditTeam;
    },
    canDeleteMember() {
      return this.canDeleteTeam;
    },
    tableFields() {
      return [
        { key: "name", sortable: true },
        { key: "nickname", label: this.$t("spitzname"), sortable: true },
        { key: "abbreviation", label: this.$t("abkuerzung"), sortable: true },
        { key: "actions", label: "", class: "text-end" },
      ];
    },
    currentTeam(): ExtendedTeam | null {
      if (!this.teamId || !this.teams) return null;

      return this.teams.find((t) => t.id == this.teamId) ?? null;
    },
    sortedMembersOfCurrentTeam() {
      const team = this.currentTeam;
      if (!team || !team.SeasonTeams) return [];

      const seasonTeam = team.SeasonTeams[this.seasonTabIndex];
      if (!seasonTeam) return [];

      const members = seasonTeam.Members;
      if (!members || members.length === 0) return [];

      return [...members].sort((a: Member, b: Member) =>
        a.name.localeCompare(b.name)
      );
    },
  },
  watch: {
    "$route.params": {
      handler() {
        this.teamId = this.$route.params.teamId as string;
        this.load();
      },
      immediate: true,
    },
  },
  async mounted() {
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
    this.accessSharingEnabled = await FeatureFlagService.isEnabled(
      FeatureFlagKeys.ACCESS_SHARING
    );
  },
  methods: {
    load() {
      return Promise.all([
        TeamService.getAll().then((response: Team[]) => {
          this.teams = response.map((t) => {
            const et = t as ExtendedTeam;
            const seasonTeams = [...(et.SeasonTeams || [])].sort(
              (a: ExtendedSeasonTeam, b: ExtendedSeasonTeam) =>
                b.Season.year - a.Season.year
            );
            return { ...et, SeasonTeams: seasonTeams };
          });
        }),
      ]);
    },
    onNameEdit(nameNew: string) {
      this.currentTeam!.name = nameNew;
      TeamService.setName(this.teamId!, nameNew).then((response) => {
        const team = response as ExtendedTeam;
        if (!team.SeasonTeams)
          team.SeasonTeams =
            this.teams.find((t) => t.id == team.id)?.SeasonTeams || [];
        const teamCopy = this.teams.filter((t) => t.id != this.currentTeam!.id);
        teamCopy.push(team);
        this.teams = teamCopy;
      });
    },
    onMemberCreation(member: Member) {
      const seasonTeam = this.currentTeam!.SeasonTeams[this.seasonTabIndex]!;
      seasonTeam.Members.push(member);
      this.editMemberId = null;
      this.setLastUpdaterToMe();
    },
    onMemberUpdate(member: Member) {
      const seasonTeam = this.currentTeam!.SeasonTeams[this.seasonTabIndex]!;
      const membersCopy = seasonTeam.Members.filter(
        (m: Member) => m.id != this.editMemberId
      );
      membersCopy.push(member);
      seasonTeam.Members = membersCopy;
      this.editMemberId = null;
      this.setLastUpdaterToMe();
    },
    requestMemberRemoval(id: string) {
      (
        this.$refs.deleteMemberModal as InstanceType<typeof DeleteMemberModal>
      ).open(id);
    },
    onMemberDeletion(MemberId: string) {
      const seasonTeam = this.currentTeam!.SeasonTeams[this.seasonTabIndex]!;
      seasonTeam.Members = seasonTeam.Members.filter(
        (m: Member) => m.id != MemberId
      );
      this.setLastUpdaterToMe();
    },
    editMember(id: string) {
      this.editMemberId = id;
      this.openMemberModal();
    },
    openMemberModal() {
      this.$nextTick(() => {
        (
          this.$refs.createMemberModal as InstanceType<typeof CreateMemberModal>
        ).open();
      });
    },
    onTeamDeletion(teamId: string) {
      this.teams = this.teams.filter((t: ExtendedTeam) => t.id != teamId);
      if (this.teams.length > 0)
        this.$router
          .push({
            name: "Team",
            params: {
              teamId: this.teams[0]!.id,
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
    onMemberImport(newMembers: Member[]) {
      this.currentTeam?.SeasonTeams[this.seasonTabIndex]?.Members.push(
        ...newMembers
      );
      this.setLastUpdaterToMe();
    },
    updateSeasonTabIndex(newIndex: number) {
      this.seasonTabIndex = newIndex;
    },
    setPresentation(newPresentation: string) {
      this.presentation = newPresentation;
    },
    ddVariant(isActive: boolean) {
      return (isActive ? "primary" : "outline-primary") as any;
    },
    openDeleteSeasonTeamModal() {
      const seasonTeamId =
        (this.currentTeam?.SeasonTeams ?? [])[this.seasonTabIndex]?.id ?? "";
      (
        this.$refs.deleteSeasonTeamModal as InstanceType<
          typeof DeleteSeasonTeamModal
        >
      ).open(seasonTeamId);
    },
    openDeleteTeamModal() {
      (this.$refs.deleteTeamModal as InstanceType<typeof DeleteTeamModal>).open(
        this.teamId ?? ""
      );
    },
    openImportMemberModal() {
      (
        this.$refs.importMemberModal as InstanceType<typeof ImportMemberModal>
      ).open();
    },
    openCreateSeasonModal() {
      (
        this.$refs.createSeasonModal as InstanceType<typeof CreateSeasonModal>
      ).open(this.currentTeam?.id ?? "");
    },
    setLastUpdaterToMe() {
      const team = this.currentTeam;
      const me = this.me;
      if (me && me.id && team && team.updaterId !== me.id) {
        team.updaterId = me.id;
        team.updater = me;
      }
    },
  },
});
</script>
