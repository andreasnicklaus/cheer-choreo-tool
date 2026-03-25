import http from "http";
import fs from "fs/promises";
import path from "path";
// use WHATWG URL API instead of deprecated url.parse
import puppeteer from "puppeteer";
import { minify as htmlMinify } from "html-minifier-terser";

const DIST_DIR = path.join(process.cwd(), "dist");
const PORT = process.env.PRERENDER_PORT || 5000;
const HOST = `http://localhost:${PORT}`;

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case ".html":
      return "text/html; charset=utf-8";
    case ".js":
      return "text/javascript; charset=utf-8";
    case ".css":
      return "text/css; charset=utf-8";
    case ".json":
      return "application/json; charset=utf-8";
    case ".png":
      return "image/png";
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".svg":
      return "image/svg+xml";
    case ".webp":
      return "image/webp";
    default:
      return "application/octet-stream";
  }
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch (e) {
    return false;
  }
}

async function startStaticServer(distDir, port) {
  const server = http.createServer(async (req, res) => {
    try {
      const base = `http://localhost:${port}`;
      const reqUrl = new URL(req.url || "/", base);
      let pathname = decodeURIComponent(reqUrl.pathname || "/");
      if (pathname.endsWith("/")) pathname = pathname.slice(0, -1);
      // map to file, preventing path traversal
      const filePath = path.join(distDir, pathname);
      const resolvedPath = path.resolve(filePath);
      if (!resolvedPath.startsWith(path.resolve(distDir))) {
        res.writeHead(403);
        res.end("Forbidden");
        return;
      }
      if (await fileExists(filePath)) {
        const stats = await fs.stat(filePath);
        if (stats.isDirectory()) {
          if (await fileExists(path.join(filePath, "index.html"))) {
            const data = await fs.readFile(path.join(filePath, "index.html"));
            res.writeHead(200, { "Content-Type": contentType("index.html") });
            res.end(data);
            return;
          }
        } else {
          const data = await fs.readFile(filePath);
          res.writeHead(200, { "Content-Type": contentType(filePath) });
          res.end(data);
          return;
        }
      }
      // fallback to index.html (SPA)
      const indexFile = path.join(distDir, "index.html");
      if (await fileExists(indexFile)) {
        const data = await fs.readFile(indexFile);
        res.writeHead(200, { "Content-Type": contentType("index.html") });
        res.end(data);
        return;
      }
      res.writeHead(404);
      res.end("Not found");
    } catch (err) {
      res.writeHead(500);
      res.end(`Server error: ${String(err)}`);
    }
  });

  await new Promise((resolve) => server.listen(port, resolve));
  return server;
}

function normalizeRoute(route) {
  if (!route) return "/";
  if (!route.startsWith("/")) route = "/" + route;
  return route;
}

function outputPathForRoute(distDir, route) {
  // route: /en/login -> dist/en/login/index.html
  const parts = route.split("/").filter(Boolean);
  if (parts.length === 0) return path.join(distDir, "index.html");
  const outDir = path.join(distDir, ...parts);
  return path.join(outDir, "index.html");
}

async function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function postProcessHtml(html) {
  // replicate vue.config.js postProcess transforms
  let out = html
    .replace(
      /<link href="(.*?)" rel="stylesheet">/g,
      `<link rel="preload" href="$1" as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link href="$1" rel="stylesheet"></noscript>`
    )
    .replace(
      /<link rel="stylesheet" (.*?)>/g,
      `<link rel="preload" $1 as="style" onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet" $1></noscript>`
    )
    .replace(/<script (((?!defer).)*?)>/g, `<script $1 defer>`)
    .replace('id="app"', 'id="app" data-server-rendered="true"');

  // HTML minification
  try {
    out = await htmlMinify(out, {
      collapseBooleanAttributes: true,
      collapseWhitespace: true,
      decodeEntities: true,
      keepClosingSlash: true,
      sortAttributes: true,
      sortClassName: true,
      minifyCSS: true,
      minifyJS: true,
    });
  } catch (e) {
    console.warn(
      "HTML minification failed, writing unminified output:",
      e && e.message ? e.message : e
    );
  }

  return out;
}

