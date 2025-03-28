<template>
  <b-card>
    <b-card-header class="d-flex justify-content-between align-items-center">
      <b-card-title class="mb-0">{{
        $t("countOverview.dieser-count")
      }}</b-card-title>
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
                      :title="$t('countOverview.zum-vorigen-count-verschieben')"
                      :disabled="count <= 0 || !interactive"
                      @click="() => moveHitToPreviousCount(hit.id)"
                    >
                      <b-icon-chevron-left />
                    </b-button>
                    <b-button
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        $t('countOverview.zum-naechsten-count-verschieben')
                      "
                      :disabled="count >= choreo.counts - 1 || !interactive"
                      @click="() => moveHitToNextCount(hit.id)"
                    >
                      <b-icon-chevron-right />
                    </b-button>
                    <b-button
                      variant="outline-success"
                      @click="() => editHit(hit.id)"
                      v-b-tooltip.hover
                      :title="$t('countOverview.bearbeiten')"
                      :disabled="!interactive"
                    >
                      <b-icon-pen />
                    </b-button>
                    <b-button
                      variant="outline-danger"
                      @click="() => $refs.deleteHitModal.open(hit.id)"
                      v-b-tooltip.hover
                      :title="$t('countOverview.loeschen')"
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
                    backgroundColor:
                      teamMembers.find((tm) => tm.id == member.id)
                        .ChoreoParticipation.color + '55',
                    borderRadius: '50%',
                    border:
                      'solid 2px ' +
                      teamMembers.find((tm) => tm.id == member.id)
                        .ChoreoParticipation.color,
                  }"
                ></div>
                {{ member.nickname || member.name }}
              </b-row>
            </b-col>
            <p v-else>
              <b-badge variant="info">{{ $t("countOverview.alle") }}</b-badge>
            </p>
          </div>

          <div v-else>
            <h5 class="mb-4">
              <b-row align-h="between" align-v="center">
                <b-col>
                  <b-form-group :state="editHitNameIsValid" class="m-0">
                    <template #invalid-feedback>
                      <span :style="{ fontSize: '14px' }">
                        {{ editHitNameStateFeedback }}
                      </span>
                    </template>
                    <b-form-input
                      v-model="editHitName"
                      :style="{
                        color: '#2c3e50',
                        border: 'none',
                        fontSize: '20px',
                        height: '1.2em',
                        textDecoration: 'underline dotted',
                      }"
                      @keydown.enter="
                        () => {
                          if (editHitNameIsValid) saveHit();
                        }
                      "
                      @keydown.esc="() => (editHitId = null)"
                      class="p-0"
                      autofocus
                      :placeholder="$t('countOverview.name-des-hits')"
                      :state="editHitNameIsValid"
                    />
                  </b-form-group>
                </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="success"
                      v-b-tooltip.hover
                      :title="$t('speichern')"
                      :disabled="
                        !editHitName ||
                        !editHitAchterIsValid ||
                        !editHitCountIsValid ||
                        !editHitMembersIsValid
                      "
                      @click="() => saveHit()"
                    >
                      <b-icon-check />
                    </b-button>
                    <b-button
                      variant="danger"
                      v-b-tooltip.hover
                      :title="$t('abbrechen')"
                      @click="() => (editHitId = null)"
                    >
                      <b-icon-x />
                    </b-button>
                  </b-button-group>
                </b-col>
              </b-row>
            </h5>
            <b-col>
              <b-form-group label="Count:" label-cols="2">
                <b-row>
                  <b-col>
                    <b-form-group
                      description="Achter"
                      :state="editHitAchterIsValid"
                      :invalid-feedback="editHitAchterStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        v-model="editHitAchter"
                        :state="editHitAchterIsValid"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      description="Count"
                      :state="editHitCountIsValid"
                      :invalid-feedback="editHitCountStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        max="8"
                        v-model="editHitCount"
                        :state="editHitCountIsValid"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>

              <hr />

              <b-form-group
                label="Teilnehmer:"
                :state="editHitMembersIsValid"
                :invalid-feedback="editHitMembersStateFeedback"
              >
                <b-button-group>
                  <b-button
                    variant="light"
                    @click="
                      () => (editHitMembers = teamMembers.map((m) => m.id))
                    "
                  >
                    <b-icon-check-all />
                    {{ $t("alle-auswaehlen") }}
                  </b-button>
                  <b-button
                    variant="light"
                    @click="() => (editHitMembers = [])"
                  >
                    <b-icon-slash />
                    {{ $t("keine-auswaehlen") }}
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
                    {{ $t("auswahl-wechseln") }}
                  </b-button>
                </b-button-group>
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
                          backgroundColor:
                            member.ChoreoParticipation.color + '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' + member.ChoreoParticipation.color,
                        }"
                      ></div>
                      {{ member.nickname || member.name }}
                    </b-row>
                  </b-form-checkbox>
                </b-form-checkbox-group>
              </b-form-group>
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
                <b-col>{{ $tc("lineup", 1) }}</b-col>
                <b-col cols="auto">
                  <b-button-group class="mr-2">
                    <b-button
                      v-if="lineup.Positions.length != teamMembers.length"
                      variant="outline-primary"
                      v-b-tooltip.hover
                      :title="
                        $t(
                          'countOverview.alle-teilnehmer-in-der-aufstellung-speichern'
                        )
                      "
                      @click="() => addAllMembersToLineup(lineup.id)"
                      :disabled="!interactive"
                    >
                      <b-icon-people-fill />
                    </b-button>
                  </b-button-group>
                  <b-button-group>
                    <b-button
                      variant="outline-success"
                      v-b-tooltip.hover
                      :title="$t('countOverview.bearbeiten')"
                      @click="() => editLineup(lineup.id)"
                      :disabled="!interactive"
                    >
                      <b-icon-pen />
                    </b-button>
                    <b-button
                      variant="outline-danger"
                      v-b-tooltip.hover
                      :title="$t('countOverview.loeschen')"
                      @click="() => $refs.deleteLineupModal.open(lineup.id)"
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
                v-for="position in lineup.Positions.slice().sort((a, b) =>
                  teamMembers
                    .find((m) => m.id == a.MemberId)
                    .name.localeCompare(
                      teamMembers.find((m) => m.id == b.MemberId).name
                    )
                )"
                :key="position.id"
                no-gutters
              >
                <div
                  class="mr-2"
                  :style="{
                    height: '24px',
                    width: '24px',
                    backgroundColor:
                      teamMembers.find((tm) => tm.id == position.MemberId)
                        .ChoreoParticipation.color + '55',
                    borderRadius: '50%',
                    border:
                      'solid 2px ' +
                      teamMembers.find((tm) => tm.id == position.MemberId)
                        .ChoreoParticipation.color,
                  }"
                ></div>
                {{ position.Member.name }}
              </b-row>
            </b-col>
            <p v-else>
              <b-badge variant="info">{{ $t("countOverview.alle") }}</b-badge>
            </p>
          </div>

          <div v-else>
            <h5>
              <b-row align-h="between" align-v="center">
                <b-col> {{ $tc("lineup", 1) }} </b-col>
                <b-col cols="auto">
                  <b-button-group>
                    <b-button
                      variant="success"
                      v-b-tooltip.hover
                      :title="$t('speichern')"
                      @click="() => saveLineup()"
                      :disabled="
                        !editLineupStartAchterIsValid ||
                        !editLineupStartCountIsValid ||
                        !editLineupEndAchterIsValid ||
                        !editLineupEndCountIsValid ||
                        !editLineupMembersIsValid
                      "
                    >
                      <b-icon-check />
                    </b-button>
                    <b-button
                      variant="danger"
                      v-b-tooltip.hover
                      :title="$t('abbrechen')"
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
                    <b-form-group
                      description="Achter"
                      :state="editLineupStartAchterIsValid"
                      :invalid-feedback="editLineupStartAchterStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        v-model="editLineupStartAchter"
                        :state="editLineupStartAchterIsValid"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      description="Count"
                      :state="editLineupStartCountIsValid"
                      :invalid-feedback="editLineupStartCountStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupStartCount"
                        :state="editLineupStartCountIsValid"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>
              <b-form-group
                label="Ende:"
                label-cols="2"
                :state="editLineupStartIsBeforeEnd"
                :invalid-feedback="editLineupStartIsBeforeEndStateFeedback"
              >
                <b-row>
                  <b-col>
                    <b-form-group
                      description="Achter"
                      :state="editLineupEndAchterIsValid"
                      :invalid-feedback="editLineupEndAchterStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        v-model="editLineupEndAchter"
                        :state="editLineupEndAchterIsValid"
                      />
                    </b-form-group>
                  </b-col>
                  <b-col>
                    <b-form-group
                      description="Count"
                      :state="editLineupEndCountIsValid"
                      :invalid-feedback="editLineupEndCountStateFeedback"
                    >
                      <b-form-input
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupEndCount"
                        :state="editLineupEndCountIsValid"
                      />
                    </b-form-group>
                  </b-col>
                </b-row>
              </b-form-group>

              <hr />

              <b-form-group
                label="Teilnehmer:"
                :state="editLineupMembersIsValid"
                :invalid-feedback="editLineupMembersStateFeedback"
              >
                <b-button-group>
                  <b-button
                    variant="light"
                    @click="
                      () => (editLineupMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="editLineupMembers.length == teamMembers.length"
                  >
                    <b-icon-check-all />
                    {{ $t("alle-auswaehlen") }}
                  </b-button>
                  <b-button
                    variant="light"
                    @click="() => (editLineupMembers = [])"
                    :disabled="editLineupMembers.length == 0"
                  >
                    <b-icon-slash />
                    {{ $t("keine-auswaehlen") }}
                  </b-button>
                  <b-button
                    variant="light"
                    @click="
                      () =>
                        (editLineupMembers = teamMembers
                          .filter((m) => !editLineupMembers.includes(m.id))
                          .map((m) => m.id))
                    "
                    :disabled="
                      editLineupMembers?.length == 0 ||
                      editLineupMembers?.length == teamMembers?.length
                    "
                  >
                    <b-icon-arrow-repeat />
                    {{ $t("auswahl-wechseln") }}
                  </b-button>
                </b-button-group>

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
                  >
                    <b-row no-gutters class="mb-1">
                      <div
                        class="mr-2"
                        :style="{
                          height: '24px',
                          width: '24px',
                          backgroundColor:
                            member.ChoreoParticipation.color + '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' + member.ChoreoParticipation.color,
                        }"
                      ></div>
                      {{ member.nickname || member.name }}
                    </b-row>
                  </b-form-checkbox>
                </b-form-checkbox-group>
              </b-form-group>
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
          <p class="text-muted">
            {{
              $t("countOverview.fuer-diesen-count-hast-du-noch-nichts-geplant")
            }}
          </p>
        </b-list-group-item>
      </b-skeleton-wrapper>
    </b-list-group>

    <b-button
      variant="outline-success"
      block
      class="mt-2"
      @click="() => $emit('openCreateHitModal')"
      :disabled="!interactive"
    >
      <b-icon-plus />
      {{ $t("countOverview.count-eintrag-hinzufuegen") }}
    </b-button>
    <b-button
      variant="light"
      block
      class="mt-2"
      @click="() => $refs.createLineupModal.open()"
      :disabled="!interactive"
    >
      <b-icon-plus />
      {{ $t("countOverview.aufstellung-hinzufuegen") }}
    </b-button>

    <CreateLineupModal
      ref="createLineupModal"
      :count="count"
      :choreo="choreo"
      :teamMembers="teamMembers"
      :lineupsForCurrentCount="lineupsForCurrentCount"
      :currentPositions="currentPositions"
      @updateLineups="(lineupCopy) => $emit('updateLineups', lineupCopy)"
    />

    <DeleteLineupModal
      ref="deleteLineupModal"
      :choreo="choreo"
      @updateLineups="(lineupCopy) => $emit('updateLineups', lineupCopy)"
    />

    <DeleteHitModal
      ref="deleteHitModal"
      :choreo="choreo"
      @updateHits="(hitCopy) => $emit('updateHits', hitCopy)"
    />
  </b-card>
