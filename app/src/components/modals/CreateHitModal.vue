<template>
  <b-modal
    :id="`modal-newHit-${id}`"
    :title="$t('shortcut-tutorial.neuer-eintrag')"
    centered
    size="lg"
    @show="resetModal"
    @hidden="resetModal"
    @ok="createHit"
  >
    <b-form>
      <b-form-group
        :label="$t('name')"
        label-class="label-with-colon"
        :state="newHitNameIsValid"
        :invalid-feedback="newHitNameStateFeedback"
        valid-feedback="Gültig!"
      >
        <b-form-input
          v-model="newHitName"
          :placeholder="$t('modals.create-hit.wie-heisst-der-neue-eintrag')"
          autofocus
          required
          :state="newHitNameIsValid"
          list="hitName-options"
        />
        <datalist
          id="hitName-options"
          v-if="newHitName && newHitName.length > 1"
        >
          <option
            v-for="proposal in hitNameProposals.filter((p) =>
              p.toLowerCase().startsWith(newHitName.toLowerCase())
            )"
            :key="proposal"
          >
            {{ proposal }}
          </option>
        </datalist>
      </b-form-group>
      <b-row>
        <b-col cols="6">
          <b-form-group
            :description="$t('achter')"
            :state="newHitAchterIsValid"
            :invalid-feedback="newHitAchterStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              v-model="newHitAchter"
              type="number"
              min="1"
              :max="Math.ceil(maxCount / 8)"
              :state="newHitAchterIsValid"
            />
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group
            :description="$tc('count', 1)"
            :state="newHitCountIsValid"
            :invalid-feedback="newHitCountStateFeedback"
            :valid-feedback="$t('login.gueltig')"
          >
            <b-form-input
              v-model="newHitCount"
              type="number"
              min="1"
              :max="8"
              :state="newHitCountIsValid"
            />
          </b-form-group>
        </b-col>
      </b-row>

      <hr />

      <b-form-group
        :label="$t('teilnehmer')"
        label-class="label-with-colon"
        :state="newHitMembersIsValid"
        :invalid-feedback="newHitMembersStateFeedback"
        :valid-feedback="$t('login.gueltig')"
      >
        <b-button-group>
          <b-button
            variant="light"
            @click="() => (this.newHitMembers = teamMembers.map((m) => m.id))"
            :disabled="newHitMembers?.length == teamMembers?.length"
          >
            <b-icon-check-all />
            {{ $t("alle-auswaehlen") }}
          </b-button>
          <b-button
            variant="light"
            @click="() => (this.newHitMembers = [])"
            :disabled="newHitMembers?.length == 0"
          >
            <b-icon-slash /> {{ $t("keine-auswaehlen") }}
          </b-button>
          <b-button
            variant="light"
            @click="
              () =>
                (this.newHitMembers = teamMembers
                  .filter((m) => !newHitMembers.includes(m.id))
                  .map((m) => m.id))
            "
            :disabled="
              newHitMembers?.length == 0 ||
              newHitMembers?.length == teamMembers?.length
            "
          >
            <b-icon-arrow-repeat />
            {{ $t("auswahl-wechseln") }}
          </b-button>
        </b-button-group>
        <b-form-checkbox-group
          id="memberSelection"
          v-model="newHitMembers"
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
                  backgroundColor: member.ChoreoParticipation.color + '55',
                  borderRadius: '50%',
                  border: 'solid 2px ' + member.ChoreoParticipation.color,
                }"
              ></div>
              {{ member.nickname || member.name }}
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
          !newHitNameIsValid ||
          !newHitAchterIsValid ||
          !newHitCountIsValid ||
          !newHitMembersIsValid
        "
      >
        {{ $t("speichern") }}
      </b-button>
      <b-button @click="cancel" variant="danger">{{
        $t("abbrechen")
      }}</b-button>
    </template>
  </b-modal>
</template>

<script>
import HitService from "@/services/HitService";