async function main() {
  // Import unlocalized routes (safe: components are lazy functions, won't be executed)
  const routesModule = await import("../src/router/unlocalized-routes.mjs");
  const routes = routesModule.default || routesModule;

  // Default language slugs (match your router config)
  const slugs = ["en", "de"];
  const defaultSlug = slugs[0];

  // Build set of routes to prerender (avoid duplicates), honoring per-route sitemap slugs and aliases
  const prerenderSet = new Set();

  function addRouteVariants(p) {
    // p is a route path like '/contact' or '/de/contact'
    if (!p.startsWith("/")) p = "/" + p;
    prerenderSet.add(p.replace(/\/+/g, "/"));
  }

  for (const r of routes) {
    // handle top-level routes that are marked for prerender
    if (r.meta && r.meta.prerender) {
      const slugsForRoute =
        (r.meta && r.meta.sitemap && r.meta.sitemap.slugs) || slugs;
      const sub =
        r.path && r.path !== "/" ? `/${r.path.replace(/^\//, "")}` : "";

      for (const s of slugsForRoute) {
        addRouteVariants(`/${s}${sub}`);
        if (s === defaultSlug) addRouteVariants(sub || "/");
      }

      // handle alias(es) for the route
      if (r.alias) {
        const aliases = Array.isArray(r.alias) ? r.alias : [r.alias];
        for (const a of aliases) {
          const aPath = a.startsWith("/") ? a : `/${a}`;
          for (const s of slugsForRoute) {
            addRouteVariants(`/${s}${aPath}`);
            if (s === defaultSlug) addRouteVariants(aPath || "/");
          }
        }
      }
    }

    // handle parent routes with param (e.g. '/:lang') and children
    if (
      r.path &&
      /\/:[a-zA-Z]/.test(r.path) &&
      r.children &&
      Array.isArray(r.children)
    ) {
      const parentSlugs =
        (r.meta && r.meta.sitemap && r.meta.sitemap.slugs) || slugs;
      for (const c of r.children) {
        if (!(c.meta && c.meta.prerender)) continue;
        const childSub =
          c.path && c.path !== "/" ? `/${c.path.replace(/^\//, "")}` : "";
        for (const p of parentSlugs) {
          addRouteVariants(`/${p}${childSub}`);
          if (p === defaultSlug) addRouteVariants(childSub || "/");
        }

        // child's alias
        if (c.alias) {
          const childAliases = Array.isArray(c.alias) ? c.alias : [c.alias];
          for (const a of childAliases) {
            const aPath = a.startsWith("/") ? a : `/${a}`;
            for (const p of parentSlugs) {
              addRouteVariants(`/${p}${aPath}`);
              if (p === defaultSlug) addRouteVariants(aPath || "/");
            }
          }
        }
      }
    }
  }

  const prerenderRoutes = Array.from(prerenderSet).sort();

  if (prerenderRoutes.length === 0) {
    console.log("No prerender routes found. Exiting.");
    return;
  }

  // Ensure dist exists
  if (!(await fileExists(DIST_DIR))) {
    console.error(
      `Dist directory not found: ${DIST_DIR} - run a production build first (npm run build)`
    );
    process.exit(1);
  }

  const server = await startStaticServer(DIST_DIR, PORT);
  console.log(`Static server running at ${HOST} serving ${DIST_DIR}`);

  const browser = await puppeteer.launch({
    headless: "new",
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  for (const route of prerenderRoutes) {
    const url = HOST + (route === "/" ? "/" : route);
    console.log("Rendering", url);
    try {
      // ensure any page scripts see the prerender flag during initial load
      const preloadFile = await fs.readFile(
        "./scripts/setPrerenderIndicators.js",
        "utf8"
      );
      await page.evaluateOnNewDocument(preloadFile);
      await page.goto(url, { waitUntil: "networkidle0", timeout: 30000 });
      // wait for data-view marker if present
      try {
        await page.waitForSelector("[data-view]", { timeout: 3000 });
      } catch (e) {
        // ignore - selector not present
      }
      // prerender flag is injected before navigation via page.addInitScript

      let html = await page.content();
      // postProcess HTML (link/script transforms + minify)
      html = await postProcessHtml(html);
      const out = outputPathForRoute(DIST_DIR, route);
      await ensureDirForFile(out);
      await fs.writeFile(out, html, "utf-8");
      console.log(`Wrote ${out}`);
    } catch (e) {
      console.error(`Failed to prerender ${url}:`, e);
    }
  }

  await browser.close();
  await new Promise((resolve) => server.close(resolve));
  console.log("Prerender complete.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
