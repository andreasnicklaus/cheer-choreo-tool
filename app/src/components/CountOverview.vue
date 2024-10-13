<template>
  <b-card>
    <b-card-header class="d-flex justify-content-between align-items-center">
      <b-card-title class="mb-0"> Dieser Count </b-card-title>
      <b-badge>
        {{ countToString(count) }}
      </b-badge>
    </b-card-header>
    <b-list-group flush>
      <!-- HITS -->
      <b-skeleton-wrapper :loading="!hitsForCurrentCount">
        <template #loading>
          <b-list-group-item v-for="(_, i) in Array(1)" :key="i">
            <b-skeleton width="25%" height="30px" class="mb-2" />
            <b-skeleton width="50%" />
            <b-skeleton width="25%" class="mb-3" />
          </b-list-group-item>
        </template>
        <b-list-group-item
          v-for="hit in hitsForCurrentCount"
          :key="hit.id"
          :variant="
            editHitId != null ? (editHitId != hit.id ? 'light' : null) : null
          "
        >
          <div v-if="hit.id != editHitId">
            <h5>
              <b-row align-h="between" align-v="center">
                <b-col>
                  {{ hit.name }}
                </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      title="Zum vorigen Count verschieben"
                      :disabled="count <= 0 || !interactive"
                      @click="() => moveHitToPreviousCount(hit.id)"
                    >
                      <b-icon-chevron-left />
                    </b-button>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      title="Zum nächsten Count verschieben"
                      :disabled="count >= choreo.counts - 1 || !interactive"
                      @click="() => moveHitToNextCount(hit.id)"
                    >
                      <b-icon-chevron-right />
                    </b-button>
                    <b-button
                      variant="outline-success"
                      @click="() => editHit(hit.id)"
                      v-b-tooltip.hover
                      title="bearbeiten"
                      :disabled="!interactive"
                    >
                      <b-icon-pen />
                    </b-button>
                    <b-button
                      variant="outline-danger"
                      @click="() => deleteHit(hit.id)"
                      v-b-tooltip.hover
                      title="löschen"
                      :disabled="!interactive"
                    >
                      <b-icon-trash />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </h5>

            <b-col
              v-if="
                hit.Members &&
                hit.Members.length > 0 &&
                hit.Members.length != teamMembers.length
              "
              :style="{ columnCount: 2 }"
            >
              <b-row v-for="member in hit.Members" :key="member.id">
                <div
                  class="mr-2"
                  :style="{
                    height: '24px',
                    width: '24px',
                    backgroundColor: member.color + '55',
                    borderRadius: '50%',
                    border: 'solid 2px ' + member.color,
                  }"
                ></div>
                {{ member.nickname || member.name }}
              </b-row>
            </b-col>
            <p v-else>
              <b-badge variant="info">Alle</b-badge>
            </p>
          </div>

          <div v-else>
            <h5 class="mb-4">
              <b-row align-h="between" align-v="center">
                <b-col>
                  <b-form-group :state="Boolean(editHitName)" class="m-0">
                    <b-form-input
                      v-model="editHitName"
                      :style="{
                        color: '#2c3e50',
                        border: 'none',
                        fontSize: '20px',
                        height: '1.2em',
                        textDecoration: 'underline dotted',
                      }"
                      @keydown.enter="() => saveHit()"
                      @keydown.esc="() => (editHitId = null)"
                      class="p-0"
                      autofocus
                      placeholder="Name des Hits"
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="success"
                      v-b-tooltip.hover
                      title="Speichern"
                      :disabled="!editHitName"
                      @click="() => saveHit()"
                    >
                      <b-icon-check />
                    </b-button>
                    <b-button
                      variant="danger"
                      v-b-tooltip.hover
                      title="Abbrechen"
                      @click="() => (editHitId = null)"
                    >
                      <b-icon-x />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </h5>
            <b-col>
              <b-form-group label="Count:" label-cols="auto">
                <b-form-input
                  v-model="editHitCount"
                  type="number"
                  :min="1"
                  :max="choreo.counts"
                />
              </b-form-group>
              <b-form-checkbox-group
                id="memberSelection"
                v-model="editHitMembers"
                stacked
                :style="{ columnCount: 2 }"
              >
                <b-form-checkbox
                  v-for="member in teamMembers"
                  :key="member.id"
                  :value="member.id"
                >
                  <b-row no-gutters class="mb-1">
                    <div
                      class="mr-2"
                      :style="{
                        height: '24px',
                        width: '24px',
                        backgroundColor: member.color + '55',
                        borderRadius: '50%',
                        border: 'solid 2px ' + member.color,
                      }"
                    ></div>
                    {{ member.nickname || member.name }}
                  </b-row>
                </b-form-checkbox>
              </b-form-checkbox-group>
              <b-button-group class="mt-2">
                <b-button
                  variant="light"
                  @click="() => (editHitMembers = teamMembers.map((m) => m.id))"
                >
                  <b-icon-check-all />
                  Alle auswählen
                </b-button>
                <b-button variant="light" @click="() => (editHitMembers = [])">
                  <b-icon-slash />
                  Keine auswählen
                </b-button>
                <b-button
                  variant="light"
                  @click="
                    () =>
                      (editHitMembers = teamMembers
                        .filter((m) => !editHitMembers.includes(m.id))
                        .map((m) => m.id))
                  "
                  :disabled="
                    editHitMembers?.length == 0 ||
                    editHitMembers?.length == teamMembers?.length
                  "
                >
                  <b-icon-arrow-repeat />
                  Auswahl wechseln
                </b-button>
              </b-button-group>
            </b-col>
          </div>
        </b-list-group-item>
      </b-skeleton-wrapper>

      <!-- LINEUPS -->
      <b-skeleton-wrapper :loading="!lineupsForCurrentCount">
        <template #loading>
          <b-list-group-item v-for="(_, i) in Array(1)" :key="i">
            <b-skeleton width="25%" height="30px" class="mb-2" />
            <b-skeleton width="50%" />
            <b-skeleton width="25%" class="mb-3" />
          </b-list-group-item>
        </template>
        <b-list-group-item
          v-for="lineup in lineupsForCurrentCount"
          :key="lineup.id"
          :variant="editLineupId == lineup.id ? null : 'light'"
        >
          <div v-if="lineup.id != editLineupId">
            <h5>
              <b-row align-h="between" align-v="center">
                <b-col> Aufstellung </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        lineup.startCount <= 0 ? '' : 'nach vorne verlängern'
                      "
                      @click="() => extendLineupToBeginning(lineup.id)"
                      :disabled="lineup.startCount <= 0 || !interactive"
                    >
                      <b-icon-chevron-double-left />
                    </b-button>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        lineup.startCount <= 0
                          ? ''
                          : 'gesamte Aufstellung einen Count nach vorne verschieben'
                      "
                      @click="() => moveLineupToBeginning(lineup.id)"
                      :disabled="lineup.startCount <= 0 || !interactive"
                    >
                      <b-icon-chevron-left />
                    </b-button>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        lineup.endCount >= choreo.count - 1
                          ? ''
                          : 'gesamte Aufstellung einen Count nach hinten verschieben'
                      "
                      @click="() => moveLineupToEnd(lineup.id)"
                      :disabled="
                        lineup.endCount >= choreo.count - 1 || !interactive
                      "
                    >
                      <b-icon-chevron-right />
                    </b-button>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        lineup.endCount >= choreo.count - 1
                          ? ''
                          : 'nach hinten verlängern'
                      "
                      @click="() => extendLineupToEnd(lineup.id)"
                      :disabled="
                        lineup.endCount >= choreo.count - 1 || !interactive
                      "
                    >
                      <b-icon-chevron-double-right />
                    </b-button>
                    <b-button
                      variant="outline-success"
                      v-b-tooltip.hover
                      title="bearbeiten"
                      @click="() => editLineup(lineup.id)"
                      :disabled="!interactive"
                    >
                      <b-icon-pen />
                    </b-button>
                    <b-button
                      variant="outline-danger"
                      v-b-tooltip.hover
                      title="löschen"
                      @click="() => openDeleteModal(lineup.id)"
                      :disabled="!interactive"
                    >
                      <b-icon-trash />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </h5>
            <p>
              Counts:
              <b-badge variant="light">
                {{ countToString(lineup.startCount) }}</b-badge
              >
              -
              <b-badge variant="light">
                {{ countToString(lineup.endCount) }}
              </b-badge>
            </p>

            <b-col
              v-if="
                lineup.Positions &&
                lineup.Positions.length > 0 &&
                lineup.Positions.length != teamMembers.length
              "
              :style="{ columnCount: 2 }"
            >
              <b-row
                v-for="position in lineup.Positions"
                :key="position.id"
                no-gutters
              >
                <div
                  class="mr-2"
                  :style="{
                    height: '24px',
                    width: '24px',
                    backgroundColor: position.Member.color + '55',
                    borderRadius: '50%',
                    border: 'solid 2px ' + position.Member.color,
                  }"
                ></div>
                {{ position.Member.name }}
              </b-row>
            </b-col>
            <p v-else>
              <b-badge variant="info">Alle</b-badge>
            </p>
          </div>

          <div v-else>
            <h5>
              <b-row align-h="between" align-v="center">
                <b-col> Aufstellung </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="success"
                      v-b-tooltip.hover
                      title="Speichern"
                      @click="() => saveLineup()"
                    >
                      <b-icon-check />
                    </b-button>
                    <b-button
                      variant="danger"
                      v-b-tooltip.hover
                      title="Abbrechen"
                      @click="() => (editLineupId = null)"
                    >
                      <b-icon-x />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </h5>

            <b-form>
              <b-form-group label="Start:" label-cols="2">
                <b-row>
                  <b-col>
                    <b-form-group description="Achter">
                      <b-form-input
                        type="number"
                        min="1"
                        v-model="editLineupStartAchter"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group description="Count">
                      <b-form-input
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupStartCount"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
              <b-form-group label="Ende:" label-cols="2">
                <b-row>
                  <b-col>
                    <b-form-group description="Achter">
                      <b-form-input
                        type="number"
                        min="1"
                        v-model="editLineupEndAchter"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group description="Count">
                      <b-form-input
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupEndCount"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
              <b-form-checkbox-group
                id="memberSelection-lineup"
                v-model="editLineupMembers"
                stacked
              >
                <b-form-checkbox
                  v-for="member in teamMembers"
                  :key="member.id"
                  :value="member.id"
                >
                  <b-row no-gutters class="mb-1">
                    <div
                      class="mr-2"
                      :style="{
                        height: '24px',
                        width: '24px',
                        backgroundColor: member.color + '55',
                        borderRadius: '50%',
                        border: 'solid 2px ' + member.color,
                      }"
                    ></div>
                    {{ member.nickname || member.name }}
                  </b-row>
                </b-form-checkbox>
              </b-form-checkbox-group>
            </b-form>
          </div>
        </b-list-group-item>
      </b-skeleton-wrapper>

      <b-skeleton-wrapper :loading="!choreo">
        <template #loading>
          <b-list-group-item v-for="(_, i) in Array(1)" :key="i">
            <b-skeleton width="25%" height="30px" class="mb-2" />
            <b-skeleton width="50%" />
            <b-skeleton width="25%" class="mb-3" />
          </b-list-group-item>
        </template>
        <b-list-group-item
          v-if="
            hitsForCurrentCount.length == 0 &&
            lineupsForCurrentCount.length == 0
          "
        >
          <p class="text-muted">Für diesen Count hast du noch nichts geplant</p>
        </b-list-group-item>
      </b-skeleton-wrapper>
    </b-list-group>

    <b-button
      variant="outline-success"
      block
      class="mt-2"
      v-b-modal.modal-newHit
      :disabled="!interactive"
    >
      <b-icon-plus />
      Count-Eintrag hinzufügen
    </b-button>
    <b-button
      variant="light"
      block
      class="mt-2"
      v-b-modal.modal-newLineup
      :disabled="!interactive"
    >
      <b-icon-plus />
      Aufstellung hinzufügen
    </b-button>

    <!-- NEW LINEUP MODAL -->
    <b-modal
      id="modal-newLineup"
      title="Neue Aufstellung"
      centered
      @show="resetLineupModal"
      @hidden="resetLineupModal"
      @ok="createLineup"
      size="lg"
    >
      <b-form
        @keydown.enter="
          () => {
            if (
              editLineupStartAchter &&
              editLineupStartCount &&
              editLineupEndAchter &&
              editLineupEndCount
            ) {
              $bvModal.hide('modal-newLineup');
              createLineup();
            }
          }
        "
      >
        <b-form-group label="Start:" label-cols="2">
          <b-row>
            <b-col>
              <b-form-group description="Achter">
                <b-form-input
                  type="number"
                  min="1"
                  v-model="editLineupStartAchter"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group description="Count">
                <b-form-input
                  type="number"
                  min="1"
                  max="8"
                  v-model="editLineupStartCount"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-form-group>
        <b-form-group label="Ende:" label-cols="2">
          <b-row>
            <b-col>
              <b-form-group description="Achter">
                <b-form-input
                  type="number"
                  min="1"
                  v-model="editLineupEndAchter"
                />
              </b-form-group>
            </b-col>
            <b-col>
              <b-form-group description="Count">
                <b-form-input
                  type="number"
                  min="1"
                  max="8"
                  v-model="editLineupEndCount"
                />
              </b-form-group>
            </b-col>
          </b-row>
        </b-form-group>
        <b-form-checkbox-group
          id="memberSelection-lineup"
          v-model="editLineupMembers"
          stacked
          :style="{ columnCount: 2 }"
        >
          <b-form-checkbox
            v-for="member in teamMembers"
            :key="member.id"
            :value="member.id"
            :disabled="
              lineupsForCurrentCount
                .map((l) => l.Positions.map((p) => p.MemberId))
                .flat()
                .includes(member.id)
            "
          >
            <b-row no-gutters class="mb-1">
              <div
                class="mr-2"
                :style="{
                  height: '24px',
                  width: '24px',
                  backgroundColor: member.color + '55',
                  borderRadius: '50%',
                  border: 'solid 2px ' + member.color,
                }"
              ></div>
              {{ member.nickname || member.name }}
              {{
                lineupsForCurrentCount
                  .map((l) => l.Positions.map((p) => p.MemberId))
                  .flat()
                  .includes(member.id)
                  ? "(Ist in anderer Aufstellung)"
                  : null
              }}
            </b-row>
          </b-form-checkbox>
        </b-form-checkbox-group>
      </b-form>
      <template #modal-footer="{ ok, cancel }">
        <b-button
          type="submit"
          @click="ok"
          variant="success"
          :disabled="
            !editLineupStartAchter ||
            !editLineupStartCount ||
            !editLineupEndAchter ||
            !editLineupEndCount ||
            editLineupMembers.length == 0
          "
        >
          Speichern
        </b-button>
        <b-button @click="cancel" variant="danger">Abbrechen</b-button>
      </template>
    </b-modal>

    <!-- DELETE LINEUP MODAL -->
    <b-modal
      id="modal-deleteLineup"
      title="Aufstellung löschen?"
      centered
      @hidden="resetDeleteLineupModal"
      @ok="deleteLineup"
    >
      <p class="m-0">Du kannst das nicht rückgängig machen.</p>
      <template #modal-footer="{ ok, cancel }">
        <b-button @click="ok" variant="danger"> Löschen </b-button>
        <b-button @click="cancel" variant="outline-secondary">
          Abbrechen
        </b-button>
      </template>
    </b-modal>
  </b-card>
