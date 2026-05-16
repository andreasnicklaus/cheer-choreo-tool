<template>
  <BModal
    :id="`howToModal-${id}`"
    ref="modal"
    :title="$t('modals.howto.anleitung')"
    no-footer
    scrollable
    size="xl"
  >
    <BTabs fill>
      <BTab :title="$t('lineup', 2)">
        <BCard :title="$t('lineup', 2)" border-variant="light">
          <BCardText>
            <p>
              {{ $t("modals.howto.lineup-text-1") }}
            </p>
            <hr />
            <I18n-t keypath="modals.howto.lineup-text-2" tag="p">
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
            </I18n-t>
            <hr />
            <I18n-t keypath="modals.howto.lineup-text-3" tag="p">
              <b>{{ $t("modals.howto.aufstellungen-aufteilen") }}:</b>
              <IBiPen />
              <BButton
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiPlus />{{ $t("modals.howto.aufstellung-hinzufuegen") }}
              </BButton>
            </I18n-t>
            <hr />
            <BAlert variant="warning" show>
              {{ $t("modals.howto.ueberschneidung-warnung") }}
            </BAlert>
          </BCardText>
        </BCard>
      </BTab>
      <BTab :title="$t('countsheet', 1)">
        <BCard :title="$t('countsheet', 1)" border-variant="light">
          <BCardText>
            <p>
              {{ $t("modals.howto.countsheet-info-1") }}
            </p>
            <hr />
            <I18n-t keypath="modals.howto.countsheet-info-2" tag="p">
              <b>{{ $t("modals.howto.eintraege-hinzufuegen") }}:</b>
              <BButton
                variant="outline-success"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiPlus />{{ $t("modals.howto.eintrag-hinzufuegen") }}
              </BButton>
              <BBadge variant="light">H</BBadge>
              <BBadge variant="light">N</BBadge>
              <b>{{ $t("modals.howto.doppelklick-auf-die-zelle") }}</b>
            </I18n-t>
            <BAlert variant="info" show>
              {{ $t("modals.howto.countsheet-info-box") }}
            </BAlert>
            <hr />
            <I18n-t keypath="modals.howto.countsheet-info-3" tag="p">
              <b>{{ $t("modals.howto.eintraege-bearbeiten") }}:</b>
              <IBiPen />
              <BBadge variant="light">Ä</BBadge>
              <BButton
                variant="success"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiCheck />
              </BButton>
            </I18n-t>
          </BCardText>
        </BCard>
      </BTab>
      <BTab :title="$t('modals.howto.steuerung')">
        <BCard :title="$t('modals.howto.steuerung')" border-variant="light">
          <EditViewShortcutTutorial />
        </BCard>
      </BTab>
      <BTab :title="$t('modals.howto.video-und-countsheet-downloaden')">
        <BCard
          :title="$t('modals.howto.video-und-countsheet-downloaden')"
          border-variant="light"
        >
          <BCardText>
            <I18n-t keypath="modals.howto.download-info-1" tag="p">
              <b>{{ $t("modals.howto.countsheet-als-pdf-downloaden") }}:</b>
              <BButton
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiThreeDotsVertical />
              </BButton>
              <BButton
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiFilePdf /> {{ $t("Home.countsheet-als-pdf") }}
              </BButton>
            </I18n-t>
            <hr />
            <I18n-t keypath="modals.howto.download-info-2" tag="p">
              <b
                >{{ $t("modals.howto.aufstellungen-als-video-downloaden") }}:</b
              >
              <BButton
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiThreeDotsVertical />
              </BButton>
              <BButton
                variant="light"
                disabled
                :style="{ display: 'inline-block' }"
              >
                <IBiFilm /> {{ $t("editView.video-exportieren") }}
              </BButton>
            </I18n-t>
          </BCardText>
        </BCard>
      </BTab>
    </BTabs>
  </BModal>
</template>

<script>
import EditViewShortcutTutorial from "../EditViewShortcutTutorial.vue";

/**
 * @module Modal:HowToModal
 *
 * @vue-data {String} id
 *
 * @example
 * <template>
 *  <HowToModal ref="howToModal" />
 *  <Button @click="() => $refs.howToModal.open()" />
 * </template>
 */
export default {
  name: "HowToModal",
  components: { EditViewShortcutTutorial },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      this.$refs.modal.show();
    },
  },
};
</script>
