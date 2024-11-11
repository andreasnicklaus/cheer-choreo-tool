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
      🍪 Diese Website verwendet Matomo, um den Datenverkehr zu analysieren und
      uns dabei zu helfen, Ihr Nutzererlebnis zu verbessern. Wir verarbeiten
      Ihre IP-Adresse sowie Browser- und Geräteinformationen, und Cookies werden
      in Ihrem Browser gespeichert. Diese Daten werden nur von uns und unserer
      Webhosting-Plattform verarbeitet.
    </p>
    <b-row align-v="center">
      <b-col>
        <b-button
          variant="success"
          @click="consent"
          block
          :style="{ color: 'white' }"
        >
          Einwilligen
        </b-button>
      </b-col>
      <b-col cols="12" md="auto" class="text-center">
        <b-button variant="link" @click="closeWithoutConsent">
          Ablehnen
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
const cookieName = "mtm_consent";

export default {
  name: "ConsentWindow",
  data: () => ({
    showConsentWindow: false,
  }),
  mounted() {
    const consent = this.$cookie.get(cookieName);
    if (!consent) this.showConsentWindow = true;
    else {
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
    },
  },
};
</script>
