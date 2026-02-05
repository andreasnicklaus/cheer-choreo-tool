<template>
  <b-container id="editView" @keydown="onKeyPress" data-view>
    <EditableNameHeading
      name="Choreo"
      :value="choreo?.name"
      class="mb-4"
      @input="onNameEdit"
      :placeholder="`${$t('loading')}...`"
      v-if="!$store.state.isMobile || mobileEditingEnabled"
    />

    <!-- Controls -->
    <b-row
      align-v="center"
      class="mb-4"
      v-if="!$store.state.isMobile || mobileEditingEnabled"
    >
      <b-col>
        <b-row
          align-h="center"
          align-v="center"
          class="mx-auto"
          :style="{ flexWrap: 'nowrap' }"
        >
          <b-col cols="auto">
            <b-button-group>
              <b-button
                variant="outline-secondary"
                @click="skipToStart"
                :disabled="count <= 0"
                id="tooltip-target-skipToStart"
              >
                <b-icon-chevron-double-left />
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="previousCount"
                :disabled="count <= 0"
                id="tooltip-target-previousCount"
              >
                <b-icon-chevron-left />
              </b-button>
            </b-button-group>
            <b-tooltip
              v-if="count > 0 && countBackButtonHasNeverBeenUsed"
              target="tooltip-target-previousCount"
              triggers="hover"
            >
              {{ $t("editView.zum-vorigen-count-springen") }}
            </b-tooltip>
            <b-tooltip
              v-if="count > 0 && countStartButtonHasNeverBeenUsed"
              target="tooltip-target-skipToStart"
              triggers="hover"
            >
              {{ $t("editView.zum-anfang-springen") }}
            </b-tooltip>
          </b-col>
          <b-col cols="auto">
            <b-row align-v="center">
              <b-button
                :variant="playInterval ? 'danger' : 'outline-success'"
                class="mr-2"
                @click="playPause"
              >
                <b-icon-pause v-if="playInterval" />
                <b-icon-play v-else />
              </b-button>
              <div>
                <p class="mb-0">
                  {{ $t("achter") }}:
                  <b>{{ Math.floor(count / 8) + 1 }}</b>
                </p>
                <p class="mb-0">
                  {{ $tc("count", 1) }}: <b>{{ (count % 8) + 1 }}</b>
                </p>
              </div>
            </b-row>
          </b-col>
          <b-col cols="auto">
            <b-button-group>
              <b-button
                variant="outline-secondary"
                @click="nextCount"
                :disabled="choreo ? count >= choreo.counts - 1 : true"
                id="tooltip-target-nextCount"
              >
                <b-icon-chevron-right />
              </b-button>
              <b-button
                variant="outline-secondary"
                @click="skipToEnd"
                :disabled="choreo ? count >= choreo.counts - 1 : true"
                id="tooltip-target-endCount"
              >
                <b-icon-chevron-double-right />
              </b-button>
            </b-button-group>
            <b-tooltip
              v-if="
                choreo &&
                count < choreo.counts - 1 &&
                countNextButtonHasNeverBeenUsed
              "
              target="tooltip-target-nextCount"
              triggers="hover"
            >
              {{ $t("editView.zum-naechsten-count-springen") }}
            </b-tooltip>
            <b-tooltip
              v-if="
                choreo &&
                count < choreo.counts - 1 &&
                countEndButtonHasNeverBeenUsed
              "
              target="tooltip-target-endCount"
              triggers="hover"
            >
              {{ $t("editView.zum-ende-springen") }}
            </b-tooltip>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="auto" class="h3">
        <b-button-group>
          <b-button
            variant="light"
            v-b-tooltip.hover
            :title="$t('editView.anleitung')"
            @click="() => $refs.howToModal.open()"
          >
            <b-icon-question />
          </b-button>
          <b-dropdown
            right
            no-caret
            variant="light"
            v-b-tooltip.hover
            :title="$t('optionen')"
          >
            <template #button-content>
              <b-icon-three-dots-vertical />
            </template>
            <b-dropdown-group :header="$t('editView.exportieren')">
              <b-dropdown-item
                :to="{
                  name: 'PDF',
                  params: { choreoId, locale: $root.$i18n.localele },
                }"
              >
                <b-icon-file-pdf class="mr-2" />
                {{ $t("Home.countsheet-als-pdf") }}
              </b-dropdown-item>
              <b-dropdown-item
                :to="{
                  name: 'Video',
                  params: { choreoId, locale: $root.$i18n.locale },
                }"
              >
                <b-icon-film class="mr-2" />
                {{ $t("editView.video-exportieren") }}
              </b-dropdown-item>
            </b-dropdown-group>
            <b-dropdown-divider />
            <b-dropdown-group :header="$t('editView.choreo-einstellungen')">
              <b-dropdown-item
                @click="() => $refs.changeChoreoLengthModal.open()"
                :disabled="!choreo"
              >
                <b-icon-hash class="mr-2" />
                {{ $t("editView.laenge-anpassen") }}
              </b-dropdown-item>
              <b-dropdown-item
                @click="() => $refs.changeMatLayoutModal.open()"
                :disabled="!choreo"
              >
                <b-icon-layout-three-columns class="mr-2" />
                {{ $t("editView.change-mat-layout") }}
                <NewVersionBadge
                  :versions="['0.10.3', '0.11.0']"
                /> </b-dropdown-item
            ></b-dropdown-group>
            <b-dropdown-divider />
            <b-dropdown-group :header="$t('editView.bearbeitung')">
              <b-dropdown-text style="width: 250px">
                <b-checkbox switch v-model="snapping">
                  {{
                    $t("editView.positionen-horizontal-und-vertikal-ausrichten")
                  }}
                </b-checkbox>
              </b-dropdown-text>
              <b-dropdown-text style="width: 250px">
                <b-checkbox switch v-model="proposalEnabled">
                  {{ $t("editView.propose-positions") }}
                </b-checkbox>
              </b-dropdown-text>
              <b-dropdown-text>
                <b-checkbox switch v-model="moveWithCountEdit">
                  {{ $t("editView.beim-bearbeiten-den-count-mitwechseln") }}
                </b-checkbox>
              </b-dropdown-text>
            </b-dropdown-group>
            <b-dropdown-divider />
            <b-dropdown-item
              @click="() => $refs.deleteChoreoModal.open()"
              :disabled="!choreo"
              variant="danger"
            >
              <b-icon-trash class="mr-2" />
              {{ $t("editView.choreo-loeschen") }}
            </b-dropdown-item>
          </b-dropdown>
        </b-button-group>
      </b-col>
    </b-row>

    <!-- Main: Mat + CountOverview -->
    <b-row
      align-h="around"
      v-if="!$store.state.isMobile || mobileEditingEnabled"
    >
      <b-col cols="auto">
        <Mat
          ref="Mat"
          :currentPositions="currentPositions"
          :transitionMs="transitionMs"
          :teamMembers="teamMembers"
          :snapping="snapping"
          :proposedPositions="proposedPositions"
          :matType="choreo?.matType"
          @positionChange="onPositionChange"
        />
      </b-col>
      <b-col cols="12" lg="6">
        <CountOverview
          :count="count"
          :choreo="choreo"
          ref="countOverview"
          :hitsForCurrentCount="hitsForCurrentCount"
          :lineupsForCurrentCount="lineupsForCurrentCount"
          :teamMembers="teamMembers"
          :currentPositions="currentPositions"
          @updateHits="onUpdateHits"
          @updateLineups="onUpdateLineups"
          @updateCount="onUpdateCount"
          @openCreateHitModal="openCreateHitModal"
        />
        <b-card
          :sub-title="$t('editView.acceptProposal')"
          border-variant="light"
          align="right"
          class="mt-2"
          v-if="proposedPositions && proposedPositions.length > 0"
        >
          <b-dropdown
            split
            variant="light"
            v-b-tooltip.hover
            :title="$t('general.reject')"
            @click="rejectProposedLineup"
            class="mr-2"
            right
          >
            <template #button-content>
              <b-icon-x />
            </template>
            <b-dropdown-item
              @click="
                () => {
                  proposalEnabled = false;
                  rejectProposedLineup();
                }
              "
              >{{ $t("editView.reject-and-disable") }}</b-dropdown-item
            >
          </b-dropdown>
          <b-button variant="outline-success" @click="acceptProposedLineup">
            <b-icon-check class="mr-2" />
            {{ $t("general.accept") }}
          </b-button>
        </b-card>
      </b-col>
    </b-row>

    <!-- Tabs: Countsheet + Team -->
    <b-tabs
      content-class="mt-3"
      class="mt-5"
      fill
      v-if="!$store.state.isMobile || mobileEditingEnabled"
    >
      <b-tab :title="$tc('countsheet', 1)" active>
        <CountSheet
          v-if="choreo && choreo.Hits"
          :count="count"
          :choreo="choreo"
          @setCounter="setCounter"
          @openCreateHitModal="openCreateHitModal"
        />
      </b-tab>
      <b-tab :title="$tc('team', 1)">
        <b-table
          striped
          hover
          :items="teamMembers.map((m) => ({ ...m, actions: null }))"
          :fields="participants_table_fields"
          sort-by="name"
        >
          <!-- TODO: Mit einem Member wechseln, der bereits auf der Matte steht -->
          <template #cell(color)="data">
            <b-input
              type="color"
              :value="data.item.ChoreoParticipation.color"
              @input="(event) => changeColor(data.item.id, event)"
            />
          </template>
          <template #cell(actions)="data">
            <b-button-group>
              <b-button
                variant="light"
                v-b-tooltip.hover
                :title="
                  $t('editView.auswechseln', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                @click="subOutParticipant(data.item.id)"
              >
                <b-icon-arrow-repeat />
              </b-button>
              <b-button
                variant="outline-danger"
                v-b-tooltip.hover
                :title="
                  $t('editView.von-der-matte-nehmen', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                @click="removeParticipant(data.item.id)"
              >
                <b-icon-box-arrow-right />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <p class="text-muted" v-if="teamMembers.length == 0">
          {{ $t("editView.bisher-steht-noch-kein-teammitglied-auf-der-matte") }}
        </p>

        <hr class="my-5" />

        <p class="text-muted">
          <b>{{ $t("editView.nicht-teilnehmende-mitglieder-des-teams") }}:</b>
          {{ choreo?.SeasonTeam.Team.name }} ({{
            choreo?.SeasonTeam.Season.name
          }})
        </p>
        <b-table
          striped
          hover
          :items="notParticipatingMembers.map((m) => ({ ...m, actions: null }))"
          :fields="team_table_fields"
          sort-by="name"
          class="text-muted"
        >
          <template #cell(actions)="data">
            <b-button-group>
              <b-button
                variant="light"
                v-b-tooltip.hover
                :title="
                  $t('editView.einwechseln', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                @click="subInMember(data.item.id)"
              >
                <b-icon-arrow-repeat />
              </b-button>
              <b-button
                variant="outline-success"
                v-b-tooltip.hover
                :title="
                  $t('editView.auf-die-matte-stellen', {
                    name: data.item.nickname || data.item.name.split(' ')[0],
                  })
                "
                @click="addParticipant(data.item.id)"
              >
                <b-icon-box-arrow-in-right />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <p class="text-muted" v-if="notParticipatingMembers.length == 0">
          {{
            $t(
              "editView.alle-mitglieder-deines-teams-stehen-schon-auf-der-matte"
            )
          }}
        </p>
      </b-tab>
    </b-tabs>

    <CreateHitModal
      ref="createHitModal"
      :teamMembers="teamMembers"
      :choreoId="choreoId"
      :count="count"
      :hitsForCurrentCount="hitsForCurrentCount"
      :maxCount="choreo?.counts"
      @hitCreated="onHitCreated"
    />

    <!-- MODALS -->
    <ChangeChoreoLengthModal
      ref="changeChoreoLengthModal"
      :choreo="choreo"
      @countUpdate="onCountUpdate"
    />
    <ChangeMatLayoutModal
      ref="changeMatLayoutModal"
      :choreo="choreo"
      @matTypeUpdate="onMatTypeUpdate"
    />
    <DeleteChoreoModal ref="deleteChoreoModal" :choreoId="choreoId" />
    <HowToModal ref="howToModal" />
    <SelectHitModal
      ref="selectHitModal"
      :hitsForCurrentCount="hitsForCurrentCount"
      @selection="onHitSelection"
    />
    <ParticipantSubstitutionModal
      ref="participantSubstitutionModal"
      :choreo="choreo"
      :participants="teamMembers"
      :nonParticipants="notParticipatingMembers"
      @substitution="onSubstitution"
    />
    <MobileChoreoEditModal :choreoId="choreoId" ref="mobileChoreoEditModal" />
  </b-container>
</template>

<script>
import Mat from "@/components/Mat.vue";
import ChoreoService from "@/services/ChoreoService";
import CountSheet from "@/components/CountSheet.vue";
import EditableNameHeading from "@/components/EditableNameHeading.vue";
import CountOverview from "@/components/CountOverview.vue";
import PositionService from "@/services/PositionService";
import LineupService from "@/services/LineupService";
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
export default {
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
  data: function () {
    return {
      choreoId: null,
      matHeight: 500,
      matWidth: 500,
      snapping: true,
      proposalEnabled: true,
      moveWithCountEdit: true,
      count: 0,
      team_table_fields: [
        { key: "name", sortable: true, class: "text-left" },
        { key: "nickname", label: this.$t("spitzname") },
        { key: "abbreviation", label: this.$t("abkuerzung") },
        { key: "actions", label: "", class: "text-right" },
      ],
      participants_table_fields: [
        { key: "name", sortable: true, class: "text-left" },
        { key: "nickname", label: this.$t("spitzname") },
        { key: "abbreviation", label: this.$t("abkuerzung") },
        { key: "color", label: this.$t("editView.farbe") },
        { key: "actions", label: "", class: "text-right" },
      ],
      choreo: null,
      lastKeyEvent: null,
      transitionMs: 800,
      positionUpdates: {},
      lineupCreationInProgress: false,
      playInterval: null,
      countBackButtonHasNeverBeenUsed: true,
      countStartButtonHasNeverBeenUsed: true,
      countNextButtonHasNeverBeenUsed: true,
      countEndButtonHasNeverBeenUsed: true,
      proposedPositions: [],
      rejectedPositionProposals: [],
      mobileEditingEnabled: true,
    };
  },
  mounted() {
    FeatureFlagService.isEnabled(FeatureFlagKeys.MOBILE_EDITING).then(
      (enabled) => {
        this.mobileEditingEnabled = enabled;

        if (this.$store.state.isMobile && !this.mobileEditingEnabled) {
          if (this.$refs.mobileChoreoEditModal)
            this.$refs.mobileChoreoEditModal.open(this.choreoId);
        } else this.loadChoreo();
      }
    );
  },
  watch: {
    "$route.params": {
      handler() {
        this.choreoId = this.$route.params.choreoId;
        if (this.$store.state.isMobile && !this.mobileEditingEnabled) {
          if (this.$refs.mobileChoreoEditModal)
            this.$refs.mobileChoreoEditModal.open(this.choreoId);
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
  methods: {
    loadChoreo() {
      ChoreoService.getById(this.choreoId)
        .then((choreo) => {
          if (!choreo) return;

          this.choreo = choreo;

          if (choreo.Lineups.length == 0 && choreo.Hits.length == 0)
            this.$refs.howToModal.open();

          this.updateProposedPositions();
        })
        .catch((e) => {
          error(e, ERROR_CODES.CLUB_QUERY_FAILED);
          this.$router
            .push({
              name: "Start",
              params: { locale: this.$root.$i18n.locale },
            })
            .catch(() => {
              error(
                "Redundant navigation to start",
                ERROR_CODES.REDUNDANT_ROUTING
              );
            });
        });
    },
    onPositionChange(MemberId, x, y, isRetry = false) {
      const positionToUpdate = this.lineupsForCurrentCount
        .map((l) => l.Positions.filter((p) => p.MemberId == MemberId))
        .flat()[0];

      if (positionToUpdate) {
        const memberTimeout = this.positionUpdates[MemberId];
        if (memberTimeout) clearTimeout(memberTimeout.timeout);

        const pos = this.choreo.Lineups.find(
          (l) => l.id == positionToUpdate.LineupId
        ).Positions.find((p) => p.id == positionToUpdate.id);

        // Store original position to revert in case of error
        const originalX = pos.x;
        const originalY = pos.y;

        this.positionUpdates[MemberId] = {
          timeout: setTimeout(() => {
            if (positionToUpdate.id) this.updateProposedPositions();
            PositionService.update(
              positionToUpdate.LineupId,
              positionToUpdate.id,
              x,
              y
            )
              .then(() => {
                this.showSuccessMessage(this.$tc("lineup", 1));
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
            let lineupCopy = this.choreo.Lineups;
            if (!lineup.Positions) lineup.Positions = [];
            lineupCopy.push(lineup);
            this.choreo.Lineups = lineupCopy;
            this.lineupCreationInProgress = false;

            return this.createPositionOnExistingLineup(lineup, x, y, MemberId);
          });
        } else {
          const memberTimeout = this.positionUpdates[MemberId];
          if (memberTimeout) clearTimeout(memberTimeout.timeout);

          this.positionUpdates[MemberId] = {
            timeout: setTimeout(() => {
              let lineupCopy = this.choreo.Lineups;
              let positionsCopy = lineupCopy.find(
                (l) => l.id == lineupToUpdate.id
              ).Positions;
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
              lineupCopy.find((l) => l.id == lineupToUpdate.id).Positions =
                positionsCopy;
              this.choreo.Lineups = lineupCopy;

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
    },
    createPositionOnExistingLineup(lineupToUpdate, x, y, MemberId) {
      return PositionService.create(lineupToUpdate.id, x, y, MemberId).then(
        (position) => {
          let lineupCopy = this.choreo.Lineups;
          let positionsCopy = lineupCopy.find(
            (l) => l.id == lineupToUpdate.id
          ).Positions;
          positionsCopy = positionsCopy.filter((p) => p.MemberId != MemberId);
          positionsCopy.push(position);
          lineupCopy.find((l) => l.id == lineupToUpdate.id).Positions =
            positionsCopy;
          this.choreo.Lineups = lineupCopy;
          this.showSuccessMessage(this.$tc("lineup", 1));
          this.updateProposedPositions();
        }
      );
    },
    onKeyPress(event) {
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
          if (this.count < this.choreo.counts - 1)
            this.setCounter(this.count + 1);
          break;
        case "ArrowDown":
          if (this.count < this.choreo.counts - 8)
            this.setCounter(this.count + 8);
          break;
        case "ArrowUp":
          if (this.count > 7) this.setCounter(this.count - 8);
          break;
        case "KeyH":
        case "KeyN":
          this.$refs.countOverview.openNewHitModal();
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
    setCounter(count) {
      // the order does matter!
      // 1. store the old positions for animation
      // 2. persist the inflight position updates in the local choreo copy and reset the object
      // 3. change to the next count
      const oldPositions = this.currentPositions;
      this.resetPositionUpdates();
      this.count = count;

      if (this.$refs.Mat)
        this.$refs.Mat.animatePositions(oldPositions, this.currentPositions);
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
            const pos = this.choreo.Lineups.find(
              (l) => l.id == positionToUpdate.LineupId
            ).Positions.find((p) => p.id == positionToUpdate.id);

            pos.x = roundToDecimals(positionUpdate.x, 2);
            pos.y = roundToDecimals(positionUpdate.y, 2);
          }
        }
      );
      this.positionUpdates = {};
    },
    playPause() {
      if (!this.playInterval) {
        this.playInterval = setInterval(() => {
          if (this.count + 1 < this.choreo.counts) {
            this.setCounter(this.count + 1);
          } else {
            clearInterval(this.playInterval);
            this.playInterval = null;
          }
        }, this.transitionMs);
      } else {
        clearInterval(this.playInterval);
        this.playInterval = null;
      }
    },
    countToString(count) {
      return `${Math.floor(count / 8) + 1} / ${(count % 8) + 1}`;
    },
    onNameEdit(nameNew) {
      this.choreo.name = nameNew;
      ChoreoService.changeName(this.choreoId, nameNew).then(() => {
        this.choreo.name = nameNew;
        this.showSuccessMessage();
      });
    },
    onUpdateHits(hits) {
      this.choreo.Hits = hits;
      this.showSuccessMessage(this.$tc("countsheet", 1));
    },
    onUpdateLineups(lineups) {
      this.choreo.Lineups = lineups;
      this.showSuccessMessage(this.$tc("lineup", 1));
      this.updateProposedPositions();
    },
    onUpdateCount(count) {
      if (this.moveWithCountEdit) this.setCounter(count);
    },
    onCountUpdate(counts) {
      this.choreo.counts = counts;
      this.showSuccessMessage();
    },
    onMatTypeUpdate(matType) {
      this.choreo.matType = matType;
      this.showSuccessMessage();
    },
    openCreateHitModal() {
      this.$refs.createHitModal.open();
    },
    onHitCreated(hit) {
      let hitsCopy = this.choreo.Hits;
      hitsCopy.push(hit);
      this.choreo.Hits = hitsCopy;
      this.showSuccessMessage(this.$tc("countsheet", 1));
    },
    initiateHitUpdate() {
      if (this.hitsForCurrentCount.length == 0) return;
      else if (this.hitsForCurrentCount.length == 1)
        this.onHitSelection(this.hitsForCurrentCount[0].id);
      else {
        this.$refs.selectHitModal.open();
      }
    },
    onHitSelection(hitId) {
      this.$refs.countOverview.editHit(hitId);
      this.scrollToCountOverView();
    },
    scrollToCountOverView() {
      this.$refs.countOverview.$el.scrollIntoView({ behavior: "smooth" });
    },
    showSuccessMessage(savedType) {
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
      this.setCounter(this.choreo.counts - 1);
      this.countEndButtonHasNeverBeenUsed = false;
    },
    subOutParticipant(MemberId) {
      this.$refs.participantSubstitutionModal.open(MemberId, null);
    },
    subInMember(MemberId) {
      this.$refs.participantSubstitutionModal.open(null, MemberId);
    },
    removeParticipant(MemberId) {
      ChoreoService.removeParticipant(this.choreoId, MemberId).then(() => {
        this.choreo.Participants = this.choreo.Participants.filter(
          (p) => p.id != MemberId
        );
        this.updateProposedPositions();
      });
    },
    addParticipant(MemberId) {
      const color = ColorService.getRandom(
        this.choreo.Participants.map((p) => p.ChoreoParticipation.color)
      );
      ChoreoService.addParticipant(this.choreoId, MemberId, color).then(() => {
        const memberToAdd = {
          ...this.choreo.SeasonTeam.Members.find((m) => m.id == MemberId),
          ChoreoParticipation: { color },
        };
        this.choreo.Participants = [...this.choreo.Participants, memberToAdd];
        this.updateProposedPositions();
      });
    },
    onSubstitution(choreo) {
      this.choreo = choreo;
      this.updateProposedPositions();
    },
    changeColor(participantId, color) {
      ChoreoService.changeParticipantColor(
        this.choreoId,
        participantId,
        color
      ).then(() => {
        this.choreo.Participants.find(
          (p) => p.id == participantId
        ).ChoreoParticipation.color = color;
      });
    },
    findPreviousPosition(memberId) {
      const previousRelevantLineups = this.choreo.Lineups.filter(
        (lineup) =>
          lineup.endCount < this.count &&
          lineup.Positions.some((position) => position.MemberId == memberId)
      ).sort((a, b) => b.endCount - a.endCount);
      if (previousRelevantLineups.length == 0) return null;

      const previousRelevantLineup = previousRelevantLineups[0];
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

      const currentlyPositionedMembers = this.lineupsForCurrentCount
        .map((lineup) => lineup.Positions.map((pos) => pos.Member))
        .flat();

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
          ...this.choreo.Lineups.map((l) => l.endCount)
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

        // if all movements are the same, propose new positions based on that movement
        const allMovementsEqual = movements.every((movement) => {
          return (
            movement &&
            Math.abs(movement.movementX - movements[0].movementX) < 1 &&
            Math.abs(movement.movementY - movements[0].movementY) < 1
          );
        });

        if (allMovementsEqual) {
          this.setProposedPositions(
            LineupService.filterRejectedProposals(
              this.calculateProposedPositionsBasedOnMovement(
                currentlyPositionedMembers,
                movements
              ),
              this.rejectedPositionProposals
            )
          );
          return;
        } else {
          if (currentlyPositionedMembers.length > 1) {
            const proposedPositions = LineupService.filterRejectedProposals(
              this.calculateProposedPositionsBasedOnLine(
                currentlyPositionedMembers
              ),
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
    setProposedPositions(proposedPositions) {
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
    rejectProposedLineup() {
      this.rejectedPositionProposals.push(this.proposedPositions);
      this.proposedPositions = [];
    },
    calculateMovementsForCurrentlyPositionedMembers(
      currentlyPositionedMembers
    ) {
      const movements = currentlyPositionedMembers.map((member) => {
        const currentRelevantLineup = this.lineupsForCurrentCount.find(
          (lineup) => lineup.Positions.some((pos) => pos.MemberId == member.id)
        );
        if (!currentRelevantLineup) return null;

        let currentPosition = currentRelevantLineup.Positions.find(
          (pos) => pos.MemberId == member.id
        );

        if (this.positionUpdates[member.id]) {
          currentPosition = {
            ...currentPosition,
            x: this.positionUpdates[member.id].x,
            y: this.positionUpdates[member.id].y,
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
      currentlyPositionedMembers,
      movements
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

          return {
            MemberId: member.id,
            x: clamp(previousPosition.x + movements[0].movementX, 0, 100, 1),
            y: clamp(previousPosition.y + movements[0].movementY, 0, 100, 1),
            Member: member,
          };
        });
      return proposedPositions;
    },
    calculateProposedPositionsBasedOnLine(currentlyPositionedMembers) {
      const currentPosition1 = this.currentPositions.find(
        (p) => p.MemberId == currentlyPositionedMembers[0].id
      );

      if (this.positionUpdates[currentPosition1.MemberId]) {
        currentPosition1.x = this.positionUpdates[currentPosition1.MemberId].x;
        currentPosition1.y = this.positionUpdates[currentPosition1.MemberId].y;
      }

      const currentPosition2 = this.currentPositions.find((p) => {
        return p.MemberId == currentlyPositionedMembers[1].id;
      });

      if (this.positionUpdates[currentPosition2.MemberId]) {
        currentPosition2.x = this.positionUpdates[currentPosition2.MemberId].x;
        currentPosition2.y = this.positionUpdates[currentPosition2.MemberId].y;
      }

      const xDiff = roundToDecimals(currentPosition1.x - currentPosition2.x, 2);
      const yDiff = roundToDecimals(currentPosition1.y - currentPosition2.y, 2);

      const allCurrentPositionInLine = currentlyPositionedMembers.every(
        (member) => {
          const currentPosition = this.currentPositions.find(
            (p) => p.MemberId == member.id
          );

          if (this.positionUpdates[currentPosition.MemberId]) {
            currentPosition.x =
              this.positionUpdates[currentPosition.MemberId].x;
            currentPosition.y =
              this.positionUpdates[currentPosition.MemberId].y;
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
  },
  computed: {
    teamMembers() {
      if (!this.choreo?.Participants) return [];
      return Array.from(this.choreo.Participants).sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    },
    notParticipatingMembers() {
      if (!this.choreo?.SeasonTeam?.Members) return [];
      return this.choreo.SeasonTeam.Members.filter(
        (m) => !this.choreo.Participants.map((p) => p.id).includes(m.id)
      ).sort((a, b) => a.name.localeCompare(b.name));
    },
    currentPositions() {
      return ChoreoService.getPositionsFromChoreoAndCount(
        this.choreo,
        this.count,
        this.teamMembers
      );
    },
    hitsForCurrentCount() {
      if (!this.choreo || !this.choreo.Hits) return [];

      return this.choreo.Hits.filter((a) => {
        return a.count == this.count;
      }).sort((a, b) => b.Members?.length - a.Members?.length);
    },
    lineupsForCurrentCount() {
      if (!this.choreo || !this.choreo.Lineups) return [];

      return this.choreo.Lineups.filter((a) => {
        return a.startCount <= this.count && a.endCount >= this.count;
      });
    },
  },
  metaInfo() {
    return {
      title: this.choreo?.name || this.$t("pdf.laedt-choreo"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.editView.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.editView.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.editView.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content:
            (this.choreo?.name || this.$t("pdf.laedt-choreo")) +
            ` - ${this.$t("general.ChoreoPlaner")} | ${this.$t(
              "meta.defaults.title"
            )}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content:
            (this.choreo?.name || this.$t("pdf.laedt-choreo")) +
            ` - ${this.$t("general.ChoreoPlaner")} | ${this.$t(
              "meta.defaults.title"
            )}`,
        },
      ],
    };
  },
};
</script>
