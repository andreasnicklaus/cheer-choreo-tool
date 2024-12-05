<template>
  <b-modal
    :id="`feedback-modal-${id}`"
    title="Sag uns deine Meinung"
    centered
    @ok="send"
  >
    <p>
      Hilf uns, besser zu werden! Gib uns ein kurzes Feedback, um deine
      Erfahrung mit dem Choreo Planer noch besser zu machen.
    </p>
    <b-row align-h="center">
      <b-col cols="auto">
        <b-button-group>
          <b-button
            v-for="(_, i) in Array(5)"
            :key="i"
            variant="light"
            @click="stars = i"
            @mouseover="mouseOver(i)"
            @mouseleave="mouseLeave"
          >
            <b-icon-star-fill
              variant="primary"
              v-if="hoverStars != null ? hoverStars >= i : stars >= i"
              :style="{ pointerEvents: 'none' }"
            />
            <b-icon-star
              v-else
              variant="primary"
              :style="{ pointerEvents: 'none' }"
            />
          </b-button>
        </b-button-group>
      </b-col>
    </b-row>
    <textarea
      name="feedback-text"
      id="feedback-text"
      rows="5"
      v-model="feedbackText"
      class="p-2 mt-3"
      placeholder="Was gefällt dir am Choreo Planer? Was nicht?"
    />
    <template #modal-footer="{ ok, cancel }">
      <b-row align-h="between" class="w-100 mr-2" no-gutters>
        <b-col cols="auto">
          <b-button
            v-show="!forced"
            @click="closeWithoutSending"
            variant="link"
            class="text-muted"
          >
            Nicht mehr fragen
          </b-button>
        </b-col>
        <b-col cols="auto">
          <b-row no-gutters :style="{ columnGap: '8px' }">
            <b-col>
              <b-button
                @click="ok"
                variant="success"
                :disabled="stars < 0 || stars > 4 || !feedbackText"
                to="#"
              >
                <b-spinner small v-if="sending" />
                <span v-else> Abschicken </span>
              </b-button>
            </b-col>
            <b-col cols="auto">
              <b-button @click="cancel" variant="outline-danger">
                Schließen
              </b-button>
            </b-col>
          </b-row>
        </b-col>
      </b-row>
    </template>

    <b-modal
      :id="`feedback-thankyou-modal-${id}`"
      title="Dankeschön!"
      centered
      @ok="close"
      @hide="close"
      header-bg-variant="success"
      header-text-variant="light"
    >
      <p>
        Vielen Dank! Wir haben dein Feedback gespeichert und werden gleich
        anfangen, an deinen Verbesserungsvorschlägen zu arbeiten.
      </p>
      <template #modal-footer="{ cancel }">
        <b-button variant="success" @click="cancel" :style="{ color: 'white' }">
          Schließen
        </b-button>
      </template>
    </b-modal>
  </b-modal>
</template>

<script>
import FeedbackService from "@/services/FeedbackService";

const feedbackDeclinedCookieName = "feedback-declined";

export default {
  name: "FeedbackPrompt",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    stars: 4,
    feedbackText: null,
    hoverStars: null,
    sending: false,
    feedbackAlreadyGiven: false,
    forced: false,
    showTimer: null,
  }),
  mounted() {
    if (!window.__PRERENDER_INJECTED) {
      this.initializeShowTimer();
      FeedbackService.getAll()
        .then((feedbacks) => {
          this.feedbackAlreadyGiven = feedbacks?.length > 0;
        })
        .catch(() => {
          this.feedbackAlreadyGiven = false;
        });
    }
  },
  methods: {
    open(force = false) {
      this.stars = 4;
      this.feedbackText = null;
      this.forced = force;
      const feedbackDeclined = Boolean(
        this.$cookie.get(feedbackDeclinedCookieName)
      );
      if (force || (!this.feedbackAlreadyGiven && !feedbackDeclined))
        this.$bvModal.show(`feedback-modal-${this.id}`);

      this.stopShowTimer();
    },
    timedOpen() {
      if (!this.isABootstrapModalOpen()) this.open();
      else this.resetShowTimer();
    },
    send(event) {
      event.preventDefault();
      this.stopShowTimer();
      FeedbackService.sendFeedback(
        parseInt(this.stars) + 1,
        this.feedbackText
      ).then(() => {
        this.$bvModal.show(`feedback-thankyou-modal-${this.id}`);
        this.feedbackAlreadyGiven = true;
      });
    },
    mouseOver(stars) {
      this.hoverStars = stars;
    },
    mouseLeave() {
      this.hoverStars = null;
    },
    closeWithoutSending() {
      this.stopShowTimer();
      this.$cookie.set(feedbackDeclinedCookieName, true, { expires: 30 });
      this.close();
    },
    close() {
      console.log("custom close");
      this.$bvModal.hide(`feedback-modal-${this.id}`);
      this.$bvModal.hide(`feedback-thankyou-modal-${this.id}`);
    },
    isABootstrapModalOpen() {
      return document.querySelectorAll(".modal.in").length > 0;
    },
    initializeShowTimer() {
      this.showTimer = setTimeout(this.timedOpen, 120_000);
    },
    resetShowTimer() {
      if (this.showTimer) {
        clearTimeout(this.showTimer);
        this.initializeShowTimer;
      }
    },
    stopShowTimer() {
      clearTimeout(this.showTimer);
    },
  },
  watch: {
    "$route.path": {
      handler() {
        this.resetShowTimer();
      },
    },
  },
};
</script>

<style lang="scss" scoped>
textarea {
  width: 100%;
  border: solid var(--lt-color-gray-300) 2px;
  border-radius: 4px;
  resize: none;
  outline: none;

  &:focus,
  &:focus-visible {
    border-color: var(--lt-color-gray-500);
  }
}
</style>
