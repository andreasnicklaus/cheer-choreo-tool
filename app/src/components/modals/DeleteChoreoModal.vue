<template>
  <b-modal
    :id="`deleteModal-${id}`"
    centered
    @ok="removeChoreo"
    :title="$t('bist-du-sicher')"
  >
    {{ $t("du-kannst-das-nicht-rueckgaengig-machen") }}
    <template #modal-footer="{ ok, cancel }">
      <b-button @click="ok" variant="danger">{{ $t("loeschen") }}</b-button>
      <b-button @click="cancel" variant="outline-secondary">
        {{ $t("abbrechen") }}
      </b-button>
    </template>
  </b-modal>
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
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
  }),
  props: {
    choreoId: {
      type: String,
    },
  },
  methods: {
    open() {
      this.$bvModal.show(`deleteModal-${this.id}`);
    },
    removeChoreo() {
      ChoreoService.remove(this.choreoId).then(() => {
        this.$router
          .push({
            name: "Start",
            params: { locale: this.$root.$i18n.locale },
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
