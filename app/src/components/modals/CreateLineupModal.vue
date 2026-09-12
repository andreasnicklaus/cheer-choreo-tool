<template>
  <BModal
    :id="`modal-newLineup-${id}`"
    ref="modal"
    :title="$t('modals.create-lineup.neue-aufstellung')"
    size="lg"
    scrollable
    @show="resetLineupModal"
    @hidden="resetLineupModal"
    @ok="createLineup"
  >
    <BForm @keydown.enter="onKeydownEnter">
      <BFormGroup
        :label="$t('modals.create-lineup.start')"
        label-cols="2"
        label-class="label-with-colon"
      >
        <BRow>
          <BCol>
            <BFormGroup
              :description="$t('achter')"
              :state="editLineupStartAchterIsValid"
              :invalid-feedback="editLineupStartAchterStateFeedback"
            >
              <BFormInput
                v-model="editLineupStartAchter"
                type="number"
                min="1"
                autofocus
                :state="editLineupStartAchterIsValid"
                data-testid="startAchterInput"
              />
            </BFormGroup>
          </BCol>
          <BCol>
            <BFormGroup
              :description="$t('count', 2)"
              :state="editLineupStartCountIsValid"
              :invalid-feedback="editLineupStartCountStateFeedback"
            >
              <BFormInput
                v-model="editLineupStartCount"
                type="number"
                min="1"
                max="8"
                :state="editLineupStartCountIsValid"
                data-testid="startCountInput"
              />
            </BFormGroup>
          </BCol>
        </BRow>
      </BFormGroup>
      <BFormGroup
        :label="$t('modals.create-lineup.ende')"
        label-class="label-with-colon"
        label-cols="2"
        :state="startIsBeforeEnd"
        :invalid-feedback="startIsBeforeEndStateFeedback"
      >
        <BRow>
          <BCol>
            <BFormGroup
              :description="$t('achter')"
              :state="editLineupEndAchterIsValid"
              :invalid-feedback="editLineupEndAchterStateFeedback"
            >
              <BFormInput
                v-model="editLineupEndAchter"
                type="number"
                min="1"
                :max="Math.ceil((choreo?.counts || 0) / 8)"
                :state="editLineupEndAchterIsValid"
                data-testid="endAchterInput"
              />
            </BFormGroup>
          </BCol>
          <BCol>
            <BFormGroup
              :description="$t('count', 2)"
              :state="editLineupEndCountIsValid"
              :invalid-feedback="editLineupEndCountStateFeedback"
            >
              <BFormInput
                v-model="editLineupEndCount"
                type="number"
                min="1"
                max="8"
                :state="editLineupEndCountIsValid"
                data-testid="endCountInput"
              />
            </BFormGroup>
          </BCol>
        </BRow>
      </BFormGroup>
      <BFormGroup
        :label="$t('teilnehmer')"
        label-class="label-with-colon"
        :state="editLineupMembersIsValid"
        :invalid-feedback="editLineupMembersStateFeedback"
      >
        <BButtonGroup class="mb-2">
          <BButton
            variant="light"
            :disabled="
              editLineupMembers?.length ==
              teamMembers?.filter(
                (m) =>
                  !lineupsForCurrentCount
                    .map((l) => l?.Positions.map((p) => p.MemberId))
                    .flat()
                    .includes(m.id)
              )?.length
            "
            @click="
              () =>
                (editLineupMembers = teamMembers
                  .filter(
                    (m) =>
                      !lineupsForCurrentCount
                        .map((l) => l?.Positions.map((p) => p.MemberId))
                        .flat()
                        .includes(m.id)
                  )
                  .map((m) => m.id))
            "
          >
            <IBiCheckAll />
            {{ $t("alle-auswaehlen") }}
          </BButton>
          <BButton
            variant="light"
            :disabled="editLineupMembers?.length == 0"
            @click="() => (editLineupMembers = [])"
          >
            <IBiSlash /> {{ $t("keine-auswaehlen") }}
          </BButton>
          <BButton
            variant="light"
            :disabled="
              editLineupMembers?.length == 0 ||
              editLineupMembers?.length == teamMembers?.length
            "
            @click="
              () =>
                (editLineupMembers = teamMembers
                  .filter((m) => !editLineupMembers.includes(m.id))
                  .map((m) => m.id))
            "
          >
            <IBiArrowRepeat />
            {{ $t("auswahl-wechseln") }}
          </BButton>
        </BButtonGroup>
        <BFormCheckboxGroup
          id="memberSelection-lineup"
          v-model="editLineupMembers"
          stacked
          :style="{ columnCount: 2 }"
        >
          <BFormCheckbox
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
            <BRow no-gutters class="mb-1">
              <div
                class="me-2"
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
                  ? $t("modals.create-lineup.ist-in-anderer-aufstellung")
                  : null
              }}
            </BRow>
          </BFormCheckbox>
        </BFormCheckboxGroup>
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="success"
        :disabled="
          !editLineupStartAchter ||
          !editLineupStartCount ||
          !editLineupEndAchter ||
          !editLineupEndCount ||
          editLineupMembers.length == 0
        "
        @click="ok"
      >
        {{ $t("speichern") }}
      </BButton>
      <BButton variant="outline-danger" @click="cancel">{{
        $t("abbrechen")
      }}</BButton>
    </template>
  </BModal>
