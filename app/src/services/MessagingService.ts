import { debug } from "@/utils/logging";
import i18n from "@/plugins/vue-i18n";

/**
 * Service for displaying messages and notifications to the user.
 * @class MessagingService
 */
const DEFAULT_OPTIONS = {
  modelValue: 5_000,
  solid: false,
};

interface MessageOptions {
  modelValue?: number;
  solid?: boolean;
  variant?: string;
  title?: string;
  progressProps?: Record<string, string>;
  autoHideDelay?: number;
}

class MessagingService {
  handlers: Record<
    string,
    (message: string, options: MessageOptions) => Promise<void>
  > = {};

  /**
   * Subscribe a handler for message display.
   * @param {string} key - Unique key for the handler
   * @param {Function} handler - Function to handle message display
   */
  subscribe(
    key: string,
    handler: (message: string, options: MessageOptions) => Promise<void>
  ): void {
    debug("Message handler registered", { key });
    this.handlers[key] = handler;
  }

  /**
   * Show a generic message with options.
   * @param {string} message - The message to display
   * @param {Object} options - Options for the message display
   * @returns {Promise}
   */
  _showMessage(message: string, options: MessageOptions): Promise<void[]> {
    if (options.variant) options.progressProps = { variant: options.variant };
    debug("_showMessage", { message, options });
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
  showInfo(
    message: string,
    title: string | null = null,
    options: MessageOptions = {}
  ): Promise<void[]> {
    debug("Showing Info message", { message, title, options });
    if (!title) title = i18n.global.t("info");
    return this._showMessage(message, { title, ...options });
  }

  /**
   * Show a success message.
   * @param {string} message - The message to display
   * @param {string|null} [title] - The title of the message
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showSuccess(
    message: string,
    title: string | null = null,
    options: MessageOptions = {}
  ): Promise<void[]> {
    debug("Showing success message", { message, title, options });
    if (!title) title = i18n.global.t("login.erfolg");
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
  showError(
    message: string,
    title: string | null = null,
    options: MessageOptions = {}
  ): Promise<void[]> {
    debug("Showing error message", { message, title, options });
    // ERROR_MESSAGES must be within this function to ensure that the right locale is used when it is called
    const ERROR_MESSAGES = [
      i18n.global.t("failMessages.oh-oh"),
      i18n.global.t("failMessages.satz-mit-x"),
      i18n.global.t("failMessages.da-dumm"),
      i18n.global.t("failMessages.check-ich-nicht"),
      i18n.global.t("failMessages.probiers-nochmal"),
      i18n.global.t("failMessages.computer-sagt-nein"),
      i18n.global.t("failMessages.traurige-trompete"),
    ];
    if (!title)
      title =
        ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)]!;
    return this._showMessage(message, {
      title: title ?? undefined,
      variant: "danger",
      ...options,
    });
  }

  /**
   * Show a warning message.
   * @param {string} message - The warning message to display
   * @param {string|null} [title] - The title of the warning message
   * @param {Object} [options] - Options for the message display
   * @returns {Promise}
   */
  showWarning(
    message: string,
    title: string | null = null,
    options: MessageOptions = {}
  ): Promise<void[]> {
    debug("Showing warning message", { message, title, options });
    if (!title) title = i18n.global.t("warnung");
    return this._showMessage(message, {
      title,
      variant: "warning",
      ...options,
    });
  }
}

export default new MessagingService();
