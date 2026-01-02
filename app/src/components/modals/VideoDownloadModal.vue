<template>
  <b-modal
    hide-footer
    :id="`video-download-modal-${id}`"
    :title="$t('modals.video-download.video-herunterladen')"
    size="xl"
  >
    <b-row align-v="end">
      <b-col>
        <video
          :width="width"
          controls
          ref="outputVideo"
          :src="downloadUrl"
          :style="{ width: '100%', minWidth: '100px', aspectRatio: '1/1' }"
        ></video>
      </b-col>
      <b-col>
        <b-collapse id="collapse-technical-issues" class="mb-2">
          <b-card
            title="Probleme?"
            sub-title="Klicke auf die beste Beschreibung deines Problems"
          >
            <b-button v-b-toggle.collapse-stocking-video>
              {{ $t("modals.video-download.stocking-video") }}
            </b-button>
            <b-button v-b-toggle.collapse-video-format>
              {{ $t("modals.video-download.video-file-issues") }}
            </b-button>
            <b-col>
              <b-button v-b-toggle.collapse-other>{{
                $t("modals.video-download.other-issue")
              }}</b-button>
            </b-col>

            <b-collapse
              id="collapse-stocking-video"
              accordion="technical-issues-accordion"
            >
              <b-card-text>
                <b>{{ $t("modals.video-download.jerky-video") }}</b>
                {{ $t("modals.video-download.jerky-video-answer") }}
              </b-card-text>
            </b-collapse>
            <b-collapse
              id="collapse-video-format"
              accordion="technical-issues-accordion"
            >
              <b-card-text>
                <b>{{ $t("modals.video-download.file-issues") }}</b>
                {{ $t("modals.video-download.file-issues-answer") }}
              </b-card-text>
            </b-collapse>
            <b-collapse
              id="collapse-other"
              accordion="technical-issues-accordion"
            >
              <b-card-text>
                <b>{{ $t("modals.video-download.other-issue-question") }}</b>
                {{ $t("modals.video-download.other-issue-answer") }}
              </b-card-text>
              <b-card-text>
                <router-link
                  :to="{ name: 'Help', params: { locale: $root.$i18n.locale } }"
                >
                  {{ $t("general.help") }}
                </router-link>
              </b-card-text>
            </b-collapse>
          </b-card>
        </b-collapse>
        <b-row class="mb-1" no-gutters>
          <b-col>
            <b-button
              ref="downloadButton"
              split
              block
              variant="success"
              :href="downloadUrl"
              :download="
                (choreo ? `${choreo.name}` : 'video') +
                selectedDownloadOption.ext
              "
            >
              <b-icon-download />
              {{ $t("download") }} {{ selectedDownloadOption.name }}
            </b-button>
          </b-col>
          <b-col cols="auto">
            <b-dropdown variant="light">
              <template #button-content>
                <b-icon-film />
                {{
                  selectedDownloadOption.name ||
                  this.$t("modals.video-download.format")
                }}
              </template>
              <b-dropdown-item
                v-for="option in downloadOptions"
                :key="option.id"
                @click="() => selectDownloadOption(option.id)"
              >
                {{ option.name }}
                <span class="text-muted">{{ option.ext }}</span>
              </b-dropdown-item>
            </b-dropdown>
          </b-col>
          <b-col cols="auto">
            <b-button
              v-b-toggle.collapse-technical-issues
              variant="light"
              v-b-tooltip.hover
              :title="$t('general.help')"
            >
              <b-icon-question-circle />
            </b-button>
          </b-col>
        </b-row>
      </b-col>
    </b-row>
  </b-modal>
</template>

<script>
/**
 * @module Modal:VideoDownloadModal
 *
 * @vue-data {String} id
 * @vue-data {String} selectedDownloadOptionId="mp4"
 *
 * @vue-prop {Object} choreo
 * @vue-prop {Number} [width=500]
 * @vue-prop {String} downloadUrl
 * @vue-prop {Array} downloadOptions
 *
 * @vue-computed {Object} selectedDownloadOption
 *
 * @vue-event {String} downloadOptionChanged
 *
 * @example
 * <template>
 *   <VideoDownloadModal ref="videoDownloadModal" :choreo="choreoObj" :width="800" :downloadUrl="url" :downloadOptions="options" @downloadOptionChanged="handler" />
 *   <Button @click="() => $refs.videoDownloadModal.open()" />
 * </template>
 * @example <VideoDownloadModal :choreo="choreoObj" :width="800" :downloadUrl="url" :downloadOptions="options" @downloadOptionChanged="handler" />
 * @example <VideoDownloadModal :downloadUrl="url" :downloadOptions="options" @downloadOptionChanged="handler" />
 */
export default {
  name: "VideoDownloadModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    selectedDownloadOptionId: "mp4",
  }),
  props: {
    choreo: {
      type: Object,
    },
    width: {
      type: Number,
      default: 500,
    },
    downloadUrl: {
      type: String,
    },
    downloadOptions: {
      type: Array,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`video-download-modal-${this.id}`);
    },
    selectDownloadOption(optionId) {
      this.selectedDownloadOptionId = optionId;
      this.$emit("downloadOptionChanged", optionId);
    },
  },
  computed: {
    selectedDownloadOption() {
      return this.downloadOptions.find(
        (o) => o.id == this.selectedDownloadOptionId
      );
    },
  },
};
</script>
