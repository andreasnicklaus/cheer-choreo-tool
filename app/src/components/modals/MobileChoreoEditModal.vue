<template>
  <BModal
    ref="modal"
    :id="`mobile-choreoEdit-modal-${id}`"
    centered
    no-close-on-backdrop
    no-close-on-esc
    no-header-close
    @close="(event) => event.preventDefault()"
    :title="$t('modals.mobile-choreo-edit.am-handy-nicht-moeglich')"
  >
    <p class="text-muted">
      {{ $t("modals.mobile-choreo-edit.info-1") }}
    </p>
    <p class="text-muted">
      {{ $t("modals.mobile-choreo-edit.info-2") }}
    </p>
    <BRow :style="{ gap: '10px' }">
      <BCol>
        <BButton
          :to="{
            name: 'PDF',
            params: { choreoId, locale: $i18n.locale },
          }"
          variant="success"
        >
          <IBiFilePdf class="me-2" />
          {{ $t("Home.countsheet-als-pdf") }}
        </BButton>
      </BCol>
      <BCol>
        <BButton
          :to="{
            name: 'Video',
            params: { choreoId, locale: $i18n.locale },
          }"
          variant="success"
        >
          <IBiFilm class="me-2" />
          {{ $t("editView.video-exportieren") }}
        </BButton>
      </BCol>
    </BRow>
    <template #footer="{ cancel }">
      <BButton
        @click="cancel"
        :to="{ name: 'Start', params: { locale: $i18n.locale } }"
        variant="outline-secondary"
      >
        {{ $t("zur-startseite") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
/**
 * @module Modal:MobileChoreoEditModal
 *
 * @vue-data {String} id
 *
 * @vue-prop {String} choreoId
 *
 * @vue-event {string} open
 * @vue-event {string} close
 *
 * @example
 * <template>
 *   <MobileChoreoEditModal ref="mobileChoreoEditModal" choreoId="123" @open="handler" @close="handler" />
 *   <Button @click="() => $refs.mobileChoreoEditModal.open()" />
 * </template>
 */
export default {
  name: "MobileChoreoEditModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    choreoId: {
      type: String,
      required: true,
    },
  },
  methods: {
    open() {
      this.$refs.modal.show();
    },
    close() {
      this.$refs.modal.hide();
    },
  },
};
</script>
