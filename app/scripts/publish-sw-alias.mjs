import { copyFileSync, existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

/**
 * Mirrors the generated service worker to /sw.js.
 *
 * Version 1.0.0 shipped a worker named sw.js and injected a registration
 * pointing at /sw.js, while the worker file itself is now emitted as
 * /service-worker.js (the path 0.12.x clients are still registered on).
 * Both paths must resolve, otherwise whichever cohort a browser happens to
 * have registered gets a 404 on its worker update check and can never recover:
 * its cached index.html keeps loading a registration script that points at the
 * missing file.
 *
 * A plain copy is enough. The generated worker imports "./workbox-<hash>.js"
 * relative to its own script URL, and that file sits next to both copies in
 * dist, so the import resolves from either path. A registration only exists
 * per origin, so the two entry points never conflict - whichever URL a browser
 * stored keeps receiving the current worker bytes.
 *
 * Runs after vite build, so the alias is not part of the precache manifest.
 */
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const source = resolve(root, "dist/service-worker.js");
const target = resolve(root, "dist/sw.js");

if (!existsSync(source)) {
  console.error(
    `${source} not found. Run this script after "vite build" has emitted the service worker.`
  );
  process.exit(1);
}

copyFileSync(source, target);
console.log(`Published service worker alias: dist/sw.js`);
