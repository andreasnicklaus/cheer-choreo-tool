<template>
  <BContainer class="text-center" data-view>
    <vue-html2pdf
      ref="html2pdf"
      :show-layout="false"
      :float-layout="true"
      :enable-download="true"
      :preview-modal="true"
      :filename="choreo?.name || 'Countsheet'"
      :pdf-quality="2"
      :manual-pagination="true"
      pdf-format="a4"
      pdf-orientation="portrait"
      pdf-content-width="700px"
      :html-to-pdf-options="{
        margin: [15, 10],
        filename: choreo?.name ? choreo.name + '.pdf' : 'Countsheet.pdf',
      }"
    >
      <template v-slot:pdf-content>
        <section>
          <div v-for="(split, i) in hitSplits" :key="split.startIndex">
            <BRow
              align-h="between"
              align-v="center"
              class="mb-2"
              :ref="(el) => setCountSheetInfoRef(el, split.startIndex)"
            >
              <BCol cols="auto" v-if="includeChoreoName">
                {{ choreo?.name }}
              </BCol>
              <BCol cols="auto" v-if="includeTeamName">
                {{ choreo?.SeasonTeam.Team?.name }}
              </BCol>
              <BCol cols="auto" v-if="includeDate">
                {{ new Date(date).toLocaleDateString("de-de") }}
              </BCol>
              <BCol cols="auto" v-if="includeLogo">
                <img
                  :src="currentClubLogoBlob"
                  alt=""
                  height="60"
                  :style="{ maxWidth: '200px' }"
                />
              </BCol>
              <BCol
                cols="auto"
                v-if="
                  includeMemberNames &&
                  includedMembers.length > 0 &&
                  includedMembers.length < teamMembers.length
                "
                class="text-start"
              >
                {{
                  teamMembers
                    .filter((m) => includedMembers.includes(m.id))
                    .map((m) => m.nickname || m.name)
                    .join(", ")
                }}
              </BCol>
            </BRow>
            <CountSheet
              :ref="(el) => setCountSheetRef(el, split.startIndex)"
              :count="-1"
              :startCount="split.startIndex"
              :choreo="
                choreo
                  ? {
                      ...choreo,
                      counts: split.nItems,
                      Hits: choreo?.Hits.filter(
                        (h) =>
                          (!h.Members ||
                            h.Members.length == 0 ||
                            h.Members.length == teamMembers.length ||
                            h.Members.some((m) =>
                              includedMembers.includes(m.id)
                            )) &&
                          h.count >= split.startIndex &&
                          h.count <= split.startIndex + split.nItems
                      ),
                    }
                  : choreo
              "
              :stickyHeader="false"
              :fontSize="12"
              :fixed="true"
            />
            <p class="text-center">{{ i + 1 }} / {{ hitSplits.length }}</p>
            <div class="html2pdf__page-break" />
          </div>
        </section>
      </template>
    </vue-html2pdf>

    <BCard
      class="text-start mb-4"
      :title="$t('pdf.countsheet-zusammenstellen')"
    >
      <BCardSubtitle v-if="choreo">
        <p class="m-0">
          {{ $t("video-export-comp.ausgewaehlte-choreo") }}: {{ choreo.name }}
        </p>
        <p class="m-0">
          {{ $t("team", 1) }}: {{ choreo.SeasonTeam.Team.name }} ({{
            choreo.SeasonTeam.Season.name
          }})
        </p>
      </BCardSubtitle>
      <BCardSubtitle v-else :style="{ height: '38.38px' }">
        {{ $t("pdf.choreo-laedt") }}
      </BCardSubtitle>
      <BCardBody>
        <BRow :style="{ rowGap: '16px' }">
          <BCol md="6" cols="12">
            <BFormGroup
              :description="$t('pdf.das-datum-auf-das-countsheet-schreiben')"
              :state="dateIsValid"
              :invalid-feedback="dateStateFeedback"
            >
              <BFormCheckbox v-model="includeDate">
                {{ $t("pdf.datum-anzeigen") }}
              </BFormCheckbox>
              <BFormInput
                type="date"
                v-model="date"
                :disabled="!includeDate"
                :state="dateIsValid"
              />
            </BFormGroup>
            <BFormGroup
              :description="
                $t('pdf.den-team-namen-auf-das-countsheet-schreiben')
              "
            >
              <BFormCheckbox v-model="includeTeamName">
                {{ $t("pdf.team-name-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :description="
                $t('pdf.den-choreo-namen-auf-das-countsheet-schreiben')
              "
            >
              <BFormCheckbox v-model="includeChoreoName">
                {{ $t("pdf.choreo-name-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :description="
                $t('pdf.die-namen-der-teilnehmer-auf-das-countsheet-schreiben')
              "
            >
              <BFormCheckbox v-model="includeMemberNames">
                {{ $t("pdf.teilnehmer-namen-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :disabled="!currentClub?.logoExtension"
              :description="
                $t('pdf.zeige-das-logo-deines-vereins-auf-dem-countsheet-an')
              "
            >
              <BFormCheckbox v-model="includeLogo">
                {{ $t("pdf.vereinslogo-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BAvatar
              size="60px"
              :src="currentClubLogoBlob"
              v-if="currentClub?.logoExtension"
              :disabled="!includeLogo"
            >
              <IBiHouseFill v-if="!currentClubLogoBlob" font-scale="1.5" />
            </BAvatar>
          </BCol>
          <BCol md="6" cols="12" class="mb-3">
            <BPlaceholderWrapper
              :loading="
                !choreo || !choreo.SeasonTeam.Team || !choreo.Participants
              "
            >
              <template #loading>
                <BPlaceholder
                  v-for="(_, i) in Array(3)"
                  :key="i"
                  animation="wave"
                ></BPlaceholder>
              </template>
              <BFormGroup
                :description="$t('pdf.fuer-wen-ist-das-countsheet')"
                :state="includedMembersIsValid"
                :invalid-feedback="includedMembersStateFeedback"
              >
                <BButtonGroup class="mb-2">
                  <BButton
                    variant="light"
                    @click="
                      () => (includedMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="includedMembers.length == teamMembers.length"
                  >
                    <IBiCheckAll />
                    {{ $t("alle-auswaehlen") }}
                  </BButton>
                  <BButton
                    variant="light"
                    @click="() => (includedMembers = [])"
                    :disabled="includedMembers.length == 0"
                  >
                    <IBiSlash />
                    {{ $t("keine-auswaehlen") }}
                  </BButton>
                </BButtonGroup>
                <BFormCheckboxGroup
                  v-model="includedMembers"
                  :style="{ columnCount: $store.state.isMobile ? 1 : 2 }"
                  stacked
                  :options="
                    teamMembers.map((m) => ({
                      text: m.name,
                      value: m.id,
                    }))
                  "
                />
              </BFormGroup>
            </BPlaceholderWrapper>
          </BCol>
          <BCol>
            <BAlert
              variant="warning"
              :show="
                choreo &&
                includeMemberNames &&
                includedMembers.length >= teamMembers.length
              "
            >
              {{ $t("pdf.alle-namen-warnung") }}
            </BAlert>
          </BCol>
        </BRow>
      </BCardBody>
      <template #footer>
        <div v-if="loading" class="text-center">
          <BSpinner />
          <p>{{ slogan || $t("pdf.choreo-wird-geladen") }}</p>
        </div>
        <div class="d-grid" v-else>
          <BButton
            @click="generatePdf"
            variant="success"
            :disabled="includedMembers.length == 0"
          >
            <IBiFilePdf />
            {{ $t("pdf.pdf-generieren") }}
          </BButton>
        </div>
      </template>
    </BCard>

    <LoadingModal
      ref="loadingModal"
      :description="$t('pdf.pdf-wird-generiert')"
    />
  </BContainer>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import CountSheet from "@/components/CountSheet.vue";
import LoadingModal from "@/components/modals/LoadingModal.vue";
import AuthService from "@/services/AuthService";
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import VueHtml2pdf from "vue3-html2pdf";

/**
 * @vue-data {Object|null} user=null - The currently logged-in user.
 * @vue-data {String|null} choreoId - The ID of the choreo to load.
 * @vue.data {Object|null} choreo=null - The loaded choreo object.
 * @vue-data {Array} teamMembers - The list of team members for the choreo.
 * @vue-data {Array} hitSplits - The splits of the counts for the choreo.
 * @vue-data {Number} sloganIndex=0 - The index of the current slogan.
 * @vue-data {Interval|null} sloganInterval=null - Interval for changing slogans.
 * @vue-data {Boolean} includeDate=true - Whether to include the date on the PDF.
 * @vue-data {Boolean} includeTeamName=true - Whether to include the team name on the PDF.
 * @vue-data {Boolean} includeChoreoName=true - Whether to include the choreo name on the PDF.
 * @vue-data {Boolean} includeMemberNames=false - Whether to include member names on the PDF.
 * @vue-data {Array} includedMembers - The IDs of members to include in the PDF.
 * @vue-data {Boolean} includeLogo=true - Whether to include the club logo on the PDF.
 * @vue-data {Boolean} loading=true - Whether the PDF is currently loading.
 * @vue-data {String} date - The date to include on the PDF, formatted as YYYY-MM-DD.
 * @vue-data {Blob|null} currentClubLogoBlob=null - The blob URL of the current club's logo.
 *
 * @vue-computed {Object|null} currentClub - The current club of the user, based on the store's club ID.
 * @vue-computed {string[]} slogans - An array of slogans to display while loading the PDF.
 * @vue-computed {string} slogan - The current slogan to display, based on the slogan index.
 * @vue-computed {Boolean} dateIsValid - Whether the selected date is valid.
 * @vue-computed {String|null} dateStateFeedback - Feedback message for the date input.
 * @vue-computed {Boolean} includedMembersIsValid - Whether at least one member is included in the PDF.
 * @vue-computed {String|null} includedMembersStateFeedback - Feedback message for the included members input.
 *
 * @vue-computed {MetaInfo} metaInfo
 */

export default {
  name: "PdfView",
  components: { CountSheet, VueHtml2pdf, LoadingModal },
  setup() {
    const { t } = useI18n();
    return { t };
  },
  data: () => ({
    user: null,
    choreoId: null,
    choreo: null,
    teamMembers: [],
    hitSplits: [],
    sloganIndex: 0,
    sloganInterval: null,
    includeDate: true,
    includeTeamName: true,
    includeChoreoName: true,
    includeMemberNames: false,
    includedMembers: [],
    includeLogo: true,
    loading: true,
    date: new Date().toISOString().split("T")[0],
    currentClubLogoBlob: null,
    countSheetRefs: {},
    countSheetInfoRefs: {},
  }),
  methods: {
    setCountSheetRef(el, startIndex) {
      if (el) {
        this.countSheetRefs[startIndex] = el;
      }
    },
    setCountSheetInfoRef(el, startIndex) {
      if (el) {
        this.countSheetInfoRefs[startIndex] = el;
      }
    },
    loadChoreo() {
      ChoreoService.getById(this.choreoId).then((choreo) => {
        this.choreo = choreo;
        this.teamMembers = choreo.Participants.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.includedMembers = choreo.Participants.map((m) => m.id);
        this.calculateHitSplits().then(() => {
          if (this.sloganInterval) clearInterval(this.sloganInterval);
          this.loading = false;
        });
      });
    },
    loadUserInfo() {
      return AuthService.getUserInfo().then((user) => {
        this.user = user;
        this.includeLogo = Boolean(this.currentClub?.logoExtension);
        this.loadClubLogo();
      });
    },
    generatePdf() {
      this.sloganIndex = Math.floor(Math.random() * this.slogans.length);

      this.$refs.loadingModal.open();

      setTimeout(() => {
        this.calculateHitSplits().then(() => {
          this.$refs.loadingModal.close();
          clearInterval(this.sloganInterval);
          this.$refs.html2pdf.generatePdf();
        });
      }, 500);
    },
    async calculateHitSplits() {
      let startIndex = 0;
      let nItems = 8;

      let confirmedHitSplits = [];

      while (startIndex + nItems <= this.choreo.counts) {
        this.hitSplits = [
          ...confirmedHitSplits,
          {
            startIndex,
            nItems,
          },
        ];

        const [height, infoHeight] = await new Promise((resolve, reject) => {
          this.$nextTick(() => {
            // Give slot content time to render and populate refs
            setTimeout(() => {
              const countSheetSplit = this.countSheetRefs[startIndex];
              const countSheetSplitInfo = this.countSheetInfoRefs[startIndex];

              if (!countSheetSplit || !countSheetSplitInfo) {
                console.error("Refs not found for startIndex:", startIndex, {
                  countSheetSplit,
                  countSheetSplitInfo,
                  availableCountSheetRefs: Object.keys(this.countSheetRefs),
                  availableInfoRefs: Object.keys(this.countSheetInfoRefs),
                });
                return reject(
                  new Error(
                    `Required refs not found for startIndex ${startIndex}. PDF generation cannot continue.`
                  )
                );
              }

              resolve([
                countSheetSplit.$el.clientHeight,
                countSheetSplitInfo.$el.clientHeight,
              ]);
            }, 200);
          });
        });

        const maxHeight = 950 - infoHeight;

        if (height < maxHeight) {
          nItems += 8;
        } else {
          confirmedHitSplits.push({ startIndex, nItems: nItems - 8 });

          startIndex = startIndex + nItems - 8;
          nItems = 8;
        }
      }

      const lastElement = this.hitSplits.sort(
        (a, b) => b.startIndex - a.startIndex
      )[0];
      lastElement.nItems = this.choreo.counts - lastElement.startIndex;

      this.hitSplits = this.hitSplits.sort(
        (a, b) => a.startIndex - b.startIndex
      );
    },
    loadClubLogo() {
      if (this.currentClub?.logoExtension == null)
        this.currentClubLogoBlob = null;
      else
        ClubService.getClubLogo(
          this.currentClub.id,
          this.currentClub.logoExtension
        ).then((response) => {
          this.currentClubLogoBlob = URL.createObjectURL(response.data);
        });
    },
  },
  mounted() {
    useHead({
      title: computed(
        () =>
          `${this.choreo?.name || this.t("pdf.laedt-choreo")} - ${this.t(
            "pdf.PDF"
          )}`
      ),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: computed(() => this.t("meta.pdfView.description")),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: computed(() => this.t("meta.pdfView.description")),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: computed(() => this.t("meta.pdfView.description")),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: computed(
            () =>
              `${
                this.choreo?.name || this.t("pdf.laedt-choreo")
              } - ${this.t("pdf.PDF")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: computed(
            () =>
              `${
                this.choreo?.name || this.t("pdf.laedt-choreo")
              } - ${this.t("pdf.PDF")} - ${this.t(
                "general.ChoreoPlaner"
              )} | ${this.t("meta.defaults.title")}`
          ),
        },
      ],
    });
    this.loadUserInfo();
    this.choreoId = this.$route.params.choreoId;
    this.loadChoreo();
    this.sloganInterval = setInterval(() => {
      this.sloganIndex = Math.floor(Math.random() * this.slogans.length);
    }, 3000);
  },
  computed: {
    currentClub() {
      return this.user?.Clubs.find((c) => c.id == this.$store.state.clubId);
    },
    slogans() {
      return [
        this.$t("loading-slogans.schuhe-werden-gebunden"),
        this.$t("loading-slogans.haare-werden-geflochten"),
        this.$t("loading-slogans.schleifen-werden-gerichtet"),
        this.$t("loading-slogans.maskottchen-wird-hingelegt"),
        this.$t("loading-slogans.1-3-5-7"),
        this.$t("loading-slogans.dehnen"),
        this.$t("loading-slogans.uniformen-werden-sortiert"),
        this.$t("loading-slogans.tabelle-wird-gemalt"),
        this.$t("loading-slogans.eintraege-werden-geschrieben"),
        this.$t("loading-slogans.schminke-wird-aufgetragen"),
        this.$t("loading-slogans.zopf-wird-gebunden"),
      ];
    },
    slogan() {
      return this.slogans[this.sloganIndex];
    },
    dateIsValid() {
      return (
        !this.includeDate ||
        (Boolean(this.date) && Boolean(new Date(this.date)))
      );
    },
    dateStateFeedback() {
      if (!this.includeDate) return null;
      if (Boolean(this.date) && Boolean(new Date(this.date)))
        return this.$t("erforderlich");
      return null;
    },
    includedMembersIsValid() {
      return this.includedMembers.length > 0;
    },
    includedMembersStateFeedback() {
      if (this.includedMembers.length <= 0)
        return this.$t("pdf.min-teilnehmer-erforderlich");
      return null;
    },
  },
};
</script>
