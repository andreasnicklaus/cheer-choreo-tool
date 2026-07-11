/**
 * Environment variable access
 * @module Util:Env
 */

interface Env {
  PROD?: boolean;
  BASE_URL?: string;
  VITE_VERSION?: string;
  VITE_BETTERSTACK_SOURCE_TOKEN?: string;
  VITE_BETTERSTACK_INGESTING_HOST?: string;
  VITE_FEATURE_FLAG_API_KEY?: string;
  [key: string]: unknown;
}

const env: Env =
  typeof import.meta !== "undefined" && import.meta.env
    ? import.meta.env
    : typeof process !== "undefined"
      ? process.env
      : {};

export default env;
