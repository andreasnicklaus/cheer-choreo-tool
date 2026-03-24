<template>
  <BModal
    ref="feedbackModal"
    :id="`feedback-modal-${id}`"
    :title="$t('feedback.sag-uns-deine-meinung')"
    centered
    @ok.prevent="send"
  >
    <p>
      {{ $t("feedback.hilf-uns-besser-zu-werden") }}
    </p>
    <BRow align-h="center">
      <BCol cols="auto">
        <BButtonGroup>
          <BButton
            v-for="(_, i) in Array(5)"
            :key="i"
            variant="light"
            @click="stars = i"
            @mouseover="mouseOver(i)"
            @mouseleave="mouseLeave"
          >
            <IBiStarFill
              class="text-primary"
              v-show="hoverStars != null ? hoverStars >= i : stars >= i"
              :style="{ pointerEvents: 'none' }"
            />
            <IBiStar
              v-show="hoverStars != null ? hoverStars < i : stars < i"
              class="text-primary"
              :style="{ pointerEvents: 'none' }"
            />
          </BButton>
        </BButtonGroup>
      </BCol>
    </BRow>
    <textarea
      name="feedback-text"
      id="feedback-text"
      rows="5"
      v-model="feedbackText"
      class="p-2 mt-3"
      :placeholder="$t('feedback.was-gefaellt-dir-am-choreo-planer')"
    />
    <template #footer="{ ok, cancel }">
      <BRow align-h="between" class="w-100 me-2" no-gutters>
        <BCol cols="auto">
          <BButton
            v-show="!forced"
            @click="closeWithoutSending"
            variant="link"
            class="text-muted"
          >
            {{ $t("feedback.nicht-mehr-fragen") }}
          </BButton>
        </BCol>
        <BCol cols="auto">
          <BRow no-gutters :style="{ columnGap: '8px' }">
            <BCol>
              <BButton
                @click="ok"
                variant="success"
                :disabled="stars < 0 || stars > 4 || !feedbackText"
                to="#"
              >
                <BSpinner small v-show="sending" />
                <span v-show="!sending"> {{ $t("feedback.abschicken") }} </span>
              </BButton>
            </BCol>
            <BCol cols="auto">
              <BButton @click="cancel" variant="outline-danger">
                {{ $t("feedback.schliessen") }}
              </BButton>
            </BCol>
          </BRow>
        </BCol>
      </BRow>
    </template>

    <BModal
      ref="thankyouModal"
      :id="`feedback-thankyou-modal-${id}`"
      :title="$t('feedback.dankeschoen')"
      centered
      @ok="close"
      @hide="close"
      header-bg-variant="success"
      header-text-variant="light"
    >
      <p>
        {{ $t("feedback.vielen-dank") }}
      </p>
      <template #footer="{ cancel }">
        <BButton variant="success" @click="cancel" :style="{ color: 'white' }">
          {{ $t("feedback.schliessen") }}
        </BButton>
      </template>
    </BModal>
  </BModal>
</template>

<script>
import Cookies from "js-cookie";

import FeedbackService from "@/services/FeedbackService";
import { error, debug } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";
import { isPrerender } from "@/utils/isPrerender";

const feedbackDeclinedCookieName = "feedback-declined";

/**
 * @module Component:FeedbackPrompt
 *
 * @vue-data {String} id
 * @vue-data {Number} stars=4
 * @vue-data {String|null} feedbackText=null
 * @vue-data {Number|null} hoverStars=null
 * @vue-data {Boolean} sending=false
 * @vue-data {Boolean} feedbackAlreadyGiven=false
 * @vue-data {Boolean} forced=false
 * @vue-data {Number|null} showTimer=null
 *
 * @vue-event {Object} feedbackSent - Emitted when feedback is successfully sent.
 *
 * @example
 * <template>
 *   <FeedbackPrompt ref="feedbackPrompt" @feedbackSent="handler" />
 *   <Button @click="() => $refs.feedbackPrompt.open()" />
 * </template>
 */

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
    if (!isPrerender()) {
      this.initializeShowTimer();
      FeedbackService.getAll()
        .then((feedbacks) => {
          this.feedbackAlreadyGiven = feedbacks?.length > 0;
        })
        .catch(() => {
          error(
            "Feedback could not be queried",
            ERROR_CODES.FEEDBACK_QUERY_FAILED
          );
          this.feedbackAlreadyGiven = false;
        });
    } else {
      debug("Prerendering detected, feedback prompt will not be shown");
      this.feedbackAlreadyGiven = true; // prevent showing the feedback prompt during prerendering
    }
  },
  methods: {
    open(force = false) {
      this.stars = 4;
      this.feedbackText = null;
      this.forced = force;
      const feedbackDeclined = Boolean(Cookies.get(feedbackDeclinedCookieName));
      if (force || (!this.feedbackAlreadyGiven && !feedbackDeclined))
        this.$refs.feedbackModal.show();

      this.stopShowTimer();
    },
    timedOpen() {
      if (!this.isABootstrapModalOpen()) this.open();
      else this.resetShowTimer();
    },
    send() {
      this.stopShowTimer();
      FeedbackService.sendFeedback(
        parseInt(this.stars) + 1,
        this.feedbackText
      ).then(() => {
        this.$emit("feedbackSent", {
          stars: this.stars,
          feedbackText: this.feedbackText,
        });
        this.$refs.thankyouModal.show();
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
      Cookies.set(feedbackDeclinedCookieName, true, { expires: 30 });
      this.close();
    },
    close() {
      this.$refs.feedbackModal.hide();
      this.$refs.thankyouModal.hide();
    },
    isABootstrapModalOpen() {
      return document.querySelectorAll(".modal.in").length > 0;
    },
    initializeShowTimer() {
      this.showTimer = setTimeout(this.timedOpen, 600_000); // opens the feedback prompt modal after 10 minutes of inactivity
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
