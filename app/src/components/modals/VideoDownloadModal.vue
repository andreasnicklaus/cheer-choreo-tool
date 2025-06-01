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
