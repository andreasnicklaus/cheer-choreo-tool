<template>
  <b-container id="editView" @keydown="onKeyPress">
    <EditableNameHeading
      name="Choreo"
      :value="choreo?.name"
      class="mb-4"
      @input="onNameEdit"
      placeholder="lädt..."
    />

    <!-- Controls -->
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
          <b-button
            variant="light"
            v-b-tooltip.hover
            title="Anleitung"
            v-b-modal.howToModal
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
            <b-dropdown-item v-b-modal.changeLengthModal :disabled="!choreo">
              <b-icon-hash class="mr-2" />
              Länge anpassen
            </b-dropdown-item>
            <b-dropdown-text>
              <b-checkbox switch v-model="snapping">
                Positionen horizontal und vertikal ausrichten
              </b-checkbox>
            </b-dropdown-text>
            <b-dropdown-divider />
            <b-dropdown-item
              v-b-modal.deleteModal
              :disabled="!choreo"
              variant="danger"
            >
              <b-icon-trash class="mr-2" />
              Löschen
            </b-dropdown-item>
          </b-dropdown>
        </b-button-group>
      </b-col>
    </b-row>

    <!-- Main: Mat + CountOverview -->
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

    <!-- Tabs: Countsheet + Team -->
    <b-tabs content-class="mt-3" class="mt-5" fill>
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
          :items="teamMembers"
          :fields="team_table_fields"
          sort-by="name"
        >
          <!-- TODO: Teilnehmer ausschließen -->
          <!-- TODO: Positionen mit anderem Member wechseln -->
          <!-- TODO: Hits mit anderem Member wechseln -->
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

    <!-- NEW HIT MODAL -->
    <CreateHitModal
      ref="createHitModal"
      :teamMembers="teamMembers"
      :choreoId="choreoId"
      :count="count"
      :hitsForCurrentCount="hitsForCurrentCount"
      :maxCount="choreo?.counts"
      @hitCreated="onHitCreated"
    />

    <!-- Modal: change length of choreo -->
    <b-modal
      id="changeLengthModal"
      centered
      title="Länge der Choreo ändern"
      @show="
        () => {
          if (this.choreo) {
            this.newChoreoAchter = Math.floor(this.choreo.counts / 8);
            this.newChoreoCount = this.choreo.counts % 8;
          }
        }
      "
      @ok="changeChoreoLength"
    >
      <b-form>
        <b-form-group description="Achter">
          <b-form-input type="number" min="1" v-model="newChoreoAchter" />
        </b-form-group>
        <b-form-group
          description="Counts (Zusätzliche Counts nach den Achtern)"
        >
          <b-form-input
            type="number"
            min="0"
            max="7"
            v-model="newChoreoCount"
          />
        </b-form-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button
          @click="ok"
          variant="success"
          :disabled="
            !newChoreoAchter ||
            newChoreoAchter <= 0 ||
            !newChoreoCount ||
            newChoreoCount < 0 ||
            newChoreoCount > 7
          "
        >
          Länge ändern
        </b-button>
        <b-button @click="cancel" variant="danger"> Abbrechen </b-button>
      </template>
    </b-modal>

    <!-- Modal: delete choreo -->
    <b-modal
      id="deleteModal"
      centered
      @ok="removeChoreo"
      title="Bist du sicher?"
    >
      Du kannst das nicht rückgängig machen.
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="danger"> Löschen </b-button>
        <b-button @click="cancel" variant="outline-secondary">
          Abbrechen
        </b-button>
      </template>
    </b-modal>

    <!-- Modal: How To -->
    <b-modal id="howToModal" title="Anleitung" hide-footer scrollable size="xl">
      <b-tabs fill>
        <b-tab title="Aufstellungen">
          <b-card title="Aufstellungen" border-variant="light">
            <b-card-text>
              <p>
                Aufstellungen definieren, wo sich die Teilnehmer deiner Choreo
                auf der Matte befinden. Jede Aufstellung besteht aus den
                Positionen für die Teilnehmer und einer Dauer, wie lange die
                Aufstellung gehalten wird.
              </p>
              <hr />
              <p>
                <b>Aufstellungen anlegen:</b> Um deine erste Aufstellung
                anzulegen, klicke einfach einen Teilnehmer auf der Matte an und
                platziere den Marker
                <span
                  :style="{
                    height: '24px',
                    width: '24px !important',
                    backgroundColor: '#ffab0655',
                    borderRadius: '50%',
                    border: 'solid 2px #ffab06',
                    display: 'inline-block',
                  }"
                />
                an die gewünschte Stelle. Es wird automatisch eine neue
                Aufstellung angelegt oder der Teilnehmer zu einer bestehenden
                Aufstellung hinzugefügt.
              </p>
              <hr />
              <p>
                <b>Aufstellungen aufteilen:</b> Wenn Aufstellungen nicht für
                alle gleich lang gelten, brauchst du auf denselben Count mehrere
                Aufstellungen. Entferne dafür ggf. Teilnehmer aus der
                Aufstellung, indem du in der Liste an Aufstellung und
                Countsheet-Einträgen auf <b-icon-pen /> klickst und die Häkchen
                bei den Teilnehmern entfernst. Klicke dann auf
                <b-button
                  variant="light"
                  disabled
                  :style="{
                    display: 'inline-block',
                  }"
                >
                  <b-icon-plus />Aufstellung hinzufügen
                </b-button>
                , wähle die Teilnehmer für die zweite Gruppe aus und ziehe die
                Marker dann auf der Matte an die richtige Stelle.
              </p>
              <hr />
              <b-alert variant="warning" show>
                Wenn du Aufstellungen definierst, die sich für einen Teilnehmer
                überschneiden, werden Animationen nicht richtig angezeigt!
              </b-alert>
            </b-card-text>
          </b-card>
        </b-tab>
        <b-tab title="Countsheet">
          <b-card title="Countsheet" border-variant="light">
            <b-card-text>
              <p>
                Einträge im Countsheet werden durch den Count, an dem sie
                passieren, einem Namen und durch eine Liste an Teilnehmern
                definiert.
              </p>
              <hr />
              <p>
                <b>Einträge hinzufügen:</b> Klicke auf
                <b-button
                  variant="outline-success"
                  disabled
                  :style="{
                    display: 'inline-block',
                  }"
                >
                  <b-icon-plus />Eintrag hinzufügen
                </b-button>
                oder nutze den Shortcuts
                <b-badge variant="light">H</b-badge> oder
                <b-badge variant="light">N</b-badge> oder mache einen
                Doppelklick auf die Zelle im Countsheet, um einen Neuen Eintrag
                anzulegen. Dabei kannst du den Namen festlegen und wählen, für
                wen dieser Eintrag gilt. Standardmäßig wird der Eintrag für den
                aktuellen Count angelegt.
              </p>
              <b-alert variant="info" show>
                Wenn du dir die Mühe machst anzugeben, für wen der Eintrag gilt,
                kannst du später persönliche Countsheets austeilen.
              </b-alert>
              <hr />
              <p>
                <b>Einträge bearbeiten:</b> Angelegte Einträge findest in der
                Liste an Aufstellung und Countsheet-Einträgen. Klicke auf
                <b-icon-pen /> neben dem Eintrag, den du bearbeiten willst oder
                nutze den Shortcut <b-badge variant="light">Ä</b-badge> und
                klicke nach dem Bearbeiten auf
                <b-button
                  variant="success"
                  disabled
                  :style="{
                    display: 'inline-block',
                  }"
                >
                  <b-icon-check /> </b-button
                >, um deine Änderungen zu speichern.
              </p>
            </b-card-text>
          </b-card>
        </b-tab>
        <b-tab title="Steuerung">
          <b-card title="Steuerung" border-variant="light">
            <EditViewShortcutTutorial />
          </b-card>
        </b-tab>
        <b-tab title="Video und Countsheet downloaden">
          <b-card
            title="Video und Countsheet downloaden"
            border-variant="light"
          >
            <b-card-text>
              <p>
                <b>Countsheet als PDF downloaden:</b> Klicke im Menü oben rechts
                auf
                <b-button
                  variant="light"
                  disabled
                  :style="{ display: 'inline-block' }"
                >
                  <b-icon-three-dots-vertical />
                </b-button>
                und wähle
                <b-button
                  variant="light"
                  disabled
                  :style="{ display: 'inline-block' }"
                >
                  <b-icon-file-pdf />
                  Countsheet als PDF
                </b-button>
                aus, um das Countsheet zusammenzustellen und herunterzuladen.
              </p>
              <hr />
              <p>
                <b>Aufstellungen als Video downloaden:</b> Klicke im Menü oben
                rechts auf
                <b-button
                  variant="light"
                  disabled
                  :style="{ display: 'inline-block' }"
                >
                  <b-icon-three-dots-vertical />
                </b-button>
                und wähle
                <b-button
                  variant="light"
                  disabled
                  :style="{ display: 'inline-block' }"
                >
                  <b-icon-film />
                  Video exportieren
                </b-button>
                aus, um dein Video zusammenzustellen und herunterzuladen.
              </p>
            </b-card-text>
          </b-card>
        </b-tab>
      </b-tabs>
    </b-modal>

    <!-- Modal: selectHitToUpdate -->
    <b-modal
      id="modal-selectHitToUpdate"
      centered
      @ok="() => setHitUpdateMode()"
      title="Welchen Eintrag willst du ändern?"
    >
      <b-form-radio-group
        id="hitToUpdateSelectGroup"
        v-model="hitIdToUpdate"
        :options="
          hitsForCurrentCount.map((h) => ({ text: h.name, value: h.id }))
        "
        name="hitToUpdateSelectGroup"
        stacked
      ></b-form-radio-group>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="success"> Auswählen </b-button>
        <b-button @click="cancel" variant="outline-danger">
          Abbrechen
        </b-button>
      </template>
    </b-modal>
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
import EditViewShortcutTutorial from "@/components/EditViewShortcutTutorial.vue";
import CreateHitModal from "@/components/modals/CreateHitModal.vue";

