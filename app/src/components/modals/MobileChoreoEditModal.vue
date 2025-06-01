<template>
  <b-modal
    :id="`mobile-choreoEdit-modal-${id}`"
    centered
    no-close-on-backdrop
    no-close-on-esc
    hide-header-close
    @close="(event) => event.preventDefault()"
    :title="$t('modals.mobile-choreo-edit.am-handy-nicht-moeglich')"
  >
    <p class="text-muted">
      {{ $t("modals.mobile-choreo-edit.info-1") }}
    </p>
    <p class="text-muted">
      {{ $t("modals.mobile-choreo-edit.info-2") }}
    </p>
    <b-row :style="{ gap: '10px' }">
      <b-col>
        <b-button
          :to="{
            name: 'PDF',
            params: { choreoId, locale: $root.$i18n.locale },
          }"
          variant="success"
        >
          <b-icon-file-pdf class="mr-2" />
          {{ $t("Home.countsheet-als-pdf") }}
        </b-button>
      </b-col>
      <b-col>
        <b-button
          :to="{
            name: 'Video',
            params: { choreoId, locale: $root.$i18n.locale },
          }"
          variant="success"
        >
          <b-icon-film class="mr-2" />
          {{ $t("editView.video-exportieren") }}
        </b-button>
      </b-col>
    </b-row>
    <template #modal-footer="{ cancel }">
      <b-button
        @click="cancel"
        :to="{ name: 'Start', params: { locale: $root.$i18n.locale } }"
        variant="outline-secondary"
      >
        {{ $t("zur-startseite") }}
      </b-button>
    </template>
  </b-modal>
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
      this.$bvModal.show(`mobile-choreoEdit-modal-${this.id}`);
    },
    close() {
      this.$bvModal.hide(`mobile-choreoEdit-modal-${this.id}`);
    },
  },
};
</script>
