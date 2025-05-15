import i18n from "@/plugins/vue-i18n";
import VersionService from "@/services/VersionService";

console.image = async function (url, size = 100) {
  const img = await fetch("/Icon.png");
  const blob = await img.blob();
  await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result;
      image.onload = function () {
        var style = [
          "font-size: 1px;",
          "padding: " + size + "px " + size + "px;",
          "background: url(" + reader.result + ") no-repeat;",
          "background-size: contain;",
        ].join(" ");
        console.log("%c ", style);
        setTimeout(resolve, 100);
      };
    };
    reader.readAsDataURL(blob);
  });
};

const DEFAULT_TEXT_STYLE =
  "font-family: Avenir, Helvetica, Arial, sans-serif; font-size: 12px;";

export async function logWelcomeMessage() {
  console.clear();

  await console.image("/Icon.png");

  console.log(
    `${i18n.t("logging.welcome")}`,
    `${DEFAULT_TEXT_STYLE} font-size: 36px; font-weight: bolder;`,
    `${DEFAULT_TEXT_STYLE}`
  );

  console.log(
    i18n.t("logging.warning"),
    `${DEFAULT_TEXT_STYLE} color: #dc3545; font-weight: bold; font-size: 1.2rem;`,
    `${DEFAULT_TEXT_STYLE} color: #dc3545;`
  );

  const details = [
    {
      key: i18n.t("logging.app-version"),
      value: VersionService.getAppVersion(),
    },
    {
      key: i18n.t("logging.server-version"),
      value: (await VersionService.getServerVersion()) ?? "unknown",
    },
    { key: i18n.t("logging.user-agent"), value: window.navigator.userAgent },
    { key: i18n.t("logging.current-locale"), value: i18n.locale },
    {
      key: i18n.t("logging.available-locales"),
      value: i18n.availableLocales.join(", "),
    },
  ];
  const styles = [];
  details.forEach(() => {
    styles.push(`${DEFAULT_TEXT_STYLE} font-weight: bold;`);
    styles.push(`${DEFAULT_TEXT_STYLE}`);
  });
  const result = details
    .map(({ key, value }) => {
      return `%c${key}: %c${value}`;
    })
    .join("\n");
  console.log(result, ...styles);
}

function generateTimeStamp() {
  return new Date().toISOString();
}

export function log(...messages) {
  console.log(generateTimeStamp(), "LOG", ...messages);
}

export function debug(...messages) {
  console.debug(generateTimeStamp(), "DEBUG", ...messages);
}

export function warn(...messages) {
  console.warn(generateTimeStamp(), "WARN", ...messages);
}

export function error(...messages) {
  console.error(generateTimeStamp(), "ERROR", ...messages);
}
