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
            <BPlaceholder
              width="25%"
              height="30px"
              class="mb-2"
              animation="wave"
            />
            <BPlaceholder width="50%" animation="wave" />
            <BPlaceholder width="25%" class="mb-3" animation="wave" />
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
                      v-b-tooltip.hover="
                        $t('countOverview.zum-vorigen-count-verschieben')
                      "
                      variant="outline-primary"
                      :disabled="count <= 0 || !interactive"
                      data-testid="moveHitToPreviousCount-button"
                      @click="() => moveHitToPreviousCount(hit.id!)"
                    >
                      <IBiChevronLeft />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="
                        $t('countOverview.zum-naechsten-count-verschieben')
                      "
                      variant="outline-primary"
                      :disabled="count >= choreo.counts - 1 || !interactive"
                      data-testid="moveHitToNextCount-button"
                      @click="() => moveHitToNextCount(hit.id!)"
                    >
                      <IBiChevronRight />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="$t('countOverview.bearbeiten')"
                      variant="outline-success"
                      :disabled="!interactive"
                      data-testid="editHit-button"
                      @click="() => editHit(hit.id!)"
                    >
                      <IBiPen />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="$t('countOverview.loeschen')"
                      variant="outline-danger"
                      :disabled="!interactive"
                      data-testid="deleteHit-button"
                      @click="openHitDeleteModal(hit.id!)"
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
                      teamMembers.find((tm) => tm.id == member.id)!
                        .ChoreoParticipation!.color + '55',
                    borderRadius: '50%',
                    border:
                      'solid 2px ' +
                      teamMembers.find((tm) => tm.id == member.id)!
                        .ChoreoParticipation!.color,
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
              <BBadge variant="success">{{ $t("countOverview.alle") }}</BBadge>
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
                        color: 'var(--bs-body-color)',
                        border: 'none',
                        fontSize: '20px',
                        height: '1.2em',
                        textDecoration: 'underline dotted',
                      }"
                      class="p-0"
                      autofocus
                      :placeholder="$t('countOverview.name-des-hits')"
                      :state="editHitNameIsValid"
                      @keydown="
                        (e: KeyboardEvent) => {
                          if (e.key === 'Enter' && editHitNameIsValid)
                            saveHit();
                          else if (e.key === 'Escape') editHitId = null;
                        }
                      "
                    />
                  </BFormGroup>
                </BCol>
                <BCol cols="auto">
                  <BButtonGroup>
                    <BButton
                      v-b-tooltip.hover="$t('speichern')"
                      variant="success"
                      :disabled="
                        !editHitName ||
                        !editHitAchterIsValid ||
                        !editHitCountIsValid ||
                        !editHitMembersIsValid
                      "
                      data-testid="saveHit-button"
                      @click="() => saveHit()"
                    >
                      <IBiCheck />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="$t('abbrechen')"
                      variant="danger"
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
                        v-model="editHitAchter"
                        data-testid="editHitAchterInput"
                        type="number"
                        min="1"
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
                        v-model="editHitCount"
                        data-testid="editHitCountInput"
                        type="number"
                        min="1"
                        max="8"
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
                    :disabled="
                      editHitMembers?.length == 0 ||
                      editHitMembers?.length == teamMembers?.length
                    "
                    @click="
                      () =>
                        (editHitMembers = teamMembers
                          .filter((m) => !editHitMembers.includes(m.id))
                          .map((m) => m.id))
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
                            member.ChoreoParticipation!.color + '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' + member.ChoreoParticipation!.color,
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
            <BPlaceholder
              width="25%"
              height="30px"
              class="mb-2"
              animation="wave"
            />
            <BPlaceholder width="50%" animation="wave" />
            <BPlaceholder width="25%" class="mb-3" animation="wave" />
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
                      v-show="
                        (lineup.Positions?.length ?? 0) != teamMembers.length
                      "
                      v-b-tooltip.hover="
                        $t(
                          'countOverview.alle-teilnehmer-in-der-aufstellung-speichern'
                        )
                      "
                      variant="outline-primary"
                      :disabled="!interactive"
                      data-testid="selectAllMembersForLineup-button"
                      @click="() => addAllMembersToLineup(lineup.id)"
                    >
                      <IBiPeopleFill />
                    </BButton>
                  </BButtonGroup>
                  <BButtonGroup>
                    <BButton
                      v-b-tooltip.hover="$t('countOverview.bearbeiten')"
                      variant="outline-success"
                      :disabled="!interactive"
                      data-testid="editLineup-button"
                      @click="() => editLineup(lineup.id)"
                    >
                      <IBiPen />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="$t('countOverview.loeschen')"
                      variant="outline-danger"
                      :disabled="!interactive"
                      data-testid="deleteLineup-button"
                      @click="openDeleteLineupModal(lineup.id)"
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
                v-for="position in (lineup.Positions ?? [])
                  .slice()
                  .sort((a, b) =>
                    teamMembers
                      .find((m) => m.id == a.MemberId)!
                      .name.localeCompare(
                        teamMembers.find((m) => m.id == b.MemberId)!.name
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
                      teamMembers.find((tm) => tm.id == position.MemberId)!
                        .ChoreoParticipation!.color + '55',
                    borderRadius: '50%',
                    border:
                      'solid 2px ' +
                      teamMembers.find((tm) => tm.id == position.MemberId)!
                        .ChoreoParticipation!.color,
                  }"
                ></div>
                {{ position.Member!.name }}
              </BRow>
            </BCol>
            <p
              v-show="
                !lineup.Positions ||
                lineup.Positions.length <= 0 ||
                lineup.Positions.length == teamMembers.length
              "
            >
              <BBadge variant="success">{{ $t("countOverview.alle") }}</BBadge>
            </p>
          </div>

          <div v-show="lineup.id == editLineupId">
            <h5>
              <BRow align-h="between" align-v="center">
                <BCol> {{ $t("lineup", 1) }} </BCol>
                <BCol cols="auto">
                  <BButtonGroup>
                    <BButton
                      v-b-tooltip.hover="$t('speichern')"
                      variant="success"
                      :disabled="
                        !editLineupStartAchterIsValid ||
                        !editLineupStartCountIsValid ||
                        !editLineupEndAchterIsValid ||
                        !editLineupEndCountIsValid ||
                        !editLineupMembersIsValid
                      "
                      data-testid="saveLineup-button"
                      @click="() => saveLineup()"
                    >
                      <IBiCheck />
                    </BButton>
                    <BButton
                      v-b-tooltip.hover="$t('abbrechen')"
                      variant="danger"
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
                        v-model="editLineupStartAchter"
                        data-testid="editLineupStartAchterInput"
                        type="number"
                        min="1"
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
                        v-model="editLineupStartCount"
                        data-testid="editLineupStartCountInput"
                        type="number"
                        min="1"
                        max="8"
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
                        v-model="editLineupEndAchter"
                        data-testid="editLineupEndAchterInput"
                        type="number"
                        min="1"
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
                        v-model="editLineupEndCount"
                        data-testid="editLineupEndCountInput"
                        type="number"
                        min="1"
                        max="8"
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
                    :disabled="editLineupMembers.length == teamMembers.length"
                    @click="
                      () => (editLineupMembers = teamMembers.map((m) => m.id))
                    "
                  >
                    <IBiCheckAll />
                    {{ $t("alle-auswaehlen") }}
                  </BButton>
                  <BButton
                    variant="light"
                    :disabled="editLineupMembers.length == 0"
                    @click="() => (editLineupMembers = [])"
                  >
                    <IBiSlash />
                    {{ $t("keine-auswaehlen") }}
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
                            member.ChoreoParticipation!.color + '55',
                          borderRadius: '50%',
                          border:
                            'solid 2px ' + member.ChoreoParticipation!.color,
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
            <BPlaceholder
              width="25%"
              height="30px"
              class="mb-2"
              animation="wave"
            />
            <BPlaceholder width="50%" animation="wave" />
            <BPlaceholder width="25%" class="mb-3" animation="wave" />
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
        :disabled="!interactive"
        @click="() => $emit('openCreateHitModal')"
      >
        <IBiPlus />
        {{ $t("countOverview.count-eintrag-hinzufuegen") }}
      </BButton>
    </div>
    <div class="d-grid">
      <BButton
        variant="light"
        class="mt-2"
        :disabled="!interactive"
        @click="openCreateLineupModal"
      >
        <IBiPlus />
        {{ $t("countOverview.aufstellung-hinzufuegen") }}
      </BButton>
    </div>

    <CreateLineupModal
      ref="createLineupModal"
      :count="count"
      :choreo="choreo as any"
      :team-members="teamMembers as any"
      :lineups-for-current-count="lineupsForCurrentCount as any"
      :current-positions="currentPositions"
      @update-lineups="(lineupCopy) => $emit('updateLineups', lineupCopy)"
    />

    <DeleteLineupModal
      ref="deleteLineupModal"
      :choreo="choreo"
      @update-lineups="(lineupCopy) => $emit('updateLineups', lineupCopy)"
    />

    <DeleteHitModal
      ref="deleteHitModal"
      :choreo="choreo"
      @update-hits="(hitCopy) => $emit('updateHits', hitCopy)"
    />
  </BCard>
</template>

<script lang="ts">
import HitService from "@/services/HitService";
import LineupService from "@/services/LineupService";
import PositionService from "@/services/PositionService";
import CreateLineupModal from "./modals/CreateLineupModal.vue";
import DeleteLineupModal from "./modals/DeleteLineupModal.vue";
import DeleteHitModal from "./modals/DeleteHitModal.vue";
import { defineComponent, PropType } from "vue";
import type { Lineup } from "@/types";

interface LocalMember {
  id: string;
  name: string;
  nickname?: string;
  ChoreoParticipation?: { color: string };
}

interface LocalHit {
  id?: string;
  name: string;
  count: number;
  Members?: LocalMember[];
}

interface LocalPosition {
  id?: string;
  MemberId: string;
  Member?: LocalMember;
}

interface LocalLineup {
  id: string;
  startCount: number;
  endCount: number;
  Positions?: LocalPosition[];
}

interface LocalChoreo {
  counts: number;
  Hits: LocalHit[];
  Lineups: LocalLineup[];
}

interface LocalCurrentPosition {
  MemberId: string;
  x: number;
  y: number;
}

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
export default defineComponent({
  name: "CountOverview",
  components: { CreateLineupModal, DeleteLineupModal, DeleteHitModal },
  props: {
    count: {
      type: Number,
      required: true,
    },
    hitsForCurrentCount: {
      type: Array as PropType<LocalHit[]>,
      required: true,
    },
    lineupsForCurrentCount: {
      type: Array as PropType<LocalLineup[]>,
      required: true,
    },
    teamMembers: {
      type: Array as PropType<LocalMember[]>,
      default: () => [] as LocalMember[],
    },
    choreo: {
      type: Object as PropType<LocalChoreo>,
      default: () => ({ counts: 0, Hits: [], Lineups: [] }) as LocalChoreo,
    },
    currentPositions: {
      type: Array as PropType<LocalCurrentPosition[]>,
      default: () => [] as LocalCurrentPosition[],
    },
    interactive: {
      type: Boolean,
      default: true,
    },
  },
  emits: ["openCreateHitModal", "updateLineups", "updateHits", "updateCount"],
  data: () => ({
    editHitId: null as string | null,
    editHitName: null as string | null,
    editHitAchter: 1 as number,
    editHitCount: 1 as number,
    editHitMembers: [] as string[],
    editLineupId: null as string | null,
    editLineupStartAchter: 1 as number,
    editLineupStartCount: 1 as number,
    editLineupEndAchter: 1 as number,
    editLineupEndCount: 1 as number,
    editLineupMembers: [] as string[],
  }),
  computed: {
    editHitNameIsValid() {
      return Boolean(this.editHitName) && this.editHitName!.trim().length >= 3;
    },
    editHitNameStateFeedback() {
      if (!this.editHitName) return this.$t("erforderlich");
      if (this.editHitName.trim().length < 3)
        return this.$t("countOverview.hit-name-min-laenge");
      return undefined;
    },
    editHitAchterIsValid() {
      return Boolean(this.editHitAchter);
    },
    editHitAchterStateFeedback() {
      if (!this.editHitAchter) return this.$t("erforderlich");
      return undefined;
    },
    editHitCountIsValid() {
      return Boolean(this.editHitCount);
    },
    editHitCountStateFeedback() {
      if (!this.editHitCount) return this.$t("erforderlich");
      return undefined;
    },
    editHitMembersIsValid() {
      return Boolean(this.editHitMembers) && this.editHitMembers.length > 0;
    },
    editHitMembersStateFeedback() {
      if (!this.editHitMembers || this.editHitMembers.length == 0)
        return this.$t("erforderlich");
      return undefined;
    },
    editLineupStartIsBeforeEnd() {
      const absoluteStartCount =
        (this.editLineupStartAchter - 1) * 8 + this.editLineupStartCount - 1;
      const absoluteEndCount =
        (this.editLineupEndAchter - 1) * 8 + this.editLineupEndCount - 1;
      return absoluteStartCount <= absoluteEndCount;
    },
    editLineupStartIsBeforeEndStateFeedback() {
      if (!this.editLineupStartIsBeforeEnd)
        return this.$t("countOverview.start-vor-ende");
      return undefined;
    },
    editLineupEndAchterIsValid() {
      return (
        Boolean(this.editLineupEndAchter) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupEndAchterStateFeedback() {
      if (!this.editLineupEndAchter) return this.$t("erforderlich");
      return undefined;
    },
    editLineupStartAchterIsValid() {
      return (
        Boolean(this.editLineupStartAchter) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupStartAchterStateFeedback() {
      if (!this.editLineupStartAchter) return this.$t("erforderlich");
      return undefined;
    },
    editLineupStartCountIsValid() {
      return (
        Boolean(this.editLineupStartCount) && this.editLineupStartIsBeforeEnd
      );
    },
    editLineupStartCountStateFeedback() {
      if (!this.editLineupStartCount) return this.$t("erforderlich");
      return undefined;
    },
    editLineupEndCountIsValid() {
      return (
        Boolean(this.editLineupEndCount) && this.editLineupStartIsBeforeEnd
      );
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
    openNewHitModal() {
      this.$emit("openCreateHitModal");
    },
    countToString(count: number) {
      return `${Math.floor(count / 8) + 1} / ${(count % 8) + 1}`;
    },
    moveHitToPreviousCount(hitId: string) {
      HitService.setCount(hitId, this.count - 1).then(() => {
        let hitsCopy = this.choreo.Hits;
        hitsCopy.find((h: LocalHit) => h.id == hitId)!.count = this.count - 1;
        this.$emit("updateHits", hitsCopy);
        this.$emit("updateCount", this.count - 1);
      });
    },
    moveHitToNextCount(hitId: string) {
      HitService.setCount(hitId, this.count + 1).then(() => {
        let hitsCopy = this.choreo.Hits;
        hitsCopy.find((h: LocalHit) => h.id == hitId)!.count = this.count + 1;
        this.$emit("updateHits", hitsCopy);
        this.$emit("updateCount", this.count + 1);
      });
    },
    editHit(id: string) {
      this.editHitId = id;
      const selectedHit = this.hitsForCurrentCount.find(
        (h: LocalHit) => h.id == id
      )!;
      this.editHitName = selectedHit.name;
      this.editHitMembers =
        selectedHit.Members && selectedHit.Members.length > 0
          ? selectedHit.Members.map((m: LocalMember) => m.id)
          : this.teamMembers.map((m: LocalMember) => m.id);
      this.editHitCount = (selectedHit.count % 8) + 1;
      this.editHitAchter = Math.floor(selectedHit.count / 8) + 1;
    },
    saveHit() {
      const achterAtStart = Number(this.editHitAchter);
      const countAtStart = Number(this.editHitCount);
      const absoluteCount = (achterAtStart - 1) * 8 + countAtStart - 1;
      HitService.update(
        this.editHitId!,
        this.editHitName!,
        absoluteCount,
        this.editHitMembers
      ).then((hit: LocalHit) => {
        let hitsCopy = this.choreo.Hits.filter((h: LocalHit) => h.id != hit.id);
        hitsCopy.push(hit);
        this.$emit("updateHits", hitsCopy);

        this.editHitId = null;
      });
    },
    editLineup(lineupId: string) {
      this.editLineupId = lineupId;
      const selectedLineup = this.lineupsForCurrentCount.find(
        (l: LocalLineup) => l.id == lineupId
      )!;
      this.editLineupStartCount = (selectedLineup.startCount % 8) + 1;
      this.editLineupStartAchter =
        Math.floor(selectedLineup.startCount / 8) + 1;
      this.editLineupEndCount = (selectedLineup.endCount % 8) + 1;
      this.editLineupEndAchter = Math.floor(selectedLineup.endCount / 8) + 1;
      this.editLineupMembers =
        selectedLineup.Positions && selectedLineup.Positions.length > 0
          ? selectedLineup.Positions.map((p: LocalPosition) => p.MemberId)
          : this.teamMembers.map((m: LocalMember) => m.id);
    },
    saveLineup() {
      const startAchter = Number(this.editLineupStartAchter);
      const startCount = Number(this.editLineupStartCount);
      const endAchter = Number(this.editLineupEndAchter);
      const endCount = Number(this.editLineupEndCount);
      const absoluteStartCount = (startAchter - 1) * 8 + startCount - 1;
      const absoluteEndCount = (endAchter - 1) * 8 + endCount - 1;
      LineupService.update(this.editLineupId!, {
        startCount: absoluteStartCount,
        endCount: absoluteEndCount,
      }).then((lineup: Lineup | LocalLineup) => {
        const lineupLocal = lineup as LocalLineup;
        const memberIdsWithoutPositions = this.teamMembers
          .filter((m: LocalMember) => !this.editLineupMembers.includes(m.id))
          .map((m: LocalMember) => m.id);
        const positionsToDelete = (
          this.lineupsForCurrentCount.find(
            (l: LocalLineup) => l.id == lineupLocal.id
          )!.Positions ?? []
        ).filter((p: LocalPosition) =>
          memberIdsWithoutPositions.includes(p.MemberId)
        );
        const positionDeletion = Promise.all(
          positionsToDelete.map((p: LocalPosition) =>
            PositionService.remove(p.id!).then(() => p.id!)
          )
        );

        const memberIdsOfMembersWithPosition = (
          this.lineupsForCurrentCount.find(
            (l: LocalLineup) => l.id == lineupLocal.id
          )!.Positions ?? []
        ).map((p: LocalPosition) => p.MemberId);
        const memberIdsToAdd = this.editLineupMembers.filter(
          (mId: string) => !memberIdsOfMembersWithPosition.includes(mId)
        );
        const positionCreation = Promise.all(
          memberIdsToAdd.map((mId: string) => {
            const positionOfMember = this.currentPositions.find(
              (p: LocalCurrentPosition) => p.MemberId == mId
            )!;
            return PositionService.create(
              lineupLocal.id,
              positionOfMember.x,
              positionOfMember.y,
              mId
            );
          })
        );

        return Promise.all([positionDeletion, positionCreation]).then(
          ([deletedPositionIds, createdPositions]) => {
            const lineupCopy = this.choreo!.Lineups.filter(
              (l: LocalLineup) => l.id != lineupLocal.id
            );

            const positionsCopy = (lineupLocal.Positions ?? []).filter(
              (p: LocalPosition) => !deletedPositionIds.includes(p.id!)
            );
            positionsCopy.push(...(createdPositions as LocalPosition[]));
            lineupLocal.Positions = positionsCopy;

            lineupCopy.push(lineupLocal);
            this.$emit("updateLineups", lineupCopy);
          }
        );
      });

      this.editLineupId = null;
    },
    addAllMembersToLineup(lineupId: string) {
      const lineupToUpdate = this.lineupsForCurrentCount.find(
        (l: LocalLineup) => l.id == lineupId
      )!;
      const memberIdsWithoutPositions = this.teamMembers
        .filter(
          (m: LocalMember) =>
            !lineupToUpdate
              .Positions!.map((p: LocalPosition) => p.MemberId)
              .includes(m.id)
        )
        .map((m: LocalMember) => m.id);

      const positionCreation = Promise.all(
        memberIdsWithoutPositions.map((mId: string) => {
          const positionOfMember = this.currentPositions.find(
            (p: LocalCurrentPosition) => p.MemberId == mId
          )!;
          return PositionService.create(
            lineupToUpdate.id,
            positionOfMember.x,
            positionOfMember.y,
            mId
          );
        })
      );

      positionCreation.then((createdPositions) => {
        const lineupCopy = this.choreo!.Lineups.filter(
          (l: LocalLineup) => l.id != lineupToUpdate.id
        );

        const positionsCopy = lineupToUpdate.Positions!;
        positionsCopy.push(...(createdPositions as LocalPosition[]));
        lineupToUpdate.Positions = positionsCopy;

        lineupCopy.push(lineupToUpdate);
        this.$emit("updateLineups", lineupCopy);
      });
    },
    openHitDeleteModal(hitId: string) {
      (this.$refs.deleteHitModal as InstanceType<typeof DeleteHitModal>)?.open(
        hitId
      );
    },
    openDeleteLineupModal(lineupId: string) {
      (
        this.$refs.deleteLineupModal as InstanceType<typeof DeleteLineupModal>
      )?.open(lineupId);
    },
    openCreateLineupModal() {
      (
        this.$refs.createLineupModal as InstanceType<typeof CreateLineupModal>
      ).open();
    },
  },
});
</script>
