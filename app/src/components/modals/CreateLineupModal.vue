<template>
  <b-modal
    :id="`modal-newLineup-${id}`"
    title="Neue Aufstellung"
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
            <b-form-group
              description="Achter"
              :state="editLineupStartAchterIsValid"
              :invalid-feedback="editLineupStartAchterStateFeedback"
            >
              <b-form-input
                type="number"
                min="1"
                v-model="editLineupStartAchter"
                autofocus
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
        :state="startIsBeforeEnd"
        :invalid-feedback="startIsBeforeEndStateFeedback"
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
                :max="Math.ceil((choreo?.counts || 0) / 8)"
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
      <b-form-group
        label="Teilnehmer:"
        :state="editLineupMembersIsValid"
        :invalid-feedback="editLineupMembersStateFeedback"
      >
        <b-button-group>
          <b-button
            variant="light"
            @click="
              () => (this.editLineupMembers = teamMembers.map((m) => m.id))
            "
            :disabled="editLineupMembers?.length == teamMembers?.length"
          >
            <b-icon-check-all />
            Alle auswählen
          </b-button>
          <b-button
            variant="light"
            @click="() => (this.editLineupMembers = [])"
            :disabled="editLineupMembers?.length == 0"
          >
            <b-icon-slash /> Keine auswählen
          </b-button>
          <b-button
            variant="light"
            @click="
              () =>
                (this.editLineupMembers = teamMembers
                  .filter((m) => !editLineupMembers.includes(m.id))
                  .map((m) => m.id))
            "
            :disabled="
              editLineupMembers?.length == 0 ||
              editLineupMembers?.length == teamMembers?.length
            "
          >
            <b-icon-arrow-repeat />
            Auswahl wechseln
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
            :disabled="
              lineupsForCurrentCount
                .map((l) => l?.Positions.map((p) => p.MemberId))
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
                  backgroundColor: member.ChoreoParticipation.color + '55',
                  borderRadius: '50%',
                  border: 'solid 2px ' + member.ChoreoParticipation.color,
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
      </b-form-group>
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
</template>

<script>
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";

export default {
  name: "CreateLineupModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
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
    choreo: {
      type: Object,
    },
    teamMembers: {
      type: Array,
    },
    lineupsForCurrentCount: {
      type: Array,
      required: true,
    },
    currentPositions: {
      type: Array,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-newLineup-${this.id}`);
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
  computed: {
    startIsBeforeEnd() {
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
    startIsBeforeEndStateFeedback() {
      if (!this.startIsBeforeEnd)
        return "Der Start deiner Aufstellung muss vor dem Ende liegen!";
      return null;
    },
    editLineupEndAchterIsValid() {
      return Boolean(this.editLineupEndAchter) && this.startIsBeforeEnd;
    },
    editLineupEndAchterStateFeedback() {
      if (!this.editLineupEndAchter) return "Erforderlich";
      return null;
    },
    editLineupStartAchterIsValid() {
      return Boolean(this.editLineupStartAchter) && this.startIsBeforeEnd;
    },
    editLineupStartAchterStateFeedback() {
      if (!this.editLineupStartAchter) return "Erforderlich";
      return null;
    },
    editLineupStartCountIsValid() {
      return Boolean(this.editLineupStartCount) && this.startIsBeforeEnd;
    },
    editLineupStartCountStateFeedback() {
      if (!this.editLineupStartCount) return "Erforderlich";
      return null;
    },
    editLineupEndCountIsValid() {
      return Boolean(this.editLineupEndCount) && this.startIsBeforeEnd;
    },
    editLineupEndCountStateFeedback() {
      if (!this.editLineupEndCount) return "Erforderlich";
      return null;
    },
    editLineupMembersIsValid() {
      return (
        Boolean(this.editLineupMembers) && this.editLineupMembers.length > 0
      );
    },
    editLineupMembersStateFeedback() {
      if (!this.editLineupMembers || this.editLineupMembers.length == 0)
        return "Erforderlich";
      return null;
    },
  },
};
</script>
