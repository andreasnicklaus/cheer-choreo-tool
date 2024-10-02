<template>
  <b-container id="homeView">
    <section
      id="sectionA"
      :style="{
        display: 'grid',
        placeItems: 'center',
        minHeight: 'calc(100vh - 76px)',
      }"
    >
      <b-col
        id="homeView"
        class="d-flex flex-column justify-content-center align-items-center"
      >
        <img id="logoImg" src="/Icon.png" alt="" width="200" />
        <h1 id="title">Editor für Cheer-Choreos</h1>
        <b-row
          class="w-75 my-4"
          align-h="around"
          :style="{ fontWeight: 'bold' }"
        >
          <b-col cols="auto" id="callout1"> 1. Choreos erstellen </b-col>
          <b-col cols="auto" id="callout2"> 2. Countsheets teilen </b-col>
          <b-col cols="auto" id="callout3"> 3. Videos erstellen </b-col>
        </b-row>
        <b-button
          id="registerButton"
          variant="primary"
          :to="{ name: 'Login' }"
          class="my-4"
        >
          Anmelden / Registrieren
        </b-button>
        <router-link id="helpLink" :to="{ name: 'Help' }"> Hilfe </router-link>
      </b-col>
    </section>

    <hr />

    <section
      :style="{
        display: 'grid',
        placeItems: 'center',
      }"
    >
      <b-row align-v="center" align-h="center" class="w-100" id="sectionB">
        <b-col cols="6">
          <h2>Choreos erstellen</h2>
          <b-list-group>
            <b-list-group-item>
              1. Gib deiner Choreo einen Namen
            </b-list-group-item>
            <b-list-group-item>
              2. Erstelle Aufstellungen, indem du die Punkte auf der Matte an
              die richtige Stelle ziehst
            </b-list-group-item>
            <b-list-group-item>
              3. Bestimme, wie lange die Aufstellungen gehalten werden sollen
              und von wem
            </b-list-group-item>
            <b-list-group-item>
              4. Mache Einträge in dein Countsheet, wer wann was macht
            </b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col cols="auto">
          <Mat :current-positions="currentPositions"
        /></b-col>
      </b-row>
    </section>

    <hr />

    <section id="sectionC">
      <b-row align-h="center">
        <b-col cols="6">
          <h2>Countsheets teilen</h2>
          <b-list-group>
            <b-list-group-item>
              1. Mache Einträge ins Countsheet, während du deine Choreo
              erstellst
            </b-list-group-item>
            <b-list-group-item>
              2. Bestimme für jeden Eintrag, ob er für alle oder nur für
              bestimmte Teilnehmerinnen und Teilnehmer gilt
            </b-list-group-item>
            <b-list-group-item>
              3. Erstelle Countsheets als Video oder als PDF für alle oder nur
              für bestimmte Teilnehmerinnen und Teilnehmer
            </b-list-group-item>
          </b-list-group>
        </b-col>

        <b-col cols="6" :style="{ minHeight: '400px' }">
          <CountOverview
            id="CountOverview"
            :count="count"
            :choreo="choreo"
            :hitsForCurrentCount="hitsForCurrentCount"
            :lineupsForCurrentCount="[]"
            :teamMembers="teamMembers"
            :interactive="false"
          />
        </b-col>
        <b-col cols="11">
          <CountSheet
            id="CountSheet"
            :count="count"
            :choreo="choreo"
            :interactive="false"
          />
        </b-col>
      </b-row>
    </section>

    <hr />

    <section id="sectionD">
      <b-row align-h="center">
        <b-col cols="6">
          <h2>Videos erstellen</h2>
          <b-list-group>
            <b-list-group-item>
              1. Wenn du zufrieden bist, gehe zu "als Video exportieren"
            </b-list-group-item>
            <b-list-group-item>
              2. Wähle aus, ab du ein Video mit allen auf der Matte oder
              ausgewählten Personen haben willst
            </b-list-group-item>
            <b-list-group-item>
              3. Warte, bis dein Video fertig ist
            </b-list-group-item>
          </b-list-group>
        </b-col>
        <b-col cols="auto">
          <b-form class="mt-5">
            <b-form-group
              id="checkbox1"
              description="Wähle aus, wer auf dem Video erscheinen soll"
            >
              <b-form-checkbox-group
                id="selectMembers"
                v-model="selectedTeamMembers"
                :options="
                  teamMembers.map((t) => ({
                    text: t.nickname,
                    value: t.abbreviation,
                  }))
                "
                stacked
              />
            </b-form-group>
            <b-form-group
              id="checkbox2"
              description="Soll das Video mit deinem Logo erstellt werden?"
            >
              <b-form-checkbox :checked="true">Mit Logo</b-form-checkbox>
            </b-form-group>
            <b-form-group
              id="checkbox3"
              description="Soll das Video mit deinem Vereins- und Mannschaftsnamen erstellt werden?"
            >
              <b-form-checkbox :checked="true">Mit Namen</b-form-checkbox>
            </b-form-group>
            <b-form-group
              id="checkbox4"
              description="Soll das Video einen durchlaufendem Count haben?"
            >
              <b-form-checkbox :checked="true">Mit Count</b-form-checkbox>
            </b-form-group>
            <b-form-group
              id="checkbox5"
              description="Soll das Video Einträge aus dem Countsheet zeigen?"
            >
              <b-form-checkbox :checked="true">
                Mit Countsheet-Einträgen
              </b-form-checkbox>
            </b-form-group>
          </b-form>
        </b-col>
      </b-row>
    </section>
  </b-container>
