<template>
  <BModal
    :id="`modal-newHit-${id}`"
    ref="modal"
    :title="$t('shortcut-tutorial.neuer-eintrag')"
    scrollable
    size="lg"
    @show="resetModal"
    @hidden="resetModal"
    @ok="createHit"
  >
    <BForm>
      <BFormGroup
        :label="$t('name')"
        label-class="label-with-colon"
        :state="newHitNameIsValid"
        :invalid-feedback="newHitNameStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <BFormInput
          v-model="newHitName"
          :placeholder="$t('modals.create-hit.wie-heisst-der-neue-eintrag')"
          autofocus
          required
          :state="newHitNameIsValid"
          list="hitName-options"
        />
        <datalist
          v-if="newHitName && newHitName.length > 1"
          id="hitName-options"
        >
          <option
            v-for="hitProposal in filteredHitNameProposals"
            :key="hitProposal"
          >
            {{ hitProposal }}
          </option>
        </datalist>
      </BFormGroup>
      <BRow>
        <BCol cols="6">
          <BFormGroup
            :description="$t('achter')"
            :state="newHitAchterIsValid"
            :invalid-feedback="newHitAchterStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="newHitAchter"
              type="number"
              min="1"
              :max="Math.ceil(maxCount / 8)"
              :state="newHitAchterIsValid"
            />
          </BFormGroup>
        </BCol>
        <BCol cols="6">
          <BFormGroup
            :description="$t('count', 1)"
            :state="newHitCountIsValid"
            :invalid-feedback="newHitCountStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <BFormInput
              v-model="newHitCount"
              type="number"
              min="1"
              :max="8"
              :state="newHitCountIsValid"
            />
          </BFormGroup>
        </BCol>
      </BRow>

      <hr />

      <BFormGroup
        :label="$t('teilnehmer')"
        label-class="label-with-colon"
        :state="newHitMembersIsValid"
        :invalid-feedback="newHitMembersStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <BButtonGroup class="mb-2">
          <BButton
            variant="light"
            :disabled="newHitMembers?.length == teamMembers?.length"
            @click="() => (newHitMembers = teamMembers.map((m) => m.id))"
          >
            <IBiCheckAll />
            {{ $t("alle-auswaehlen") }}
          </BButton>
          <BButton
            variant="light"
            :disabled="newHitMembers?.length == 0"
            @click="() => (newHitMembers = [])"
          >
            <IBiSlash /> {{ $t("keine-auswaehlen") }}
          </BButton>
          <BButton
            variant="light"
            :disabled="
              newHitMembers?.length == 0 ||
              newHitMembers?.length == teamMembers?.length
            "
            @click="
              () =>
                (newHitMembers = teamMembers
                  .filter((m) => !newHitMembers?.includes(m.id))
                  .map((m) => m.id))
            "
          >
            <IBiArrowRepeat />
            {{ $t("auswahl-wechseln") }}
          </BButton>
        </BButtonGroup>
        <BFormCheckbox-group
          id="memberSelection"
          v-model="newHitMembers"
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
                  backgroundColor: member.ChoreoParticipation.color + '55',
                  borderRadius: '50%',
                  border: 'solid 2px ' + member.ChoreoParticipation.color,
                }"
              ></div>
              {{ member.nickname || member.name }}
            </BRow>
          </BFormCheckbox>
        </BFormCheckbox-group>
      </BFormGroup>
    </BForm>
    <template #footer="{ ok, cancel }">
      <BButton
        type="submit"
        variant="success"
        :disabled="
          !newHitNameIsValid ||
          !newHitAchterIsValid ||
          !newHitCountIsValid ||
          !newHitMembersIsValid
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
import HitService from "@/services/HitService";
import { defineComponent, PropType } from "vue";
import type { Member, Hit, Participant } from "@/types";

function generateHitNameProposals(t: (key: string) => string) {
  const preDirections = [null, t("hits.high"), t("hits.low")];
  const postDirections = [
    null,
    t("hits.nach-rechts"),
    t("hits.rechts"),
    t("hits.nach-links"),
    t("hits.links"),
    t("hits.nach-hinten"),
    t("hits.hinten"),
    t("hits.nach-vorne"),
    t("hits.vorne"),
  ];

  const preActions = [
    null,
    t("hits.set"),
    t("hits.go"),
    t("hits.start"),
    t("hits.dip"),
    t("hits.half-up"),
  ];

  const actions = [
    null,
    "V",
    t("hits.elevator"),
    t("hits.stretch"),
    t("hits.lib"),
    t("hits.tick-tock"),
    t("hits.scale"),
    t("hits.arabesque"),
    t("hits.rad"),
    t("hits.bogengang"),
    t("hits.flick-flack"),
    t("hits.pinguin"),
    t("hits.playmobil"),
    t("hits.clap"),
    t("hits.toetouch"),
    t("hits.pyra"),
    t("hits.radwende"),
    t("hits.spagat"),
    t("hits.kneel"),
    t("hits.knien"),
    t("hits.full-around"),
    t("hits.half-around"),
    t("hits.trophy"),
    t("hits.basket"),
    t("hits.log-roll"),
    t("hits.cradle"),
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    t("hits.wurf"),
  ];

  const standAlones = [
    t("hits.clean"),
    t("hits.raussetzen"),
    t("hits.loslaufen"),
    t("hits.umgreifen"),
    t("hits.greifen"),
    t("hits.ende"),
  ];

  const combinations = preDirections
    .map((preDirection) => {
      return preActions.map((preAction) => {
        return actions.map((action) => {
          return postDirections.map((postDirection) => {
            return [preDirection, preAction, action, postDirection]
              .filter((i) => i != null)
              .join(" ");
          });
        });
      });
    })
    .flat(Infinity);

  return [...standAlones, ...combinations].filter(
    (s) => s && s.length > 0
  ) as string[];
}

