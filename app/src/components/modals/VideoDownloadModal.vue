<template>
  <BModal
    :id="`video-download-modal-${id}`"
    ref="modal"
    no-footer
    :title="$t('modals.video-download.video-herunterladen')"
    size="xl"
  >
    <BRow align-v="end">
      <BCol>
        <video
          ref="outputVideo"
          :width="width"
          controls
          :src="downloadUrl"
          :style="{ width: '100%', minWidth: '100px', aspectRatio: '1/1' }"
        ></video>
      </BCol>
      <BCol>
        <BCollapse id="collapse-technical-issues" class="mb-2">
          <BCard
            title="Probleme?"
            subtitle="Klicke auf die beste Beschreibung deines Problems"
          >
            <BButton v-b-toggle.collapse-stocking-video>
              {{ $t("modals.video-download.stocking-video") }}
            </BButton>
            <BButton v-b-toggle.collapse-video-format>
              {{ $t("modals.video-download.video-file-issues") }}
            </BButton>
            <BCol>
              <BButton v-b-toggle.collapse-other>{{
                $t("modals.video-download.other-issue")
              }}</BButton>
            </BCol>

            <BCollapse
              id="collapse-stocking-video"
              accordion="technical-issues-accordion"
            >
              <BCardText>
                <b>{{ $t("modals.video-download.jerky-video") }}</b>
                {{ $t("modals.video-download.jerky-video-answer") }}
              </BCardText>
            </BCollapse>
            <BCollapse
              id="collapse-video-format"
              accordion="technical-issues-accordion"
            >
              <BCardText>
                <b>{{ $t("modals.video-download.file-issues") }}</b>
                {{ $t("modals.video-download.file-issues-answer") }}
              </BCardText>
            </BCollapse>
            <BCollapse
              id="collapse-other"
              accordion="technical-issues-accordion"
            >
              <BCardText>
                <b>{{ $t("modals.video-download.other-issue-question") }}</b>
                {{ $t("modals.video-download.other-issue-answer") }}
              </BCardText>
              <BCardText>
                <router-link
                  :to="{ name: 'Help', params: { locale: $i18n.locale } }"
                >
                  {{ $t("general.help") }}
                </router-link>
              </BCardText>
            </BCollapse>
          </BCard>
        </BCollapse>
        <BRow class="mb-1" no-gutters>
          <BCol class="d-grid">
            <BButton
              ref="downloadButton"
              split
              variant="success"
              :href="downloadUrl"
              :download="
                (choreo ? `${choreo.name}` : 'video') +
                selectedDownloadOption.ext
              "
            >
              <IBiDownload />
              {{ $t("download") }} {{ selectedDownloadOption.name }}
            </BButton>
          </BCol>
          <BCol cols="auto">
            <BDropdown variant="light">
              <template #button-content>
                <IBiFilm />
                {{
                  selectedDownloadOption.name ||
                  $t("modals.video-download.format")
                }}
              </template>
              <BDropdownItem
                v-for="option in downloadOptions"
                :key="option.id"
                @click="() => selectDownloadOption(option.id)"
              >
                {{ option.name }}
                <span class="text-muted">{{ option.ext }}</span>
              </BDropdownItem>
            </BDropdown>
          </BCol>
          <BCol cols="auto">
            <BButton
              v-b-toggle.collapse-technical-issues
              v-b-tooltip.hover="$t('general.help')"
              variant="light"
            >
              <IBiQuestionCircle />
            </BButton>
          </BCol>
        </BRow>
      </BCol>
    </BRow>
  </BModal>
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
  props: {
    choreo: {
      type: Object,
      default: null,
    },
    width: {
      type: Number,
      default: 500,
    },
    downloadUrl: {
      type: String,
      default: "",
    },
    downloadOptions: {
      type: Array,
      default: () => [],
    },
  },
  emits: ["downloadOptionChanged"],
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    selectedDownloadOptionId: "mp4",
  }),
  computed: {
    selectedDownloadOption() {
      return this.downloadOptions.find(
        (o) => o.id == this.selectedDownloadOptionId
      );
    },
  },
  methods: {
    open() {
      this.$refs.modal.show();
    },
    selectDownloadOption(optionId) {
      this.selectedDownloadOptionId = optionId;
      this.$emit("downloadOptionChanged", optionId);
    },
  },
};
</script>