</template>

<script>
import HitService from "@/services/HitService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";

export default {
  name: "CountOverview",
  data: () => ({
    newHitName: null,
    newHitCount: null,
    newHitMembers: [],
    editHitId: null,
    editHitName: null,
    editHitCount: 1,
    editHitMembers: [],
    editLineupId: null,
    deleteLineupId: null,
    editLineupStartAchter: 0,
    editLineupStartCount: 0,
    editLineupEndAchter: 0,
    editLineupEndCount: 0,
    editLineupMembers: [],
  }),
  props: {
    count: {
      type: Number,
      required: true,
    },
    hitsForCurrentCount: {
      type: Array,
      required: true,
    },
    lineupsForCurrentCount: {
      type: Array,
      required: true,
    },
    teamMembers: {
      type: Array,
    },
    choreo: {
      type: Object,
    },
    currentPositions: {
      type: Array,
    },
    interactive: {
      type: Boolean,
      default: true,
    },
  },
  mounted() {
    // this.editLineupId = this.lineupsForCurrentCount[0].id;
  },
  methods: {
    openNewHitModal() {
      this.$bvModal.show("modal-newHit");
    },
    countToString(count) {
      return `${Math.floor(count / 8) + 1} / ${(count % 8) + 1}`;
    },
    moveHitToPreviousCount(hitId) {
      HitService.setCount(hitId, this.count - 1).then(() => {
        let hitsCopy = this.choreo.Hits;
        hitsCopy.find((h) => h.id == hitId).count = this.count - 1;
        this.$emit("updateHits", hitsCopy);
      });
    },
    moveHitToNextCount(hitId) {
      HitService.setCount(hitId, this.count + 1).then(() => {
        let hitsCopy = this.choreo.Hits;
        hitsCopy.find((h) => h.id == hitId).count = this.count + 1;
        this.$emit("updateHits", hitsCopy);
      });
    },
    deleteHit(hitId) {
      HitService.remove(hitId).then(() => {
        let hitsCopy = this.choreo.Hits.filter((h) => h.id != hitId);
        this.$emit("updateHits", hitsCopy);
      });
    },
    editHit(id) {
      this.editHitId = id;
      const selectedHit = this.hitsForCurrentCount.find((h) => h.id == id);
      this.editHitName = selectedHit.name;
      this.editHitMembers =
        selectedHit.Members && selectedHit.Members.length > 0
          ? selectedHit.Members.map((m) => m.id)
          : this.teamMembers.map((m) => m.id);
      this.editHitCount = selectedHit.count + 1;
    },
    saveHit() {
      console.log({ editHitMembers: this.editHitMembers });
      HitService.update(
        this.editHitId,
        this.editHitName,
        this.editHitCount - 1,
        this.editHitMembers
      ).then((hit) => {
        console.log(hit);
        let hitsCopy = this.choreo.Hits.filter((h) => h.id != hit.id);
        hitsCopy.push(hit);
        this.$emit("updateHits", hitsCopy);

        this.editHitId = null;
      });
    },
    extendLineupToBeginning(lineupId) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      lineupToUpdate.startCount -= 1;
      LineupService.update(lineupId, {
        startCount: lineupToUpdate.startCount,
      }).then((lineup) => {
        const lineupCopy = this.choreo.Lineups.filter((l) => l.id != lineup.id);
        lineupCopy.push(lineup);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    extendLineupToEnd(lineupId) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      lineupToUpdate.endCount += 1;
      LineupService.update(lineupId, {
        endCount: lineupToUpdate.endCount,
      }).then((lineup) => {
        const lineupCopy = this.choreo.Lineups.filter((l) => l.id != lineup.id);
        lineupCopy.push(lineup);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    moveLineupToBeginning(lineupId) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      lineupToUpdate.endCount -= 1;
      lineupToUpdate.startCount -= 1;
      LineupService.update(lineupId, {
        startCount: lineupToUpdate.startCount,
        endCount: lineupToUpdate.endCount,
      }).then((lineup) => {
        const lineupCopy = this.choreo.Lineups.filter((l) => l.id != lineup.id);
        lineupCopy.push(lineup);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    moveLineupToEnd(lineupId) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      lineupToUpdate.endCount += 1;
      lineupToUpdate.startCount += 1;
      LineupService.update(lineupId, {
        startCount: lineupToUpdate.startCount,
        endCount: lineupToUpdate.endCount,
      }).then((lineup) => {
        const lineupCopy = this.choreo.Lineups.filter((l) => l.id != lineup.id);
        lineupCopy.push(lineup);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    editLineup(lineupId) {
      this.editLineupId = lineupId;
      const selectedLineup = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      this.editLineupStartCount = (selectedLineup.startCount % 8) + 1;
      this.editLineupStartAchter =
        Math.floor(selectedLineup.startCount / 8) + 1;
      this.editLineupEndCount = (selectedLineup.endCount % 8) + 1;
      this.editLineupEndAchter = Math.floor(selectedLineup.endCount / 8) + 1;
      this.editLineupMembers =
        selectedLineup.Positions.length > 0
          ? selectedLineup.Positions?.map((p) => p.MemberId)
          : this.teamMembers.map((m) => m.id);
    },
    saveLineup() {
      const absoluteStartCount =
        (parseInt(this.editLineupStartAchter) - 1) * 8 +
        parseInt(this.editLineupStartCount) -
        1;
      const absoluteEndCount =
        (parseInt(this.editLineupEndAchter) - 1) * 8 +
        parseInt(this.editLineupEndCount) -
        1;

      LineupService.update(this.editLineupId, {
        startCount: absoluteStartCount,
        endCount: absoluteEndCount,
      }).then((lineup) => {
        const memberIdsWithoutPositions = this.teamMembers
          .filter((m) => !this.editLineupMembers.includes(m.id))
          .map((m) => m.id);
        const positionsToDelete = this.lineupsForCurrentCount
          .find((l) => l.id == lineup.id)
          .Positions.filter((p) =>
            memberIdsWithoutPositions.includes(p.MemberId)
          );
        const positionDeletion = Promise.all(
          positionsToDelete.map((p) =>
            PositionService.remove(p.id).then(() => p.id)
          )
        );

        const memberIdsOfMembersWithPosition = this.lineupsForCurrentCount
          .find((l) => l.id == lineup.id)
          .Positions.map((p) => p.MemberId);
        const memberIdsToAdd = this.editLineupMembers.filter(
          (mId) => !memberIdsOfMembersWithPosition.includes(mId)
        );
        const positionCreation = Promise.all(
          memberIdsToAdd.map((mId) => {
            const positionOfMember = this.currentPositions.find(
              (p) => p.MemberId == mId
            );
            return PositionService.create(
              lineup.id,
              positionOfMember.x,
              positionOfMember.y,
              mId
            );
          })
        );

        return Promise.all([positionDeletion, positionCreation]).then(
          ([deletedPositionIds, createdPositions]) => {
            const lineupCopy = this.choreo.Lineups.filter(
              (l) => l.id != lineup.id
            );

            const positionsCopy = lineup.Positions.filter(
              (p) => !deletedPositionIds.includes(p.id)
            );
            positionsCopy.push(...createdPositions);
            lineup.Positions = positionsCopy;

            lineupCopy.push(lineup);
            this.$emit("updateLineups", lineupCopy);
          }
        );
      });

      this.editLineupId = null;
    },
    resetDeleteLineupModal() {
      this.deleteLineupId = null;
    },
    openDeleteModal(lineupId) {
      this.deleteLineupId = lineupId;
      this.$bvModal.show("modal-deleteLineup");
    },
    deleteLineup() {
      LineupService.remove(this.deleteLineupId).then(() => {
        this.$emit(
          "updateLineups",
          this.choreo.Lineups.filter((l) => l.id != this.deleteLineupId)
        );
      });
    },
    resetLineupModal() {
      this.editLineupStartCount = (this.count % 8) + 1;
      this.editLineupStartAchter = Math.floor(this.count / 8) + 1;
      this.editLineupEndCount = (this.count % 8) + 1;
      this.editLineupEndAchter = Math.floor(this.count / 8) + 1;
      const positionedMemberIds = this.lineupsForCurrentCount
        .map((l) => l.Positions.map((p) => p.MemberId))
        .flat();
      this.editLineupMembers = this.teamMembers
        .map((m) => m.id)
        .filter((mId) => !positionedMemberIds.includes(mId));
    },
    createLineup() {
      const absoluteStartCount =
        (parseInt(this.editLineupStartAchter) - 1) * 8 +
        parseInt(this.editLineupStartCount) -
        1;
      const absoluteEndCount =
        (parseInt(this.editLineupEndAchter) - 1) * 8 +
        parseInt(this.editLineupEndCount) -
        1;

      LineupService.create(
        absoluteStartCount,
        absoluteEndCount,
        this.choreo.id
      ).then((lineup) => {
        return Promise.all(
          this.editLineupMembers.map((mId) => {
            const positionOfMember = this.currentPositions.find(
              (p) => p.MemberId == mId
            );
            return PositionService.create(
              lineup.id,
              positionOfMember.x,
              positionOfMember.y,
              mId
            );
          })
        ).then((createdPositions) => {
          const lineupCopy = this.choreo.Lineups.filter(
            (l) => l.id != lineup.id
          );

          const positionsCopy = lineup.Positions || [];
          positionsCopy.push(...createdPositions);
          lineup.Positions = positionsCopy;

          lineupCopy.push(lineup);
          this.$emit("updateLineups", lineupCopy);
        });
      });
    },
  },
};
</script>
