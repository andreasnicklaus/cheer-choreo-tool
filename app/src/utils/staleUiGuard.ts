/**
 * Stale UI detection utility
 * @module Util:StaleUiGuard
 */
import env from "./env";

const VERSION_URL = "/version.json";
const RELOAD_GUARD_KEY = "choreo-stale-ui-reloaded";

interface BuildVersionMarker {
  version?: string;
}

/**
 * Reloads the app when the running bundle is older than the one the server
 * actually serves.
 *
 * This is the safety net for clients whose service worker serves a stale
 * precached index.html: the guard compares the version baked into this bundle
 * against the build marker emitted into dist by vite, so it only fires when the
 * deployed frontend really moved on. It deliberately does not use the backend
 * /version endpoint - an API-only deploy would otherwise purge the caches and
 * reload the app on every single page view.
 */
export async function reloadIfUiIsStale(): Promise<void> {
  if (!env.PROD || typeof window === "undefined") return;

  // Only a controlled client can be holding a stale precached shell.
  if (!("serviceWorker" in navigator) || !navigator.serviceWorker.controller)
    return;

  // Hard guard: at most one forced reload per tab session, so a marker that
  // stays stale for any reason cannot turn into a reload loop.
  try {
    if (sessionStorage.getItem(RELOAD_GUARD_KEY)) return;
  } catch (e) {
    // ignore
  }

  const currentVersion = env.VITE_VERSION;
  if (!currentVersion) return;

  let deployedVersion: string | undefined;
  try {
    const response = await fetch(VERSION_URL, { cache: "no-store" });
    if (!response.ok) return;
    const marker = (await response.json()) as BuildVersionMarker;
    deployedVersion = marker.version;
  } catch (e) {
    return;
  }

  if (!deployedVersion || deployedVersion === currentVersion) return;

  let guardPersisted = false;
  try {
    sessionStorage.setItem(RELOAD_GUARD_KEY, "1");
    guardPersisted = true;
  } catch (e) {
    // ignore
  }

  // If the guard cannot be persisted we cannot prove the reload is a one-off,
  // so leave the client alone rather than risk a reload loop.
  if (!guardPersisted) return;

  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter((key) => key.startsWith("workbox-"))
        .map((key) => caches.delete(key))
    );
  } catch (e) {
    // ignore
  }

  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  } catch (e) {
    // ignore
  }

  window.location.reload();
}