export default {
  name: "EditView",
  components: {
    Mat,
    CountSheet,
    EditableNameHeading,
    CountOverview,
    EditViewShortcutTutorial,
    CreateHitModal,
  },
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
    newChoreoCount: 0,
    newChoreoAchter: 1,
    hitIdToUpdate: null,
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

          if (choreo.Lineups.length == 0 && choreo.Hits.length == 0)
            this.$bvModal.show("howToModal");
        })
        .catch(() => {
          this.$router.push({ name: "Start" }).catch(() => {});
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
        case "KeyN":
          this.$refs.countOverview.openNewHitModal();
          break;
        case "Quote":
          this.initiateHitUpdate();
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
      ChoreoService.changeName(this.choreoId, nameNew).then(() => {
        this.choreo.name = nameNew;
      });
    },
    onUpdateHits(hits) {
      this.choreo.Hits = hits;
    },
    onUpdateLineups(lineups) {
      this.choreo.Lineups = lineups;
    },
    changeChoreoLength() {
      const counts =
        parseInt(this.newChoreoAchter) * 8 + parseInt(this.newChoreoCount);
      ChoreoService.changeLength(this.choreoId, counts).then(() => {
        this.choreo.counts = counts;
      });
    },
    removeChoreo() {
      ChoreoService.remove(this.choreoId).then(() => {
        this.$router.push({ name: "Start" }).catch(() => {});
      });
    },
    openCreateHitModal() {
      this.$refs.createHitModal.open();
    },
    onHitCreated(hit) {
      let hitsCopy = this.choreo.Hits;
      hitsCopy.push(hit);
      this.choreo.Hits = hitsCopy;
    },
    initiateHitUpdate() {
      if (this.hitsForCurrentCount.length == 0) return;
      else if (this.hitsForCurrentCount.length == 1)
        this.setHitUpdateMode(this.hitsForCurrentCount[0].id);
      else {
        this.hitIdToUpdate = this.hitsForCurrentCount[0].id;
        this.$bvModal.show("modal-selectHitToUpdate");
      }
    },
    setHitUpdateMode(hitId = this.hitIdToUpdate) {
      this.$refs.countOverview.editHit(hitId);
      this.scrollToCountOverView();
    },
    scrollToCountOverView() {
      this.$refs.countOverview.$el.scrollIntoView({ behavior: "smooth" });
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
};
</script>
