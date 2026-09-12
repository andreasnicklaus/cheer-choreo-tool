import fs from "fs/promises";
import path from "path";

const DIST_DIR = path.join(process.cwd(), "dist");
const HOSTNAME = "https://www.choreo-planer.de";

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    const res = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      files.push(...(await walk(res)));
    } else {
      files.push(res);
    }
  }
  return files;
}

function toRoute(distDir, filePath) {
  const rel = path.relative(distDir, filePath).split(path.sep).join("/");
  if (!rel.endsWith("index.html")) return null;
  const parts = rel.split("/");
  parts.pop(); // remove index.html
  const route = "/" + parts.filter(Boolean).join("/");
  return route === "/" ? "/" : route + "/";
}

async function main() {
  try {
    // ensure dist exists
    await fs.access(DIST_DIR);
  } catch (e) {
    console.error("Dist directory not found, run a production build first.");
    process.exit(1);
  }

  const files = await walk(DIST_DIR);

  // build entries with route, file and per-file lastmod
  const entries = (
    await Promise.all(
      files.map(async (f) => {
        const route = toRoute(DIST_DIR, f);
        if (!route) return null;
        try {
          const st = await fs.stat(f);
          return { route, file: f, lastmod: st.mtime.toISOString() };
        } catch (e) {
          return { route, file: f, lastmod: new Date().toISOString() };
        }
      })
    )
  ).filter(Boolean);

  // detect locale prefixes (two-letter lowercase) from routes
  const localeSet = new Set();
  for (const e of entries) {
    const segs = e.route.split("/").filter(Boolean);
    if (segs.length && /^[a-z]{2}$/.test(segs[0])) localeSet.add(segs[0]);
  }
  const locales = Array.from(localeSet).sort();
  const defaultLocale = locales.includes("en") ? "en" : locales[0] || null;

  // group by base route (strip leading locale if present)
  const groups = new Map();
  for (const e of entries) {
    let base = e.route;
    const segs = e.route.split("/").filter(Boolean);
    if (segs.length && locales.includes(segs[0])) {
      // remove leading locale
      base = "/" + segs.slice(1).join("/") + (segs.length > 1 ? "/" : "/");
      if (base === "//") base = "/";
    }
    if (!base.endsWith("/")) base = base + "/";
    if (!groups.has(base)) groups.set(base, []);
    // determine locale for this entry
    const locale = segs.length && locales.includes(segs[0]) ? segs[0] : null;
    groups.get(base).push({ route: e.route, lastmod: e.lastmod, locale });
  }

  // defaults
  const DEFAULT_CHANGEFREQ = "daily";
  const DEFAULT_PRIORITY = "0.5";

  // build urlset entries with hreflang alternates
  const urlEntries = [];
  for (const [base, variants] of groups.entries()) {
    // for each variant, write a <url> with alternates for all variants in group
    for (const v of variants) {
      const loc = `${HOSTNAME}${v.route}`;
      const lastmod = v.lastmod;
      const alternates = variants
        .map((a) => {
          const href = `${HOSTNAME}${a.route}`;
          const hreflang = a.locale || "x-default";
          // prefer explicit locale; x-default will be added below
          return { hreflang: a.locale || null, href };
        })
        .filter(Boolean);

      // x-default points to default locale variant if available, otherwise to first variant
      let xDefaultHref = `${HOSTNAME}${variants[0].route}`;
      if (defaultLocale) {
        const found = variants.find((a) => a.locale === defaultLocale);
        if (found) xDefaultHref = `${HOSTNAME}${found.route}`;
      }

      const alternateLinks =
        variants
          .map(
            (a) =>
              `    <xhtml:link rel="alternate" hreflang="${a.locale || "x-default"}" href="${HOSTNAME}${a.route}"/>`
          )
          .join("\n") +
        `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${xDefaultHref}"/>`;

      const urlXml = `  <url>\n    <loc>${loc}</loc>\n${alternateLinks}\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${DEFAULT_CHANGEFREQ}</changefreq>\n    <priority>${DEFAULT_PRIORITY}</priority>\n  </url>`;
      urlEntries.push(urlXml);
    }
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlEntries.join("\n")}\n</urlset>`;

  await fs.writeFile(path.join(DIST_DIR, "sitemap.xml"), xml, "utf-8");
  console.log(
    `Wrote sitemap with ${urlEntries.length} entries to ${path.join(DIST_DIR, "sitemap.xml")}`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
