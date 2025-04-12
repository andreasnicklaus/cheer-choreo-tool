<template>
  <b-container class="text-center" data-view>
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
      <section slot="pdf-content">
        <div v-for="(split, i) in hitSplits" :key="split.startIndex">
          <b-row
            align-h="between"
            align-v="center"
            class="mb-2"
            :ref="`count-sheet-info-${split.startIndex}`"
          >
            <b-col cols="auto" v-if="includeChoreoName">
              {{ choreo?.name }}
            </b-col>
            <b-col cols="auto" v-if="includeTeamName">
              {{ choreo?.SeasonTeam.Team?.name }}
            </b-col>
            <b-col cols="auto" v-if="includeDate">
              {{ new Date(date).toLocaleDateString("de-de") }}
            </b-col>
            <b-col cols="auto" v-if="includeLogo">
              <img
                :src="currentClubLogoBlob"
                alt=""
                height="60"
                :style="{ maxWidth: '200px' }"
              />
            </b-col>
            <b-col
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
            </b-col>
          </b-row>
          <CountSheet
            :ref="`count-sheet-${split.startIndex}`"
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
    </vue-html2pdf>

    <b-card
      class="text-left mb-4"
      :title="$t('pdf.countsheet-zusammenstellen')"
    >
      <b-card-sub-title v-if="choreo">
        <p class="m-0">Ausgewählte Choreo: {{ choreo.name }}</p>
        <p class="m-0">
          {{ $tc("team", 1) }}: {{ choreo.SeasonTeam.Team.name }} ({{
            choreo.SeasonTeam.Season.name
          }})
        </p>
      </b-card-sub-title>
      <b-card-sub-title v-else :style="{ height: '38.38px' }">
        {{ $t("pdf.choreo-laedt") }}
      </b-card-sub-title>
      <b-card-body>
        <b-row :style="{ rowGap: '16px' }">
          <b-col md="6" cols="12">
            <b-form-group
              :description="$t('pdf.das-datum-auf-das-countsheet-schreiben')"
              :state="dateIsValid"
              :invalid-feedback="dateStateFeedback"
            >
              <b-form-checkbox v-model="includeDate">
                {{ $t("pdf.datum-anzeigen") }}
              </b-form-checkbox>
              <b-form-input
                type="date"
                v-model="date"
                :disabled="!includeDate"
                :state="dateIsValid"
              />
            </b-form-group>
            <b-form-group
              :description="
                $t('pdf.den-team-namen-auf-das-countsheet-schreiben')
              "
            >
              <b-form-checkbox v-model="includeTeamName">
                {{ $t("pdf.team-name-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :description="
                $t('pdf.den-choreo-namen-auf-das-countsheet-schreiben')
              "
            >
              <b-form-checkbox v-model="includeChoreoName">
                {{ $t("pdf.choreo-name-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :description="
                $t('pdf.die-namen-der-teilnehmer-auf-das-countsheet-schreiben')
              "
            >
              <b-form-checkbox v-model="includeMemberNames">
                {{ $t("pdf.teilnehmer-namen-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :disabled="!currentClub?.logoExtension"
              description="Zeige das Logo deines Vereins auf dem Countsheet an"
            >
              <b-form-checkbox v-model="includeLogo">
                Vereinslogo anzeigen
              </b-form-checkbox>
            </b-form-group>
            <b-avatar
              size="60px"
              :src="currentClubLogoBlob"
              v-if="currentClub?.logoExtension"
              :disabled="!includeLogo"
            >
              <b-icon-house-fill v-if="!currentClubLogoBlob" font-scale="1.5" />
            </b-avatar>
          </b-col>
          <b-col md="6" cols="12" class="mb-3">
            <b-skeleton-wrapper
              :loading="
                !choreo || !choreo.SeasonTeam.Team || !choreo.Participants
              "
            >
              <template #loading>
                <b-skeleton v-for="(_, i) in Array(3)" :key="i"></b-skeleton>
              </template>
              <b-form-group
                :description="$t('pdf.fuer-wen-ist-das-countsheet')"
                :state="includedMembersIsValid"
                :invalid-feedback="includedMembersStateFeedback"
              >
                <b-button-group class="mb-2">
                  <b-button
                    variant="light"
                    @click="
                      () => (includedMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="includedMembers.length == teamMembers.length"
                  >
                    <b-icon-check-all />
                    {{ $t("alle-auswaehlen") }}
                  </b-button>
                  <b-button
                    variant="light"
                    @click="() => (includedMembers = [])"
                    :disabled="includedMembers.length == 0"
                  >
                    <b-icon-slash />
                    {{ $t("keine-auswaehlen") }}
                  </b-button>
                </b-button-group>
                <b-checkbox-group
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
              </b-form-group>
            </b-skeleton-wrapper>
          </b-col>
          <b-col>
            <b-alert
              variant="warning"
              :show="
                choreo &&
                includeMemberNames &&
                includedMembers.length >= teamMembers.length
              "
            >
              {{ $t("pdf.alle-namen-warnung") }}
            </b-alert>
          </b-col>
        </b-row>
      </b-card-body>
      <template #footer>
        <div v-if="loading" class="text-center">
          <b-spinner />
          <p>{{ slogan || $t("pdf.choreo-wird-geladen") }}</p>
        </div>
        <b-button
          block
          v-else
          @click="generatePdf"
          variant="success"
          :disabled="includedMembers.length == 0"
        >
          <b-icon-file-pdf />
          {{ $t("pdf.pdf-generieren") }}
        </b-button>
      </template>
    </b-card>

    <LoadingModal
      ref="loadingModal"
      :description="$t('pdf.pdf-wird-generiert')"
    />
  </b-container>
</template>

<script>
import CountSheet from "@/components/CountSheet.vue";
import LoadingModal from "@/components/modals/LoadingModal.vue";
import AuthService from "@/services/AuthService";
import ChoreoService from "@/services/ChoreoService";
import ClubService from "@/services/ClubService";
import VueHtml2pdf from "vue-html2pdf";

export default {
  name: "PdfView",
  components: { CountSheet, VueHtml2pdf, LoadingModal },
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
  }),
  methods: {
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

        const [height, infoHeight] = await new Promise((resolve) => {
          this.$nextTick(function () {
            const countSheetSplit = this.$refs[`count-sheet-${startIndex}`][0];
            const countSheetSplitInfo =
              this.$refs[`count-sheet-info-${startIndex}`][0];
            resolve([
              countSheetSplit.$el.clientHeight,
              countSheetSplitInfo.clientHeight,
            ]);
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
  metaInfo() {
    return {
      title: `${this.choreo?.name || this.$t("pdf.laedt-choreo")} - ${this.$t(
        "pdf.PDF"
      )} - ${this.$t("general.ChoreoPlaner")} | ${this.$t(
        "meta.defaults.title"
      )}`,
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.pdfView.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.pdfView.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.pdfView.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${
            this.choreo?.name || this.$t("pdf.laedt-choreo")
          } - ${this.$t("pdf.PDF")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${
            this.choreo?.name || this.$t("pdf.laedt-choreo")
          } - ${this.$t("pdf.PDF")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>
