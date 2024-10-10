<template>
  <b-container class="text-center">
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
          <h1 v-if="i == 0">{{ choreo?.name }}</h1>
          <b-row align-h="between" align-v="center" class="mb-2">
            <b-col cols="auto" v-if="i != 0 && includeChoreoName">{{
              choreo?.name
            }}</b-col>
            <b-col cols="auto" v-if="includeTeamName">{{
              choreo?.Team?.name
            }}</b-col>
            <b-col cols="auto" v-if="includeDate">
              {{ new Date(date).toLocaleDateString("de-de") }}
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
                        (allMembers ||
                          !h.Members ||
                          h.Members.length == 0 ||
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
    <b-card class="text-left mb-4" title="Countsheet zusammenstellen">
      <b-card-body>
        <b-row>
          <b-col cols="6">
            <b-form-group description="Das Datum auf das Countsheet schreiben">
              <b-form-checkbox v-model="includeDate">
                Datum anzeigen
              </b-form-checkbox>
              <b-form-input
                type="date"
                v-model="date"
                :disabled="!includeDate"
              />
            </b-form-group>
            <b-form-group
              description="Den Team-Namen auf das Countsheet schreiben"
            >
              <b-form-checkbox v-model="includeTeamName">
                Team-Name anzeigen
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              description="Den Choreo-Namen auf das Countsheet schreiben"
            >
              <b-form-checkbox v-model="includeChoreoName">
                Choreo-Name anzeigen
              </b-form-checkbox>
            </b-form-group>
          </b-col>
          <b-col cols="6" class="mb-3">
            <b-skeleton-wrapper
              :loading="!choreo || !choreo.Team || !choreo.Team.Members"
            >
              <template #loading>
                <b-skeleton v-for="(_, i) in Array(3)" :key="i"></b-skeleton>
              </template>
              <b-form-group description="Für wen ist das Countsheet?">
                <b-form-checkbox v-model="allMembers"> Alle </b-form-checkbox>
                <hr />
                <b-checkbox-group
                  :disabled="allMembers"
                  v-model="includedMembers"
                  :style="{ columnCount: 2 }"
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
        </b-row>
      </b-card-body>
      <template #footer>
        <div v-if="loading" class="text-center">
          <b-spinner />
          <p>{{ slogan || "Choreo wird geladen..." }}</p>
        </div>
        <b-button block v-else @click="generatePdf" variant="success">
          <b-icon-file-pdf />
          PDF generieren
        </b-button>
      </template>
    </b-card>
  </b-container>
</template>

<script>
import CountSheet from "@/components/CountSheet.vue";
import ChoreoService from "@/services/ChoreoService";
import VueHtml2pdf from "vue-html2pdf";

const slogans = [
  "Schuhe werden zusammengebunden...",
  "Haare werden geflochten...",
  "Schleifen werden gerichtet...",
  "Maskottchen wird hingelegt...",
  "1 - 3 - 5 - 7!",
  "Dehnen...",
  "Uniformen werden sortiert...",
  "Tabelle wird gemalt...",
  "Einträge werden geschrieben...",
  "Schminke wird aufgetragen...",
];

export default {
  name: "PdfView",
  components: { CountSheet, VueHtml2pdf },
  data: () => ({
    choreoId: null,
    choreo: null,
    teamMembers: [],
    hitSplits: [],
    sloganIndex: 0,
    sloganInterval: null,
    includeDate: true,
    includeTeamName: true,
    includeChoreoName: true,
    allMembers: true,
    includedMembers: [],
    loading: true,
    date: new Date().toISOString().split("T")[0],
  }),
  methods: {
    loadChoreo() {
      ChoreoService.getById(this.choreoId).then((choreo) => {
        this.choreo = choreo;
        this.teamMembers = choreo.Team.Members.sort((a, b) =>
          a.name.localeCompare(b.name)
        );
        this.includedMembers = choreo.Team.Members.map((m) => m.id);
        this.calculateHitSplits().then(() => {
          this.loading = false;
          //   this.generatePdf();
          if (this.sloganInterval) clearInterval(this.sloganInterval);
        });
      });
    },
    generatePdf() {
      this.$refs.html2pdf.generatePdf();
    },
    async calculateHitSplits() {
      let startIndex = 0;
      let nItems = 8;

      let confirmedHitSplits = [];

      while (startIndex + nItems < this.choreo.counts) {
        this.hitSplits = [
          ...confirmedHitSplits,
          {
            startIndex,
            nItems,
          },
        ];

        const promise = new Promise((resolve) => {
          this.$nextTick(function () {
            const countSheetSplit = this.$refs[`count-sheet-${startIndex}`][0];
            resolve(countSheetSplit.$el.clientHeight);
          });
        });

        const height = await promise;
        const maxHeight = startIndex == 0 ? 860 : 940;

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
  },
  mounted() {
    this.choreoId = this.$route.params.choreoId;
    this.loadChoreo();
    this.sloganInterval = setInterval(() => {
      this.sloganIndex = Math.floor(Math.random() * slogans.length);
    }, 3000);
  },
  computed: {
    slogan() {
      return slogans[this.sloganIndex];
    },
  },
};
</script>
