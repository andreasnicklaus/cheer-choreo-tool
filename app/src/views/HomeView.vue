<template>
  <BContainer id="homeView" data-view>
    <section
      id="sectionA"
      :style="{
        display: 'grid',
        placeItems: 'center',
        minHeight: 'calc(100vh - 76px)',
      }"
    >
      <BCol
        class="d-flex flex-column justify-content-center align-items-center"
      >
        <img
          id="logoImg"
          :src="
            $store.getters.isChristmasTime
              ? '/Icon-Christmas.png'
              : $store.getters.isEasterTime
                ? '/Icon-Easter.png'
                : '/Icon.png'
          "
          :alt="$t('choreo-planer-icon')"
          width="200"
          height="200"
        />
        <h1 id="title" class="text-center display-4">
          {{ $t("Home.dein") }}
          {{ $t("general.ChoreoPlaner") }}
        </h1>
        <BRow
          class="w-75 my-4"
          align-h="around"
          :style="{ fontWeight: 'bold' }"
        >
          <BCol cols="auto" id="callout1">
            1. {{ $t("Home.choreos-erstellen") }}
          </BCol>
          <BCol cols="auto" id="callout2">
            2. {{ $t("Home.countsheets-teilen") }}
          </BCol>
          <BCol cols="auto" id="callout3">
            3. {{ $t("Home.videos-erstellen") }}
          </BCol>
        </BRow>
        <BButton
          id="registerButton"
          variant="primary"
          :to="
            $store.state.loggedIn
              ? { name: 'Start', params: { locale: $i18n.locale } }
              : { name: 'Login', params: { locale: $i18n.locale } }
          "
          class="my-4"
          :style="{ textWrap: 'no-wrap' }"
        >
          {{
            $store.state.loggedIn
              ? $t("Home.zur-uebersicht")
              : `${$t("anmelden")} / ${$t("registrieren")}`
          }}
        </BButton>
        <router-link
          id="helpLink"
          :to="{ name: 'Help', params: { locale: $i18n.locale } }"
        >
          {{ $t("general.help") }}
        </router-link>
      </BCol>
    </section>

    <section
      id="sectionB"
      :style="{
        display: 'grid',
        placeItems: 'center',
      }"
    >
      <BRow align-v="center" align-h="center" class="w-100">
        <BCol cols="12" lg="6" class="mb-lg-0 mb-2">
          <h2>📝 {{ $t("Home.choreos-erstellen") }}</h2>
          <ol>
            <li>{{ $t("Home.choreo-benennen") }}</li>
            <li>
              {{ $t("Home.aufstellungen-erstellen") }}
            </li>
            <li>
              {{ $t("Home.laenge-bestimmen") }}
            </li>
            <li>{{ $t("Home.eintraege-machen") }}</li>
          </ol>
        </BCol>
        <BCol cols="12" lg="6" :style="{ minHeight: matWidth + 56 + 'px' }">
          <BTabs pills content-class="mt-3" align="center">
            <BTab :title="$t('cheerleading')" id="cheer-Mat">
              <div
                :style="{
                  minHeight: matWidth + 'px',
                  placeItems: 'center',
                  display: 'grid',
                }"
              >
                <Mat
                  :currentPositions="currentPositions"
                  :width="matWidth"
                  matType="cheer"
                  :teamMembers="teamMembers"
                  :interactive="false"
                  :dotRadius="(matWidth / 500) * 20"
                />
              </div>
            </BTab>
            <BTab id="garde-Mat">
              <template #title>
                {{ $t("Home.garde") }}
                <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
              </template>
              <div
                :style="{
                  minHeight: matWidth + 'px',
                  placeItems: 'center',
                  display: 'grid',
                }"
              >
                <Mat
                  :currentPositions="currentPositions"
                  :width="matWidth"
                  matType="1:2"
                  :teamMembers="teamMembers"
                  :interactive="false"
                  :dotRadius="(matWidth / 500) * 20"
                />
              </div>
            </BTab>
            <BTab id="v34-Mat">
              <template #title>
                {{ $t("Home.stage-3-4") }}
                <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
              </template>
              <div
                :style="{
                  minHeight: matWidth + 'px',
                  placeItems: 'center',
                  display: 'grid',
                }"
              >
                <Mat
                  :currentPositions="currentPositions"
                  :width="matWidth"
                  matType="3:4"
                  :teamMembers="teamMembers"
                  :interactive="false"
                  :dotRadius="(matWidth / 500) * 20"
                />
              </div>
            </BTab>
            <BTab id="square-Mat">
              <template #title>
                {{ $t("Home.stage-1-1") }}
                <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
              </template>
              <div
                :style="{
                  minHeight: matWidth + 'px',
                  placeItems: 'center',
                  display: 'grid',
                }"
              >
                <Mat
                  :currentPositions="currentPositions"
                  :width="matWidth"
                  matType="square"
                  :teamMembers="teamMembers"
                  :interactive="false"
                  :dotRadius="(matWidth / 500) * 20"
                />
              </div>
            </BTab>
          </BTabs>
        </BCol>
      </BRow>
    </section>

    <div id="featureCallouts1" class="featureCallouts d-none d-md-flex">
      <BCol class="featureCallout h3">
        <IBiPeopleFill class="text-info" /><br />
        {{ $t("Home.mitgliederverwaltung") }}
        <ul>
          <li>{{ $t("verein", 2) }}</li>
          <li>{{ $t("team", 2) }}</li>
          <li>{{ $t("seasonkader") }}</li>
          <li>{{ $t("teilnehmer", 2) }}</li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiLayoutThreeColumns class="text-secondary" /><br />
        {{ $t("Home.choreoplanung") }}
        <ul>
          <li>{{ $t("lineup", 2) }}</li>
          <li>{{ $t("countsheet", 2) }}</li>
          <li>{{ $t("Home.verwaltung-nach-season") }}</li>
          <li>
            {{ $t("Home.choose-the-layout-of-your-stage") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
          </li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiStarFill class="text-warning fs-1" /><br />
        {{ $t("Home.personalisierung") }}
        <ul>
          <li>
            {{ $t("Home.branding-deines-vereins") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
          </li>
          <li>
            {{ $t("Home.lade-das-logo-deines-vereins-hoch") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
          </li>
          <li>
            {{ $t("Home.mach-werbung-fuer-dein-team") }}
            <NewVersionBadge :versions="['0.10.3', '0.11.0']" />
          </li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiFilePdfFill class="text-danger" /><br />
        {{ $t("Home.dateigenerierung") }}
        <ul>
          <li>{{ $t("Home.videos-als-mp4-und-webm") }}</li>
          <li>{{ $t("Home.countsheet-als-pdf") }}</li>
          <li>{{ $t("Home.aufstellungen-als-bild") }}</li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiFilm class="text-secondary" /><br />
        {{ $t("Home.video-export") }}
        <ul>
          <li>{{ $t("Home.teile-choreos-einfach-als-video") }}</li>
          <li>{{ $t("Home.generierung-lokal-im-browser") }}</li>
          <li>{{ $t("Home.download-als-mp4-oder-webm") }}</li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiShieldFillCheck class="text-primary" /><br />
        {{ $t("Home.datensicherung") }}
        <ul>
          <li>{{ $t("Home.speicherung-auf-unseren-servern") }}</li>
          <li>{{ $t("Home.per-passwort-gesicherter-datenzugriff") }}</li>
          <li>{{ $t("Home.verschluesselter-datentransfer") }}</li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiCalendar2RangeFill /><br />
        {{ $t("Home.seasonwechsel") }}
        <ul>
          <li>{{ $t("Home.starte-neue-seasons-wenn-du-soweit-bist") }}</li>
          <li>{{ $t("Home.importiere-teilnehmer-in-neue-seasonkader") }}</li>
          <li>
            {{ $t("Home.definiere-eigene-seasons") }}
          </li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiTrophyFill class="text-warning" /><br />
        {{ $t("Home.meisterschaftsvorbereitung") }}
        <ul>
          <li>{{ $t("Home.bereite-choreos-vor") }}</li>
          <li>{{ $t("Home.gib-videos-und-countsheets") }}</li>
          <li>{{ $t("Home.mache-last-minute-auswechslungen") }}</li>
        </ul>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiArchiveFill /><br />
        {{ $t("Home.datenarchivierung") }}
        <ul>
          <li>{{ $t("Home.regelmaessige-datensicherung") }}</li>
          <li>
            {{ $t("Home.deine-daten-werden-verwendet") }}
          </li>
        </ul>
      </BCol>
    </div>

    <section id="sectionC">
      <BRow align-h="center">
        <BCol cols="12" lg="6" class="mb-lg-0 mb-2">
          <h2>🫰 {{ $t("Home.countsheets-teilen") }}</h2>
          <ol>
            <li>
              {{ $t("Home.mache-eintraege") }}
            </li>
            <li>
              {{ $t("Home.bestimme-fuer-jeden-eintrag") }}
            </li>
            <li>
              {{ $t("Home.erstelle-countsheets-als-video") }}
            </li>
          </ol>
        </BCol>

        <BCol cols="12" lg="6" :style="{ minHeight: '400px' }">
          <CountOverview
            id="CountOverview"
            :count="count"
            :choreo="choreo"
            :hitsForCurrentCount="hitsForCurrentCount"
            :lineupsForCurrentCount="[]"
            :teamMembers="teamMembers"
            :interactive="false"
          />
        </BCol>
        <BCol cols="12" class="d-none d-md-flex flex-column">
          <CountSheet
            id="CountSheet"
            :count="count"
            :choreo="choreo"
            :interactive="false"
          />
          <small class="text-muted text-center">{{
            $t("Home.beispiel-countsheet")
          }}</small>
        </BCol>
      </BRow>
    </section>

    <div
      id="featureCallouts2"
      class="featureCallouts row-reverse d-none d-md-flex"
    >
      <BCol class="featureCallout h3">
        <IBiPersonPlusFill class="text-success" /><br />
        1. {{ $t("anmelden") }}
        <ol>
          <li>{{ $t("Home.anmelden-mit-benutzername-und-passwort") }}</li>
          <li>{{ $t("Home.gib-deinem-ersten-verein-einen-namen") }}</li>
        </ol>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiPeopleFill class="text-info" /><br />
        2. {{ $t("Home.team-anlegen") }}
        <ol>
          <li>{{ $t("Home.name-deines-teams") }}</li>
          <li>{{ $t("Home.aktuelle-season-des-teams") }}</li>
          <li>{{ $t("Home.seasonkader-fuellen") }}</li>
        </ol>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiLayoutThreeColumns class="text-secondary" /><br />
        3. {{ $t("Home.choreos-planen") }}
        <ol>
          <li>{{ $t("Home.name-der-choreo") }}</li>
          <li>{{ $t("Home.laenge-in-counts-and-achtern") }}</li>
          <li>{{ $t("lineup", 2) }}</li>
          <li>{{ $t("Home.eintraege-im-countsheet") }}</li>
        </ol>
      </BCol>
      <BCol class="featureCallout h3">
        <IBiDownload /><br />
        4. {{ $t("Home.videos-herunterladen") }}
        <ol>
          <li>{{ $t("Home.generiere-das-video") }}</li>
          <li>{{ $t("Home.lade-das-video-runter") }}</li>
          <li>{{ $t("Home.teile-es-in-eurem-team-chat") }}</li>
        </ol>
      </BCol>
      <BCol class="featureCallout h3">
        <div>
          <IBiChatFill class="text-success" />
          <IBiFileEarmarkArrowUpFill class="text-danger" />
        </div>
        <br />
        5. {{ $t("Home.countsheets-teilen") }}
        <ol>
          <li>{{ $t("Home.fuelle-das-countsheet") }}</li>
          <li>{{ $t("Home.lade-das-pdf-herunter") }}</li>
          <li>{{ $t("Home.teile-es-in-eurem-team-chat") }}</li>
        </ol>
      </BCol>
    </div>

    <section id="sectionD">
      <BRow align-h="center">
        <BCol cols="12" lg="6">
          <h2>🎞️ {{ $t("Home.videos-erstellen") }}</h2>
          <ol>
            <li>{{ $t("Home.gehe-zu-als-video-exportieren") }}</li>
            <li>
              {{ $t("Home.waehle-mit-allen-aus") }}
            </li>
            <li>{{ $t("Home.warte-bis-video") }}</li>
          </ol>
        </BCol>
        <BCol cols="12" lg="6">
          <BForm id="video-form">
            <BFormGroup
              id="checkbox1"
              :description="$t('Home.waehle-aus-wer-soll')"
            >
              <BFormCheckboxGroup
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
            </BFormGroup>
            <BFormGroup id="checkbox2" :description="$t('Home.soll-dein-logo')">
              <BFormCheckbox :checked="true">{{
                $t("Home.mit-logo")
              }}</BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              id="checkbox3"
              :description="$t('Home.soll-mit-deinem-verein')"
            >
              <BFormCheckbox :checked="true">{{
                $t("Home.mit-namen")
              }}</BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              id="checkbox4"
              :description="$t('Home.soll-durchlaufendem-count')"
            >
              <BFormCheckbox :checked="true">{{
                $t("Home.mit-count")
              }}</BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              id="checkbox5"
              :description="$t('Home.soll-mit-eintraegen')"
            >
              <BFormCheckbox :checked="true">
                {{ $t("Home.mit-countsheet-eintraegen") }}
              </BFormCheckbox>
            </BFormGroup>
          </BForm>
        </BCol>
      </BRow>
    </section>

    <div
      :style="{
        borderRadius: '4px',
      }"
      v-show="!$store.state.loggedIn"
      class="text-center py-5 px-3 bg-success text-light mb-5"
      id="interestedSection"
    >
      <h2 class="mb-1">{{ $t("Home.interesse-geweckt") }}</h2>
      <p class="mb-4">
        {{ $t("Home.zum-loslegen") }}
      </p>
      <BButton
        class="pulse-button bg-white text-success"
        :to="{ name: 'Login', params: { locale: $i18n.locale } }"
      >
        {{ $t("anmelden") }} /
        {{ $t("registrieren") }}
      </BButton>
    </div>
  </BContainer>
</template>

<script setup>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

useHead({
  title: computed(
    () => `${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
  ),
  titleTemplate: null,
  meta: [
    {
      name: "description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      name: "twitter:description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      property: "og:description",
      content: computed(() => t("meta.defaults.description")),
    },
    {
      property: "og:title",
      content: computed(
        () => `${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
      ),
    },
    {
      name: "twitter:title",
      content: computed(
        () => `${t("general.ChoreoPlaner")} | ${t("meta.defaults.title")}`
      ),
    },
  ],
});
</script>

<script>
import CountOverview from "@/components/CountOverview.vue";
import CountSheet from "@/components/CountSheet.vue";
import Mat from "@/components/Mat.vue";
import NewVersionBadge from "@/components/NewVersionBadge.vue";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/all";

/**
 * @vue-data {Number} count=0 - The current count value, used to highlight the selected cell.
 * @vue-data {Array} teamMembers - List of team members with their details.
 * @vue-data {Object} choreo - The choreography object containing hits and counts.
 * @vue-data {Array} currentPositions - The current positions of all members on the mat.
 * @vue-data {Array} selectedTeamMembers - The currently selected team members for video export.
 *
 * @vue-computed {Array} hitsForCurrentCount - The hits for the current count, filtered from the choreo object.
 * @vue-computed {Number} matWidth - The width of the mat, calculated based on the window size.
 *
 * @vue-meta {MetaInfo} metaInfo
 */

export default {
  name: "HomeView",
  components: {
    Mat,
    CountSheet,
    CountOverview,
    NewVersionBadge,
  },
  data: function () {
    return {
      count: 0,
      teamMembers: [
        {
          id: "a",
          name: this.$t("personas.anna-unersetzlich"),
          abbreviation: this.$t("personas.anna-unersetzlich-abk"),
          nickname: this.$t("personas.anna-unersetzlich-nick"),
          ChoreoParticipation: {
            color: "#dd45a8",
          },
        },
        {
          id: "m",
          name: this.$t("personas.maxi-supidupi"),
          abbreviation: this.$t("personas.maxi-supidupi-abk"),
          nickname: this.$t("personas.maxi-supidupi-nick"),
          ChoreoParticipation: {
            color: "#00ee8a",
          },
        },
        {
          id: "t",
          name: this.$t("personas.theresa-toll"),
          abbreviation: this.$t("personas.theresa-toll-abk"),
          nickname: this.$t("personas.theresa-toll-nick"),
          ChoreoParticipation: {
            color: "#0000aa",
          },
        },
        {
          id: "p",
          name: this.$t("personas.paulina-flickflack"),
          abbreviation: this.$t("personas.paulina-flickflack-abk"),
          nickname: this.$t("personas.paulina-flickflack-nick"),
          ChoreoParticipation: {
            color: "#FFFF22",
          },
        },
      ],
      choreo: {
        counts: 40,
        Hits: [
          {
            name: this.$t("Home.Umdrehen"),
            count: 0,
            Members: [
              {
                id: "a",
                name: this.$t("personas.anna-unersetzlich"),
                abbreviation: this.$t("personas.anna-unersetzlich-abk"),
                nickname: this.$t("personas.anna-unersetzlich-nick"),
                ChoreoParticipation: {
                  color: "#dd45a8",
                },
              },
            ],
          },
          {
            name: "Dip 1",
            count: 0,
            Members: [
              {
                id: "m",
                name: this.$t("personas.maxi-supidupi"),
                abbreviation: this.$t("personas.maxi-supidupi-abk"),
                nickname: this.$t("personas.maxi-supidupi-nick"),
                ChoreoParticipation: {
                  color: "#00ee8a",
                },
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
                id: "m",
                name: this.$t("personas.maxi-supidupi"),
                abbreviation: this.$t("personas.maxi-supidupi-abk"),
                nickname: this.$t("personas.maxi-supidupi-abk"),
                ChoreoParticipation: {
                  color: "#00ee8a",
                },
              },
            ],
          },
          {
            name: "Flugrolle",
            count: 8,
            Members: [
              {
                id: "a",
                name: this.$t("personas.anna-unersetzlich"),
                abbreviation: this.$t("personas.anna-unersetzlich-abk"),
                nickname: this.$t("personas.anna-unersetzlich-nick"),
                ChoreoParticipation: {
                  color: "#dd45a8",
                },
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
          MemberId: "a",
          Member: {
            id: "a",
            name: this.$t("personas.anna-unersetzlich"),
            abbreviation: this.$t("personas.anna-unersetzlich-abk"),
            nickname: this.$t("personas.anna-unersetzlich-nick"),
            ChoreoParticipation: {
              color: "#dd45a8",
            },
          },
          x: 40,
          y: 50,
        },
        {
          MemberId: "m",
          Member: {
            id: "m",
            name: this.$t("personas.maxi-supidupi"),
            abbreviation: this.$t("personas.maxi-supidupi-abk"),
            nickname: this.$t("personas.maxi-supidupi-nick"),
            ChoreoParticipation: {
              color: "#00ee8a",
            },
          },
          x: 60,
          y: 50,
        },
        {
          MemberId: "t",
          Member: {
            id: "t",
            name: this.$t("personas.theresa-toll"),
            abbreviation: this.$t("personas.theresa-toll-abk"),
            nickname: this.$t("personas.theresa-toll-nick"),
            ChoreoParticipation: {
              color: "#0000aa",
            },
          },
          x: 45,
          y: 10,
        },
        {
          MemberId: "p",
          Member: {
            id: "p",
            name: this.$t("personas.paulina-flickflack"),
            abbreviation: this.$t("personas.paulina-flickflack-abk"),
            nickname: this.$t("personas.paulina-flickflack-nick"),
            ChoreoParticipation: {
              color: "#FFFF22",
            },
          },
          x: 55,
          y: 10,
        },
      ],
      selectedTeamMembers: [],
    };
  },
  computed: {
    hitsForCurrentCount() {
      return this.choreo.Hits.filter((h) => h.count == this.count).map((h) => ({
        ...h,
        id: (Math.random() + 1).toString(36).substring(7),
      }));
    },
    matWidth() {
      const w = document.getElementById("app")?.clientWidth;
      if (w < 576) return 300;
      else if (w < 992) return 400;
      else return 500;
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
        trigger: "#sectionA",
        start: "center center",
        end: "bottom 20%",
        scrub: -1,
      },
      y: "15vh",
      width: "100%",
    });
    gsap.to("#helpLink", {
      scrollTrigger: {
        trigger: "#sectionA",
        start: "center center",
        end: "bottom 20%",
        scrub: -1,
      },
      y: "15vh",
      opacity: 0,
    });

    const homeViewWidth = document.getElementById("homeView").clientWidth;
    const featureCallouts1Width =
      document.getElementById("featureCallouts1").clientWidth;
    const featureCallouts2Width =
      document.getElementById("featureCallouts2").clientWidth;

    gsap.to("#featureCallouts1", {
      scrollTrigger: {
        trigger: "#featureCallouts1",
        start: "center center",
        end: `+=${featureCallouts1Width - homeViewWidth}`,
        scrub: -1,
        pin: true,
        anticipatePin: 1,
      },
      x: homeViewWidth - featureCallouts1Width,
    });
    gsap.from("#featureCallouts2", {
      scrollTrigger: {
        trigger: "#featureCallouts2",
        start: "center center",
        end: `+=${featureCallouts2Width - homeViewWidth}`,
        scrub: -1,
        pin: true,
        anticipatePin: 1,
      },
      x: homeViewWidth - featureCallouts2Width,
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
        id: "a",
        positions: [
          {
            x: 0.08,
            y: 0.12,
          },
          {
            x: 0.5,
            y: 0.12,
          },
          {
            x: 0.5,
            y: 0.84,
          },
        ],
      },
      {
        id: "m",
        positions: [
          {
            x: 0.92,
            y: 0.12,
          },
          {
            x: 0.5,
            y: 0.5,
          },
          {
            x: 0.5,
            y: 0.9,
          },
        ],
      },
      {
        id: "t",
        positions: [
          {
            x: 0.46,
            y: 0.5,
          },
          {
            x: 0.12,
            y: 0.5,
          },
          {
            x: 0.46,
            y: 0.9,
          },
        ],
      },
      {
        id: "p",
        positions: [
          {
            x: 0.54,
            y: 0.5,
          },
          {
            x: 0.88,
            y: 0.5,
          },
          {
            x: 0.54,
            y: 0.9,
          },
        ],
      },
    ];
    const displayedMats = [
      {
        id: "cheer-Mat",
        heightFactor: 1,
      },
      {
        id: "garde-Mat",
        heightFactor: 0.5,
      },
      {
        id: "v34-Mat",
        heightFactor: 0.75,
      },
      {
        id: "square-Mat",
        heightFactor: 1,
      },
    ];

    matAnimations.forEach(({ id, positions }) => {
      displayedMats.forEach(({ id: matId, heightFactor }) => {
        scrollTimeLine.to(
          `#${matId} #t${id}`,
          {
            keyframes: positions.map((p) => ({
              ease: p.ease,
              x: p.x * this.matWidth,
              y: p.y * this.matWidth * heightFactor,
            })),
          },
          "<"
        );
        scrollTimeLine.to(
          `#${matId} #c${id}`,
          {
            keyframes: positions.map((p) => ({
              ease: p.ease,
              cx: p.x * this.matWidth,
              cy: p.y * this.matWidth * heightFactor,
            })),
          },
          "<"
        );
      });
    });

    ScrollTrigger.create({
      trigger: "#CountOverview",
      start: "top 40%",
      endTrigger: "#sectionC",
      end: "bottom center",
      scrub: -1,
      onUpdate: (self) => {
        this.count = Math.floor(4 * self.progress) * 2;
      },
    });
  },
};
</script>

<style lang="scss" scoped>
h1 {
  font-weight: 800;
}

h2 {
  text-align: center;
  section > & {
    color: #0069d9;
  }
  font-weight: bold;
  margin-bottom: 32px;
}

section {
  min-height: 70vh;
  display: grid;
  place-items: center;
  &:not(#sectionA) {
    padding: 20vh 0;
  }
  & > .row {
    row-gap: 10vh;
  }
}

ol,
ul {
  font-size: large;
  margin-left: 20px;
  margin-bottom: 0;
  & > li {
    margin-bottom: 8px;
  }
}

.featureCallouts {
  display: flex;
  width: fit-content;
  margin: 10vh 0;

  &.row-reverse {
    flex-direction: row-reverse;

    .featureCallout {
      &:nth-of-type(1) {
        margin-right: 0;
        margin-left: 48px;
      }
      &:last-of-type {
        margin-left: 0;
        margin-right: 48px;
      }
    }
  }

  .featureCallout {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: max-content;
    hyphens: manual;
    font-weight: 800;
    font-size: 2em;
    text-align: center;
    margin: 0 48px;

    & > ul,
    & > ol {
      text-align: start;
      margin-top: 24px;
      margin-left: 24px;
      font-weight: initial;
    }

    & .b-icon {
      font-size: 60px;
      margin-bottom: 16px;
    }

    &:nth-of-type(1) {
      margin-left: 0;
    }
    &:last-of-type {
      margin-right: 0;
    }
  }
}

.pulse-button {
  box-shadow: 0 0 0 0 white;
  -webkit-animation: pulsing 2s infinite cubic-bezier(0.66, 0, 0, 1);
  -moz-animation: pulsing 2s infinite cubic-bezier(0.66, 0, 0, 1);
  -ms-animation: pulsing 2s infinite cubic-bezier(0.66, 0, 0, 1);
  animation: pulsing 2s infinite cubic-bezier(0.66, 0, 0, 1);
}

.pulse-button:hover {
  -webkit-animation: none;
  -moz-animation: none;
  -ms-animation: none;
  animation: none;
  color: #ffffff;
}

@-webkit-keyframes pulsing {
  50% {
    box-shadow: 0 0 0 20px #6927d300;
  }
  100% {
    box-shadow: 0 0 0 20px #6927d300;
  }
}

@-moz-keyframes pulsing {
  50% {
    box-shadow: 0 0 0 20px #6927d300;
  }
  100% {
    box-shadow: 0 0 0 20px #6927d300;
  }
}

@-ms-keyframes pulsing {
  50% {
    box-shadow: 0 0 0 20px #6927d300;
  }
  100% {
    box-shadow: 0 0 0 20px #6927d300;
  }
}

@keyframes pulsing {
  50% {
    box-shadow: 0 0 0 20px #6927d300;
  }
  100% {
    box-shadow: 0 0 0 20px #6927d300;
  }
}
</style>
