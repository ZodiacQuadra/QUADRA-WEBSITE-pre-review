// Download an exact offline copy of the published quadrasystems.net (the Framer project's live output).
// Read-only: only GET requests to the public website and its file servers. Nothing is sent to Framer.
// Pages, scripts, images, videos and fonts are saved to ./live_mirror and every reference is rewritten
// to the local copy. Tracking scripts are removed and form/analytics endpoints are disconnected.
// Usage: node mirror_live.js            then: node serve_site.js 8081 live_mirror
"use strict";
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const shared = require("./mirror_rewrite");

const SITE = "https://www.quadrasystems.net";
const PORT = 8081; // the copy is served from http://localhost:8081 (scripts need an absolute origin for files)
const ORIGIN = `http://localhost:${PORT}`;
const OUT = path.join(__dirname, "live_mirror");
const UA = { "user-agent": "Mozilla/5.0 (Quadra offline copy, read-only)" };
const ASSET_HOSTS = ["framerusercontent.com", "fonts.gstatic.com"]; // downloaded up front; other mirrored hosts are filled on first use by serve_site.js

// ---------- URL mapping ----------
const ASSET_RE = /https?:(?:\\?\/){2}(framerusercontent\.com|fonts\.gstatic\.com)((?:\\?\/)[^\s"'`)\\<>]*(?:\\\/[^\s"'`)\\<>]*)*)/g;
function localFile(u) {
  // query strings select image sizes; the original file serves all of them locally
  const url = new URL(u);
  let p = decodeURIComponent(url.pathname);
  if (p.endsWith("/")) p += "index";
  if (url.search && url.hostname !== "framerusercontent.com") {
    const ext = path.extname(p);
    p = p.slice(0, p.length - ext.length) + "." + crypto.createHash("md5").update(url.search).digest("hex").slice(0, 8) + ext;
  }
  return path.join(OUT, "_mirror", url.hostname, ...p.split("/").filter(Boolean));
}
const localUrl = (u) => {
  const url = new URL(u);
  return `${ORIGIN}/_mirror/${url.hostname}${url.pathname}${url.search}`;
};

const rewrite = (text, opts) => shared.rewrite(text, ORIGIN, opts);

// ---------- discovery ----------
function findAssets(text, baseUrl) {
  const found = new Set();
  for (const m of text.matchAll(ASSET_RE)) {
    const u = ("https://" + m[1] + m[2].replace(/\\\//g, "/")).replace(/&amp;/g, "&").replace(/[.,;]+$/, "");
    try { found.add(new URL(u).href); } catch {}
  }
  if (baseUrl) {
    // relative module imports and file references inside scripts and styles
    for (const m of text.matchAll(/["'`](\.\.?\/[^"'`\s]+?\.(?:mjs|js|json|css|framercms|wasm|woff2?|ttf|otf|png|jpe?g|webp|svg|gif|avif|mp4|webm|mov))["'`]/g)) {
      try { found.add(new URL(m[1], baseUrl).href); } catch {}
    }
    for (const m of text.matchAll(/url\(\s*["']?(?!data:|https?:|#)([^"')\s]+)["']?\s*\)/g)) {
      try { found.add(new URL(m[1], baseUrl).href); } catch {}
    }
  }
  return [...found].filter((u) => ASSET_HOSTS.includes(new URL(u).hostname));
}

// ---------- page clean-up ----------
function cleanPage(html) {
  html = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, (tag) => {
    if (/googletagmanager|events\.framer\.com|recaptcha\/api\.js/.test(tag)) return ""; // tracking / captcha loaders
    if (/<script>[\s\S]*(gtag\(|dataLayer|posthog|__framer_force_showing_editorbar_since)/.test(tag)) return ""; // analytics + editor bar
    return tag;
  });
  // keep navigation inside the local copy
  html = html.replace(/href="https:\/\/www\.quadrasystems\.net(\/[^"]*)?"/g, (m, p) => (/rel="canonical"/.test(m) ? m : `href="${p || "/"}"`));
  html = rewrite(html, { links: false }); // page links were localised above; canonical/SEO tags keep the live URL
  return html.includes("Offline copy of") ? html : html.replace("<head>", `<head>\n<!-- Offline copy of ${SITE} made by mirror_live.js. Tracking removed; forms disconnected. -->`);
}

// ---------- download ----------
async function get(url, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      const res = await fetch(url, { headers: UA });
      if (res.ok || res.status === 404) return res;
    } catch (e) {
      if (i === tries) throw e;
    }
    await new Promise((r) => setTimeout(r, 1000 * i));
  }
  return fetch(url, { headers: UA });
}

async function listPages() {
  const xml = await (await get(SITE + "/sitemap.xml")).text();
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => decodeURI(new URL(m[1].trim()).pathname).replace(/\/+$/, "") || "/");
  return [...new Set(paths.concat(["/404"]))];
}
const pageFile = (p) => (p === "/" ? path.join(OUT, "index.html") : p === "/404" ? path.join(OUT, "404.html") : path.join(OUT, ...p.split("/").filter(Boolean), "index.html"));
const hasContent = (html) => (html.match(/<(p|h[1-6])\b/g) || []).length >= 5;

// --rewrite-only: re-apply the clean-up and rewrite rules to an existing copy without downloading
function rewriteExisting() {
  let n = 0;
  const walk = (dir) => {
    for (const f of fs.readdirSync(dir)) {
      const p = path.join(dir, f);
      if (fs.statSync(p).isDirectory()) { walk(p); continue; }
      const isHtml = f.endsWith(".html");
      if (!isHtml && !/\.(mjs|js|json|css)$/.test(f) && !/\.m?js@[\d.]+$/.test(f)) continue;
      const before = fs.readFileSync(p, "utf8");
      const after = isHtml ? cleanPage(before) : rewrite(before);
      if (after !== before) { fs.writeFileSync(p, after); n++; }
    }
  };
  walk(OUT);
  console.log(`rewrote ${n} files`);
}

(async () => {
  if (process.argv[2] === "--rewrite-only") return rewriteExisting();
  fs.mkdirSync(OUT, { recursive: true });
  const queue = [];
  const seen = new Set();
  const enqueue = (list) => { for (const u of list) if (!seen.has(u)) { seen.add(u); queue.push(u); } };
  const stats = { pages: 0, pageErrors: [], assets: 0, assetErrors: [], bytes: 0 };

  // 1) pages (pass paths on the command line to copy only those, e.g. for a test)
  const pagesList = process.argv.length > 2 ? process.argv.slice(2) : await listPages();
  let pi = 0;
  const pageWorker = async () => {
    while (pi < pagesList.length) {
      const p = pagesList[pi++];
      try {
        let res, html;
        for (let attempt = 1; attempt <= 4; attempt++) {
          res = await get(SITE + encodeURI(p));
          html = await res.text();
          if (hasContent(html) || p === "/404" || /^\/llms-txt$/.test(p)) break;
          await new Promise((r) => setTimeout(r, 1500 * attempt)); // the site occasionally returns pages without content under load
        }
        if (!res.ok && p !== "/404") throw new Error("HTTP " + res.status);
        enqueue(findAssets(html));
        const file = pageFile(p);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, cleanPage(html));
        stats.pages++;
        stats.bytes += html.length;
      } catch (e) {
        stats.pageErrors.push(p + ": " + (e.message || e));
      }
    }
  };
  await Promise.all([pageWorker(), pageWorker(), pageWorker()]);
  console.log(`pages saved: ${stats.pages}/${pagesList.length}; files found so far: ${queue.length}`);

  // 2) files (scripts are scanned for further imports and files)
  let ai = 0;
  const TEXT = /\.(mjs|js|json|css|svg)$/i;
  const assetWorker = async () => {
    while (ai < queue.length) {
      const u = queue[ai++];
      const file = localFile(u);
      try {
        if (fs.existsSync(file)) { stats.assets++; continue; }
        const res = await get(u);
        if (!res.ok) throw new Error("HTTP " + res.status);
        const buf = Buffer.from(await res.arrayBuffer());
        fs.mkdirSync(path.dirname(file), { recursive: true });
        const ctype = res.headers.get("content-type") || "";
        if (TEXT.test(new URL(u).pathname) || /javascript|json|css|svg/.test(ctype)) {
          const text = buf.toString("utf8");
          enqueue(findAssets(text, u));
          fs.writeFileSync(file, rewrite(text));
        } else {
          fs.writeFileSync(file, buf);
        }
        stats.assets++;
        stats.bytes += buf.length;
        if (stats.assets % 200 === 0) console.log(`files: ${stats.assets} downloaded, ${queue.length - ai} queued, ${(stats.bytes / 1e6).toFixed(0)} MB`);
      } catch (e) {
        stats.assetErrors.push(u + ": " + (e.message || e));
      }
    }
  };
  // keep workers alive while new files are discovered
  let idle = 0;
  while (ai < queue.length || idle < 1) {
    await Promise.all(Array.from({ length: 8 }, assetWorker));
    idle = ai >= queue.length ? idle + 1 : 0;
  }

  fs.writeFileSync(
    path.join(OUT, "mirror-info.json"),
    JSON.stringify({ source: SITE, servedFrom: ORIGIN, madeAt: new Date().toISOString(), pages: stats.pages, files: stats.assets, megabytes: Math.round(stats.bytes / 1e6), pageErrors: stats.pageErrors, fileErrors: stats.assetErrors, removed: ["Google Tag Manager", "PostHog", "Framer events", "reCAPTCHA", "Framer editor bar"], disconnected: BLOCK_HOSTS }, null, 1)
  );
  console.log(JSON.stringify({ pages: stats.pages, files: stats.assets, MB: Math.round(stats.bytes / 1e6), pageErrors: stats.pageErrors.length, fileErrors: stats.assetErrors.length, sampleErrors: stats.assetErrors.slice(0, 5).concat(stats.pageErrors.slice(0, 3)) }));
})();
