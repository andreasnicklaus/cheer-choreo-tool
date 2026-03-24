<template>
  <div>
    <BCard class="mb-3" :title="$t('video-export-comp.video-zusammenstellen')">
      <BCardSubtitle v-if="choreo">
        <p class="m-0">
          {{ $t("video-export-comp.ausgewaehlte-choreo") }}:
          {{ choreo.name }}
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
        <BRow class="mb-3" :style="{ rowGap: '16px' }">
          <BCol md="6" cols="12">
            <BFormGroup
              :description="$t('video-export-comp.den-count-im-video-anzeigen')"
            >
              <BFormCheckbox
                v-model="includeCount"
                :disabled="recordingIsRunning"
              >
                {{ $t("video-export-comp.count-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :description="
                $t('video-export-comp.den-namen-deines-teams-im-video-anzeigen')
              "
            >
              <BFormCheckbox
                v-model="includeTeamName"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.team-name-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :description="
                $t(
                  'video-export-comp.den-namen-deiner-choreo-im-video-anzeigen'
                )
              "
            >
              <BFormCheckbox
                v-model="includeChoreoName"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.choreo-name-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BFormGroup
              :disabled="!currentClub?.logoExtension"
              :description="
                $t(
                  'video-export-comp.dein-vereinslogo-als-wasserzeichen-im-video-anzeigen'
                )
              "
            >
              <BFormCheckbox
                v-model="includeClubLogo"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.vereinslogo-anzeigen") }}
              </BFormCheckbox>
            </BFormGroup>
            <BAvatar
              size="60px"
              :src="currentClubLogoBlob"
              v-if="currentClub?.logoExtension"
              :disabled="!includeClubLogo"
            >
              <IBiHouseFill v-if="!currentClubLogoBlob" font-scale="1.5" />
            </BAvatar>
          </BCol>
          <BCol md="6" cols="12" class="mb-3">
            <BPlaceholderWrapper :loading="!choreo || !choreo.Participants">
              <template #loading>
                <BPlaceholder
                  v-for="(_, i) in Array(3)"
                  :key="i"
                ></BPlaceholder>
              </template>
              <BFormGroup
                :description="
                  $t(
                    'video-export-comp.teilnehmer-die-im-video-angezeigt-werden-sollen'
                  )
                "
                :state="includedMembers.length > 0"
                :invalid-feedback="$t('pdf.min-teilnehmer-erforderlich')"
              >
                <BButtonGroup class="mb-2">
                  <BButton
                    variant="light"
                    @click="
                      () => (includedMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="
                      recordingIsRunning ||
                      includedMembers.length == teamMembers.length
                    "
                  >
                    <IBiCheckAll />
                    {{ $t("alle-auswaehlen") }}
                  </BButton>
                  <BButton
                    variant="light"
                    @click="() => (includedMembers = [])"
                    :disabled="
                      recordingIsRunning || includedMembers.length == 0
                    "
                  >
                    <IBiSlash />
                    {{ $t("keine-auswaehlen") }}
                  </BButton>
                </BButtonGroup>
                <BFormCheckboxGroup
                  :disabled="recordingIsRunning"
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
          <BCol cols="12">
            <BFormGroup :description="$t('video-export-comp.playback-length')">
              <BRow>
                <BCol cols="6">
                  <BInputGroup>
                    <BFormInput
                      v-model="animationMinutes"
                      type="number"
                      min="0"
                    />
                    <template #append>
                      <BInputGroupText
                        v-b-tooltip.hover="$t('video-export-comp.minutes')"
                        >Min</BInputGroupText
                      >
                    </template>
                  </BInputGroup>
                </BCol>
                <BCol cols="6">
                  <BInputGroup>
                    <BFormInput
                      v-model="animationSeconds"
                      type="number"
                      min="0"
                      max="59"
                    />
                    <template #append>
                      <BInputGroupText
                        v-b-tooltip.hover="$t('video-export-comp.seconds')"
                        >Sec</BInputGroupText
                      >
                    </template>
                  </BInputGroup>
                </BCol>
              </BRow>
            </BFormGroup>
          </BCol>
          <BCol cols="auto">
            <BButtonGroup>
              <BButton
                @click="startPreview"
                variant="outline-success"
                :disabled="animationIsRunning || recordingIsRunning || !choreo"
              >
                <IBiPlay />
              </BButton>
              <BButton
                @click="pausePreview"
                variant="outline-danger"
                :disabled="!animationIsRunning || recordingIsRunning || !choreo"
              >
                <IBiPause />
              </BButton>
              <BButton
                @click="resetPreview"
                variant="outline-secondary"
                :disabled="recordingIsRunning || !choreo || count == 0"
              >
                <IBiSkipStartFill />
              </BButton>
            </BButtonGroup>
          </BCol>
          <BCol class="d-grid">
            <BButton
              variant="success"
              @click="startRecording"
              :disabled="
                !choreo || recordingIsRunning || includedMembers.length == 0
              "
            >
              <IBiFilm class="me-2" />
              {{ $t("video-export-comp.video-generieren") }}
            </BButton>
          </BCol>
          <BCol md="auto" cols="12" v-if="downloadUrl" class="d-grid">
            <BButton
              variant="outline-success"
              @click="() => $refs.videoDownloadModal.open()"
            >
              <IBiDownload />
              {{ $t("video-export-comp.herunterladen") }}
            </BButton>
          </BCol>
        </BRow>

        <BPlaceholderWrapper :loading="!choreo">
          <template #loading>
            <BPlaceholder
              :width="width + 'px'"
              :height="height + 'px'"
              class="m-auto"
            />
          </template>
          <BOverlay :show="recordingIsRunning" class="text-center">
            <canvas
              id="videoCanvas"
              ref="videoCanvas"
              :width="width"
              :height="height"
              :style="{ width: '75%' }"
            ></canvas>
            <template #overlay>
              <div class="text-center" :style="{ minWidth: '70vw' }">
                <BSpinner />
                <p>{{ waitingSlogan || "Dein Video wird generiert!" }}</p>
                <BAlert :show="true" variant="danger">
                  {{ $t("video-export-comp.do-not-leave-this-page") }}
                </BAlert>
                <BProgress
                  :value="count"
                  :max="choreo?.counts"
                  height="2rem"
                  class="mb-3"
                />
                <BButton variant="outline-danger" @click="stopRecording">
                  {{ $t("abbrechen") }}
                </BButton>
              </div>
            </template>
          </BOverlay>
        </BPlaceholderWrapper>
      </BCardBody>
    </BCard>

    <img
      ref="clubLogo"
      :src="currentClubLogoBlob"
      alt=""
      height="200"
      :style="{ maxWidth: '200px', display: 'none' }"
    />

    <VideoDownloadModal
      ref="videoDownloadModal"
      :choreo="choreo"
      :width="width"
      :downloadUrl="downloadUrl"
      :downloadOptions="downloadOptions"
      @downloadOptionChanged="selectDownloadOption"
    />
  </div>
</template>

<script>
import { useHead } from "@unhead/vue";
import { computed, getCurrentInstance } from "vue";
import ChoreoService from "@/services/ChoreoService";
import gsap from "gsap";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import VideoDownloadModal from "./modals/VideoDownloadModal.vue";
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import ClubService from "@/services/ClubService";
import { debug, error, warn } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import { roundToDecimals } from "@/utils/numbers";

/**
 * @module Component:VideoExport
 *
 * @vue-data {Number} width=1800 - The width of the video canvas.
 * @vue-data {String|null} downloadUrl=null - The URL for the downloaded video.
 * @vue-data {MediaRecorder|null} mediaRecorder=null - The MediaRecorder instance for recording the video.
 * @vue-data {Array} recordingChunks - The chunks of video data recorded.
 * @vue-data {Number|null} count=null - The current count in the video, used for choreography timing.
 * @vue-data {gsap.timeline|null} animationTimeline=null - The GSAP timeline for controlling the animation of the video.
 * @vue-data {Number} bps=2.5 - Beats per second for the choreography.
 * @vue-data {Object|null} user=null - The authenticated user object.
 * @vue-data {Object|null} choreo=null - The choreography object being exported.
 * @vue-data {Array} teamMembers - The members of the team participating in the choreography.
 * @vue-data {Boolean} animationIsRunning=false - Whether the animation is currently running.
 * @vue-data {Boolean} recordingIsRunning=false - Whether the recording is currently running.
 * @vue-data {Boolean} includeCount=true - Whether to include the count in the video.
 * @vue-data {Boolean} includeTeamName=true - Whether to include the team name in the video.
 * @vue-data {Boolean} includeChoreoName=true - Whether to include the choreography name in the video.
 * @vue-data {Array} includedMembers - The names of team members to include in the video.
 * @vue-data {Boolean} includeClubLogo=false - Whether to include the club logo in the video.
 * @vue-data {Blob|null} currentClubLogoBlob=null - The Blob URL of the current club's logo, if available.
 * @vue-data {Array} downloadOptions=[{id: 'webm', ext: '.webm', name: 'Webm'}, {id: 'mp4', ext: '.mp4', name: 'MP4'}] - The available download options for the video.
 * @vue-data {FFmpeg|null} ffmpeg=null - The FFmpeg instance for video processing.
 * @vue-data {String|null} mp4Url=null - The URL for the MP4 version of the video, if available.
 *
 * @vue-computed {Object} currentClub - The current club of the user, based on the store state.
 * @vue-computed {String} waitingSlogan - A random slogan displayed while the video is being generated.
 * @vue-computed {Number} height - The height of the video canvas, calculated based on the width and the aspect ratio.
 *
 * @vue-computed {MetaInfo} metaInfo
 *
 * @example <VideoExport :width="800" />
 * @example <VideoExport />
 */

export default {
  name: "VideoExport",
  components: { VideoDownloadModal },
  data: () => ({
    width: 1800,
    downloadUrl: null,
    mediaRecorder: null,
    recordingChunks: [],
    count: null,
    animationTimeline: null,
    bps: 2.5,
    user: null,
    choreo: null,
    teamMembers: [],
    animationIsRunning: false,
    recordingIsRunning: false,
    includeCount: true,
    includeTeamName: true,
    includeChoreoName: true,
    includedMembers: [],
    includeClubLogo: false,
    currentClubLogoBlob: null,
    downloadOptions: [
      {
        id: "webm",
        ext: ".webm",
        name: "Webm",
      },
      {
        id: "mp4",
        ext: ".mp4",
        name: "MP4",
      },
    ],
    ffmpeg: null,
    mp4Url: null,
    animationMinutes: 0,
    animationSeconds: 0,
  }),
  methods: {
    startPreview() {
      this.animationIsRunning = true;
      this.animationTimeline.play();
    },
    pausePreview() {
      this.animationIsRunning = false;
      this.animationTimeline.pause();
    },
    resetPreview() {
      this.count = 0;
      this.animationTimeline.time(0);
    },
    startRecording() {
      this.mediaRecorder?.stop();
      this.animationTimeline.pause();

      this.count = 0;
      this.recordingIsRunning = true;
      this.animationIsRunning = true;
      this.mp4Url = null;
      this.downloadUrl = null;
      this.recordingChunks = [];

      this.mediaRecorder?.start();
      this.animationTimeline?.restart();
    },
    stopRecording() {
      this.recordingIsRunning = false;
      this.animationIsRunning = false;
      this.mediaRecorder?.stop();
      this.animationTimeline?.pause();
    },
    loadChoreo() {
      return ChoreoService.getById(this.$route.params.choreoId)
        .then((choreo) => {
          this.choreo = choreo;
          this.teamMembers = choreo.Participants.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          this.includedMembers = this.teamMembers.map((m) => m.id);
          this.addAnimationsFromChoreo();
          this.initializeRecorder();
        })
        .catch((e) => {
          error("Could not load choreo", ERROR_CODES.CHOREO_QUERY_FAILED);
          MessagingService.showError(e.response.data, this.$t("fehler"));
        });
    },
    loadUserInfo() {
      return AuthService.getUserInfo().then((user) => {
        this.user = user;
        this.includeClubLogo = Boolean(this.currentClub?.logoExtension);
        return this.loadClubLogo().then(() => user);
      });
    },
    async loadClubLogo() {
      if (this.currentClub?.logoExtension == null)
        return (this.currentClubLogoBlob = null);
      else
        return ClubService.getClubLogo(
          this.currentClub.id,
          this.currentClub.logoExtension
        ).then((response) => {
          this.currentClubLogoBlob = URL.createObjectURL(response.data);
        });
    },
    drawBackground() {
      const canvas = this.$refs.videoCanvas;
      if (!canvas) return;

      const context = canvas.getContext("2d");

      context.fillStyle = "#e5e5f7";
      context.fillRect(0, 0, canvas.width, canvas.height);

      switch (this.choreo.matType) {
        case "cheer":
          context.fillStyle = "#444cf766";
          for (let i = 0; i < 6; i++) {
            context.fillRect(
              (canvas.width / 7) * (i + 1),
              0,
              (5 / 500) * this.width,
              canvas.height
            );
          }
          break;
        default:
          break;
      }
    },
    clearCanvas() {
      const canvas = this.$refs.videoCanvas;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      this.drawBackground();
    },
    drawSinglePosition(x, y, color, text) {
      const canvas = this.$refs.videoCanvas;
      const context = canvas?.getContext("2d");
      if (!context) return;

      context.beginPath();
      context.arc(
        (x * canvas.width) / 100,
        (y * canvas.height) / 100,
        (20 / 500) * this.width,
        0,
        2 * Math.PI
      );
      context.fillStyle = color + "55";
      context.fill();

      context.lineWidth = (2 / 500) * this.width;
      context.strokeStyle = color;
      context.stroke();

      context.fillStyle = "black";
      context.textBaseline = "middle";
      context.textAlign = "center";
      context.font = (16 / 500) * this.width + "px Sans-Serif";
      context.fillText(
        text,
        (x * canvas.width) / 100,
        (y * canvas.height) / 100
      );
    },
    drawPositions(positions) {
      this.clearCanvas();
      positions.forEach((p) =>
        this.drawSinglePosition(p.x, p.y, p.color, p.text)
      );
    },
    drawCount() {
      const canvas = this.$refs.videoCanvas;
      const context = canvas?.getContext("2d");

      if (!context) return;

      context.fillStyle = "grey";
      context.textBaseline = "middle";
      context.textAlign = "right";
      context.font = (16 / 500) * this.width + "px Sans-Serif";

      const text = `${Math.floor(this.count / 8) + 1}/${
        Math.floor(this.count % 8) + 1
      }`;

      context.fillText(
        text,
        canvas.width - (20 / 500) * this.width,
        canvas.height - (20 / 500) * this.width
      );
    },
    drawTeamName() {
      const canvas = this.$refs.videoCanvas;
      const context = canvas?.getContext("2d");

      if (!context) return;

      context.fillStyle = "grey";
      context.textBaseline = "middle";
      context.textAlign = "center";
      context.font = (16 / 500) * this.width + "px Sans-Serif";

      context.fillText(
        this.choreo.SeasonTeam.Team.name,
        canvas.width / 2,
        canvas.height - (20 / 500) * this.width
      );
    },
    drawChoreoName() {
      const canvas = this.$refs.videoCanvas;
      const context = canvas?.getContext("2d");

      if (!context) return;

      context.fillStyle = "grey";
      context.textBaseline = "middle";
      context.textAlign = "left";
      context.font = (16 / 500) * this.width + "px Sans-Serif";

      context.fillText(
        this.choreo.name,
        (20 / 500) * this.width,
        canvas.height - (20 / 500) * this.width
      );
    },
    drawClubLogo() {
      const canvas = this.$refs.videoCanvas;
      const context = canvas?.getContext("2d");

      if (!context) return;

      const clubLogo = this.$refs.clubLogo;

      const imageWidthFactor = canvas.width / 2 / clubLogo.naturalWidth;
      const imageHeightFactor = canvas.height / 2 / clubLogo.naturalHeight;
      const imageFactor = Math.min(imageWidthFactor, imageHeightFactor);

      context.globalAlpha = 0.1;
      context.drawImage(
        clubLogo,
        (canvas.width - clubLogo.naturalWidth * imageFactor) / 2,
        (canvas.height - clubLogo.naturalHeight * imageFactor) / 2,
        clubLogo.naturalWidth * imageFactor,
        clubLogo.naturalHeight * imageFactor
      );
      context.globalAlpha = 1;
    },
    drawCanvas() {
      const positions = this.getPositions();
      this.drawPositions(
        positions
          .filter((p) => this.includedMembers.includes(p.MemberId))
          .map((p) => ({
            text: p.Member.abbreviation || p.Member.nickname || p.Member.name,
            color: p.Member?.ChoreoParticipation?.color,
            x: p.x,
            y: p.y,
          }))
      );
      if (this.includeCount) this.drawCount();
      if (this.includeChoreoName) this.drawChoreoName();
      if (this.includeTeamName) this.drawTeamName();
      if (this.includeClubLogo && this.currentClubLogoBlob) this.drawClubLogo();
    },
    addAnimationsFromChoreo() {
      const counts = this.choreo.counts;
      const bps = this.bps;
      const setCount = (value) => {
        this.count = value;
        if (this.count >= this.choreo.counts) this.stopRecording();
      };

      this.animationTimeline = gsap.timeline({
        paused: true,
        duration: counts / bps,
        onUpdate() {
          setCount(this.progress() * counts);
        },
      });

      setTimeout(() => {
        this.count = 0;
      }, 50);
    },
    getPositions() {
      if (!this.choreo) return [];
      return ChoreoService.getPositionsFromChoreoAndCount(
        this.choreo,
        this.count,
        this.choreo.Participants.sort((a, b) => a.name.localeCompare(b.name))
      );
    },
    initializeRecorder() {
      if (!this.$refs.videoCanvas) {
        return setTimeout(this.initializeRecorder, 50);
      }

      if (!this.$refs.videoCanvas.captureStream) {
        MessagingService.showError(
          this.$t("video-export-comp.dein-browser-unterstuetzt-kein-video"),
          this.$t("fehler")
        );
        return;
      }

      const stream = this.$refs.videoCanvas.captureStream(1000);
      try {
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp9",
        });
      } catch (e) {
        warn("VP9 not supported, falling back to VP8");
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: "video/webm; codecs=vp8",
        });
      }
      this.mediaRecorder.ondataavailable = (event) => {
        this.recordingChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        this.mp4Url = null;
        this.downloadUrl = null;
        this.downloadUrl = URL.createObjectURL(
          new Blob(this.recordingChunks, { type: "video/webm" })
        );
        this.$refs.videoDownloadModal.open();
      };
    },
    initializeFfmpeg() {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.10/dist/umd";

      return Promise.all([
        toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      ]).then(([coreURL, wasmURL]) => {
        return this.ffmpeg
          .load({
            coreURL,
            wasmURL,
          })
          .then(() => {
            this.ffmpeg.on("log", ({ message }) => {
              debug(message);
            });
            this.ffmpeg.on("progress", ({ progress, time }) => {
              debug({ progress, time });
            });
          });
      });
    },
    selectDownloadOption(optionId) {
      switch (optionId) {
        case "mp4":
          this.downloadMp4();
          break;
        case "webm":
          this.downloadUrl = URL.createObjectURL(
            new Blob(this.recordingChunks, { type: "video/webm" })
          );
          break;
      }
    },
    downloadMp4() {
      if (this.mp4Url) this.downloadUrl = this.mp4Url;
      const name = "record.webm";

      fetchFile(this.downloadUrl).then(async (vid) => {
        this.initializeFfmpeg().then(() => {
          this.ffmpeg.writeFile(name, vid).then(() => {
            this.ffmpeg.exec(["-i", name, "output.mp4"]).then(() => {
              this.ffmpeg.readFile("output.mp4").then((data) => {
                const url = URL.createObjectURL(
                  new Blob([data.buffer], { type: "video/mp4" })
                );

                this.mp4Url = url;
                this.downloadUrl = url;

                const a = document.createElement("a");
                a.href = url;
                a.download = "video.mp4";
                a.click();
              });
            });
          });
        });
      });
    },
    calculateAnimationTime() {
      const totalSeconds = roundToDecimals(this.choreo.counts / this.bps, 0);
      this.animationMinutes = Math.floor(totalSeconds / 60);
      this.animationSeconds = totalSeconds % 60;
    },
    adaptBpsFromTime() {
      const totalSeconds = roundToDecimals(
        this.animationMinutes * 60 + this.animationSeconds,
        0
      );
      if (totalSeconds > 0 && this.choreo?.counts) {
        const targetBps = roundToDecimals(this.choreo.counts / totalSeconds, 1);
        if (this.bps !== targetBps) this.bps = targetBps;
      }
    },
  },
  watch: {
    count: {
      handler() {
        this.drawCanvas();
      },
    },
    includeCount: {
      handler() {
        this.drawCanvas();
      },
    },
    includeTeamName: {
      handler() {
        this.drawCanvas();
      },
    },
    includeChoreoName: {
      handler() {
        this.drawCanvas();
      },
    },
    includedMembers: {
      handler() {
        this.drawCanvas();
      },
    },
    includeClubLogo: {
      handler() {
        this.drawCanvas();
      },
    },
    currentClubLogoBlob: {
      handler() {
        setTimeout(this.drawCanvas, 100);
      },
    },
    bps: {
      handler() {
        this.addAnimationsFromChoreo();
      },
    },
    animationSeconds: {
      handler() {
        this.adaptBpsFromTime();
      },
    },
    animationMinutes: {
      handler() {
        this.adaptBpsFromTime();
      },
    },
  },
  mounted() {
    Promise.all([this.loadUserInfo(), this.loadChoreo()]).then(() => {
      this.drawCanvas();
      this.calculateAnimationTime();
    });

    this.$nextTick(() => {
      this.ffmpeg = new FFmpeg();
      this.initializeFfmpeg();
    });

    const { proxy } = getCurrentInstance();

    useHead({
      title: computed(
        () =>
          (this.choreo?.name || proxy.$t("pdf.laedt-choreo")) +
          " - " +
          proxy.$t("video")
      ),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: computed(() => proxy.$t("meta.video.description")),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: computed(() => proxy.$t("meta.video.description")),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: computed(() => proxy.$t("meta.video.description")),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: computed(
            () =>
              `${
                this.choreo?.name || proxy.$t("pdf.laedt-choreo")
              } - ${proxy.$t("video")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: computed(
            () =>
              `${
                this.choreo?.name || proxy.$t("pdf.laedt-choreo")
              } - ${proxy.$t("video")} - ${proxy.$t(
                "general.ChoreoPlaner"
              )} | ${proxy.$t("meta.defaults.title")}`
          ),
        },
      ],
    });
  },
  computed: {
    currentClub() {
      return this.user?.Clubs.find((c) => c.id == this.$store.state.clubId);
    },
    waitingSlogan() {
      const slogans = [
        this.$t("loading-slogans.schuhe-werden-gebunden"),
        this.$t("loading-slogans.haare-werden-geflochten"),
        this.$t("loading-slogans.schleifen-werden-gerichtet"),
        this.$t("loading-slogans.maskottchen-wird-hingelegt"),
        this.$t("loading-slogans.1-3-5-7"),
        this.$t("loading-slogans.dehnen"),
        this.$t("loading-slogans.aufstellungen-werden-gemalt"),
        this.$t("loading-slogans.matte-wird-aufgezeichnet"),
        this.$t("loading-slogans.sprungboden-wird-aufgebaut"),
        this.$t("loading-slogans.schminke-wird-aufgetragen"),
        this.$t("loading-slogans.zopf-wird-gebunden"),
      ];
      if (this.choreo.SeasonTeam.Team.name)
        slogans.push(
          this.$t("loading-slogans.go-team", {
            name: this.choreo.SeasonTeam.Team.name,
          })
        );
      return slogans[Math.floor(this.count / 10) % slogans.length];
    },
    height() {
      switch (this.choreo?.matType) {
        case "1:2":
          return this.width / 2;
        case "3:4":
          return (this.width / 4) * 3;
        default:
          return this.width;
      }
    },
  },
};
</script>