</template>

<script>
import CountOverview from "@/components/CountOverview.vue";
import CountSheet from "@/components/CountSheet.vue";
import Mat from "@/components/Mat.vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

export default {
  name: "HomeView",
  components: { Mat, CountSheet, CountOverview },
  data: () => ({
    count: 0,
    teamMembers: [
      {
        name: "Anna Unersetzlich",
        abbreviation: "AU",
        nickname: "Anni",
        color: "#dd45a8",
      },
      {
        name: "Maxi Supidupi",
        abbreviation: "MS",
        nickname: "Maxi",
        color: "#00ee8a",
      },
    ],
    choreo: {
      counts: 40,
      Hits: [
        {
          name: "Umdrehen",
          count: 0,
          Members: [
            {
              name: "Anna Unersetzlich",
              abbreviation: "AU",
              nickname: "Anni",
              color: "#dd45a8",
            },
          ],
        },
        {
          name: "Dip 1",
          count: 0,
          Members: [
            {
              name: "Maxi Supidupi",
              abbreviation: "MS",
              nickname: "Maxi",
              color: "#00ee8a",
            },
          ],
        },
        {
          name: "Schultern zu",
          count: 2,
        },
        {
          name: "Low v",
          count: 4,
        },
        {
          name: "Schritt",
          count: 6,
        },
        {
          name: "Flick Flack",
          count: 8,
          Members: [
            {
              name: "Maxi Supidupi",
              abbreviation: "MS",
              nickname: "Maxi",
              color: "#00ee8a",
            },
          ],
        },
        {
          name: "Flugrolle",
          count: 8,
          Members: [
            {
              name: "Anna Unersetzlich",
              abbreviation: "AU",
              nickname: "Anni",
              color: "#dd45a8",
            },
          ],
        },
        {
          name: "Flick Flack",
          count: 10,
        },
        {
          name: "Aufstehen 1",
          count: 12,
        },
        {
          name: "Rauslaufen",
          count: 12,
        },
        {
          name: "Aufstehen 2",
          count: 14,
        },
        {
          name: "Rolle 1",
          count: 14,
        },
        {
          name: "Arme einst.",
          count: 16,
        },
        {
          name: "Flugrolle",
          count: 16,
        },
        {
          name: "1 n. unten re.",
          count: 18,
        },
        {
          name: "1 n. unten li.",
          count: 19,
        },
        {
          name: "Arme Bogen über Seite in 7",
          count: 20,
        },
        {
          name: "Beginn Motions",
          count: 22,
        },
        {
          name: "Clap",
          count: 26,
        },
        {
          name: "High Clap",
          count: 27,
        },
        {
          name: "Hurdler",
          count: 29,
        },
        {
          name: "Toe-Touch",
          count: 31,
        },
        {
          name: "Aufstehen",
          count: 34,
        },
        {
          name: "clean",
          count: 36,
        },
        {
          name: "Clap",
          count: 37,
        },
        {
          name: "High Clap",
          count: 38,
        },
      ],
      Lineups: [],
    },
    currentPositions: [
      {
        MemberId: "test",
        Member: {
          name: "Anna Unersetzlich",
          abbreviation: "AU",
          nickname: "Anni",
          color: "#dd45a8",
        },
        x: 50,
        y: 50,
      },
      {
        MemberId: "test2",
        Member: {
          name: "Maxi Supidupi",
          abbreviation: "MS",
          nickname: "Maxi",
          color: "#00ee8a",
        },
        x: 60,
        y: 50,
      },
      {
        MemberId: "test3",
        Member: {
          name: "Theresa Toll",
          abbreviation: "TT",
          nickname: "Theresa",
          color: "#0000aa",
        },
        x: 45,
        y: 10,
      },
      {
        MemberId: "test4",
        Member: {
          name: "Paulina Flickflack",
          abbreviation: "PF",
          nickname: "Pauli",
          color: "#FFFF22",
        },
        x: 55,
        y: 10,
      },
    ],
    selectedTeamMembers: [],
  }),
  computed: {
    hitsForCurrentCount() {
      return this.choreo.Hits.filter((h) => h.count == this.count).map((h) => ({
        ...h,
        id: (Math.random() + 1).toString(36).substring(7),
      }));
    },
  },
  mounted() {
    this.selectedTeamMembers = this.teamMembers.map((t) => t.abbreviation);

    const tl = gsap.timeline();

    tl.from("#logoImg", {
      x: "-50vw",
      rotate: -360,
      duration: 1,
    });
    tl.from(
      "#title",
      {
        opacity: 0,
        duration: 1,
      },
      "<"
    );
    tl.from(
      "#callout1",
      {
        y: "50",
        opacity: 0,
        duration: 1,
        delay: 0.2,
      },
      "<+=0.2"
    );
    tl.from(
      "#callout2",
      {
        y: "50",
        opacity: 0,
        duration: 1,
        delay: 0.4,
      },
      "<+=0.2"
    );
    tl.from(
      "#callout3",
      {
        y: "50",
        opacity: 0,
        duration: 1,
        delay: 0.6,
      },
      "<+=0.2"
    );

    gsap.registerPlugin(ScrollTrigger);

    gsap.to("#registerButton", {
      scrollTrigger: {
        trigger: "#sectionB",
        start: "top bottom",
        end: "top 30%",
        scrub: -1,
      },
      y: 200,
      width: "100%",
    });
    gsap.to("#helpLink", {
      scrollTrigger: {
        trigger: "#sectionB",
        start: "top bottom",
        end: "top 30%",
        scrub: -1,
      },
      y: 200,
      opacity: 0,
    });

    const scrollTimeLine = gsap.timeline({
      scrollTrigger: {
        trigger: "#sectionB",
        start: "top 70%",
        end: "bottom center",
        scrub: -1,
      },
    });

    const matAnimations = [
      {
        id: "test",
        positions: [
          {
            x: 20,
            y: 60,
          },
          {
            x: 250,
            y: 60,
          },
          {
            x: 250,
            y: 420,
          },
        ],
      },
      {
        id: "test2",
        positions: [
          {
            x: 480,
            y: 60,
          },
          {
            x: 250,
            y: 250,
          },
          {
            x: 250,
            y: 450,
          },
        ],
      },
      {
        id: "test3",
        positions: [
          {
            x: 230,
            y: 250,
          },
          {
            x: 60,
            y: 250,
          },
          {
            x: 230,
            y: 450,
          },
        ],
      },
      {
        id: "test4",
        positions: [
          {
            x: 270,
            y: 250,
          },
          {
            x: 440,
            y: 250,
          },
          {
            x: 270,
            y: 450,
          },
        ],
      },
    ];

    matAnimations.forEach(({ id, positions }) => {
      scrollTimeLine.to(
        `#t${id}`,
        {
          keyframes: positions,
        },
        "<"
      );
      scrollTimeLine.to(
        `#c${id}`,
        {
          keyframes: positions.map((p) => ({ ease: p.ease, cx: p.x, cy: p.y })),
        },
        "<"
      );
    });

    ScrollTrigger.create({
      trigger: "#CountOverview",
      start: "top 40%",
      endTrigger: "#CountSheet",
      end: "bottom center",
      scrub: -1,
      onUpdate: (self) => {
        this.count = Math.floor(4 * self.progress) * 2;
      },
    });

    Array.from(Array(5)).forEach((_, i) => {
      gsap.from(`#checkbox${i + 1}`, {
        scrollTrigger: {
          trigger: `#checkbox${i + 1}`,
          start: "top 90%",
          end: i == 4 ? "+=80" : "+=150",
          scrub: -1,
        },
        x: 100,
        opacity: 0,
      });
    });
  },
};
</script>

<style lang="scss" scoped>
h2 {
  text-align: center;
  color: #0069d9;
  font-weight: bold;
  margin-bottom: 32px;
}

section {
  min-height: 70vh;
  display: grid;
  place-items: center;
}
</style>
