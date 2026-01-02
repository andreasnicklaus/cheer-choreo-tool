<template>
  <div
    class="py-3 px-4"
    :style="{
      position: 'fixed',
      bottom: 0,
      backgroundColor: '#fff',
      borderRadius: '20px 20px 0 0 ',
      boxShadow: '0px 0px 25px #aaa',
      zIndex: 2,
    }"
    v-show="showConsentWindow"
  >
    <p>
      🍪
      <i18n path="consent.info-text">
        <router-link
          :to="{
            name: 'Datenschutz',
            params: { locale: $root.$i18n.locale },
          }"
          >{{ $t("datenschutz.datenschutzerklaerung") }}</router-link
        >
      </i18n>
    </p>
    <b-row align-v="center">
      <b-col>
        <b-button
          variant="success"
          @click="consent"
          block
          :style="{ color: 'white' }"
        >
          {{ $t("consent.einwilligen") }}
        </b-button>
      </b-col>
      <b-col cols="12" md="auto" class="text-center">
        <b-button variant="link" @click="closeWithoutConsent">
          {{ $t("consent.ablehnen") }}
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
const cookieName = "mtm_consent";
const dismissCookieName = "consent-dismissed";

/**
 * @module Component:ConsentWindow
 *
 * @vue-data {Boolean} showConsentWindow=false - Whether the consent window is visible.
 *
 * @example <ConsentWindow />
 */
export default {
  name: "ConsentWindow",
  data: () => ({
    showConsentWindow: false,
  }),
  mounted() {
    const consent = this.$cookie.get(cookieName);
    if (!consent) {
      const dismissed = this.$cookie.get(dismissCookieName);
      if (!dismissed) this.showConsentWindow = true;
    } else {
      window._paq.push(["rememberConsentGiven"]);
    }
  },
  methods: {
    consent() {
      this.showConsentWindow = false;
      window._paq.push(["rememberConsentGiven"]);
    },
    closeWithoutConsent() {
      this.showConsentWindow = false;
      this.$cookie.set(dismissCookieName, true, { expires: 1 });
    },
  },
};
</script>
