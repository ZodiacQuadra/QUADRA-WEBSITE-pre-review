// Assemble the site that runs on localhost:8081 as plain static files in ./dist, for static hosting (Vercel).
// Usage: node build_deploy.js   (Vercel runs it as the build command; see vercel.json)
//
// Locally, serve_site.js overlays live_updated/ on live_mirror/ and every copied page and script points at
// http://localhost:8081. Here the two folders are merged into dist/ and those addresses become root-relative, so the
// site works on any domain. Image sizes the pages ask for (image.jpg?scale-down-to=512) point to the size saved
// locally when there is one, otherwise to /_img/…, which vercel.json passes to Framer's public image CDN (read-only,
// as the local server does). Nothing is fetched or changed at build time; live_mirror/ and live_updated/ are only read.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const LAYERS = ["live_mirror", "live_updated"]; // later layers win, as in the local overlay
const IMAGES = path.join(ROOT, "live_mirror", "_mirror", "framerusercontent.com", "images");
const TEXT = /\.(html|js|mjs|css|json|svg|xml|txt)$/i;
const SIZE_Q = /^(scale-down-to|width|height|lossless)=/;

if (!fs.existsSync(path.join(ROOT, "live_updated", "index.html"))) {
  console.error("live_updated/ is missing: run node build_live_copy.js first.");
  process.exit(1);
}

// the sized image saved beside an original (same naming as serve_site.js)
function localVariant(name, query) {
  const ext = path.extname(name);
  const tag = query.replace(/&amp;/g, "&").split("&").filter((q) => SIZE_Q.test(q)).sort().join("_").replace(/[^\w-]/g, "-");
  if (!tag) return null;
  const file = name.slice(0, name.length - ext.length) + "." + tag + ext;
  return fs.existsSync(path.join(IMAGES, file)) ? file : null;
}

const IMG_RE = /\/_mirror\/framerusercontent\.com\/images\/([\w.-]+?\.[a-z0-9]+)\?([^"'\s,)`\\<>]+)/gi;
let images = { local: 0, cdn: 0 };
function rewrite(text, isScript) {
  // Framer's scripts resolve files against full addresses (new URL("./x.framercms", `http://localhost:8081/...`)):
  // in scripts, a template string that starts with the old origin starts with the page's own origin instead
  if (isScript) text = text.replace(/`http:\/\/localhost:8081/g, "`${globalThis.location.origin}");
  text = text.split("http://localhost:8081").join("");
  return text.replace(IMG_RE, (m, name, query) => {
    const v = localVariant(name, query);
    if (v) { images.local++; return `/_mirror/framerusercontent.com/images/${v}`; }
    images.cdn++;
    return `/_img/${name}?${query}`;
  });
}

let files = 0, rewritten = 0;
function copyTree(src, dst) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name), d = path.join(dst, entry.name);
    if (entry.isDirectory()) { fs.mkdirSync(d, { recursive: true }); copyTree(s, d); continue; }
    if (entry.name.startsWith(".generated-by-") || /\.part-/.test(entry.name)) continue;
    // Framer's CMS data is read in slices (?range=a-b,c-d), which a static host can't answer: leaving these files out
    // lets vercel.json pass those requests to Framer's public CDN, which serves the slices
    if (/\.framercms$/i.test(entry.name)) continue;
    if (TEXT.test(entry.name)) {
      const before = fs.readFileSync(s, "utf8");
      const after = rewrite(before, /\.m?js$/i.test(entry.name));
      fs.writeFileSync(d, after);
      if (after !== before) rewritten++;
    } else {
      fs.copyFileSync(s, d);
    }
    files++;
  }
}

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
for (const layer of LAYERS) copyTree(path.join(ROOT, layer), OUT);
console.log(JSON.stringify({ out: OUT, files, rewrittenTextFiles: rewritten, imageSizes: images }, null, 1));
