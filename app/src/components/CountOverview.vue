<template>
  <BCard>
    <BCardHeader class="d-flex justify-content-between align-items-center">
      <BCardTitle class="mb-0">{{
        $t("countOverview.dieser-count")
      }}</BCardTitle>
      <BBadge>
        {{ countToString(count) }}
      </BBadge>
    </BCardHeader>
    <BListGroup flush>
      <!-- HITS -->
      <BPlaceholderWrapper :loading="!hitsForCurrentCount">
        <template #loading>
          <BListGroupItem v-for="(_, i) in Array(1)" :key="i">
            <BPlaceholder width="25%" height="30px" class="mb-2" />
            <BPlaceholder width="50%" />
            <BPlaceholder width="25%" class="mb-3" />
          </BListGroupItem>
        </template>
        <BListGroupItem
          v-for="hit in hitsForCurrentCount"
          :key="hit.id"
          :variant="
            editHitId != null ? (editHitId != hit.id ? 'light' : null) : null
          "
        >
          <div v-show="hit.id != editHitId">
            <h5>
              <BRow align-h="between" align-v="center">
                <BCol>
                  {{ hit.name }}
                </BCol>
                <BCol cols="auto">
                  <BButtonGroup>
                    <BButton
                      variant="outline-primary"
                      v-b-tooltip.hover="
                        $t('countOverview.zum-vorigen-count-verschieben')
                      "
                      :disabled="count <= 0 || !interactive"
                      @click="() => moveHitToPreviousCount(hit.id)"
                      data-testid="moveHitToPreviousCount-button"
                    >
                      <IBiChevronLeft />
                    </BButton>
                    <BButton
                      variant="outline-primary"
                      v-b-tooltip.hover="
                        $t('countOverview.zum-naechsten-count-verschieben')
                      "
                      :disabled="count >= choreo.counts - 1 || !interactive"
                      @click="() => moveHitToNextCount(hit.id)"
                      data-testid="moveHitToNextCount-button"
                    >
                      <IBiChevronRight />
                    </BButton>
                    <BButton
                      variant="outline-success"
                      @click="() => editHit(hit.id)"
                      v-b-tooltip.hover="$t('countOverview.bearbeiten')"
                      :disabled="!interactive"
                      data-testid="editHit-button"
                    >
                      <IBiPen />
                    </BButton>
                    <BButton
                      variant="outline-danger"
                      @click="() => $refs.deleteHitModal.open(hit.id)"
                      v-b-tooltip.hover="$t('countOverview.loeschen')"
                      :disabled="!interactive"
                      data-testid="deleteHit-button"
                    >
                      <IBiTrash />
                    </BButton>
                  </BButtonGroup>
                </BCol>
              </BRow>
            </h5>

            <BCol
              v-show="
                hit.Members &&
                hit.Members.length > 0 &&
                hit.Members.length != teamMembers.length
              "
              :style="{ columnCount: 2 }"
            >
              <BRow v-for="member in hit.Members" :key="member.id">
                <div
                  class="me-2"
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
              </BRow>
            </BCol>
            <p
              v-show="
                !hit.Members ||
                hit.Members.length <= 0 ||
                hit.Members.length == teamMembers.length
              "
            >
              <BBadge variant="info">{{ $t("countOverview.alle") }}</BBadge>
            </p>
          </div>

          <div v-show="hit.id == editHitId">
            <h5 class="mb-4">
              <BRow align-h="between" align-v="center">
                <BCol>
                  <BFormGroup :state="editHitNameIsValid" class="m-0">
                    <template #invalid-feedback>
                      <span :style="{ fontSize: '14px' }">
                        {{ editHitNameStateFeedback }}
                      </span>
                    </template>
                    <BFormInput
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
                  </BFormGroup>
                </BCol>
                <BCol cols="auto">
                  <BButtonGroup>
                    <BButton
                      variant="success"
                      v-b-tooltip.hover="$t('speichern')"
                      :disabled="
                        !editHitName ||
                        !editHitAchterIsValid ||
                        !editHitCountIsValid ||
                        !editHitMembersIsValid
                      "
                      @click="() => saveHit()"
                      data-testid="saveHit-button"
                    >
                      <IBiCheck />
                    </BButton>
                    <BButton
                      variant="danger"
                      v-b-tooltip.hover="$t('abbrechen')"
                      @click="() => (editHitId = null)"
                    >
                      <IBiX />
                    </BButton>
                  </BButtonGroup>
                </BCol>
              </BRow>
            </h5>
            <BCol>
              <BFormGroup
                :label="$t('count', 1)"
                label-cols="2"
                label-class="label-with-colon"
              >
                <BRow>
                  <BCol>
                    <BFormGroup
                      :description="$t('achter')"
                      :state="editHitAchterIsValid"
                      :invalid-feedback="editHitAchterStateFeedback"
                    >
                      <BFormInput
                        data-testid="editHitAchterInput"
                        type="number"
                        min="1"
                        v-model="editHitAchter"
                        :state="editHitAchterIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                  <BCol>
                    <BFormGroup
                      :description="$t('count', 1)"
                      :state="editHitCountIsValid"
                      :invalid-feedback="editHitCountStateFeedback"
                    >
                      <BFormInput
                        data-testid="editHitCountInput"
                        type="number"
                        min="1"
                        max="8"
                        v-model="editHitCount"
                        :state="editHitCountIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                </BRow>
              </BFormGroup>

              <hr />

              <BFormGroup
                :label="$t('teilnehmer')"
                label-class="label-with-colon"
                :state="editHitMembersIsValid"
                :invalid-feedback="editHitMembersStateFeedback"
              >
                <BButtonGroup>
                  <BButton
                    variant="light"
                    @click="
                      () => (editHitMembers = teamMembers.map((m) => m.id))
                    "
                  >
                    <IBiCheckAll />
                    {{ $t("alle-auswaehlen") }}
                  </BButton>
                  <BButton variant="light" @click="() => (editHitMembers = [])">
                    <IBiSlash />
                    {{ $t("keine-auswaehlen") }}
                  </BButton>
                  <BButton
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
                    <IBiArrowRepeat />
                    {{ $t("auswahl-wechseln") }}
                  </BButton>
                </BButtonGroup>
                <BFormCheckbox-group
                  id="memberSelection"
                  v-model="editHitMembers"
                  stacked
                  :style="{ columnCount: 2 }"
                >
                  <BFormCheckbox
                    v-for="member in teamMembers"
                    :key="member.id"
                    :value="member.id"
                  >
                    <BRow no-gutters class="mb-1">
                      <div
                        class="me-2"
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
                    </BRow>
                  </BFormCheckbox>
                </BFormCheckbox-group>
              </BFormGroup>
            </BCol>
          </div>
        </BListGroupItem>
      </BPlaceholderWrapper>

      <!-- LINEUPS -->
      <BPlaceholderWrapper :loading="!lineupsForCurrentCount">
        <template #loading>
          <BListGroupItem v-for="(_, i) in Array(1)" :key="i">
            <BPlaceholder width="25%" height="30px" class="mb-2" />
            <BPlaceholder width="50%" />
            <BPlaceholder width="25%" class="mb-3" />
          </BListGroupItem>
        </template>
        <BListGroupItem
          v-for="lineup in lineupsForCurrentCount"
          :key="lineup.id"
          :variant="editLineupId == lineup.id ? null : 'light'"
        >
          <div v-show="lineup.id != editLineupId">
            <h5>
              <BRow align-h="between" align-v="center">
                <BCol>{{ $t("lineup", 1) }}</BCol>
                <BCol cols="auto">
                  <BButtonGroup class="me-2">
                    <BButton
                      v-show="lineup.Positions.length != teamMembers.length"
                      variant="outline-primary"
                      v-b-tooltip.hover="
                        $t(
                          'countOverview.alle-teilnehmer-in-der-aufstellung-speichern'
                        )
                      "
                      @click="() => addAllMembersToLineup(lineup.id)"
                      :disabled="!interactive"
                      data-testid="selectAllMembersForLineup-button"
                    >
                      <IBiPeopleFill />
                    </BButton>
                  </BButtonGroup>
                  <BButtonGroup>
                    <BButton
                      variant="outline-success"
                      v-b-tooltip.hover="$t('countOverview.bearbeiten')"
                      @click="() => editLineup(lineup.id)"
                      :disabled="!interactive"
                      data-testid="editLineup-button"
                    >
                      <IBiPen />
                    </BButton>
                    <BButton
                      variant="outline-danger"
                      v-b-tooltip.hover="$t('countOverview.loeschen')"
                      @click="() => $refs.deleteLineupModal.open(lineup.id)"
                      :disabled="!interactive"
                      data-testid="deleteLineup-button"
                    >
                      <IBiTrash />
                    </BButton>
                  </BButtonGroup>
                </BCol>
              </BRow>
            </h5>
            <p>
              Counts:
              <BBadge variant="light">
                {{ countToString(lineup.startCount) }}</BBadge
              >
              -
              <BBadge variant="light">
                {{ countToString(lineup.endCount) }}
              </BBadge>
            </p>

            <BCol
              v-show="
                lineup.Positions &&
                lineup.Positions.length > 0 &&
                lineup.Positions.length != teamMembers.length
              "
              :style="{ columnCount: 2 }"
            >
              <BRow
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
                  class="me-2"
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
              </BRow>
            </BCol>
            <p
              v-show="
                !lineup.Positions ||
                lineup.Positions.length <= 0 ||
                lineup.Positions.length == teamMembers.length
              "
            >
              <BBadge variant="info">{{ $t("countOverview.alle") }}</BBadge>
            </p>
          </div>

          <div v-show="lineup.id == editLineupId">
            <h5>
              <BRow align-h="between" align-v="center">
                <BCol> {{ $t("lineup", 1) }} </BCol>
                <BCol cols="auto">
                  <BButtonGroup>
                    <BButton
                      variant="success"
                      v-b-tooltip.hover="$t('speichern')"
                      @click="() => saveLineup()"
                      :disabled="
                        !editLineupStartAchterIsValid ||
                        !editLineupStartCountIsValid ||
                        !editLineupEndAchterIsValid ||
                        !editLineupEndCountIsValid ||
                        !editLineupMembersIsValid
                      "
                      data-testid="saveLineup-button"
                    >
                      <IBiCheck />
                    </BButton>
                    <BButton
                      variant="danger"
                      v-b-tooltip.hover="$t('abbrechen')"
                      @click="() => (editLineupId = null)"
                    >
                      <IBiX />
                    </BButton>
                  </BButtonGroup>
                </BCol>
              </BRow>
            </h5>

            <BForm>
              <BFormGroup
                :label="$t('nav.start')"
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
                        data-testid="editLineupStartAchterInput"
                        type="number"
                        min="1"
                        v-model="editLineupStartAchter"
                        :state="editLineupStartAchterIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                  <BCol>
                    <BFormGroup
                      :description="$t('count', 1)"
                      :state="editLineupStartCountIsValid"
                      :invalid-feedback="editLineupStartCountStateFeedback"
                    >
                      <BFormInput
                        data-testid="editLineupStartCountInput"
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupStartCount"
                        :state="editLineupStartCountIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                </BRow>
              </BFormGroup>
              <BFormGroup
                :label="$t('hits.ende')"
                label-class="label-with-colon"
                label-cols="2"
                :state="editLineupStartIsBeforeEnd"
                :invalid-feedback="editLineupStartIsBeforeEndStateFeedback"
              >
                <BRow>
                  <BCol>
                    <BFormGroup
                      :description="$t('achter')"
                      :state="editLineupEndAchterIsValid"
                      :invalid-feedback="editLineupEndAchterStateFeedback"
                    >
                      <BFormInput
                        data-testid="editLineupEndAchterInput"
                        type="number"
                        min="1"
                        v-model="editLineupEndAchter"
                        :state="editLineupEndAchterIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                  <BCol>
                    <BFormGroup
                      :description="$t('count', 1)"
                      :state="editLineupEndCountIsValid"
                      :invalid-feedback="editLineupEndCountStateFeedback"
                    >
                      <BFormInput
                        data-testid="editLineupEndCountInput"
                        type="number"
                        min="1"
                        max="8"
                        v-model="editLineupEndCount"
                        :state="editLineupEndCountIsValid"
                      />
                    </BFormGroup>
                  </BCol>
                </BRow>
              </BFormGroup>

              <hr />

              <BFormGroup
                :label="$t('teilnehmer')"
                label-class="label-with-colon"
                :state="editLineupMembersIsValid"
                :invalid-feedback="editLineupMembersStateFeedback"
              >
                <BButtonGroup>
                  <BButton
                    variant="light"
                    @click="
                      () => (editLineupMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="editLineupMembers.length == teamMembers.length"
                  >
                    <IBiCheckAll />
                    {{ $t("alle-auswaehlen") }}
                  </BButton>
                  <BButton
                    variant="light"
                    @click="() => (editLineupMembers = [])"
                    :disabled="editLineupMembers.length == 0"
                  >
                    <IBiSlash />
                    {{ $t("keine-auswaehlen") }}
                  </BButton>
                  <BButton
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
                    <IBiArrowRepeat />
                    {{ $t("auswahl-wechseln") }}
                  </BButton>
                </BButtonGroup>

                <BFormCheckbox-group
                  id="memberSelection-lineup"
                  v-model="editLineupMembers"
                  stacked
                  :style="{ columnCount: 2 }"
                >
                  <BFormCheckbox
                    v-for="member in teamMembers"
                    :key="member.id"
                    :value="member.id"
                  >
                    <BRow no-gutters class="mb-1">
                      <div
                        class="me-2"
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
                    </BRow>
                  </BFormCheckbox>
                </BFormCheckbox-group>
              </BFormGroup>
            </BForm>
          </div>
        </BListGroupItem>
      </BPlaceholderWrapper>

      <BPlaceholderWrapper :loading="!choreo">
        <template #loading>
          <BListGroupItem v-for="(_, i) in Array(1)" :key="i">
            <BPlaceholder width="25%" height="30px" class="mb-2" />
            <BPlaceholder width="50%" />
            <BPlaceholder width="25%" class="mb-3" />
          </BListGroupItem>
        </template>
        <BListGroupItem
          v-show="
            hitsForCurrentCount.length == 0 &&
            lineupsForCurrentCount.length == 0
          "
        >
          <p class="text-muted">
            {{
              $t("countOverview.fuer-diesen-count-hast-du-noch-nichts-geplant")
            }}
          </p>
        </BListGroupItem>
      </BPlaceholderWrapper>
    </BListGroup>

    <div class="d-grid">
      <BButton
        variant="outline-success"
        class="mt-2"
        @click="() => $emit('openCreateHitModal')"
        :disabled="!interactive"
      >
        <IBiPlus />
        {{ $t("countOverview.count-eintrag-hinzufuegen") }}
      </BButton>
    </div>
    <div class="d-grid">
      <BButton
        variant="light"
        class="mt-2"
        @click="() => $refs.createLineupModal.open()"
        :disabled="!interactive"
      >
        <IBiPlus />
        {{ $t("countOverview.aufstellung-hinzufuegen") }}
      </BButton>
    </div>

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
  </BCard>
</template>

<script>
import HitService from "@/services/HitService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";
import CreateLineupModal from "./modals/CreateLineupModal.vue";
import DeleteLineupModal from "./modals/DeleteLineupModal.vue";
import DeleteHitModal from "./modals/DeleteHitModal.vue";

/**
 * @module Component:CountOverview
 *
 * @vue-data {Number|null} editHitId=null - The ID of the hit currently being edited, or null if none.
 * @vue-data {String|null} editHitName=null - The name of the hit currently being edited.
 * @vue-data {Number} editHitAchter=1 - The 'Achter' value for the hit being edited.
 * @vue-data {Number} editHitCount=1 - The count value for the hit being edited.
 * @vue-data {Array} editHitMembers - The members assigned to the hit being edited.
 * @vue-data {String|null} editLineupId=null - The ID of the lineup currently being edited, or null if none.
 * @vue-data {Number} editLineupStartAchter=1 - The starting 'Achter' value for the lineup being edited.
 * @vue-data {Number} editLineupStartCount=1 - The starting count value for the lineup being edited.
 * @vue-data {Number} editLineupEndAchter=1 - The ending 'Achter' value for the lineup being edited.
 * @vue-data {Number} editLineupEndCount=1 - The ending count value for the lineup being edited.
 * @vue-data {Array} editLineupMembers - The members assigned to the lineup being edited.
 *
 * @vue-prop {Number} count - The current count value for the overview.
 * @vue-prop {Array} hitsForCurrentCount - The list of hits for the current count.
 * @vue-prop {Array} lineupsForCurrentCount - The list of lineups for the current count.
 * @vue-prop {Array} teamMembers - The list of team members.
 * @vue-prop {Object} choreo - The choreography object.
 * @vue-prop {Array} currentPositions - The current positions of team members.
 * @vue-prop {Boolean} [interactive=true] - Whether the overview is interactive.
 *
 * @vue-event {Array} updateHits - Emitted when hits are updated.
 * @vue-event {Array} updateLineups - Emitted when lineups are updated.
 * @vue-event {Number} updateCount - Emitted when the count is updated.
 * @vue-event {null} openCreateHitModal - Notifies parent component to call <code>open()</code> on {@link Modal:CreateHitModal CreateHitModal}.
 *
 * @example <CountOverview :count="0" :choreo="choreoObj" :teamMembers="members" @updateHits="handler" @updateLineups="handler" @updateCount="handler" @openCreateHitModal="handler" />
 * @example <CountOverview :count="0" :choreo="choreoObj" :teamMembers="members" :interactive="false"  @updateHits="handler" @updateLineups="handler" @updateCount="handler" @openCreateHitModal="handler" />
 */
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
      this.$emit("openCreateHitModal");
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