</template>

<script lang="ts">
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";
import { defineComponent, PropType } from "vue";
import { BModal } from "bootstrap-vue-next";
import type { Choreo, Participant, Lineup, Position } from "@/types";

/**
 * @module Modal:CreateLineupModal
 *
 * @vue-data {String} id
 * @vue-data {Number} editLineupStartAchter=1
 * @vue-data {Number} editLineupStartCount=1
 * @vue-data {Number} editLineupEndAchter=1
 * @vue-data {Number} editLineupEndCount=1
 * @vue-data {Array} editLineupMembers
 *
 * @vue-prop {Number} count
 * @vue-prop {Object} choreo
 * @vue-prop {Array} teamMembers
 * @vue-prop {Array} lineupsForCurrentCount
 * @vue-prop {Array} currentPositions
 *
 * @vue-computed {Boolean} startIsBeforeEnd
 * @vue-computed {String|null} startIsBeforeEndStateFeedback
 * @vue-computed {Boolean} editLineupEndAchterIsValid
 * @vue-computed {String|null} editLineupEndAchterStateFeedback
 * @vue-computed {Boolean} editLineupStartAchterIsValid
 * @vue-computed {String|null} editLineupStartAchterStateFeedback
 * @vue-computed {Boolean} editLineupStartCountIsValid
 * @vue-computed {String|null} editLineupStartCountStateFeedback
 * @vue-computed {Boolean} editLineupEndCountIsValid
 * @vue-computed {String|null} editLineupEndCountStateFeedback
 * @vue-computed {Boolean} editLineupMembersIsValid
 * @vue-computed {String|null} editLineupMembersStateFeedback
 *
 * @vue-event {Object} updateLineups
 *
 * @example
 * <template>
 *  <CreateLineupModal ref="createLineupModal" :count="1" :choreo="choreoObj" :teamMembers="members" :lineupsForCurrentCount="lineups" :currentPositions="positions" @updateLineups="handler" />
 *  <Button @click="() => $refs.createLineupModal.open()" />
 * </template>
 */
