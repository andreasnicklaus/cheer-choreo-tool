<template>
  <BModal
    ref="modal"
    :id="`contactModal-${id}`"
    :title="
      messageWasSuccess
        ? $t('modals.contact.success')
        : messageWasError
          ? $t('modals.contact.ups')
          : $t('modals.contact.send-us-a-message')
    "
    centered
    scrollable
    @ok.prevent="send"
    :header-bg-variant="bgVariant"
    :header-text-variant="textVariant"
    :body-bg-variant="bgVariant"
    :body-text-variant="textVariant"
    :footer-bg-variant="bgVariant"
    :footer-text-variant="textVariant"
  >
    <BForm v-if="!messageWasSuccess && !messageWasError">
      <BRow>
        <BCol cols="12" md="6">
          <BFormGroup
            :label="$t('modals.contact.your-name')"
            label-for="name"
            :description="$t('modals.contact.what-should-we-call-you')"
            :state="nameIsValid"
            :invalid-feedback="nameStateFeedback"
          >
            <BFormInput
              id="name"
              v-model="name"
              :placeholder="$t('modals.contact.enter-name')"
              required
              :autofocus="name === null"
              :disabled="sending"
            ></BFormInput>
          </BFormGroup>
        </BCol>
        <BCol cols="12" md="6">
          <BFormGroup
            :label="$t('modals.contact.email-address')"
            label-for="email"
            :description="
              $t('modals.contact.well-never-share-your-email-with-anyone-else')
            "
            :state="emailIsValid"
            :invalid-feedback="emailStateFeedback"
          >
            <BFormInput
              id="email"
              v-model="email"
              type="email"
              :placeholder="$t('modals.contact.enter-email')"
              required
              :disabled="sending"
            ></BFormInput>
          </BFormGroup> </BCol
      ></BRow>

      <BFormGroup
        :label="$t('modals.contact.category')"
        label-for="category"
        :description="$t('modals.contact.what-do-you-need-help-with')"
      >
        <BFormSelect
          id="category"
          v-model="category"
          :options="[
            { value: 'question', text: $t('modals.contact.ask-a-question') },
            { value: 'bug', text: $t('modals.contact.report-a-bug') },
            { value: 'feature', text: $t('modals.contact.request-a-feature') },
            { value: 'other', text: $t('modals.contact.other') },
          ]"
          required
          :autofocus="name !== null"
          :disabled="sending"
        ></BFormSelect>
      </BFormGroup>

      <BFormGroup
        :label="$t('modals.contact.subject')"
        label-for="subject"
        :description="
          $t('modals.contact.which-expertise-should-the-respondent-have')
        "
        :state="subjectIsValid"
        :invalid-feedback="subjectStateFeedback"
      >
        <BFormInput
          id="subject"
          v-model="subject"
          :placeholder="$t('modals.contact.subject-of-your-message')"
          required
          :disabled="sending"
        ></BFormInput>
      </BFormGroup>

      <BFormGroup
        :label="$t('modals.contact.message')"
        label-for="message"
        :description="
          $t('modals.contact.let-us-know-what-youre-concerned-about')
        "
        :state="messageIsValid"
        :invalid-feedback="messageStateFeedback"
      >
        <BFormTextarea
          v-model="message"
          id="message"
          :placeholder="$t('modals.contact.enter-your-message-to-us')"
          required
          rows="6"
          max-rows="8"
          :disabled="sending"
        >
        </BFormTextarea>
      </BFormGroup>
    </BForm>
    <BContainer fluid v-if="messageWasSuccess" class="text-center">
      <IBiCheckCircleFill style="width: 120px; height: 120px" class="my-4" />
      <p>
        <b>{{ $t("modals.contact.your-message-was-sent-successfully") }}</b>
      </p>
    </BContainer>
    <BContainer fluid v-if="messageWasError" class="text-center">
      <IBiXCircle style="width: 120px; height: 120px" class="my-4" />
      <p>
        <b>{{ $t("modals.contact.there-was-an-error-with-your-message") }}</b>
      </p>
      <p v-if="errorMessage">{{ errorMessage }}</p>
    </BContainer>
    <template #footer="{ ok, cancel }">
      <BButton
        @click="ok"
        variant="success"
        v-if="!messageWasSuccess && !messageWasError"
        :disabled="!allValid || sending"
      >
        <BSpinner small v-show="sending" />
        <span v-show="!sending">
          <IBiChatRightText class="me-2" />
          {{ $t("feedback.abschicken") }}
        </span>
      </BButton>
      <BButton v-if="messageWasError" variant="light" @click="resetAfterError">
        <IBiArrowCounterclockwise class="me-2" />
        {{ $t("modals.contact.try-again") }}
      </BButton>
      <BButton @click="cancel" variant="light">
        {{ $t("feedback.schliessen") }}
      </BButton>
    </template>
  </BModal>
