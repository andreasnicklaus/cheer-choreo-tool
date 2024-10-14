<template>
  <b-modal
    id="modal-newHit"
    title="Neuer Eintrag"
    centered
    size="lg"
    @show="resetModal"
    @hidden="resetModal"
    @ok="createHit"
  >
    <b-form>
      <b-form-group label="Name:">
        <b-form-input
          v-model="newHitName"
          placeholder="Wie heißt der neue Eintrag?"
          autofocus
          required
          :state="Boolean(newHitName)"
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
          <b-form-group description="Achter">
            <b-form-input
              v-model="newHitAchter"
              type="number"
              min="1"
              :max="Math.ceil(maxCount / 8)"
              :state="Boolean(newHitAchter)"
            />
          </b-form-group>
        </b-col>
        <b-col cols="6">
          <b-form-group description="Count:">
            <b-form-input
              v-model="newHitCount"
              type="number"
              min="1"
              :max="8"
              :state="Boolean(newHitCount)"
            />
          </b-form-group>
        </b-col>
      </b-row>
      <b-form-group label="Teilnehmer:">
        <b-form-checkbox-group
          id="memberSelection"
          :options="teamMembers?.map((m) => ({ text: m.name, value: m.id }))"
          v-model="newHitMembers"
          stacked
          :style="{ columnCount: 2 }"
        />
        <b-button-group>
          <b-button
            variant="light"
            @click="() => (this.newHitMembers = teamMembers.map((m) => m.id))"
            :disabled="newHitMembers?.length == teamMembers?.length"
          >
            <b-icon-check-all />
            Alle auswählen
          </b-button>
          <b-button
            variant="light"
            @click="() => (this.newHitMembers = [])"
            :disabled="newHitMembers?.length == 0"
          >
            <b-icon-slash /> Keine auswählen
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
            Auswahl wechseln
          </b-button>
        </b-button-group>
      </b-form-group>
    </b-form>
    <template #modal-footer="{ ok, cancel }">
      <b-button
        type="submit"
        @click="ok"
        variant="success"
        :disabled="!newHitName || !newHitCount"
      >
        Speichern
      </b-button>
      <b-button @click="cancel" variant="danger">Abbrechen</b-button>
    </template>
  </b-modal>
</template>

<script>
import HitService from "@/services/HitService";

function generateHitNameProposals() {
  const preDirections = [null, "High", "Low"];
  const postDirections = [
    null,
    "nach rechts",
    "rechts",
    "nach links",
    "links",
    "nach hinten",
    "hinten",
    "nach vorne",
    "vorne",
  ];

  const preActions = [null, "Set", "Go", "Start", "Dip"];

  const actions = [
    null,
    "V",
    "Elevator",
    "Stretch",
    "Lib",
    "Tick Tock",
    "Scale",
    "Arabesque",
    "Rad",
    "Bogengang",
    "Flick Flack",
    "Pinguin",
    "Playmobil",
    "Clap",
    "Toetouch",
    "Pyra",
    "Randwende",
    "Spagat",
    "Kneel",
    "Knien",
    "Full around",
    "Half around",
    "Trophy",
    "Basket",
    "Log roll",
    "Cradle",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "Wurf",
  ];

  const standAlones = ["Clean", "Raussetzen", "Loslaufen", "Umgreifen", "Ende"];

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

export default {
  name: "CreateHitModal",
  data: () => ({
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
      this.$bvModal.show("modal-newHit");
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
};
</script>