</template>

<script>
import HitService from "@/services/HitService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";
import CreateLineupModal from "./modals/CreateLineupModal.vue";
import DeleteLineupModal from "./modals/DeleteLineupModal.vue";
import DeleteHitModal from "./modals/DeleteHitModal.vue";

export default {
  name: "CountOverview",
  components: { CreateLineupModal, DeleteLineupModal, DeleteHitModal },
  data: () => ({
    editHitId: null,
    editHitName: null,
    editHitAchter: 1,
    editHitCount: 1,
    editHitMembers: [],
    editLineupId: null,
    editLineupStartAchter: 1,
    editLineupStartCount: 1,
    editLineupEndAchter: 1,
    editLineupEndCount: 1,
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
        this.$emit("updateCount", this.count - 1);
      });
    },
    moveHitToNextCount(hitId) {
      HitService.setCount(hitId, this.count + 1).then(() => {
        let hitsCopy = this.choreo.Hits;
        hitsCopy.find((h) => h.id == hitId).count = this.count + 1;
        this.$emit("updateHits", hitsCopy);
        this.$emit("updateCount", this.count + 1);
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
      this.editHitCount = (selectedHit.count % 8) + 1;
      this.editHitAchter = Math.floor(selectedHit.count / 8) + 1;
    },
    saveHit() {
      const absoluteCount =
        (parseInt(this.editHitAchter) - 1) * 8 +
        parseInt(this.editHitCount) -
        1;
      HitService.update(
        this.editHitId,
        this.editHitName,
        absoluteCount,
        this.editHitMembers
      ).then((hit) => {
        let hitsCopy = this.choreo.Hits.filter((h) => h.id != hit.id);
        hitsCopy.push(hit);
        this.$emit("updateHits", hitsCopy);

        this.editHitId = null;
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
    addAllMembersToLineup(lineupId) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l) => l.id == lineupId
      );
      const memberIdsWithoutPositions = this.teamMembers
        .filter(
          (m) => !lineupToUpdate.Positions.map((p) => p.MemberId).includes(m.id)
        )
        .map((m) => m.id);

      const positionCreation = Promise.all(
        memberIdsWithoutPositions.map((mId) => {
          const positionOfMember = this.currentPositions.find(
            (p) => p.MemberId == mId
          );
          return PositionService.create(
            lineupToUpdate.id,
            positionOfMember.x,
            positionOfMember.y,
            mId
          );
        })
      );

      positionCreation.then((createdPositions) => {
        const lineupCopy = this.choreo.Lineups.filter(
          (l) => l.id != lineupToUpdate.id
        );

        const positionsCopy = lineupToUpdate.Positions;
        positionsCopy.push(...createdPositions);
        lineupToUpdate.Positions = positionsCopy;

        lineupCopy.push(lineupToUpdate);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    openHitDeleteModal(hitId) {
      this.$refs.deleteHitModal(hitId);
    },
  },
  computed: {
    editHitNameIsValid() {
      return Boolean(this.editHitName) && this.editHitName.trim().length >= 3;
    },
    editHitNameStateFeedback() {
      if (!this.editHitName) return this.$t("erforderlich");
      if (this.editHitName.trim().length < 3)
        return this.$t("countOverview.hit-name-min-laenge");
      return null;
    },
    editHitAchterIsValid() {
      return Boolean(this.editHitAchter);
    },
    editHitAchterStateFeedback() {
      if (!this.editHitAchter) return this.$t("erforderlich");
      return null;
    },
    editHitCountIsValid() {
      return Boolean(this.editHitCount);
    },
    editHitCountStateFeedback() {
      if (!this.editHitCount) return this.$t("erforderlich");
      return null;
    },
    editHitMembersIsValid() {
      return Boolean(this.editHitMembers) && this.editHitMembers.length > 0;
    },
    editHitMembersStateFeedback() {
      if (!this.editHitMembers || this.editHitMembers.length == 0)
        return this.$t("erforderlich");
      return null;
    },
    editLineupStartIsBeforeEnd() {
      const absoluteStartCount =
        (parseInt(this.editLineupStartAchter) - 1) * 8 +
        parseInt(this.editLineupStartCount) -
        1;
      const absoluteEndCount =
        (parseInt(this.editLineupEndAchter) - 1) * 8 +
        parseInt(this.editLineupEndCount) -
        1;
      return absoluteStartCount <= absoluteEndCount;
    },
    editLineupStartIsBeforeEndStateFeedback() {
      if (!this.editLineupStartIsBeforeEnd)
        return this.$t("countOverview.start-vor-ende");
      return null;
    },
    editLineupEndAchterIsValid() {
      return (
        Boolean(this.editLineupEndAchter) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupEndAchterStateFeedback() {
      if (!this.editLineupEndAchter) return this.$t("erforderlich");
      return null;
    },
    editLineupStartAchterIsValid() {
      return (
        Boolean(this.editLineupStartAchter) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupStartAchterStateFeedback() {
      if (!this.editLineupStartAchter) return this.$t("erforderlich");
      return null;
    },
    editLineupStartCountIsValid() {
      return (
        Boolean(this.editLineupStartCount) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupStartCountStateFeedback() {
      if (!this.editLineupStartCount) return this.$t("erforderlich");
      return null;
    },
    editLineupEndCountIsValid() {
      return (
        Boolean(this.editLineupEndCount) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupEndCountStateFeedback() {
      if (!this.editLineupEndCount) return this.$t("erforderlich");
      return null;
    },
    editLineupMembersIsValid() {
      return (
        Boolean(this.editLineupMembers) && this.editLineupMembers.length > 0
      );
    },
    editLineupMembersStateFeedback() {
      if (!this.editLineupMembers || this.editLineupMembers.length == 0)
        return this.$t("erforderlich");
      return null;
    },
  },
};
</script>
