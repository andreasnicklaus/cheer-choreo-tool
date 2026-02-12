import i18n from "@/plugins/vue-i18n";
import ax from "./RequestService";

class ContactService {
  messageSuffix = i18n.t(
    "services.ContactService.dear-choreo-planer-team",
    i18n.locale
  );

  createMessageAppendix(username = null) {
    if (username)
      return i18n.t(
        "services.ContactService.best-regards-username",
        i18n.locale,
        { username }
      );
    else return i18n.t("services.ContactService.best-regards", i18n.locale);
  }
  sendContactMessage({ name, email, subject, message, category }) {
    return ax
      .post("/contact", { name, email, subject, message, category })
      .then((res) => res.data);
  }
}

export default new ContactService();