function generateHitNameProposals() {
  const preDirections = [null, "this.$t('hits.high')", "this.$t('hits.low')"];
  const postDirections = [
    null,
    "this.$t('hits.nach-rechts')",
    "this.$t('hits.rechts')",
    "this.$t('hits.nach-links')",
    "this.$t('hits.links')",
    "this.$t('hits.nach-hinten')",
    "this.$t('hits.hinten')",
    "this.$t('hits.nach-vorne')",
    "this.$t('hits.vorne')",
  ];

  const preActions = [
    null,
    "this.$t('hits.set')",
    "this.$t('hits.go')",
    "this.$t('hits.start')",
    "this.$t('hits.dip')",
    "this.$t('hits.half-up')",
  ];

  const actions = [
    null,
    "V",
    "this.$t('hits.elevator')",
    "this.$t('hits.stretch')",
    "this.$t('hits.lib')",
    "this.$t('hits.tick-tock')",
    "this.$t('hits.scale')",
    "this.$t('hits.arabesque')",
    "this.$t('hits.rad')",
    "this.$t('hits.bogengang')",
    "this.$t('hits.flick-flack')",
    "this.$t('hits.pinguin')",
    "this.$t('hits.playmobil')",
    "this.$t('hits.clap')",
    "this.$t('hits.toetouch')",
    "this.$t('hits.pyra')",
    "this.$t('hits.radwende')",
    "this.$t('hits.spagat')",
    "this.$t('hits.kneel')",
    "this.$t('hits.knien')",
    "this.$t('hits.full-around')",
    "this.$t('hits.half-around')",
    "this.$t('hits.trophy')",
    "this.$t('hits.basket')",
    "this.$t('hits.log-roll')",
    "this.$t('hits.cradle')",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "this.$t('hits.wurf')",
  ];

  const standAlones = [
    "this.$t('hits.clean')",
    "this.$t('hits.raussetzen')",
    "this.$t('hits.loslaufen')",
    "this.$t('hits.umgreifen')",
    "this.$t('hits.greifen')",
    "this.$t('hits.ende')",
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

  return [...standAlones, ...combinations].filter((s) => s && s.length > 0);
}
const hitNameProposals = generateHitNameProposals();

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
export default {
  name: "CreateHitModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    newHitName: null,
    newHitAchter: 1,
    newHitCount: 1,
    newHitMembers: null,
    hitNameProposals,
  }),
  props: {
    teamMembers: {
      type: Array,
      default: () => [],
    },
    choreoId: {
      type: String,
    },
    count: {
      type: Number,
      default: 0,
    },
    hitsForCurrentCount: {
      type: Array,
      default: () => [],
    },
    maxCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`modal-newHit-${this.id}`);
    },
    resetModal() {
      this.newHitAchter = Math.floor(this.count / 8) + 1;
      this.newHitCount = (this.count % 8) + 1;
      this.newHitName = "";
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
        (parseInt(this.newHitAchter) - 1) * 8 + parseInt(this.newHitCount) - 1;
      HitService.create(
        this.newHitName,
        count,
        this.choreoId,
        this.newHitMembers
      ).then((hit) => {
        this.$emit("hitCreated", hit);
      });
    },
  },
  computed: {
    newHitNameIsValid() {
      return Boolean(this.newHitName) && this.newHitName.trim().length >= 3;
    },
    newHitNameStateFeedback() {
      if (!this.newHitName) return this.$t("erforderlich");
      if (this.newHitName.trim().length < 3)
        return this.$t("countOverview.hit-name-min-laenge");
      return null;
    },
    newHitAchterIsValid() {
      return Boolean(this.newHitAchter);
    },
    newHitAchterStateFeedback() {
      if (!this.newHitAchter) return this.$t("erforderlich");
      return null;
    },
    newHitCountIsValid() {
      return Boolean(this.newHitCount);
    },
    newHitCountStateFeedback() {
      if (!this.newHitCount) return this.$t("erforderlich");
      return null;
    },
    newHitMembersIsValid() {
      return Boolean(this.newHitMembers) && this.newHitMembers.length > 0;
    },
    newHitMembersStateFeedback() {
      if (!this.newHitMembers || this.newHitMembers.length == 0)
        return this.$t("erforderlich");
      return null;
    },
  },
};
</script>