/**
 * @module Modal:CreateHitModal
 *
 * @vue-data {String} id
 * @vue-data {String|null} newHitName=null
 * @vue-data {Number} newHitAchter=1
 * @vue-data {Number} newHitCount=1
 * @vue-data {Array|null} newHitMembers=null
 * @vue-data {Array} hitNameProposals
 *
 * @vue-prop {Array} [teamMembers]
 * @vue-prop {String} choreoId
 * @vue-prop {Number} [count=0]
 * @vue-prop {Array} [hitsForCurrentCount]
 * @vue-prop {Number} [maxCount=0]
 *
 * @vue-computed {Boolean} newHitNameIsValid
 * @vue-computed {String|null} newHitNameStateFeedback
 * @vue-computed {Boolean} newHitAchterIsValid
 * @vue-computed {String|null} newHitAchterStateFeedback
 * @vue-computed {Boolean} newHitCountIsValid
 * @vue-computed {String|null} newHitCountStateFeedback
 * @vue-computed {Boolean} newHitMembersIsValid
 * @vue-computed {String|null} newHitMembersStateFeedback
 *
 * @vue-event {string} hitCreated
 *
 * @example
 * <template>
 *  <CreateHitModal :choreoId="'abc'" :teamMembers="members" ref="createHitModal" @hitCreated="handler" />
 *  <Button @click="() => $refs.createHitModal.open()" />
 * </template>
 */
export default defineComponent({
  name: "CreateHitModal",
  props: {
    teamMembers: {
      type: Array as PropType<Participant[]>,
      default: () => [],
    },
    choreoId: {
      type: String,
      default: "",
    },
    count: {
      type: Number,
      default: 0,
    },
    hitsForCurrentCount: {
      type: Array as PropType<Hit[]>,
      default: () => [],
    },
    maxCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  emits: ["hitCreated"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newHitName: undefined as string | undefined,
    newHitAchter: 1,
    newHitCount: 1,
    newHitMembers: undefined as string[] | undefined,
    hitNameProposals: [] as string[],
  }),
  computed: {
    filteredHitNameProposals(): string[] {
      return this.hitNameProposals.filter(
        (p) =>
          this.newHitName != null &&
          p.toLowerCase().startsWith(this.newHitName.toLowerCase())
      );
    },
    newHitNameIsValid() {
      const n = this.newHitName;
      return n != null && n.trim().length >= 3;
    },
    newHitNameStateFeedback() {
      if (!this.newHitName) return this.$t("erforderlich");
      if (this.newHitName.trim().length < 3)
        return this.$t("countOverview.hit-name-min-laenge");
      return undefined;
    },
    newHitAchterIsValid() {
      return Boolean(this.newHitAchter);
    },
    newHitAchterStateFeedback() {
      if (!this.newHitAchter) return this.$t("erforderlich");
      return undefined;
    },
    newHitCountIsValid() {
      return Boolean(this.newHitCount);
    },
    newHitCountStateFeedback() {
      if (!this.newHitCount) return this.$t("erforderlich");
      return undefined;
    },
    newHitMembersIsValid() {
      const m = this.newHitMembers;
      return m != null && m.length > 0;
    },
    newHitMembersStateFeedback() {
      if (!this.newHitMembers || this.newHitMembers.length == 0)
        return this.$t("erforderlich");
      return undefined;
    },
  },
  mounted() {
    this.hitNameProposals = generateHitNameProposals(this.$t) as string[];
  },
  methods: {
    open() {
      (this.$refs.modal as any).show();
    },
    resetModal() {
      this.newHitAchter = Math.floor(this.count / 8) + 1;
      this.newHitCount = (this.count % 8) + 1;
      this.newHitName = undefined;
      if (!this.newHitMembers)
        this.newHitMembers = this.teamMembers
          .filter(
            (m1) =>
              !this.hitsForCurrentCount.some((h) =>
                h.Members ? h.Members.some((m2) => m1.id == m2.id) : false
              )
          )
          .map((m) => m.id);
    },
    createHit() {
      const count =
        (Number(this.newHitAchter) - 1) * 8 + Number(this.newHitCount) - 1;
      HitService.create(
        this.newHitName as string,
        count,
        this.choreoId,
        this.newHitMembers
      ).then((hit) => {
        this.$emit("hitCreated", hit);
      });
    },
  },
});
</script>