</template>

<script>
import AuthService from "@/services/AuthService";
import ContactService from "@/services/ContactService";
import { debug } from "@/utils/logging";
import ERROR_CODES from "@/utils/error_codes";

const emailRegex = /^[\w-.+]+@([\w-]+\.)+[\w-]{2,4}$/;

/**
 * @module Modal:ContactModal
 *
 * @vue-data {String} id
 * @vue-data {String} email - The email address of the user sending the message
 * @vue-data {String} name - The name of the user sending the message
 * @vue-data {String} category - The category of the message (e.g., bug report, feature request)
 * @vue-data {String} subject - The subject of the message
 * @vue-data {String} message - The content of the message
 * @vue-data {Boolean} sending - Indicates whether the message is currently being sent
 * @vue-data {Boolean} messageWasSuccess - Indicates whether the message was sent successfully
 * @vue-data {Boolean} messageWasError - Indicates whether there was an error sending the message
 * @vue-data {String} errorMessage - The error message to display if there was an error sending the message
 *
 * @vue-method {Function} open - Opens the contact modal
 * @vue-method {Function} send - Sends the contact message to the server
 * @vue-method {Function} loadUserInfo - Loads the user's information to pre-fill the form
 * @vue-method {Function} initUserMessage - Initializes the message field with a default message
 *
 * @example <ContactModal />
 */
export default {
  name: "ContactModal",
  data: () => ({
    id: (Math.random() + 1).toString(36).substring(7),
    sending: false,
    messageWasSuccess: false,
    messageWasError: false,
    errorMessage: null,
    email: null,
    name: null,
    category: "question",
    subject: null,
    message: null,
  }),
  mounted() {
    this.initUserMessage();
    this.loadUserInfo();
  },
  methods: {
    open() {
      this.sending = false;
      this.messageWasSuccess = false;
      this.messageWasError = false;
      this.errorMessage = null;

      this.initUserMessage(this.name);
      this.$refs.modal.show();
    },
    send() {
      this.sending = true;
      ContactService.sendContactMessage({
        name: this.name,
        email: this.email,
        subject: this.subject,
        message: this.message,
        category: this.category,
      })
        .then(() => {
          this.messageWasSuccess = true;
          this.messageWasError = false;
        })
        .catch((e) => {
          this.messageWasSuccess = false;
          this.messageWasError = true;
          this.errorMessage =
            e.response.data || e.data?.message || e.message || null;
        })
        .finally(() => {
          this.sending = false;

          this.category = "question";
          this.subject = null;
          this.message = null;
        });
    },
    loadUserInfo() {
      if (this.$store.state.loggedIn)
        AuthService.getUserInfo()
          .then((userInfo) => {
            if (userInfo) {
              this.email = userInfo.email;
              this.name = userInfo.username;

              this.initUserMessage(this.name);
            }
          })
          .catch(() => {
            debug(
              "Could not load user info",
              ERROR_CODES.USER_INFO_QUERY_FAILED
            );
          });
    },
    initUserMessage(username = null) {
      this.message =
        ContactService.messageSuffix +
        ContactService.createMessageAppendix(username);
    },
    close() {
      this.$refs.modal.hide();
    },
    resetAfterError() {
      this.messageWasError = false;
      this.errorMessage = null;
    },
  },
  computed: {
    bgVariant() {
      if (this.messageWasSuccess) return "success";
      if (this.messageWasError) return "danger";
      return null;
    },
    textVariant() {
      if (this.messageWasSuccess || this.messageWasError) return "white";
      return null;
    },
    nameIsValid() {
      return this.name != null && this.name.length > 0;
    },
    nameStateFeedback() {
      if (!this.name || this.name.length == 0) return this.$t("erforderlich");
      return null;
    },
    emailIsValid() {
      return this.email != null && this.email.match(emailRegex)?.length > 0;
    },
    emailStateFeedback() {
      if (!this.email) return this.$t("erforderlich");
      else if (
        !this.email.match(emailRegex) ||
        this.email.match(emailRegex)?.length == 0
      )
        return this.$t("modals.contact.please-enter-a-valid-email-address");
      return null;
    },
    subjectIsValid() {
      return this.subject != null && this.subject.length > 0;
    },
    subjectStateFeedback() {
      if (!this.subject || this.subject.length == 0)
        return this.$t("erforderlich");
      return null;
    },
    messageIsValid() {
      return this.message != null && this.message.length > 0;
    },
    messageStateFeedback() {
      if (!this.message || this.message.length == 0)
        return this.$t("erforderlich");
      return null;
    },
    allValid() {
      return (
        this.nameIsValid &&
        this.emailIsValid &&
        this.subjectIsValid &&
        this.messageIsValid
      );
    },
  },
};
</script>
