<template>
  <div>
    <b-card class="mb-3" :title="$t('video-export-comp.video-zusammenstellen')">
      <b-card-sub-title v-if="choreo">
        <p class="m-0">
          {{ $t("video-export-comp.ausgewaehlte-choreo") }}: {{ choreo.name }}
        </p>
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
        <b-row class="mb-3" :style="{ rowGap: '16px' }">
          <b-col md="6" cols="12">
            <b-form-group
              :description="$t('video-export-comp.den-count-im-video-anzeigen')"
            >
              <b-form-checkbox
                v-model="includeCount"
                :disabled="recordingIsRunning"
              >
                {{ $t("video-export-comp.count-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :description="
                $t('video-export-comp.den-namen-deines-teams-im-video-anzeigen')
              "
            >
              <b-form-checkbox
                v-model="includeTeamName"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.team-name-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :description="
                $t(
                  'video-export-comp.den-namen-deiner-choreo-im-video-anzeigen'
                )
              "
            >
              <b-form-checkbox
                v-model="includeChoreoName"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.choreo-name-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-form-group
              :disabled="!currentClub?.logoExtension"
              :description="
                $t(
                  'video-export-comp.dein-vereinslogo-als-wasserzeichen-im-video-anzeigen'
                )
              "
            >
              <b-form-checkbox
                v-model="includeClubLogo"
                :disabled="recordingIsRunning"
              >
                {{ $t("pdf.vereinslogo-anzeigen") }}
              </b-form-checkbox>
            </b-form-group>
            <b-avatar
              size="60px"
              :src="currentClubLogoBlob"
              v-if="currentClub?.logoExtension"
              :disabled="!includeClubLogo"
            >
              <b-icon-house-fill v-if="!currentClubLogoBlob" font-scale="1.5" />
            </b-avatar>
          </b-col>
          <b-col md="6" cols="12" class="mb-3">
            <b-skeleton-wrapper :loading="!choreo || !choreo.Participants">
              <template #loading>
                <b-skeleton v-for="(_, i) in Array(3)" :key="i"></b-skeleton>
              </template>
              <b-form-group
                :description="
                  $t(
                    'video-export-comp.teilnehmer-die-im-video-angezeigt-werden-sollen'
                  )
                "
                :state="includedMembers.length > 0"
                :invalid-feedback="$t('pdf.min-teilnehmer-erforderlich')"
              >
                <b-button-group class="mb-2">
                  <b-button
                    variant="light"
                    @click="
                      () => (includedMembers = teamMembers.map((m) => m.id))
                    "
                    :disabled="
                      recordingIsRunning ||
                      includedMembers.length == teamMembers.length
                    "
                  >
                    <b-icon-check-all />
                    {{ $t("alle-auswaehlen") }}
                  </b-button>
                  <b-button
                    variant="light"
                    @click="() => (includedMembers = [])"
                    :disabled="
                      recordingIsRunning || includedMembers.length == 0
                    "
                  >
                    <b-icon-slash />
                    {{ $t("keine-auswaehlen") }}
                  </b-button>
                </b-button-group>
                <b-checkbox-group
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
              </b-form-group>
            </b-skeleton-wrapper>
          </b-col>
          <b-col cols="auto">
            <b-button-group>
              <b-button
                @click="startPreview"
                variant="outline-success"
                :disabled="animationIsRunning || recordingIsRunning || !choreo"
              >
                <b-icon-play />
              </b-button>
              <b-button
                @click="pausePreview"
                variant="outline-danger"
                :disabled="!animationIsRunning || recordingIsRunning || !choreo"
              >
                <b-icon-pause />
              </b-button>
              <b-button
                @click="resetPreview"
                variant="outline-secondary"
                :disabled="recordingIsRunning || !choreo || count == 0"
              >
                <b-icon-skip-start-fill />
              </b-button>
            </b-button-group>
          </b-col>
          <b-col>
            <b-button
              variant="success"
              block
              @click="startRecording"
              :disabled="
                !choreo || recordingIsRunning || includedMembers.length == 0
              "
            >
              <b-icon-film class="mr-2" />
              {{ $t("video-export-comp.video-generieren") }}
            </b-button>
          </b-col>
          <b-col md="auto" cols="12" v-if="downloadUrl">
            <b-button
              variant="outline-success"
              @click="() => $refs.videoDownloadModal.open()"
              block
            >
              <b-icon-download />
              {{ $t("video-export-comp.herunterladen") }}
            </b-button>
          </b-col>
        </b-row>

        <b-skeleton-wrapper :loading="!choreo">
          <template #loading>
            <b-skeleton
              :width="width + 'px'"
              :height="height + 'px'"
              class="m-auto"
            />
          </template>
          <b-overlay :show="recordingIsRunning" class="text-center">
            <canvas
              id="videoCanvas"
              ref="videoCanvas"
              :width="width"
              :height="height"
              :style="{ width: '75%' }"
            ></canvas>
            <template #overlay>
              <div class="text-center" :style="{ minWidth: '70vw' }">
                <b-spinner />
                <p>{{ waitingSlogan || "Dein Video wird generiert!" }}</p>
                <b-progress
                  :value="count"
                  :max="choreo?.counts"
                  height="2rem"
                  class="mb-3"
                />
                <b-button variant="outline-danger" @click="stopRecording">
                  {{ $t("abbrechen") }}
                </b-button>
              </div>
            </template>
          </b-overlay>
        </b-skeleton-wrapper>
      </b-card-body>
    </b-card>

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
import ChoreoService from "@/services/ChoreoService";
import gsap from "gsap";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import VideoDownloadModal from "./modals/VideoDownloadModal.vue";
import AuthService from "@/services/AuthService";
import MessagingService from "@/services/MessagingService";
import ClubService from "@/services/ClubService";
import { debug, error } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

/**
 * @module Component:VideoExport
 *
 * @vue-data {Number} width=1800 - The width of the video canvas.
 * @vue-data {String|null} downloadUrl=null - The URL for the downloaded video.
 * @vue-data {MediaRecorder|null} mediaRecorder=null - The MediaRecorder instance for recording the video.
 * @vue-data {Array} recordingChunks - The chunks of video data recorded.
 * @vue-data {Number|null} count=null - The current count in the video, used for choreography timing.
 * @vue-data {gsap.timeline|null} animationTimeline=null - The GSAP timeline for controlling the animation of the video.
 * @vue-data {Number} bps=2.51 - Beats per second for the choreography.
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
    bps: 2.51,
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
      this.mediaRecorder.stop();
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

      const stream = this.$refs.videoCanvas.captureStream(1000);
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm",
      });
      this.mediaRecorder.ondataavailable = (event) => {
        this.recordingChunks.push(event.data);
      };
      this.mediaRecorder.onstop = () => {
        this.mp4Url = null;
        this.downloadUrl = null;
        this.downloadUrl = URL.createObjectURL(
          new Blob(this.recordingChunks, { type: "video/webm" })
        );
        this.$bvModal.show("video-download-modal");
      };
    },
    initializeFfmpeg() {
      const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";
      this.ffmpeg.on("log", ({ message }) => {
        debug(message);
      });
      this.ffmpeg.on("progress", ({ progress, time }) => {
        debug({ progress, time });
      });

      return Promise.all([
        toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      ]).then(([coreURL, wasmURL]) => {
        this.ffmpeg.load({
          coreURL,
          wasmURL,
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
  },
  mounted() {
    Promise.all([this.loadUserInfo(), this.loadChoreo()]).then(
      this.drawCanvas()
    );
    this.ffmpeg = new FFmpeg();
    this.initializeFfmpeg();
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
  metaInfo() {
    return {
      title:
        (this.choreo?.name || this.$t("pdf.laedt-choreo")) +
        " - " +
        this.$t("video"),
      meta: [
        {
          vmid: "description",
          name: "description",
          content: this.$t("meta.video.description"),
        },
        {
          vmid: "twitter:description",
          name: "twitter:description",
          content: this.$t("meta.video.description"),
        },
        {
          vmid: "og:description",
          property: "og:description",
          content: this.$t("meta.video.description"),
        },
        {
          vmid: "og:title",
          property: "og:title",
          content: `${
            this.choreo?.name || this.$t("pdf.laedt-choreo")
          } - ${this.$t("video")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
        {
          vmid: "twitter:title",
          name: "twitter:title",
          content: `${
            this.choreo?.name || this.$t("pdf.laedt-choreo")
          } - ${this.$t("video")} - ${this.$t(
            "general.ChoreoPlaner"
          )} | ${this.$t("meta.defaults.title")}`,
        },
      ],
    };
  },
};
</script>
