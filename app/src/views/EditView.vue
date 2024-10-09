<template>
  <b-container id="editView" @keydown="onKeyPress">
    <EditableNameHeading
      name="Choreo"
      :value="choreo?.name"
      class="mb-4"
      @input="onNameEdit"
      placeholder="lädt..."
    />

    <b-row align-v="center" class="mb-4">
      <b-col>
        <b-row align-h="between" align-v="center" class="mx-auto w-50">
          <b-col cols="auto">
            <b-button
              variant="outline-secondary"
              @click="() => setCounter(count - 1)"
              @dblclick="() => setCounter(0)"
              :disabled="count <= 0"
              id="tooltip-target-previousCount"
            >
              <b-icon-arrow-left />
            </b-button>
            <b-tooltip
              v-if="count > 0"
              target="tooltip-target-previousCount"
              triggers="hover"
            >
              <p>Zum vorigen Count springen</p>
              <p>Doppelklick: Zum Anfang springen</p>
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
            <b-button
              variant="outline-secondary"
              @click="() => setCounter(count + 1)"
              @dblclick="() => setCounter(choreo.counts - 1)"
              :disabled="choreo ? count >= choreo.counts - 1 : false"
              id="tooltip-target-nextCount"
            >
              <b-icon-arrow-right />
            </b-button>
            <b-tooltip
              v-if="choreo && count < choreo.counts - 1"
              target="tooltip-target-nextCount"
              triggers="hover"
            >
              <p>Zum nächsten Count springen</p>
              <p>Doppelklick: Zum Ende springen</p>
            </b-tooltip>
          </b-col>
        </b-row>
      </b-col>
      <b-col cols="auto" class="h3">
        <b-button-group>
          <b-dropdown right no-caret variant="light">
            <template #button-content>
              <b-icon-three-dots-vertical />
            </template>
            <!-- TODO: PDF page -->
            <b-dropdown-item :to="{ name: 'PDF', params: { choreoId } }">
              <b-icon-file-pdf />
              PDF
            </b-dropdown-item>
            <b-dropdown-item :to="{ name: 'Video', params: { choreoId } }">
              <b-icon-film />
              Video
            </b-dropdown-item>
          </b-dropdown>
          <b-button id="popover-info-target" variant="light">
            <b-icon-info-circle />
          </b-button>
        </b-button-group>
        <b-popover
          target="popover-info-target"
          triggers="hover focus"
          placement="left"
          :style="{ width: '400px' }"
        >
          <template #title>Steuerung</template>
          <b-table-simple>
            <b-tbody>
              <b-tr>
                <b-td class="font-weight-bold">Nächster Count</b-td>
                <b-td>
                  <b-icon-arrow-right class="mr-1" />
                  <b-badge variant="light"> Pfeil rechts </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Voriger Count</b-td>
                <b-td>
                  <b-icon-arrow-left class="mr-1" />
                  <b-badge variant="light"> Pfeil links </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Nächster Achter</b-td>
                <b-td>
                  <b-icon-arrow-down class="mr-1" />
                  <b-badge variant="light"> Pfeil unten </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Voriger Achter</b-td>
                <b-td>
                  <b-icon-arrow-up class="mr-1" />
                  <b-badge variant="light"> Pfeil oben </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Play/Pause</b-td>
                <b-td>
                  <b-badge variant="light"> Leerzeichen </b-badge>
                </b-td>
              </b-tr>
              <b-tr>
                <b-td class="font-weight-bold">Neuer Eintrag</b-td>
                <b-td>
                  <b-badge variant="light"> h </b-badge>
                </b-td>
              </b-tr>
            </b-tbody>
          </b-table-simple>

          <b-checkbox switch v-model="snapping">
            Positionen horizontal und vertikal ausrichten
          </b-checkbox>
        </b-popover>
      </b-col>
    </b-row>

    <b-row align-h="around">
      <b-col cols="auto">
        <Mat
          ref="Mat"
          :currentPositions="currentPositions"
          :transitionMs="transitionMs"
          @positionChange="onPositionChange"
          :snapping="snapping"
        />
      </b-col>
      <b-col cols="12" md="6">
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
        />
      </b-col>
    </b-row>

    <b-tabs content-class="mt-3" class="mt-5" fill>
      <b-tab title="Countsheet" active>
        <CountSheet
          v-if="choreo"
          :count="count"
          :choreo="choreo"
          @setCounter="setCounter"
        />
      </b-tab>
      <b-tab title="Team">
        <b-table
          striped
          hover
          :items="teamMembers"
          :fields="team_table_fields"
          sort-by="name"
        >
          <template #cell(color)="data">
            <div
              :style="{
                height: '24px',
                width: '24px',
                backgroundColor: data.value + '55',
                borderRadius: '50%',
                border: 'solid 2px ' + data.value,
              }"
            ></div>
          </template>
        </b-table>
      </b-tab>
    </b-tabs>
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

export default {
  name: "EditView",
  components: { Mat, CountSheet, EditableNameHeading, CountOverview },
  data: () => ({
    choreoId: null,
    matHeight: 500,
    matWidth: 500,
    snapping: true,
    count: 0,
    teamMembers: null,
    team_table_fields: [
      { key: "name", sortable: true, class: "text-left" },
      { key: "nickname", label: "Spitzname" },
      { key: "abbreviation", label: "Abkürzung" },
      { key: "color", label: "Farbe" },
    ],
    choreo: null,
    lastKeyEvent: null,
    transitionMs: 800,
    newHitName: null,
    newHitCount: 1,
    newHitMembers: [],
    positionUpdates: {},
    lineupCreationInProgress: false,
    playInterval: null,
  }),
  mounted() {
    this.loadChoreo();
  },
  watch: {
    "$route.params": {
      handler() {
        this.choreoId = this.$route.params.choreoId;
        this.loadChoreo();
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

          this.teamMembers = choreo.Team.Members.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
        })
        .catch(() => {
          this.$router.push({ name: "Start" });
        });
    },
    onPositionChange(memberId, x, y) {
      const pos = this.currentPositions.find((p) => p.MemberId == memberId);
      pos.x = x;
      pos.y = y;

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
              }
            );
          }, 0);
        }
      }
    },
    onKeyPress(event) {
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
          this.$refs.countOverview.openNewHitModal();
          break;
        case "Space":
          this.playPause();
          break;
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
      ChoreoService.changeName(this.choreoId, nameNew).then((choreo) => {
        this.choreo = choreo;
      });
    },
    onUpdateHits(hits) {
      this.choreo.Hits = hits;
    },
    onUpdateLineups(lineups) {
      this.choreo.Lineups = lineups;
    },
  },
  computed: {
    currentPositions() {
      return ChoreoService.getPositionsFromChoreoAndCount(
        this.choreo,
        this.count,
        this.teamMembers
      );
    },
    hitsForCurrentCount() {
      if (!this.choreo) return [];

      return this.choreo.Hits.filter((a) => {
        return a.count == this.count;
      });
    },
    lineupsForCurrentCount() {
      if (!this.choreo) return [];

      return this.choreo.Lineups.filter((a) => {
        return a.startCount <= this.count && a.endCount >= this.count;
      });
    },
  },
};
</script>