export default defineComponent({
  name: "CreateLineupModal",
  props: {
    count: {
      type: Number,
      required: true,
    },
    choreo: {
      type: Object as PropType<Choreo>,
      default: null,
    },
    teamMembers: {
      type: Array as PropType<Participant[]>,
      default: () => [],
    },
    lineupsForCurrentCount: {
      type: Array as PropType<Lineup[]>,
      required: true,
    },
    currentPositions: {
      type: Array as PropType<Position[]>,
      default: () => [],
    },
  },
  emits: ["updateLineups"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    editLineupStartAchter: 1,
    editLineupStartCount: 1,
    editLineupEndAchter: 1,
    editLineupEndCount: 1,
    editLineupMembers: [] as string[],
  }),
  computed: {
    startIsBeforeEnd() {
      const absoluteStartCount =
        (parseInt(String(this.editLineupStartAchter)) - 1) * 8 +
        parseInt(String(this.editLineupStartCount)) -
        1;
      const absoluteEndCount =
        (parseInt(String(this.editLineupEndAchter)) - 1) * 8 +
        parseInt(String(this.editLineupEndCount)) -
        1;
      return absoluteStartCount <= absoluteEndCount;
    },
    startIsBeforeEndStateFeedback() {
      if (!this.startIsBeforeEnd)
        return this.$t("countOverview.start-vor-ende");
      return undefined;
    },
    editLineupEndAchterIsValid() {
      return Boolean(this.editLineupEndAchter) && this.startIsBeforeEnd;
    },
    editLineupEndAchterStateFeedback() {
      if (!this.editLineupEndAchter) return this.$t("erforderlich");
      return undefined;
    },
    editLineupStartAchterIsValid() {
      return Boolean(this.editLineupStartAchter) && this.startIsBeforeEnd;
    },
    editLineupStartAchterStateFeedback() {
      if (!this.editLineupStartAchter) return this.$t("erforderlich");
      return undefined;
    },
    editLineupStartCountIsValid() {
      return Boolean(this.editLineupStartCount) && this.startIsBeforeEnd;
    },
    editLineupStartCountStateFeedback() {
      if (!this.editLineupStartCount) return this.$t("erforderlich");
      return undefined;
    },
    editLineupEndCountIsValid() {
      return Boolean(this.editLineupEndCount) && this.startIsBeforeEnd;
    },
    editLineupEndCountStateFeedback() {
      if (!this.editLineupEndCount) return this.$t("erforderlich");
      return undefined;
    },
    editLineupMembersIsValid() {
      return (
        Boolean(this.editLineupMembers) && this.editLineupMembers.length > 0
      );
    },
    editLineupMembersStateFeedback() {
      if (!this.editLineupMembers || this.editLineupMembers.length == 0)
        return this.$t("erforderlich");
      return undefined;
    },
  },
  methods: {
    open() {
      (this.$refs.modal as InstanceType<typeof BModal>).show();
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
    onKeydownEnter() {
      if (
        this.editLineupStartAchter &&
        this.editLineupStartCount &&
        this.editLineupEndAchter &&
        this.editLineupEndCount
      ) {
        (this.$refs.modal as InstanceType<typeof BModal>).hide();
        this.createLineup();
      }
    },
    createLineup() {
      const absoluteStartCount =
        (parseInt(String(this.editLineupStartAchter)) - 1) * 8 +
        parseInt(String(this.editLineupStartCount)) -
        1;
      const absoluteEndCount =
        (parseInt(String(this.editLineupEndAchter)) - 1) * 8 +
        parseInt(String(this.editLineupEndCount)) -
        1;

      const choreo = this.choreo as Choreo;
      LineupService.create(
        absoluteStartCount,
        absoluteEndCount,
        choreo.id
      ).then((lineup) => {
        return Promise.all(
          this.editLineupMembers.map((mId) => {
            const positionOfMember = (this.currentPositions as Position[]).find(
              (p) => p.MemberId == mId
            ) as Position;
            return PositionService.create(
              lineup.id,
              positionOfMember.x,
              positionOfMember.y,
              mId
            );
          })
        ).then((createdPositions) => {
          const lineupCopy = choreo.Lineups.filter((l) => l.id != lineup.id);

          const positionsCopy = lineup.Positions || [];
          positionsCopy.push(...createdPositions);
          lineup.Positions = positionsCopy;

          lineupCopy.push(lineup);
          this.$emit("updateLineups", lineupCopy);
        });
      });
    },
  },
});
</script>
