<template>
  <b-modal
    :id="`modal-newHit-${id}`"
    title="Neuer Eintrag"
    centered
    size="lg"
    @show="resetModal"
    @hidden="resetModal"
    @ok="createHit"
  >
    <b-form>
      <b-form-group
        label="Name:"
        :state="newHitNameIsValid"
        :invalid-feedback="newHitNameStateFeedback"
        valid-feedback="Gültig!"
      >
        <b-form-input
          v-model="newHitName"
          placeholder="Wie heißt der neue Eintrag?"
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
            description="Achter"
            :state="newHitAchterIsValid"
            :invalid-feedback="newHitAchterStateFeedback"
            valid-feedback="Gültig!"
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
            description="Count:"
            :state="newHitCountIsValid"
            :invalid-feedback="newHitCountStateFeedback"
            valid-feedback="Gültig!"
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
        label="Teilnehmer:"
        :state="newHitMembersIsValid"
        :invalid-feedback="newHitMembersStateFeedback"
        valid-feedback="Gültig!"
      >
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

  const preActions = [null, "Set", "Go", "Start", "Dip", "Half Up"];

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

  const standAlones = [
    "Clean",
    "Raussetzen",
    "Loslaufen",
    "Umgreifen",
    "Greifen",
    "Ende",
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
      if (!this.newHitName) return "Erforderlich";
      if (this.newHitName.trim().length < 3) return "Min. 3 Zeichen";
      return null;
    },
    newHitAchterIsValid() {
      return Boolean(this.newHitAchter);
    },
    newHitAchterStateFeedback() {
      if (!this.newHitAchter) return "Erforderlich";
      return null;
    },
    newHitCountIsValid() {
      return Boolean(this.newHitCount);
    },
    newHitCountStateFeedback() {
      if (!this.newHitCount) return "Erforderlich";
      return null;
    },
    newHitMembersIsValid() {
      return Boolean(this.newHitMembers) && this.newHitMembers.length > 0;
    },
    newHitMembersStateFeedback() {
      if (!this.newHitMembers || this.newHitMembers.length == 0)
        return "Erforderlich";
      return null;
    },
  },
};
</script>
