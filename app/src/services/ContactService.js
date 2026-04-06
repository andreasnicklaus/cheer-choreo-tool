import i18n from "@/plugins/vue-i18n";
import ax from "./RequestService";

class ContactService {
  messageSuffix = i18n.global.t(
    "services.ContactService.dear-choreo-planer-team",
    { locale: i18n.global.locale.value }
  );

  createMessageAppendix(username = null) {
    if (username)
      return i18n.global.t(
        "services.ContactService.best-regards-username",
        { username },
        { locale: i18n.global.locale.value }
      );
    else
      return i18n.global.t("services.ContactService.best-regards", {
        locale: i18n.global.locale.value,
      });
  }
  sendContactMessage({ name, email, subject, message, category }) {
    return ax
      .post("/contact", { name, email, subject, message, category })
      .then((res) => res.data);
  }
}

export default new ContactService();
