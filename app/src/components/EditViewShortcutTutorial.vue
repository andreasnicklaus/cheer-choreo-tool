<template>
  <b-table-simple>
    <b-tbody>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.naechster-count")
        }}</b-td>
        <b-td>
          <b-icon-arrow-right class="mr-1" />
          <b-badge variant="light">{{
            $t("shortcut-tutorial.pfeil-rechts")
          }}</b-badge>
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.voriger-count")
        }}</b-td>
        <b-td>
          <b-icon-arrow-left class="mr-1" />
          <b-badge variant="light">{{
            $t("shortcut-tutorial.pfeil-links")
          }}</b-badge>
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.naechster-achter")
        }}</b-td>
        <b-td>
          <b-icon-arrow-down class="mr-1" />
          <b-badge variant="light">{{
            $t("shortcut-tutorial.pfeil-unten")
          }}</b-badge>
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.voriger-achter")
        }}</b-td>
        <b-td>
          <b-icon-arrow-up class="mr-1" />
          <b-badge variant="light">{{
            $t("shortcut-tutorial.pfeil-oben")
          }}</b-badge>
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.play-pause")
        }}</b-td>
        <b-td>
          <b-badge variant="light">{{
            $t("shortcut-tutorial.leerzeichen")
          }}</b-badge>
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.neuer-eintrag")
        }}</b-td>
        <b-td>
          <b-badge variant="light"> H </b-badge> /
          <b-badge variant="light"> N </b-badge> /
          {{ $t("shortcut-tutorial.doppelklick-auf-countsheet-zelle") }}
        </b-td>
      </b-tr>
      <b-tr>
        <b-td class="font-weight-bold">{{
          $t("shortcut-tutorial.eintrag-aendern")
        }}</b-td>
        <b-td>
          <b-badge variant="light"> Ä </b-badge>
        </b-td>
      </b-tr>
    </b-tbody>
  </b-table-simple>
</template>

<script>
/**
 * @module Component:EditViewShortcutTutorial
 */
</script>
