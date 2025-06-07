import i18n from "@/plugins/vue-i18n";

/**
 * Service for displaying messages and notifications to the user.
 * @class MessagingService
 */
const DEFAULT_OPTIONS = {
  variant: "info",
  title: "Info",
  // autoHideDelay: 5_000,
  // appendToast: false,
  solid: true,
};

class MessagingService {
  handlers = {};

  /**
   * Subscribe a handler for message display.
   * @param {string} key - Unique key for the handler
   * @param {Function} handler - Function to handle message display
   */
  subscribe(key, handler) {
    this.handlers[key] = handler;
  }

  /**
   * Show a generic message with options.
   * @param {string} message - The message to display
   * @param {Object} options - Options for the message display
   * @returns {Promise}
   */
  _showMessage(message, options) {
    return Promise.all(
      Object.values(this.handlers).map((handler) =>
        handler(message, { ...DEFAULT_OPTIONS, ...options })
      )
    );
  }

  /**
   * Show an info message.
   * @param {string} message - The message to display
   * @param {string|null} title - The title of the message (optional)
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showInfo(message, title = null, options = {}) {
    if (!title) title = i18n.t("info");
    return this._showMessage(message, { title, ...options });
  }

  /**
   * Show a success message.
   * @param {string} message - The message to display
   * @param {string|null} [title] - The title of the message
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showSuccess(message, title = null, options = {}) {
    if (!title) title = i18n.t("login.erfolg");
    return this._showMessage(message, {
      title,
      variant: "success",
      ...options,
    });
  }

  /**
   * Show an error message.
   * @param {string} message - The error message to display
   * @param {string|null} [title] - The title of the error message
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showError(message, title = null, options = {}) {
    // ERROR_MESSAGES must be within this function to ensure that the right locale is used when it is called
    const ERROR_MESSAGES = [
      i18n.t("failMessages.oh-oh"),
      i18n.t("failMessages.satz-mit-x"),
      i18n.t("failMessages.da-dumm"),
      i18n.t("failMessages.check-ich-nicht"),
      i18n.t("failMessages.probiers-nochmal"),
      i18n.t("failMessages.computer-sagt-nein"),
      i18n.t("failMessages.traurige-trompete"),
    ];
    if (!title)
      title = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]; // njsscan-ignore: node_insecure_random_generator
    return this._showMessage(message, { title, variant: "danger", ...options });
  }

  /**
   * Show a warning message.
   * @param {string} message - The warning message to display
   * @param {string|null} [title] - The title of the warning message
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showWarning(message, title = null, options = {}) {
    if (!title) title = i18n.t("warnung");
    return this._showMessage(message, { title, variant: "warn", ...options });
  }
}

export default new MessagingService();
