<template>
  <b-container id="editView" @keydown="onKeyPress" data-view>
    <EditableNameHeading
      name="Choreo"
      :value="choreo?.name"
      class="mb-4"
      @input="onNameEdit"
      placeholder="lädt..."
      v-if="!$store.state.isMobile"
    />

    <!-- Controls -->
    <b-row align-v="center" class="mb-4" v-if="!$store.state.isMobile">
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
              Zum vorigen Count springen
            </b-tooltip>
            <b-tooltip
              v-if="count > 0 && countStartButtonHasNeverBeenUsed"
              target="tooltip-target-skipToStart"
              triggers="hover"
            >
              Zum Anfang springen
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
                  Achter: <b>{{ Math.floor(count / 8) + 1 }}</b>
                </p>
                <p class="mb-0">
                  Count: <b>{{ (count % 8) + 1 }}</b>
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
              Zum nächsten Count springen
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
              Zum Ende springen
            </b-tooltip>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="auto" class="h3">
        <b-button-group>
          <b-button
            variant="light"
            v-b-tooltip.hover
            title="Anleitung"
            @click="() => $refs.howToModal.open()"
          >
            <b-icon-question />
          </b-button>
          <b-dropdown
            right
            no-caret
            variant="light"
            v-b-tooltip.hover
            title="Optionen"
          >
            <template #button-content>
              <b-icon-three-dots-vertical />
            </template>
            <b-dropdown-item :to="{ name: 'PDF', params: { choreoId } }">
              <b-icon-file-pdf class="mr-2" />
              Countsheet als PDF
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Video', params: { choreoId } }">
              <b-icon-film class="mr-2" />
              Video exportieren
            </b-dropdown-item>
            <b-dropdown-divider />
            <b-dropdown-item
              @click="() => $refs.changeChoreoLengthModal.open()"
              :disabled="!choreo"
            >
              <b-icon-hash class="mr-2" />
              Länge anpassen
            </b-dropdown-item>
            <b-dropdown-text>
              <b-checkbox switch v-model="snapping">
                Positionen horizontal und vertikal ausrichten
              </b-checkbox>
            </b-dropdown-text>
            <b-dropdown-text>
              <b-checkbox switch v-model="moveWithCountEdit">
                Beim Bearbeiten den Count mitwechseln
              </b-checkbox>
            </b-dropdown-text>
            <b-dropdown-divider />
            <b-dropdown-item
              @click="() => $refs.deleteChoreoModal.open()"
              :disabled="!choreo"
              variant="danger"
            >
              <b-icon-trash class="mr-2" />
              Choreo löschen
            </b-dropdown-item>
          </b-dropdown>
        </b-button-group>
      </b-col>
    </b-row>

    <!-- Main: Mat + CountOverview -->
    <b-row align-h="around" v-if="!$store.state.isMobile">
      <b-col cols="auto">
        <Mat
          ref="Mat"
          :currentPositions="currentPositions"
          :transitionMs="transitionMs"
          :teamMembers="teamMembers"
          :snapping="snapping"
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
      </b-col>
    </b-row>

    <!-- Tabs: Countsheet + Team -->
    <b-tabs
      content-class="mt-3"
      class="mt-5"
      fill
      v-if="!$store.state.isMobile"
    >
      <b-tab title="Countsheet" active>
        <CountSheet
          v-if="choreo && choreo.Hits"
          :count="count"
          :choreo="choreo"
          @setCounter="setCounter"
          @openCreateHitModal="openCreateHitModal"
        />
      </b-tab>
      <b-tab title="Team">
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
                :title="`${
                  data.item.nickname || data.item.name.split(' ')[0]
                } auswechseln`"
                @click="subOutParticipant(data.item.id)"
              >
                <b-icon-arrow-repeat />
              </b-button>
              <b-button
                variant="outline-danger"
                v-b-tooltip.hover
                :title="`${
                  data.item.nickname || data.item.name.split(' ')[0]
                } von der Matte nehmen`"
                @click="removeParticipant(data.item.id)"
              >
                <b-icon-box-arrow-right />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <p class="text-muted" v-if="teamMembers.length == 0">
          Bisher steht noch kein Teammitglied auf der Matte.
        </p>

        <hr class="my-5" />

        <p class="text-muted">
          <b>Nicht teilnehmende Mitglieder des Teams:</b>
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
                :title="`${
                  data.item.nickname || data.item.name.split(' ')[0]
                } einwechseln`"
                @click="subInMember(data.item.id)"
              >
                <b-icon-arrow-repeat />
              </b-button>
              <b-button
                variant="outline-success"
                v-b-tooltip.hover
                :title="`${
                  data.item.nickname || data.item.name.split(' ')[0]
                } auf die Matte stellen`"
                @click="addParticipant(data.item.id)"
              >
                <b-icon-box-arrow-in-right />
              </b-button>
            </b-button-group>
          </template>
        </b-table>
        <p class="text-muted" v-if="notParticipatingMembers.length == 0">
          Alle Mitglieder deines Teams stehen schon auf der Matte.
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
import SelectHitModal from "@/components/modals/SelectHitModal.vue";
import ColorService from "@/services/ColorService";
import ParticipantSubstitutionModal from "@/components/modals/ParticipantSubstitutionModal.vue";
import MobileChoreoEditModal from "@/components/modals/MobileChoreoEditModal.vue";

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
    SelectHitModal,
    ParticipantSubstitutionModal,
    MobileChoreoEditModal,
  },
  data: () => ({
    choreoId: null,
    matHeight: 500,
    matWidth: 500,
    snapping: true,
    moveWithCountEdit: true,
    count: 0,
    team_table_fields: [
      { key: "name", sortable: true, class: "text-left" },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "actions", label: "", class: "text-right" },
    ],
    participants_table_fields: [
      { key: "name", sortable: true, class: "text-left" },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "color", label: "Farbe" },
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
  }),
  mounted() {
    if (this.$store.state.isMobile) {
      if (this.$refs.mobileChoreoEditModal)
        this.$refs.mobileChoreoEditModal.open(this.choreoId);
    } else this.loadChoreo();
  },
  watch: {
    "$route.params": {
      handler() {
        this.choreoId = this.$route.params.choreoId;
        if (this.$store.state.isMobile) {
          if (this.$refs.mobileChoreoEditModal)
            this.$refs.mobileChoreoEditModal.open(this.choreoId);
        } else this.loadChoreo();
      },
      immediate: true,
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
        })
        .catch(() => {
          this.$router.push({ name: "Start" }).catch(() => {});
        });
    },
    onPositionChange(memberId, x, y) {
      const positionToUpdate = this.lineupsForCurrentCount
        .map((l) => l.Positions.filter((p) => p.MemberId == memberId))
        .flat()[0];

      if (positionToUpdate) {
        const memberTimeout = this.positionUpdates[memberId];
        if (memberTimeout) clearTimeout(memberTimeout);

        this.positionUpdates[memberId] = setTimeout(() => {
          if (positionToUpdate.id)
            PositionService.update(
              positionToUpdate.LineupId,
              positionToUpdate.id,
              x,
              y
            ).then((position) => {
              let lineupCopy = this.choreo.Lineups;
              let positionsCopy = lineupCopy.find(
                (l) => l.id == positionToUpdate.LineupId
              ).Positions;
              positionsCopy = positionsCopy.filter(
                (p) => p.id != positionToUpdate.id
              );
              positionsCopy.push(position);
              lineupCopy.find(
                (l) => l.id == positionToUpdate.LineupId
              ).Positions = positionsCopy;
              this.choreo.Lineups = lineupCopy;
              this.positionUpdates[memberId] = null;

              this.showSuccessMessage("Aufstellung");
            });
        }, 1000);
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
          LineupService.create(this.count, this.count, this.choreoId).then(
            (lineup) => {
              let lineupCopy = this.choreo.Lineups;
              if (!lineup.Positions) lineup.Positions = [];
              lineupCopy.push(lineup);
              this.choreo.Lineups = lineupCopy;
              this.lineupCreationInProgress = false;

              this.showSuccessMessage("Aufstellung");
            }
          );
        } else {
          const memberTimeout = this.positionUpdates[memberId];
          if (memberTimeout) clearTimeout(memberTimeout);

          this.positionUpdates[memberId] = setTimeout(() => {
            let lineupCopy = this.choreo.Lineups;
            let positionsCopy = lineupCopy.find(
              (l) => l.id == lineupToUpdate.id
            ).Positions;
            positionsCopy = positionsCopy.filter((p) => p.MemberId != memberId);
            positionsCopy.push({
              LineupId: lineupToUpdate.id,
              MemberId: memberId,
              Member: this.teamMembers.find((m) => m.id == memberId),
              x,
              y,
            });
            lineupCopy.find((l) => l.id == lineupToUpdate.id).Positions =
              positionsCopy;
            this.choreo.Lineups = lineupCopy;

            PositionService.create(lineupToUpdate.id, x, y, memberId).then(
              (position) => {
                let lineupCopy = this.choreo.Lineups;
                let positionsCopy = lineupCopy.find(
                  (l) => l.id == lineupToUpdate.id
                ).Positions;
                positionsCopy = positionsCopy.filter(
                  (p) => p.MemberId != memberId
                );
                positionsCopy.push(position);
                lineupCopy.find((l) => l.id == lineupToUpdate.id).Positions =
                  positionsCopy;
                this.choreo.Lineups = lineupCopy;
                this.positionUpdates[memberId] = null;
                this.showSuccessMessage("Aufstellung");
              }
            );
          }, 0);
        }
      }
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
      const oldPositions = this.currentPositions;
      this.count = count;
      if (this.$refs.Mat)
        this.$refs.Mat.animatePositions(oldPositions, this.currentPositions);
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
      this.showSuccessMessage("Countsheet");
    },
    onUpdateLineups(lineups) {
      this.choreo.Lineups = lineups;
      this.showSuccessMessage("Aufstellung");
    },
    onUpdateCount(count) {
      if (this.moveWithCountEdit) this.setCounter(count);
    },
    onCountUpdate(counts) {
      this.choreo.counts = counts;
      this.showSuccessMessage();
    },
    openCreateHitModal() {
      this.$refs.createHitModal.open();
    },
    onHitCreated(hit) {
      let hitsCopy = this.choreo.Hits;
      hitsCopy.push(hit);
      this.choreo.Hits = hitsCopy;
      this.showSuccessMessage("Countsheet");
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
      const toastId = "toastId";
      this.$bvToast.hide(toastId);
      this.$bvToast.toast(
        savedType
          ? `${savedType} wurde gespeichert`
          : "Deine Choreo wurde gespeichert",
        {
          variant: "success",
          title: "Gespeichert",
          autoHideDelay: 1500,
          appendToast: false,
          solid: true,
          id: toastId,
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
    subOutParticipant(memberId) {
      this.$refs.participantSubstitutionModal.open(memberId, null);
    },
    subInMember(memberId) {
      this.$refs.participantSubstitutionModal.open(null, memberId);
    },
    removeParticipant(memberId) {
      ChoreoService.removeParticipant(this.choreoId, memberId).then(() => {
        this.choreo.Participants = this.choreo.Participants.filter(
          (p) => p.id != memberId
        );
      });
    },
    addParticipant(memberId) {
      const color = ColorService.getRandom(
        this.choreo.Participants.map((p) => p.ChoreoParticipation.color)
      );
      ChoreoService.addParticipant(this.choreoId, memberId, color).then(() => {
        const memberToAdd = {
          ...this.choreo.SeasonTeam.Members.find((m) => m.id == memberId),
          ChoreoParticipation: { color },
        };
        this.choreo.Participants = [...this.choreo.Participants, memberToAdd];
      });
    },
    onSubstitution(choreo) {
      this.choreo = choreo;
    },
    changeColor(participantId, color) {
      console.log(participantId, color);
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
      title: this.choreo?.name || "Lädt Choreo",
      meta: [
        {
          vmid: "description",
          name: "description",
          content:
            "Bearbeite deine Choreo und erstelle Aufstellungen und Countsheets.",
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content:
            "Bearbeite deine Choreo und erstelle Aufstellungen und Countsheets.",
        },
        {
          vmid: "og:description",
          property: "og:description",
          content:
            "Bearbeite deine Choreo und erstelle Aufstellungen und Countsheets.",
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: (this.choreo?.name || "Lädt Choreo") + " - Choreo Planer",
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: (this.choreo?.name || "Lädt Choreo") + " - Choreo Planer",
        },
      ],
    };
  },
};
</script>
