/**
 * Logging utilities for console and BetterStack integration
 * @module Util:Logging
 */

import i18n from "@/plugins/vue-i18n";
import VersionService from "@/services/VersionService";
import store from "@/store";
import { Logtail } from "@logtail/browser";
import ERROR_CODES from "./error_codes";
import { isPrerender } from "./isPrerender";
import env from "./env";

const SOURCE_TOKEN = env.VITE_BETTERSTACK_SOURCE_TOKEN;
const INGESTING_HOST = env.VITE_BETTERSTACK_INGESTING_HOST;
const isTestEnvironment = localStorage.getItem("isTestEnvironment") == "true";

let logtail: Logtail | undefined;
if (SOURCE_TOKEN && INGESTING_HOST && !isTestEnvironment)
  logtail = new Logtail(SOURCE_TOKEN as string, {
    endpoint: INGESTING_HOST as string,
  });

const SESSION_ID =
  (isPrerender() ? "PRERENDER-" : env.PROD ? "PROD-" : "DEV-") +
  (Math.random() + 1).toString(36).substring(7);

const sendLogsToIngest = SOURCE_TOKEN && INGESTING_HOST && !isTestEnvironment;
// const sendLogsToIngest = env.PROD;

type ConsoleImage = (url: string, size?: number) => Promise<void>;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(console as any).image = async function (url: string, size = 100) {
  const img = await fetch(url);
  const blob = await img.blob();
  await new Promise<void>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const image = new Image();
      image.src = reader.result as string;
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
 * @async
 * @returns {void}
 */
export async function logWelcomeMessage(): Promise<void> {
  console.clear();

  await (console as unknown as { image: ConsoleImage }).image("/Icon.png");

  console.log(
    `${i18n.global.t("logging.welcome")}`,
    `${DEFAULT_TEXT_STYLE} font-size: 36px; font-weight: bolder;`,
    `${DEFAULT_TEXT_STYLE}`
  );

  console.log(
    i18n.global.t("logging.warning"),
    `${DEFAULT_TEXT_STYLE} color: #dc3545; font-weight: bold; font-size: 1.2rem;`,
    `${DEFAULT_TEXT_STYLE} color: #dc3545;`
  );

  const details = [
    {
      key: i18n.global.t("logging.app-version"),
      value: VersionService.getAppVersion(),
    },
    {
      key: i18n.global.t("logging.server-version"),
      value:
        (await VersionService.getServerVersion()) ||
        i18n.global.t("errors.unknown"),
    },
    {
      key: i18n.global.t("logging.user-agent"),
      value: window.navigator.userAgent,
    },
    {
      key: i18n.global.t("logging.current-locale"),
      value: i18n.global.locale.value,
    },
    {
      key: i18n.global.t("logging.available-locales"),
      value: i18n.global.availableLocales.join(", "),
    },
  ];
  const styles: string[] = [];
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

function generateTimeStamp(): string {
  return new Date().toISOString();
}

/**
 * Log an INFO message with a timestamp
 * @param {...unknown[]} messages - Messages to log
 */
export function log(...messages: unknown[]): void {
  console.log(generateTimeStamp(), "LOG", ...messages);
  if (sendLogsToIngest) {
    logtail!.info(messages.join(), {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.global.locale.value,
      SESSION_ID,
    });
  }
}

/**
 * Log a DEBUG message with a timestamp
 * @param {...unknown[]} messages - Messages to log
 */
export function debug(...messages: unknown[]): void {
  console.debug(generateTimeStamp(), "DEBUG", ...messages);
  if (sendLogsToIngest) {
    const message = messages
      .map((m) => (typeof m !== "object" ? m : JSON.stringify(m)))
      .join(" ");
    logtail!.debug(message, {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.global.locale.value,
      SESSION_ID,
    });
  }
}

/**
 * Log a WARN message with a timestamp
 * @param {...unknown[]} messages - Messages to log
 */
export function warn(...messages: unknown[]): void {
  console.warn(generateTimeStamp(), "WARN", ...messages);
  if (sendLogsToIngest && !isPrerender()) {
    logtail!.warn(messages.join(), {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.global.locale.value,
      SESSION_ID,
    });
  }
}

/**
 * Log an ERROR message with a timestamp and error code
 * @param {unknown} message - Message to log
 * @param {string} [errorCode] - Error code (defaults to UNKNOWN_ERROR)
 */
export function error(
  message: unknown,
  errorCode: string = ERROR_CODES.UNKNOWN_ERROR ?? "E000"
): void {
  console.error(generateTimeStamp(), "ERROR", errorCode, message);
  if (sendLogsToIngest) {
    logtail!.error(`${errorCode} ${message}`, {
      state: store?.state,
      version: VersionService.getAppVersion(),
      user_locale: i18n.global.locale.value,
      errorCode,
      SESSION_ID,
    });
  }
}

/**
 * Log request results
 * @param {number} status - Response status code
 * @param {number} time - Milliseconds between request and response
 * @param {string} url - Path of the request
 */
export function logRequest(status: number, time: number, url: string): void {
  const message = `${url} responded with status ${status} in ${time} ms`;
  if (!status || status >= 400) {
    if (sendLogsToIngest && !isPrerender()) {
      logtail!.warn(message, {
        state: store?.state,
        version: VersionService.getAppVersion(),
        request: {
          status,
          time,
          url,
        },
        user_locale: i18n.global.locale.value,
        SESSION_ID,
      });
    }
  } else {
    console.debug(message);
    if (sendLogsToIngest) {
      logtail!.debug(message, {
        state: store?.state,
        version: VersionService.getAppVersion(),
        request: {
          status,
          time,
          url,
        },
        user_locale: i18n.global.locale.value,
        SESSION_ID,
      });
    }
  }
}
