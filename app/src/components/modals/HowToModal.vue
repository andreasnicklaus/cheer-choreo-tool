<template>
  <b-modal
    :id="`howToModal-${id}`"
    :title="$t('modals.howto.anleitung')"
    hide-footer
    scrollable
    size="xl"
  >
    <b-tabs fill>
      <b-tab :title="$tc('lineup', 2)">
        <b-card :title="$tc('lineup', 2)" border-variant="light">
          <b-card-text>
            <p>
              {{ $t("modals.howto.lineup-text-1") }}
            </p>
            <hr />
            <i18n path="modals.howto.lineup-text-2" tag="p">
              <b>{{ $t("modals.howto.aufstellungen-anlegen") }}:</b>
              <span
                :style="{
                  height: '24px',
                  width: '24px !important',
                  backgroundColor: '#ffab0655',
                  borderRadius: '50%',
                  border: 'solid 2px #ffab06',
                  display: 'inline-block',
                }"
              />
            </i18n>
            <hr />
            <i18n path="modals.howto.lineup-text-3" tag="p">
              <b>{{ $t("modals.howto.aufstellungen-aufteilen") }}:</b>
              <b-icon-pen />
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-plus />{{ $t("modals.howto.aufstellung-hinzufuegen") }}
              </b-button>
            </i18n>
            <hr />
            <b-alert variant="warning" show>
              {{ $t("modals.howto.ueberschneidung-warnung") }}
            </b-alert>
          </b-card-text>
        </b-card>
      </b-tab>
      <b-tab :title="$tc('countsheet', 1)">
        <b-card :title="$tc('countsheet', 1)" border-variant="light">
          <b-card-text>
            <p>
              {{ $t("modals.howto.countsheet-info-1") }}
            </p>
            <hr />
            <i18n path="modals.howto.countsheet-info-2" tag="p">
              <b>{{ $t("modals.howto.eintraege-hinzufuegen") }}:</b>
              <b-button
                variant="outline-success"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-plus />{{ $t("modals.howto.eintrag-hinzufuegen") }}
              </b-button>
              <b-badge variant="light">H</b-badge>
              <b-badge variant="light">N</b-badge>
              <b>{{ $t("modals.howto.doppelklick-auf-die-zelle") }}</b>
            </i18n>
            <b-alert variant="info" show>
              {{ $t("modals.howto.countsheet-info-box") }}
            </b-alert>
            <hr />
            <i18n path="modals.howto.countsheet-info-3" tag="p">
              <b>{{ $t("modals.howto.eintraege-bearbeiten") }}:</b>
              <b-icon-pen />
              <b-badge variant="light">Ä</b-badge>
              <b-button
                variant="success"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-check />
              </b-button>
            </i18n>
          </b-card-text>
        </b-card>
      </b-tab>
      <b-tab :title="$t('modals.howto.steuerung')">
        <b-card :title="$t('modals.howto.steuerung')" border-variant="light">
          <EditViewShortcutTutorial />
        </b-card>
      </b-tab>
      <b-tab :title="$t('modals.howto.video-und-countsheet-downloaden')">
        <b-card
          :title="$t('modals.howto.video-und-countsheet-downloaden')"
          border-variant="light"
        >
          <b-card-text>
            <i18n path="modals.howto.download-info-1" tag="p">
              <b>{{ $t("modals.howto.countsheet-als-pdf-downloaden") }}:</b>
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-three-dots-vertical />
              </b-button>
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-file-pdf /> {{ $t("Home.countsheet-als-pdf") }}
              </b-button>
            </i18n>
            <hr />
            <i18n path="modals.howto.download-info-2" tag="p">
              <b
                >{{ $t("modals.howto.aufstellungen-als-video-downloaden") }}:</b
              >
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-three-dots-vertical />
              </b-button>
              <b-button
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <b-icon-film /> {{ $t("editView.video-exportieren") }}
              </b-button>
            </i18n>
          </b-card-text>
        </b-card>
      </b-tab>
    </b-tabs>
  </b-modal>
</template>

<script>
import EditViewShortcutTutorial from "../EditViewShortcutTutorial.vue";

/**
 * @module Modal:HowToModal
 * @vue-data {String} id
 */
export default {
  name: "HowToModal",
  components: { EditViewShortcutTutorial },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      this.$bvModal.show(`howToModal-${this.id}`);
    },
  },
};
</script>
