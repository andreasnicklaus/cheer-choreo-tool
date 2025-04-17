import i18n from "@/plugins/vue-i18n";

const DEFAULT_OPTIONS = {
  variant: "info",
  title: "Info",
  autoHideDelay: 3000,
  appendToast: true,
  solid: true,
};

const ERROR_MESSAGES = [
  i18n.t("failMessages.oh-oh"),
  i18n.t("failMessages.satz-mit-x"),
  i18n.t("failMessages.da-dumm"),
  i18n.t("failMessages.check-ich-nicht"),
  i18n.t("failMessages.probiers-nochmal"),
  i18n.t("failMessages.computer-sagt-nein"),
  i18n.t("failMessages.traurige-trompete"),
];

class MessagingService {
  handlers = {};

  subscribe(key, handler) {
    this.handlers[key] = handler;
  }

  _showMessage(message, options) {
    return Promise.all(
      Object.values(this.handlers).map((handler) =>
        handler(message, { ...DEFAULT_OPTIONS, ...options })
      )
    );
  }

  showInfo(message, title = null, options = {}) {
    if (!title) title = i18n.t("info");
    return this._showMessage(message, { title, ...options });
  }

  showSuccess(message, title = null, options = {}) {
    if (!title) title = i18n.t("login.erfolg");
    return this._showMessage(message, {
      title,
      variant: "success",
      ...options,
    });
  }

  showError(message, title = null, options = {}) {
    if (!title)
      title = ERROR_MESSAGES[Math.floor(Math.random() * ERROR_MESSAGES.length)];
    return this._showMessage(message, { title, variant: "danger", ...options });
  }

  showWarning(message, title = null, options = {}) {
    if (!title) title = i18n.t("warnung");
    return this._showMessage(message, { title, variant: "warn", ...options });
  }
}

export default new MessagingService();
