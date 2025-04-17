const DEFAULT_OPTIONS = {
  variant: "info",
  title: "Info",
  autoHideDelay: 3000,
  appendToast: true,
  solid: true,
};

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

  showInfo(message, title = null) {
    // TODO: generate random info title
    return this._showMessage(message, { title });
  }

  showSuccess(message, title = null) {
    // TODO: generate random success title
    return this._showMessage(message, { title, variant: "success" });
  }

  showError(message, title = null) {
    // TODO: generate random error title
    return this._showMessage(message, { title, variant: "danger" });
  }

  showWarning(message, title = null) {
    // TODO: generate random warning title
    return this._showMessage(message, { title, variant: "warn" });
  }
}

export default new MessagingService();
