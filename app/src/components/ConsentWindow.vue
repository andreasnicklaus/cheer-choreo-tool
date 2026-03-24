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
      <i18n-t keypath="consent.info-text">
        <router-link
          :to="{
            name: 'Datenschutz',
            params: { locale: $i18n.locale },
          }"
          >{{ $t("datenschutz.datenschutzerklaerung") }}</router-link
        >
      </i18n-t>
    </p>
    <BRow align-v="center">
      <BCol>
        <div class="d-grid gap-2">
          <BButton
            variant="success"
            @click="consent"
            :style="{ color: 'white' }"
          >
            {{ $t("consent.einwilligen") }}
          </BButton>
        </div>
      </BCol>
      <BCol cols="12" md="auto" class="text-center">
        <BButton variant="link" @click="closeWithoutConsent">
          {{ $t("consent.ablehnen") }}
        </BButton>
      </BCol>
    </BRow>
  </div>
</template>

<script>
import Cookies from "js-cookie";

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
    if (localStorage.getItem("isTestEnvironment") !== "true") {
      const consent = Cookies.get(cookieName);
      if (!consent) {
        const dismissed = Cookies.get(dismissCookieName);
        if (!dismissed) this.showConsentWindow = true;
      } else {
        window._paq?.push(["rememberConsentGiven"]);
      }
    }
  },
  methods: {
    consent() {
      this.showConsentWindow = false;
      window._paq.push(["rememberConsentGiven"]);
    },
    closeWithoutConsent() {
      this.showConsentWindow = false;
      Cookies.set(dismissCookieName, true, { expires: 1 });
    },
  },
};
</script>
