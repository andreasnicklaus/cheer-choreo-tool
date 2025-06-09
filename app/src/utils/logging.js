/* eslint-disable no-console */

import i18n from "@/plugins/vue-i18n";
import VersionService from "@/services/VersionService";
import store from "@/store";
import { Logtail } from "@logtail/browser";
import ERROR_CODES from "./error_codes";

const SOURCE_TOKEN = process.env.VUE_APP_BETTERSTACK_SOURCE_TOKEN;
const INGESTING_HOST = process.env.VUE_APP_BETTERSTACK_INGESTING_HOST;

const logtail = new Logtail(SOURCE_TOKEN, {
  endpoint: INGESTING_HOST,
});

const SESSION_ID = (Math.random() + 1).toString(36).substring(7);

const sendLogsToIngest = process.env.NODE_ENV == "production";

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

/**
 * Log a welcome message in the console
 *
 * @export
 * @async
 * @returns {void}
 */
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
      value:
        (await VersionService.getServerVersion()) || i18n.t("errors.unknown"),
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

/**
 * Generate a timestamp for logging
 *
 * @returns {string} ISO string representing the current date and time
 */
function generateTimeStamp() {
  return new Date().toISOString();
}

/**
 * Log a INFO message with a timestamp
 *
 * @export
 * @param {string[]} messages - Messages to log
 */
export function log(...messages) {
  console.log(generateTimeStamp(), "LOG", ...messages);
  if (sendLogsToIngest) {
    logtail.info(messages.join(), {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.locale,
      SESSION_ID,
    });
  }
}

/**
 * Log a DEBUG message with a timestamp
 *
 * @export
 * @param {string[]} messages - Messages to log
 */
export function debug(...messages) {
  console.debug(generateTimeStamp(), "DEBUG", ...messages);
  if (sendLogsToIngest) {
    const message = messages
      .map((m) => (typeof m !== "object" ? m : JSON.stringify(m)))
      .join(" ");
    logtail.debug(message, {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.locale,
      SESSION_ID,
    });
  }
}

/**
 * Log a WARN message with a timestamp
 *
 * @export
 * @param {string[]} messages - Messages to log
 */
export function warn(...messages) {
  console.warn(generateTimeStamp(), "WARN", ...messages);
  if (sendLogsToIngest) {
    logtail.warn(messages.join(), {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.locale,
      SESSION_ID,
    });
  }
}

/**
 * Log a ERROR message with a timestamp
 *
 * @export
 * @param {string} message - Message to log
 */
export function error(message, errorCode = ERROR_CODES.UNKNOWN_ERROR) {
  console.error(generateTimeStamp(), "ERROR", errorCode, message);
  if (sendLogsToIngest) {
    logtail.error(`${errorCode} ${message}`, {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.locale,
      errorCode,
      SESSION_ID,
    });
  }
}

/**
 * Log request results
 *
 * @export
 * @param {number} status - response status
 * @param {number} time - ms between request and response
 * @param {string} url - path of the request
 */
export function logRequest(status, time, url) {
  const message = `${url} responded with status ${status} in ${time} ms`;
  if (!status || status >= 400) {
    if (sendLogsToIngest) {
      logtail.warn(message, {
        state: store?.state,
        version: VersionService.getAppVersion(),
        request: {
          status,
          time,
          url,
        },
        user_locale: i18n.locale,
        SESSION_ID,
      });
    }
  } else {
    console.debug(message);
    if (sendLogsToIngest) {
      logtail.debug(message, {
        state: store?.state,
        version: VersionService.getAppVersion(),
        request: {
          status,
          time,
          url,
        },
        user_locale: i18n.locale,
        SESSION_ID,
      });
    }
  }
}
