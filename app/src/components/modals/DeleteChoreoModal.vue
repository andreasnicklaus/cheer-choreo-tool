<template>
  <BModal
    :id="`deleteModal-${id}`"
    ref="modal"
    centered
    :title="$t('bist-du-sicher')"
    @ok="removeChoreo"
  >
    {{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}
    <template #footer="{ ok, cancel }">
      <BButton variant="danger" @click="ok">{{ $t("loeschen") }}</BButton>
      <BButton variant="outline-secondary" @click="cancel">
        {{ $t("abbrechen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import ChoreoService from "@/services/ChoreoService";
import ERROR_CODES from "@/utils/error_codes";
import { error } from "@/utils/logging";

/**
 * @module Modal:DeleteChoreoModal
 *
 * @vue-data {String} id
 *
 * @vue-prop {String} choreoId
 *
 * @example
 * <template>
 *  <DeleteChoreoModal ref="deleteChoreoModal" choreoId="abc" />
 *  <Button @click="() => $refs.deleteChoreoModal.open()" />
 * </template>
 */
export default {
  name: "DeleteChoreoModal",
  props: {
    choreoId: {
      type: String,
      default: "",
    },
  },
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  methods: {
    open() {
      this.$refs.modal.show();
    },
    removeChoreo() {
      ChoreoService.remove(this.choreoId).then(() => {
        this.$router
          .push({
            name: "Start",
            params: { locale: this.$i18n.locale },
          })
          .catch(() => {
            error(
              "Redundant navigation to start",
              ERROR_CODES.REDUNDANT_ROUTING
            );
          });
      });
    },
  },
};
</script>
