<template>
  <BContainer id="editView" data-view @keydown="onKeyPress">
    <EditableNameHeading
      v-if="!$store.state.isMobile || mobileEditingEnabled"
      name="Choreo"
      :class="me?.id != choreo?.UserId || loading ? 'mb-0' : 'mb-4'"
      :value="choreo?.name"
      :placeholder="`${$t('loading')}...`"
      @input="onNameEdit"
    />
    <BPlaceholderWrapper :loading="loading">
      <template #loading>
        <BPlaceholder width="25%" class="mb-4" animation="wave" />
      </template>
      <p
        v-show="accessSharingEnabled && me?.id != choreo?.UserId"
        class="text-muted mb-4 fw-light"
        data-testid="owner-display"
      >
        {{ $t("general.shared-with-you-by") }}
        {{ choreo?.User?.username || "unknown" }}
      </p>
    </BPlaceholderWrapper>

    <!-- Controls -->
    <BRow
      v-if="!$store.state.isMobile || mobileEditingEnabled"
      align-v="center"
      class="mb-4"
    >
      <BCol>
        <BRow
          align-h="center"
          align-v="center"
          class="mx-auto"
          :style="{ flexWrap: 'nowrap' }"
        >
          <BCol cols="auto">
            <BButtonGroup>
              <BButton
                id="tooltip-target-skipToStart"
                variant="outline-secondary"
                :disabled="count <= 0"
                @click="skipToStart"
              >
                <IBiChevronDoubleLeft />
              </BButton>
              <BButton
                id="tooltip-target-previousCount"
                variant="outline-secondary"
                :disabled="count <= 0"
                @click="previousCount"
              >
                <IBiChevronLeft />
              </BButton>
            </BButtonGroup>
            <BTooltip
              v-if="count > 0 && countBackButtonHasNeverBeenUsed"
              target="tooltip-target-previousCount"
              triggers="hover"
            >
              {{ $t("editView.zum-vorigen-count-springen") }}
            </BTooltip>
            <BTooltip
              v-if="count > 0 && countStartButtonHasNeverBeenUsed"
              target="tooltip-target-skipToStart"
              triggers="hover"
            >
              {{ $t("editView.zum-anfang-springen") }}
            </BTooltip>
          </BCol>
          <BCol cols="auto">
            <BRow align-v="center" no-gutters>
              <BCol>
                <BButton
                  :variant="playInterval ? 'danger' : 'outline-success'"
                  class="me-2"
                  @click="playPause"
                >
                  <IBiPause v-if="playInterval" />
                  <IBiPlay v-else />
                </BButton>
              </BCol>
              <BCol :style="{ whiteSpace: 'nowrap' }">
                <p class="mb-0">
                  {{ $t("achter") }}:
                  <b class="regularColor">{{ Math.floor(count / 8) + 1 }}</b>
                </p>
                <p class="mb-0">
                  {{ $t("count", 1) }}:
                  <b class="regularColor">{{ (count % 8) + 1 }}</b>
                </p>
              </BCol>
            </BRow>
          </BCol>
          <BCol cols="auto">
            <BButtonGroup>
              <BButton
                id="tooltip-target-nextCount"
                variant="outline-secondary"
                :disabled="choreo ? count >= choreo.counts - 1 : true"
                @click="nextCount"
              >
                <IBiChevronRight />
              </BButton>
              <BButton
                id="tooltip-target-endCount"
                variant="outline-secondary"
                :disabled="choreo ? count >= choreo.counts - 1 : true"
                @click="skipToEnd"
              >
                <IBiChevronDoubleRight />
              </BButton>
            </BButtonGroup>
            <BTooltip
              v-if="
                choreo &&
                count < choreo.counts - 1 &&
                countNextButtonHasNeverBeenUsed
              "
              target="tooltip-target-nextCount"
              triggers="hover"
            >
              {{ $t("editView.zum-naechsten-count-springen") }}
            </BTooltip>
            <BTooltip
              v-if="
                choreo &&
                count < choreo.counts - 1 &&
                countEndButtonHasNeverBeenUsed
              "
              target="tooltip-target-endCount"
              triggers="hover"
            >
              {{ $t("editView.zum-ende-springen") }}
            </BTooltip>
          </BCol>
        </BRow>
      </BCol>
      <BCol cols="auto">
        <BRow align-h="end" no-gutters>
          <BCol cols="auto" class="me-2">
            <BButton
              v-b-tooltip.hover="$t('editView.anleitung')"
              variant="light"
              data-testid="instructions-button"
              @click="openHowToModal"
            >
              <IBiQuestion />
            </BButton>
          </BCol>
          <BCol cols="auto">
            <BDropdown
              v-b-tooltip.hover="$t('optionen')"
              right
              no-caret
              variant="light"
              data-testid="menu-button"
            >
              <template #button-content>
                <IBiThreeDotsVertical />
              </template>
              <BDropdownGroup :header="$t('editView.exportieren')">
                <BDropdownItem
                  :to="{
                    name: 'PDF',
                    params: { choreoId, locale: $i18n.locale },
                  }"
                >
                  <IBiFilePdf class="me-2" />
                  {{ $t("Home.countsheet-als-pdf") }}
                </BDropdownItem>
                <BDropdownItem
                  :to="{
                    name: 'Video',
                    params: { choreoId, locale: $i18n.locale },
                  }"
                >
                  <IBiFilm class="me-2" />
                  {{ $t("editView.video-exportieren") }}
                </BDropdownItem>
              </BDropdownGroup>
              <BDropdownDivider />
              <BDropdownGroup :header="$t('editView.choreo-einstellungen')">
                <BDropdownItem
                  :disabled="!choreo"
                  @click="openChangeChoreoLengthModal"
                >
                  <IBiHash class="me-2" />
                  {{ $t("editView.laenge-anpassen") }}
                </BDropdownItem>
                <BDropdownItem
                  :disabled="!choreo"
                  @click="openChangeMatLayoutModal"
                >
                  <IBiLayoutThreeColumns class="me-2" />
                  {{ $t("editView.change-mat-layout") }}
                  <NewVersionBadge
                    :versions="['0.10.3', '0.11.0']"
                  /> </BDropdownItem
              ></BDropdownGroup>
              <BDropdownDivider />
              <BDropdownGroup :header="$t('editView.bearbeitung')">
                <BDropdownText style="width: 250px" @click.stop>
                  <BFormCheckbox v-model="snapping" switch>
                    {{
                      $t(
                        "editView.positionen-horizontal-und-vertikal-ausrichten"
                      )
                    }}
                  </BFormCheckbox>
                </BDropdownText>
                <BDropdownText style="width: 250px" @click.stop>
                  <BFormCheckbox v-model="proposalEnabled" switch>
                    {{ $t("editView.propose-positions") }}
                  </BFormCheckbox>
                </BDropdownText>
                <BDropdownText @click.stop>
                  <BFormCheckbox v-model="moveWithCountEdit" switch>
                    {{ $t("editView.beim-bearbeiten-den-count-mitwechseln") }}
                  </BFormCheckbox>
                </BDropdownText>
              </BDropdownGroup>
              <BDropdownDivider />
              <span>
                <BDropdownItem
                  :disabled="!choreo || !canDeleteChoreo"
                  variant="danger"
                  @click="openDeleteChoreoModal"
                >
                  <IBiTrash class="me-2" />
                  {{ $t("editView.choreo-loeschen") }}
                </BDropdownItem>
              </span>
              <BDropdownDivider
                v-if="
                  accessSharingEnabled &&
                  me?.id &&
                  (choreo?.creator?.username || choreo?.updater?.username)
                "
              />
              <BDropdownText
                v-if="accessSharingEnabled && choreo?.creator?.username"
                class="text-muted fw-light text-nowrap"
                data-testid="creator-display"
                @click.stop
              >
                {{ $t("general.created-by") }}
                {{
                  choreo.creatorId != me?.id
                    ? choreo?.creator?.username
                    : $t("general.you")
                }}
              </BDropdownText>
              <BDropdownText
                v-if="
                  accessSharingEnabled && choreo?.updater?.username && me?.id
                "
                class="text-muted fw-light text-nowrap"
                data-testid="updater-display"
                @click.stop
              >
                {{ $t("general.last-updated-by") }}
                {{
                  choreo?.updaterId != me.id
                    ? choreo?.updater?.username
                    : $t("general.you")
                }}
              </BDropdownText>
            </BDropdown>
          </BCol>
        </BRow>
      </BCol>
    </BRow>

    <!-- Main: Mat + CountOverview -->
    <BRow
      v-if="!$store.state.isMobile || mobileEditingEnabled"
      align-h="around"
    >
      <BCol cols="auto">
        <Mat
          ref="Mat"
          :current-positions="currentPositions"
          :transition-ms="transitionMs"
          :team-members="teamMembers"
          :snapping="snapping"
          :proposed-positions="proposedPositions"
          :mat-type="choreo?.matType"
          :interactive="canEditChoreo"
          @position-change="onPositionChange"
        />
      </BCol>
      <BCol cols="12" lg="6">
        <CountOverview
          ref="countOverview"
          :count="count"
          :choreo="choreo"
          :hits-for-current-count="hitsForCurrentCount"
          :lineups-for-current-count="lineupsForCurrentCount"
          :team-members="teamMembers"
          :current-positions="currentPositions"
          :interactive="canEditChoreo"
          @update-hits="onUpdateHits"
          @update-lineups="onUpdateLineups"
          @update-count="onUpdateCount"
          @open-create-hit-modal="openCreateHitModal"
        />
        <BCard
          v-if="proposedPositions && proposedPositions.length > 0"
          :subtitle="$t('editView.acceptProposal')"
          border-variant="light"
          align="end"
          class="mt-2"
        >
          <BDropdown
            v-b-tooltip.hover="$t('general.reject')"
            split
            variant="light"
            class="me-2"
            right
            @click="(e: MouseEvent) => rejectProposedLineup(e)"
          >
            <template #button-content>
              <IBiX />
            </template>
            <BDropdownItem
              @click.stop="
                () => {
                  proposalEnabled = false;
                  rejectProposedLineup();
                }
              "
              >{{ $t("editView.reject-and-disable") }}</BDropdownItem
            >
          </BDropdown>
          <BButton variant="outline-success" @click="acceptProposedLineup">
            <IBiCheck class="me-2" />
            {{ $t("general.accept") }}
          </BButton>
        </BCard>
      </BCol>
    </BRow>

    <!-- Tabs: Countsheet + Team -->
    <BTabs
      v-if="!$store.state.isMobile || mobileEditingEnabled"
      content-class="mt-3"
      class="mt-5"
      fill
    >
      <BTab :title="$t('countsheet', 1)" active>
        <CountSheet
          v-if="choreo && choreo.Hits"
          :count="count"
          :choreo="choreo"
          @set-counter="setCounter"
          @open-create-hit-modal="openCreateHitModal"
        />
      </BTab>
      <BTab :title="$t('team', 1)">
        <BTable
          striped
          hover
          :items="teamMembers.map((m) => ({ ...m, actions: null }))"
          :fields="participants_table_fields"
          :sort-by="[{ key: 'name', order: 'desc' }]"
        >
          <template #cell(color)="data">
            <BInput
              type="color"
              :value="data.item.ChoreoParticipation.color"
              @input="(event: string) => changeColor(data.item.id, event)"
            />
          </template>
          <template #cell(actions)="data">
            <BButtonGroup>
              <BButton
                v-if="canEditParticipants"
                v-b-tooltip.hover.left="
                  $t('editView.auswechseln', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                variant="light"
                @click="subOutParticipant(data.item.id)"
              >
                <IBiArrowRepeat />
              </BButton>
              <BButton
                v-if="canEditParticipants"
                v-b-tooltip.hover.right="
                  $t('editView.von-der-matte-nehmen', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                variant="outline-danger"
                @click="removeParticipant(data.item.id)"
              >
                <IBiBoxArrowRight />
              </BButton>
            </BButtonGroup>
          </template>
        </BTable>
        <p v-if="teamMembers.length == 0" class="text-muted">
          {{ $t("editView.bisher-steht-noch-kein-teammitglied-auf-der-matte") }}
        </p>

        <hr class="my-5" />

        <p class="text-muted">
          <b>{{ $t("editView.nicht-teilnehmende-mitglieder-des-teams") }}:</b>
          {{ choreo?.SeasonTeam?.Team?.name }} ({{
            choreo?.SeasonTeam?.Season?.name
          }})
        </p>
        <BTable
          striped
          hover
          :items="notParticipatingMembers.map((m) => ({ ...m, actions: null }))"
          :fields="team_table_fields"
          :sort-by="[{ key: 'name', order: 'desc' }]"
          class="text-muted"
        >
          <template #cell(actions)="data">
            <BButtonGroup>
              <BButton
                v-if="canEditParticipants"
                v-b-tooltip.hover.left="
                  $t('editView.einwechseln', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                variant="light"
                @click="subInMember(data.item.id)"
              >
                <IBiArrowRepeat />
              </BButton>
              <BButton
                v-if="canEditParticipants"
                variant="outline-success"
                @click="addParticipant(data.item.id)"
              >
                <IBiBoxArrowInRight />
              </BButton>
            </BButtonGroup>
          </template>
        </BTable>
        <p v-if="notParticipatingMembers.length == 0" class="text-muted">
          {{
            $t(
              "editView.alle-mitglieder-deines-teams-stehen-schon-auf-der-matte"
            )
          }}
        </p>
      </BTab>
    </BTabs>

    <CreateHitModal
      ref="createHitModal"
      :team-members="teamMembers"
      :choreo-id="choreoId"
      :count="count"
      :hits-for-current-count="hitsForCurrentCount"
      :max-count="choreo?.counts"
      @hit-created="onHitCreated"
    />

    <!-- MODALS -->
    <ChangeChoreoLengthModal
      ref="changeChoreoLengthModal"
      :choreo="choreo"
      @count-update="onCountUpdate"
    />
    <ChangeMatLayoutModal
      ref="changeMatLayoutModal"
      :choreo="choreo"
      @mat-type-update="onMatTypeUpdate"
    />
    <DeleteChoreoModal
      ref="deleteChoreoModal"
      :choreo-id="choreoId"
      @choreo-deleted="onChoreoDeleted"
    />
    <HowToModal ref="howToModal" />
    <SelectHitModal
      ref="selectHitModal"
      :hits-for-current-count="hitsForCurrentCount"
      @selection="onHitSelection"
    />
    <ParticipantSubstitutionModal
      ref="participantSubstitutionModal"
      :choreo="choreo"
      :participants="teamMembers"
      :non-participants="notParticipatingMembers"
      @substitution="onSubstitution"
    />
    <MobileChoreoEditModal
      v-if="choreoId"
      ref="mobileChoreoEditModal"
      :choreo-id="choreoId"
    />
  </BContainer>
</template>

<script lang="ts">
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import Mat from "@/components/Mat.vue";
import ChoreoService from "@/services/ChoreoService";
import CountSheet from "@/components/CountSheet.vue";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import CountOverview from "@/components/CountOverview.vue";
import PositionService from "@/services/PositionService";
import LineupService, { PositionProposal } from "@/services/LineupService";
import CreateHitModal from "@/components/modals/CreateHitModal.vue";
import HowToModal from "@/components/modals/HowToModal.vue";
import DeleteChoreoModal from "@/components/modals/DeleteChoreoModal.vue";
import ChangeChoreoLengthModal from "@/components/modals/ChangeChoreoLengthModal.vue";
import ChangeMatLayoutModal from "@/components/modals/ChangeMatLayoutModal.vue";
import SelectHitModal from "@/components/modals/SelectHitModal.vue";
import ColorService from "@/services/ColorService";
import ParticipantSubstitutionModal from "@/components/modals/ParticipantSubstitutionModal.vue";
import MobileChoreoEditModal from "@/components/modals/MobileChoreoEditModal.vue";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import MessagingService from "@/services/MessagingService";
import { debug, error } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import { roundToDecimals, clamp } from "@/utils/numbers";
import FeatureFlagService from "@/services/FeatureFlagService";
import { FeatureFlagKeys } from "@/services/FeatureFlagService";
import { canWrite, canDelete } from "@/utils/permissions";
import type {
  Choreo,
  Lineup,
  Member,
  Hit,
  User,
  SeasonTeam,
  Participant,
} from "@/types";
import { defineComponent } from "vue";
import { OwnerAccess } from "@/types";

interface ProposedPosition {
  MemberId: string;
  x: number;
  y: number;
  Member: Member;
}

interface PositionUpdate {
  timeout: ReturnType<typeof setTimeout>;
  x: number;
  y: number;
}

interface LastKeyEvent {
  time: number;
  code: string;
}

/**
 * @vue-data {string|null} choreoId=null - The ID of the choreo being edited.
 * @vue-data {number} matHeight=500 - The height of the mat in pixels.
 * @vue-data {number} matWidth=500 - The width of the mat in pixels.
 * @vue-data {boolean} snapping=true - Whether positions should snap to a grid.
 * @vue-data {boolean} proposalEnabled=true - Whether positions new be proposed.
 * @vue-data {boolean} moveWithCountEdit=true - Whether the mat should move with count edits.
 * @vue-data {number} count=0 - The current count being edited.
 * @vue-data {Array} team_table_fields - Fields for the team table.
 * @vue-data {Array} participants_table_fields - Fields for the participants table.
 * @vue-data {Object|null} choreo=null - The current choreo object being edited.
 * @vue-data {Object|null} lastKeyEvent=null - The last key event captured for keyboard shortcuts.
 * @vue-data {number} transitionMs=800 - The transition duration for movements in milliseconds.
 * @vue-data {Object} positionUpdates={} - A map of member IDs to their position update timeouts.
 * @vue-data {boolean} lineupCreationInProgress=false - Whether a lineup creation is currently in progress.
 * @vue-data {number|null} playInterval=null - The interval ID for playing the counts automatically.
 * @vue-data {boolean} countBackButtonHasNeverBeenUsed=true - Whether the back button has been used before.
 * @vue-data {boolean} countStartButtonHasNeverBeenUsed=true - Whether the start button has been used before.
 * @vue-data {boolean} countNextButtonHasNeverBeenUsed=true - Whether the next button has been used before.
 * @vue-data {boolean} countEndButtonHasNeverBeenUsed=true - Whether the end button has been used before.
 * @vue-data {boolean} mobileEditingEnabled=false - Whether editing on mobile devices is enabled.
 *
 * @vue-computed {Array} teamMembers - The list of team members participating in the choreo.
 * @vue-computed {Array} notParticipatingMembers - The list of team members not participating in the choreo.
 * @vue-computed {Array} currentPositions - The current positions of all members on the mat.
 * @vue-computed {Array} hitsForCurrentCount - The hits for the current count being edited.
 * @vue-computed {Array} lineupsForCurrentCount - The lineups for the current count being edited.
 *
 * @vue-computed {MetaInfo} metaInfo
 */
export default defineComponent({
  name: "EditView",
  components: {
    Mat,
    CountSheet,
    EditableNameHeading,
    CountOverview,
    CreateHitModal,
    HowToModal,
    DeleteChoreoModal,
    ChangeChoreoLengthModal,
    ChangeMatLayoutModal,
    SelectHitModal,
    ParticipantSubstitutionModal,
    MobileChoreoEditModal,
    NewVersionBadge,
  },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data: function () {
    return {
      loading: true,
      choreoId: undefined as string | undefined,
      matHeight: 500,
      matWidth: 500,
      snapping: true,
      proposalEnabled: true,
      moveWithCountEdit: true,
      count: 0,
      team_table_fields: [
        { key: "name", sortable: true, class: "text-start" },
        { key: "nickname", label: this.$t("spitzname") },
        { key: "abbreviation", label: this.$t("abkuerzung") },
        { key: "actions", label: "", class: "text-end" },
      ],
      participants_table_fields: [
        { key: "name", sortable: true, class: "text-start" },
        { key: "nickname", label: this.$t("spitzname") },
        { key: "abbreviation", label: this.$t("abkuerzung") },
        { key: "color", label: this.$t("editView.farbe") },
        { key: "actions", label: "", class: "text-end" },
      ],
      choreo: undefined as Choreo | undefined,
      lastKeyEvent: null as LastKeyEvent | null,
      transitionMs: 800,
      positionUpdates: {} as Record<string, PositionUpdate>,
      lineupCreationInProgress: false,
      playInterval: null as ReturnType<typeof setInterval> | null,
      countBackButtonHasNeverBeenUsed: true,
      countStartButtonHasNeverBeenUsed: true,
      countNextButtonHasNeverBeenUsed: true,
      countEndButtonHasNeverBeenUsed: true,
      proposedPositions: [] as ProposedPosition[],
      rejectedPositionProposals: [] as ProposedPosition[][],
      mobileEditingEnabled: true,
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
    canEditChoreo(): boolean {
      return canWrite(
        this.owners,
        this.me?.id ?? "",
        this.choreo?.UserId ?? ""
      );
    },
    canDeleteChoreo(): boolean {
      return canDelete(
        this.owners,
        this.me?.id ?? "",
        this.choreo?.UserId ?? ""
      );
    },
    canEditParticipants(): boolean {
      return this.canEditChoreo;
    },
    teamMembers(): Participant[] {
      if (!this.choreo?.Participants) return [];
      // Participants are Member instances returned with nested ChoreoParticipation
      return Array.from(this.choreo.Participants as Participant[]).sort(
        (a, b) => a.name.localeCompare(b.name)
      );
    },
    notParticipatingMembers(): Member[] {
      if (!this.choreo?.SeasonTeam?.Members) return [];
      const participantIds = (this.choreo?.Participants || []).map(
        (p: Participant) => (p as Participant).id
      );
      return this.choreo.SeasonTeam.Members.filter(
        (m) => !participantIds.includes(m.id)
      ).sort((a, b) => a.name.localeCompare(b.name));
    },
    currentPositions() {
      if (!this.choreo) return [];
      return ChoreoService.getPositionsFromChoreoAndCount(
        this.choreo,
        this.count,
        this.teamMembers
      );
    },
    hitsForCurrentCount(): Hit[] {
      if (!this.choreo || !this.choreo.Hits) return [];

      return this.choreo.Hits.filter((a) => {
        return a.count == this.count;
      }).sort((a, b) => (b.Members?.length ?? 0) - (a.Members?.length ?? 0));
    },
    lineupsForCurrentCount(): Lineup[] {
      if (!this.choreo || !this.choreo.Lineups) return [];

      return this.choreo.Lineups.filter((a) => {
        return a.startCount <= this.count && a.endCount >= this.count;
      });
    },
  },
  watch: {
    "$route.params": {
      handler() {
        this.choreoId = this.$route.params.choreoId as string;
        if (this.$store.state.isMobile && !this.mobileEditingEnabled) {
          if (this.$refs.mobileChoreoEditModal)
            (
              this.$refs.mobileChoreoEditModal as InstanceType<
                typeof MobileChoreoEditModal
              >
            ).open();
        } else this.loadChoreo();
      },
      immediate: true,
    },
    choreo: {
      handler() {
        this.updateProposedPositions();
      },
    },
    count: {
      handler() {
        this.updateProposedPositions();
      },
    },
    proposalEnabled: {
      handler() {
        this.updateProposedPositions();
      },
    },
  },
  mounted() {
    Promise.all([
      FeatureFlagService.isEnabled(FeatureFlagKeys.MOBILE_EDITING),
      FeatureFlagService.isEnabled(FeatureFlagKeys.ACCESS_SHARING),
    ]).then(([mobileEditing, accessSharing]) => {
      this.mobileEditingEnabled = mobileEditing;
      this.accessSharingEnabled = accessSharing;

      if (this.$store.state.isMobile && !this.mobileEditingEnabled) {
        if (this.$refs.mobileChoreoEditModal)
          (
            this.$refs.mobileChoreoEditModal as InstanceType<
              typeof MobileChoreoEditModal
            >
          ).open();
      } else this.loadChoreo();
    });

    useHead({
      title: computed(() => this.choreo?.name || this.t("pdf.laedt-choreo")),
      meta: [
        {
          name: "description",
          content: computed(() => this.t("meta.editView.description")),
        },
        {
          name: "twitter:description",
          content: computed(() => this.t("meta.editView.description")),
        },
        {
          property: "og:description",
          content: computed(() => this.t("meta.editView.description")),
        },
        {
          property: "og:title",
          content: computed(
            () =>
              (this.choreo?.name || this.t("pdf.laedt-choreo")) +
              ` - ${this.t("general.ChoreoPlaner")} | ${this.t(
                "meta.defaults.title"
              )}`
          ),
        },
        {
          name: "twitter:title",
          content: computed(
            () =>
              (this.choreo?.name || this.t("pdf.laedt-choreo")) +
              ` - ${this.t("general.ChoreoPlaner")} | ${this.t(
                "meta.defaults.title"
              )}`
          ),
        },
      ],
    });
  },
  methods: {
    loadChoreo() {
      this.loading = true;
      if (this.choreoId) {
        ChoreoService.getById(this.choreoId)
          .then((choreo) => {
            if (!choreo) return;

            this.choreo = choreo;

            if (choreo.Lineups.length == 0 && choreo.Hits.length == 0)
              (this.$refs.howToModal as InstanceType<typeof HowToModal>).open();

            this.updateProposedPositions();
          })
          .catch((e) => {
            error(e, ERROR_CODES.CLUB_QUERY_FAILED);
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
          })
          .finally(() => {
            this.loading = false;
          });
      }
    },
    onPositionChange(MemberId: string, x: number, y: number, isRetry = false) {
      if (!this.choreoId || !this.choreo) return;

      const positionToUpdate = this.lineupsForCurrentCount
        .map((l) => l.Positions.filter((p) => p.MemberId == MemberId))
        .flat()[0];

      if (positionToUpdate) {
        const memberTimeout = this.positionUpdates[MemberId];
        if (memberTimeout) clearTimeout(memberTimeout.timeout);

        const pos = this.choreo?.Lineups.find(
          (l) => l.id == positionToUpdate.LineupId
        )?.Positions.find((p) => p.id == positionToUpdate.id);
        if (!pos) {
          error(
            `Position for member ${MemberId} not found in choreo lineups`,
            ERROR_CODES.POSITION_NOT_FOUND
          );
          return;
        }
        // Store original position to revert in case of error
        const originalX = pos.x;
        const originalY = pos.y;

        this.positionUpdates[MemberId] = {
          timeout: setTimeout(() => {
            if (positionToUpdate.id && positionToUpdate.LineupId) {
              this.updateProposedPositions();
              PositionService.update(
                positionToUpdate.LineupId,
                positionToUpdate.id,
                x,
                y
              )
                .then(() => {
                  this.showSuccessMessage(this.$t("lineup", 1));
                })
                .catch((e) => {
                  if (e.status === 409) {
                    if (!isRetry) {
                      MessagingService.showWarning(
                        this.$t("editView.too-fast-message"),
                        this.$t("editView.too-fast-callout")
                      );
                      this.onPositionChange(MemberId, x, y, true);
                    }
                  } else {
                    console.error(e);
                    MessagingService.showError(e.message);
                  }

                  // Set temporarily to (0,0) to trigger update
                  pos.x = 0;
                  pos.y = 0;
                  // Revert position
                  pos.x = originalX;
                  pos.y = originalY;
                });
            }
          }, 1000),
          x,
          y,
        };
      } else {
        let lineupToUpdate;
        if (this.lineupsForCurrentCount.length == 1) {
          lineupToUpdate = this.lineupsForCurrentCount[0];
        } else if (this.lineupsForCurrentCount.length > 1) {
          const lineupOnlyForCurrentCount = this.lineupsForCurrentCount.find(
            (l) => l.startCount == this.count && l.endCount == this.count
          );
          if (lineupOnlyForCurrentCount)
            lineupToUpdate = lineupOnlyForCurrentCount;
        }

        if (!lineupToUpdate) {
          if (this.lineupCreationInProgress) return;

          this.lineupCreationInProgress = true;
          return LineupService.create(
            this.count,
            this.count,
            this.choreoId
          ).then((lineup) => {
            let lineupCopy = this.choreo?.Lineups;
            if (!lineupCopy) lineupCopy = [];
            if (!lineup.Positions) lineup.Positions = [];
            lineupCopy.push(lineup);
            if (this.choreo) this.choreo.Lineups = lineupCopy;
            this.lineupCreationInProgress = false;

            return this.createPositionOnExistingLineup(lineup, x, y, MemberId);
          });
        } else {
          const memberTimeout = this.positionUpdates[MemberId];
          if (memberTimeout) clearTimeout(memberTimeout.timeout);

          this.positionUpdates[MemberId] = {
            timeout: setTimeout(() => {
              let lineupCopy = this.choreo?.Lineups;
              if (!lineupCopy) lineupCopy = [];
              let positionsCopy = lineupCopy.find(
                (l) => l.id == lineupToUpdate.id
              )?.Positions;
              if (!positionsCopy) positionsCopy = [];
              positionsCopy = positionsCopy.filter(
                (p) => p.MemberId != MemberId
              );
              positionsCopy.push({
                LineupId: lineupToUpdate.id,
                MemberId: MemberId,
                Member: this.teamMembers.find((m) => m.id == MemberId),
                x,
                y,
              });
              const foundLineup = lineupCopy.find(
                (l) => l.id == lineupToUpdate.id
              );
              if (foundLineup) foundLineup.Positions = positionsCopy;
              if (this.choreo) this.choreo.Lineups = lineupCopy;

              return this.createPositionOnExistingLineup(
                lineupToUpdate,
                x,
                y,
                MemberId
              );
            }, 0),
            x,
            y,
          };
        }
      }

      this.setLastUpdaterToMe();
    },
    createPositionOnExistingLineup(
      lineupToUpdate: Lineup,
      x: number,
      y: number,
      MemberId: string
    ) {
      return PositionService.create(lineupToUpdate.id, x, y, MemberId).then(
        (position) => {
          let lineupCopy = this.choreo?.Lineups;
          if (!lineupCopy) lineupCopy = [];
          let positionsCopy = lineupCopy.find(
            (l) => l.id == lineupToUpdate.id
          )?.Positions;
          if (!positionsCopy) positionsCopy = [];
          positionsCopy = positionsCopy.filter((p) => p.MemberId != MemberId);
          positionsCopy.push(position);
          const foundLineup = lineupCopy.find((l) => l.id == lineupToUpdate.id);
          if (foundLineup) foundLineup.Positions = positionsCopy;
          if (this.choreo) this.choreo.Lineups = lineupCopy;
          this.showSuccessMessage(this.$t("lineup", 1));
          this.updateProposedPositions();
          this.setLastUpdaterToMe();
        }
      );
    },
    onKeyPress(event: KeyboardEvent) {
      // Prevent keyboard shortcuts if the user is typing in a text input field
      const inputElements = Array.from(document.getElementsByTagName("input"));
      const activeElement = document.activeElement;
      const anInputElementIsInFocus = inputElements.some(
        (e) => e == activeElement && e.type == "text"
      );
      if (anInputElementIsInFocus) return;

      if (["ArrowUp", "ArrowDown", "Space"].includes(event.code))
        event.preventDefault();

      if (
        this.lastKeyEvent &&
        Date.now() - this.lastKeyEvent.time < 100 &&
        this.lastKeyEvent.code == event.code
      )
        return;

      this.lastKeyEvent = {
        time: Date.now(),
        code: event.code,
      };

      switch (event.code) {
        case "ArrowLeft":
          if (this.count > 0) this.setCounter(this.count - 1);
          break;
        case "ArrowRight":
          if (this.choreo && this.count < this.choreo.counts - 1)
            this.setCounter(this.count + 1);
          break;
        case "ArrowDown":
          if (this.choreo && this.count < this.choreo.counts - 8)
            this.setCounter(this.count + 8);
          break;
        case "ArrowUp":
          if (this.choreo && this.count > 7) this.setCounter(this.count - 8);
          break;
        case "KeyH":
        case "KeyN":
          (
            this.$refs.countOverview as InstanceType<typeof CountOverview>
          ).openNewHitModal();
          break;
        case "Quote":
          this.initiateHitUpdate();
          break;
        case "Space":
          this.playPause();
          break;
        default:
      }
    },
    setCounter(count: number) {
      // the order does matter!
      // 1. store the old positions for animation
      // 2. persist the inflight position updates in the local choreo copy and reset the object
      // 3. change to the next count
      const oldPositions = this.currentPositions;
      this.resetPositionUpdates();
      this.count = count;

      if (this.$refs.Mat)
        (this.$refs.Mat as InstanceType<typeof Mat>).animatePositions(
          oldPositions,
          this.currentPositions
        );
      this.updateProposedPositions();
    },
    resetPositionUpdates() {
      Object.entries(this.positionUpdates).forEach(
        ([MemberId, positionUpdate]) => {
          // clear all stored timeouts
          if (positionUpdate.timeout) clearTimeout(positionUpdate.timeout);

          // store the inflight position updates from this.positionUpdates to this.choreo.Lineups
          const positionToUpdate = this.lineupsForCurrentCount
            .map((l) => l.Positions.filter((p) => p.MemberId == MemberId))
            .flat()[0];

          if (positionToUpdate) {
            const pos = this.choreo?.Lineups.find(
              (l) => l.id == positionToUpdate.LineupId
            )?.Positions.find((p) => p.id == positionToUpdate.id);

            if (pos) {
              pos.x = roundToDecimals(positionUpdate.x, 2);
              pos.y = roundToDecimals(positionUpdate.y, 2);
            }
          }
        }
      );
      this.positionUpdates = {};
    },
    playPause() {
      if (!this.playInterval) {
        this.playInterval = setInterval(() => {
          if (this.choreo && this.count + 1 < this.choreo.counts) {
            this.setCounter(this.count + 1);
          } else {
            if (this.playInterval) clearInterval(this.playInterval);
            this.playInterval = null;
          }
        }, this.transitionMs);
      } else {
        clearInterval(this.playInterval);
        this.playInterval = null;
      }
    },
    countToString(count: number) {
      return `${Math.floor(count / 8) + 1} / ${(count % 8) + 1}`;
    },
    onNameEdit(nameNew: string) {
      if (!this.choreoId || !this.choreo) return;
      this.choreo.name = nameNew;
      ChoreoService.changeName(this.choreoId, nameNew).then(() => {
        if (this.choreo?.name) this.choreo.name = nameNew;
        this.setLastUpdaterToMe();
        this.showSuccessMessage();
      });
    },
    onUpdateHits(hits: Hit[]) {
      if (this.choreo?.Hits) this.choreo.Hits = hits;
      this.setLastUpdaterToMe();
      this.showSuccessMessage(this.$t("countsheet", 1));
    },
    onUpdateLineups(lineups: Lineup[]) {
      if (this.choreo?.Lineups) this.choreo.Lineups = lineups;
      this.setLastUpdaterToMe();
      this.showSuccessMessage(this.$t("lineup", 1));
      this.updateProposedPositions();
    },
    onUpdateCount(count: number) {
      if (this.moveWithCountEdit) this.setCounter(count);
    },
    onCountUpdate(counts: number) {
      if (this.choreo?.counts) this.choreo.counts = counts;
      this.setLastUpdaterToMe();
      this.showSuccessMessage();
    },
    onMatTypeUpdate(matType: string) {
      if (this.choreo?.matType) this.choreo.matType = matType;
      this.setLastUpdaterToMe();
      this.showSuccessMessage();
    },
    onChoreoDeleted() {
      this.$router.push({
        name: "Start",
        params: { locale: this.$i18n.locale },
      });
    },
    openCreateHitModal() {
      (this.$refs.createHitModal as InstanceType<typeof CreateHitModal>).open();
    },
    onHitCreated(hit: Hit) {
      let hitsCopy = this.choreo?.Hits;
      if (!hitsCopy) hitsCopy = [];
      hitsCopy.push(hit);
      if (this.choreo) this.choreo.Hits = hitsCopy;
      this.setLastUpdaterToMe();
      this.showSuccessMessage(this.$t("countsheet", 1));
    },
    initiateHitUpdate() {
      if (this.hitsForCurrentCount.length == 0) return;
      else if (
        this.hitsForCurrentCount.length == 1 &&
        this.hitsForCurrentCount[0]?.id
      )
        this.onHitSelection(this.hitsForCurrentCount[0].id);
      else {
        (
          this.$refs.selectHitModal as InstanceType<typeof SelectHitModal>
        ).open();
      }
    },
    onHitSelection(hitId: string) {
      (this.$refs.countOverview as InstanceType<typeof CountOverview>).editHit(
        hitId
      );
      this.scrollToCountOverView();
    },
    scrollToCountOverView() {
      (
        this.$refs.countOverview as InstanceType<typeof CountOverview>
      ).$el.scrollIntoView({ behavior: "smooth" });
    },
    showSuccessMessage(savedType?: string) {
      debug("Saved successfully");
      MessagingService.showSuccess(
        savedType
          ? `${savedType} ${this.$t("editView.wurde-gespeichert")}`
          : this.$t("editView.deine-choreo-wurde-gespeichert"),
        this.$t("editView.gespeichert"),
        {
          autoHideDelay: 1_500,
        }
      );
    },
    skipToStart() {
      this.setCounter(0);
      this.countStartButtonHasNeverBeenUsed = false;
    },
    previousCount() {
      this.setCounter(this.count - 1);
      this.countBackButtonHasNeverBeenUsed = false;
    },
    nextCount() {
      this.setCounter(this.count + 1);
      this.countNextButtonHasNeverBeenUsed = false;
    },
    skipToEnd() {
      this.setCounter(this.choreo?.counts ? this.choreo.counts - 1 : 0);
      this.countEndButtonHasNeverBeenUsed = false;
    },
    subOutParticipant(MemberId: string) {
      (
        this.$refs.participantSubstitutionModal as InstanceType<
          typeof ParticipantSubstitutionModal
        >
      ).open(MemberId, null);
    },
    subInMember(MemberId: string) {
      (
        this.$refs.participantSubstitutionModal as InstanceType<
          typeof ParticipantSubstitutionModal
        >
      ).open(null, MemberId);
    },
    removeParticipant(MemberId: string) {
      if (!this.choreoId || !this.choreo) return;
      ChoreoService.removeParticipant(this.choreoId, MemberId).then(() => {
        if (this.choreo && this.choreo.Participants)
          this.choreo.Participants = this.choreo.Participants.filter(
            (p) => p.id != MemberId
          );
        this.setLastUpdaterToMe();
        this.updateProposedPositions();
      });
    },
    addParticipant(MemberId: string) {
      if (!this.choreoId || !this.choreo) return;

      const color = ColorService.getRandom(
        (this.choreo?.Participants || []).map(
          (p: Participant) => p.ChoreoParticipation.color
        )
      );

      ChoreoService.addParticipant(this.choreoId, MemberId, color).then(() => {
        if (!this.choreo?.SeasonTeam?.Members) return;
        const member = this.choreo.SeasonTeam.Members.find(
          (m) => m.id == MemberId
        );
        if (!member) return;
        const memberToAdd = {
          ...(member as Member),
          ChoreoParticipation: { color },
        } as Participant;
        if (this.choreo.Participants)
          this.choreo.Participants = [...this.choreo.Participants, memberToAdd];
        else this.choreo.Participants = [memberToAdd];
        this.setLastUpdaterToMe();
        this.updateProposedPositions();
      });
    },
    onSubstitution(choreo: Choreo) {
      this.choreo = choreo;
      this.updateProposedPositions();
    },
    changeColor(participantId: string, color: string) {
      if (!this.choreoId || !this.choreo) return;
      ChoreoService.changeParticipantColor(
        this.choreoId,
        participantId,
        color
      ).then(() => {
        if (this.choreo?.Participants) {
          const foundParticipant = (
            this.choreo.Participants as Participant[]
          ).find((p) => p.id == participantId);
          if (foundParticipant)
            foundParticipant.ChoreoParticipation.color = color;
        }
        this.setLastUpdaterToMe();
      });
    },
    findPreviousPosition(memberId: string) {
      if (!this.choreo || !this.choreo.Lineups) return null;
      const previousRelevantLineups = this.choreo.Lineups.filter(
        (lineup) =>
          lineup.endCount < this.count &&
          lineup.Positions.some((position) => position.MemberId == memberId)
      ).sort((a, b) => b.endCount - a.endCount);
      if (previousRelevantLineups.length == 0) return null;

      const previousRelevantLineup = previousRelevantLineups[0];
      if (!previousRelevantLineup?.Positions) return null;
      const previousPosition = previousRelevantLineup.Positions.find(
        (pos) => pos.MemberId == memberId
      );
      if (!previousPosition) return null;
      return previousPosition;
    },
    updateProposedPositions() {
      if (!this.proposalEnabled) {
        this.proposedPositions = [];
        return;
      }

      let currentlyPositionedMembers = this.lineupsForCurrentCount
        .map((lineup) => lineup.Positions.map((pos) => pos.Member))
        .flat()
        .filter((m) => m !== undefined && m !== null);

      Object.keys(this.positionUpdates).forEach((MemberId) => {
        const member = this.teamMembers.find((m) => m.id == MemberId);
        if (
          member &&
          !currentlyPositionedMembers.some((m) => m.id == member.id)
        )
          currentlyPositionedMembers.push(member);
      });

      if (currentlyPositionedMembers.length == 0) {
        const lastLineupEnd = Math.max(
          0,
          ...(this.choreo?.Lineups?.map((l) => l.endCount) ?? [0])
        );
        if (this.count > lastLineupEnd) {
          try {
            const proposedPositions = LineupService.proposeLineup(
              this.teamMembers,
              this.rejectedPositionProposals
            );
            this.setProposedPositions(proposedPositions);
          } catch (e) {
            error(e);
            this.setProposedPositions([]);
          }
        }
        return;
      } else if (currentlyPositionedMembers.length > 0) {
        const movements = this.calculateMovementsForCurrentlyPositionedMembers(
          currentlyPositionedMembers
        ).filter((movement) => movement !== null);

        if (!movements || movements.length == 0) {
          this.setProposedPositions([]);
          return;
        }

        // if all movements are the same, propose new positions based on that movement
        const allMovementsEqual = movements.every((movement) => {
          if (!movements[0]) return false;
          return (
            movement &&
            Math.abs(movement.movementX - movements[0].movementX) < 1 &&
            Math.abs(movement.movementY - movements[0].movementY) < 1
          );
        });

        if (allMovementsEqual) {
          const movementProposals =
            this.calculateProposedPositionsBasedOnMovement(
              currentlyPositionedMembers,
              movements
            ).filter((p) => p !== null);
          this.setProposedPositions(
            LineupService.filterRejectedProposals(
              movementProposals as PositionProposal[],
              this.rejectedPositionProposals
            )
          );
          return;
        } else {
          if (currentlyPositionedMembers.length > 1) {
            const lineProposals = this.calculateProposedPositionsBasedOnLine(
              currentlyPositionedMembers
            );
            const proposedPositions = LineupService.filterRejectedProposals(
              lineProposals
                ? (lineProposals.filter(
                    (p) => p !== null
                  ) as PositionProposal[])
                : [],
              this.rejectedPositionProposals
            );
            if (proposedPositions) {
              this.setProposedPositions(proposedPositions);
              return;
            }
          }
        }

        this.setProposedPositions([]);
        return;
      }
    },
    setProposedPositions(proposedPositions: ProposedPosition[]) {
      if (proposedPositions.length == 0) {
        this.proposedPositions = [];
        return;
      }
      if (
        !proposedPositions.every((p) =>
          this.currentPositions.some(
            (cp) => cp.MemberId == p.MemberId && cp.x == p.x && cp.y == p.y
          )
        )
      ) {
        this.proposedPositions = proposedPositions;
      } else {
        this.proposedPositions = [];
      }
    },
    async acceptProposedLineup() {
      const [first, ...rest] = this.proposedPositions;
      if (!first) return;
      await this.onPositionChange(first.MemberId, first.x, first.y);
      rest.forEach((proposedPosition) => {
        this.onPositionChange(
          proposedPosition.MemberId,
          proposedPosition.x,
          proposedPosition.y
        );
      });
      this.updateProposedPositions();
    },
    rejectProposedLineup(event?: MouseEvent) {
      const target = event?.target;
      if (target instanceof HTMLElement && target.closest(".dropdown-toggle"))
        return;
      this.rejectedPositionProposals.push(this.proposedPositions);
      this.proposedPositions = [];
    },
    calculateMovementsForCurrentlyPositionedMembers(
      currentlyPositionedMembers: Member[]
    ) {
      const movements = currentlyPositionedMembers.map((member) => {
        const currentRelevantLineup = this.lineupsForCurrentCount.find(
          (lineup) => lineup.Positions.some((pos) => pos.MemberId == member.id)
        );
        if (!currentRelevantLineup) return null;

        let currentPosition = currentRelevantLineup.Positions.find(
          (pos) => pos.MemberId == member.id
        );

        if (!currentPosition) return null;

        if (this.positionUpdates[member.id]) {
          currentPosition = {
            ...currentPosition,
            x: this.positionUpdates[member.id]?.x ?? 0,
            y: this.positionUpdates[member.id]?.y ?? 0,
          };
        }

        const previousPosition = this.findPreviousPosition(member.id);
        if (!previousPosition) return null;

        return {
          MemberId: member.id,
          movementX: currentPosition.x - previousPosition.x,
          movementY: currentPosition.y - previousPosition.y,
        };
      });
      return movements;
    },
    calculateProposedPositionsBasedOnMovement(
      currentlyPositionedMembers: Member[],
      movements: { MemberId: string; movementX: number; movementY: number }[]
    ) {
      const proposedPositions = this.teamMembers
        .filter((member) => {
          return (
            !currentlyPositionedMembers.some((m) => m.id == member.id) &&
            Boolean(this.findPreviousPosition(member.id))
          );
        })
        .map((member) => {
          const previousPosition = this.findPreviousPosition(member.id);
          if (!previousPosition) return null;

          if (!movements[0]) return null;

          return {
            MemberId: member.id,
            x: clamp(previousPosition.x + movements[0].movementX, 0, 100, 1),
            y: clamp(previousPosition.y + movements[0].movementY, 0, 100, 1),
            Member: member,
          };
        });
      return proposedPositions;
    },
    calculateProposedPositionsBasedOnLine(
      currentlyPositionedMembers: Member[]
    ) {
      const currentPosition1 = this.currentPositions.find(
        (p) =>
          currentlyPositionedMembers[0] &&
          p.MemberId == currentlyPositionedMembers[0].id
      );

      if (!currentPosition1) return null;

      if (this.positionUpdates[currentPosition1.MemberId]) {
        currentPosition1.x =
          this.positionUpdates[currentPosition1.MemberId]?.x ??
          currentPosition1.x;
        currentPosition1.y =
          this.positionUpdates[currentPosition1.MemberId]?.y ??
          currentPosition1.y;
      }

      const currentPosition2 = this.currentPositions.find(
        (p) =>
          currentlyPositionedMembers[1] &&
          p.MemberId == currentlyPositionedMembers[1].id
      );

      if (!currentPosition2) return null;

      if (this.positionUpdates[currentPosition2.MemberId]) {
        currentPosition2.x =
          this.positionUpdates[currentPosition2.MemberId]?.x ??
          currentPosition2.x;
        currentPosition2.y =
          this.positionUpdates[currentPosition2.MemberId]?.y ??
          currentPosition2.y;
      }

      const xDiff = roundToDecimals(currentPosition1.x - currentPosition2.x, 2);
      const yDiff = roundToDecimals(currentPosition1.y - currentPosition2.y, 2);

      const allCurrentPositionInLine = currentlyPositionedMembers.every(
        (member) => {
          const currentPosition = this.currentPositions.find(
            (p) => p.MemberId == member.id
          );

          if (!currentPosition) return false;

          if (this.positionUpdates[currentPosition.MemberId]) {
            currentPosition.x =
              this.positionUpdates[currentPosition.MemberId]?.x ??
              currentPosition.x;
            currentPosition.y =
              this.positionUpdates[currentPosition.MemberId]?.y ??
              currentPosition.y;
          }

          if (
            member.id == currentPosition1.MemberId ||
            member.id == currentPosition2.MemberId
          )
            return true;

          const currentDiffX = roundToDecimals(
            Math.abs(currentPosition.x - currentPosition2.x),
            2
          );
          const xIsMultipleOfDiff =
            Math.abs((currentDiffX / xDiff) % 1) < 0.15 ||
            (xDiff == 0 && currentDiffX == 0);

          const currentDiffY = roundToDecimals(
            Math.abs(currentPosition.y - currentPosition2.y),
            2
          );
          const yIsMultipleOfDiff =
            Math.abs((currentDiffY / yDiff) % 1) < 0.15 ||
            (yDiff == 0 && currentDiffY == 0);

          return xIsMultipleOfDiff && yIsMultipleOfDiff;
        }
      );
      if (!allCurrentPositionInLine) return null;

      const membersToPosition = this.teamMembers.filter((member) => {
        return (
          !currentlyPositionedMembers.some((m) => m.id == member.id) &&
          Boolean(this.findPreviousPosition(member.id))
        );
      });

      const additor = currentlyPositionedMembers.filter((m) => {
        let isBetweenPositions = false;
        const currentMember = this.currentPositions.find(
          (p) => p.MemberId == m.id
        );

        if (!currentMember) return false;

        if (yDiff > 0)
          isBetweenPositions = currentMember.y >= currentPosition2.y;
        else if (yDiff < 0)
          isBetweenPositions = currentMember.y <= currentPosition1.y;

        if (isBetweenPositions) return true;

        if (xDiff >= 0)
          isBetweenPositions = currentMember.x > currentPosition2.x;
        else if (xDiff <= 0)
          isBetweenPositions = currentMember.x < currentPosition1.x;
        return isBetweenPositions;
      }).length;

      const proposedPositions = membersToPosition.map((member, i) => {
        const factor = i + 1 + additor;

        return {
          Member: member,
          MemberId: member.id,
          x: clamp(currentPosition1.x + factor * xDiff, 0, 100, 1),
          y: clamp(currentPosition1.y + factor * yDiff, 0, 100, 1),
        };
      });
      return proposedPositions;
    },
    openHowToModal() {
      (this.$refs.howToModal as InstanceType<typeof HowToModal>).open();
    },
    openChangeChoreoLengthModal() {
      (
        this.$refs.changeChoreoLengthModal as InstanceType<
          typeof ChangeChoreoLengthModal
        >
      ).open();
    },
    openChangeMatLayoutModal() {
      (
        this.$refs.changeMatLayoutModal as InstanceType<
          typeof ChangeMatLayoutModal
        >
      ).open();
    },
    openDeleteChoreoModal() {
      (
        this.$refs.deleteChoreoModal as InstanceType<typeof DeleteChoreoModal>
      ).open();
    },
    setLastUpdaterToMe() {
      if (this.me?.id && this.choreo?.updaterId === this.me?.id) {
        this.choreo.updaterId = this.me?.id;
        this.choreo.updater = this.me;
      }
    },
  },
});
</script>
