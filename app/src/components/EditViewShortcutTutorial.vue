<template>
  <BTableSimple>
    <BTbody>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.naechster-count")
        }}</BTd>
        <BTd>
          <IBiArrowRight class="me-1" />
          <BBadge variant="light">{{
            $t("shortcut-tutorial.pfeil-rechts")
          }}</BBadge>
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.voriger-count")
        }}</BTd>
        <BTd>
          <IBiArrowLeft class="me-1" />
          <BBadge variant="light">{{
            $t("shortcut-tutorial.pfeil-links")
          }}</BBadge>
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.naechster-achter")
        }}</BTd>
        <BTd>
          <IBiArrowDown class="me-1" />
          <BBadge variant="light">{{
            $t("shortcut-tutorial.pfeil-unten")
          }}</BBadge>
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.voriger-achter")
        }}</BTd>
        <BTd>
          <IBiArrowUp class="me-1" />
          <BBadge variant="light">{{
            $t("shortcut-tutorial.pfeil-oben")
          }}</BBadge>
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.play-pause")
        }}</BTd>
        <BTd>
          <BBadge variant="light">{{
            $t("shortcut-tutorial.leerzeichen")
          }}</BBadge>
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.neuer-eintrag")
        }}</BTd>
        <BTd>
          <BBadge variant="light"> H </BBadge> /
          <BBadge variant="light"> N </BBadge> /
          {{ $t("shortcut-tutorial.doppelklick-auf-countsheet-zelle") }}
        </BTd>
      </BTr>
      <BTr>
        <BTd class="font-weight-bold">{{
          $t("shortcut-tutorial.eintrag-aendern")
        }}</BTd>
        <BTd>
          <BBadge variant="light"> Ä </BBadge>
        </BTd>
      </BTr>
    </BTbody>
  </BTableSimple>
</template>

<script>
/**
 * @module Component:EditViewShortcutTutorial
 *
 * @example <EditViewShortcutTutorial />
 */
</script>
