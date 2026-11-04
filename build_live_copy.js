// Build the updated live copy (./live_updated) from the exact offline copy (./live_mirror) and content.json.
// Pages in the content pack are rebuilt from their live page: the real <head>, navigation, hero background and
// footer are kept, the hero text is replaced, and the sections in between are rebuilt from the new content in the
// live design with the page's own live images. Every other live page is copied unchanged.
// Usage: node build_live_copy.js   then: node serve_site.js 8081 live_updated,live_mirror
// Framer is not contacted; live_mirror/ is only read.
"use strict";
const fs = require("fs");
const path = require("path");
const H = require("./framer_html");
const { PATHS } = require("./site_paths");

const ROOT = __dirname;
const MIRROR = path.join(ROOT, "live_mirror");
const OUT = path.join(ROOT, "live_updated");
const SRC = path.join(ROOT, "site_src");
const ORIGIN = "http://localhost:8081";
const LIVE = "https://www.quadrasystems.net";
const MARKER = ".generated-by-build_live_copy";

const D = JSON.parse(fs.readFileSync(path.join(ROOT, "content.json"), "utf8"));
const NAV = JSON.parse(fs.readFileSync(path.join(ROOT, "navigation.json"), "utf8"));
const pages = D.pages;
const byId = Object.fromEntries(pages.map((p) => [p.id, p]));

// ---------- inputs ----------
const mirrorFile = (p) => (p === "/" ? path.join(MIRROR, "index.html") : path.join(MIRROR, ...p.split("/").filter(Boolean), "index.html"));
const mirrorPaths = [];
(function walk(dir, rel) {
  for (const f of fs.readdirSync(dir)) {
    if (f === "_mirror") continue;
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) walk(full, rel + "/" + f);
    else if (f === "index.html") mirrorPaths.push(rel || "/");
  }
})(MIRROR, "");
const inMirror = new Set(mirrorPaths);

const LX = new Map(); // live text/images extracted read-only by extract_live.js
const lxIndex = path.join(ROOT, "live_extract", "index.json");
if (fs.existsSync(lxIndex)) {
  for (const e of JSON.parse(fs.readFileSync(lxIndex, "utf8")).pages) {
    if (e.file && e.status === 200) LX.set(e.path, JSON.parse(fs.readFileSync(path.join(ROOT, "live_extract", e.file), "utf8")));
  }
}

const isPlaceholder = (p) => /^Existing content will be retained/.test(p.intro || "");
const REBUILT = pages.filter((p) => !(isPlaceholder(p) && inMirror.has(PATHS[p.id]))); // placeholders keep the live page
const rebuiltPaths = new Set(REBUILT.map((p) => PATHS[p.id]));
const ALL = new Set([...mirrorPaths, ...rebuiltPaths]);

// ---------- small helpers ----------
const esc = H.escText;
const escA = H.escAttr;
const norm = (s) => String(s || "").replace(/\s+/g, " ").trim();
const paras = (t) => String(t || "").split(/\n\s*\n/).map(norm).filter(Boolean);
const pHtml = (t) => paras(t).map((x) => `<p>${esc(x)}</p>`).join("");
const ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const colsFor = (n) => (n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3);

// Live style: the closing phrase of a heading in orange ("Top Tier Recognition from / Industry Leaders").
function accent(t) {
  const w = norm(t).split(" ");
  if (w.length < 4) return esc(norm(t));
  const k = Math.max(1, Math.round(w.length * 0.38));
  return `${esc(w.slice(0, -k).join(" "))} <span class="q-accent">${esc(w.slice(-k).join(" "))}</span>`;
}

const pagePath = (id) => PATHS[id];
// A link from the pack: internal page id, live URL (kept local when the copy has the page) or external URL.
function target(a) {
  if (a.target && byId[a.target]) return { href: pagePath(a.target) };
  if (a.type === "open_menu" || a.type === "menu") return { href: pagePath("technology") };
  if (a.url && a.url.startsWith(LIVE)) {
    let p = decodeURI(new URL(a.url).pathname).replace(/\/+$/, "") || "/";
    if (p === "/newsroom" && /founder/i.test(a.label || "")) p = pagePath("founder");
    if (p === "/awards") p = pagePath("recognition");
    if (ALL.has(p)) return { href: p };
    return { href: a.url, external: true };
  }
  if (a.url) return { href: a.url, external: true };
  return null;
}
function btn(label, t, ghost) {
  if (!t) return `<button class="q-btn${ghost ? " q-btn-ghost" : ""}" type="button" disabled title="Preview only — not connected">${esc(label)}</button>`;
  return `<a class="q-btn${ghost ? " q-btn-ghost" : ""}" href="${escA(t.href)}"${t.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}${ARROW}</a>`;
}
function textLink(label, t) {
  if (!t) return `<span class="q-small">${esc(label)}</span>`;
  return `<a class="q-link" href="${escA(t.href)}"${t.external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)}${t.external ? " ↗" : ARROW}</a>`;
}
const actionsRow = (list) => (list && list.length ? `<div class="q-actions q-center">${list.map((a, i) => (a.type === "form" ? btn(a.label, null, i > 0) : btn(a.label || "Explore", target(a), i > 0))).join("")}</div>` : "");

// Real images from the matching live page (or its nearest live parent) for the rebuilt sections.
const localImg = (src, w = 1600) => src.replace("https://framerusercontent.com/", `${ORIGIN}/_mirror/framerusercontent.com/`) + `?scale-down-to=${w}`;
function liveImages(livePath) {
  const lp = LX.get(livePath);
  if (!lp) return [];
  const out = [];
  const seen = new Set();
  const visit = (bs) => { for (const b of bs) { if (b.t === "card") visit(b.blocks); else if (b.t === "img" && (!b.w || b.w >= 240) && !seen.has(b.src)) { seen.add(b.src); out.push(b); } } };
  lp.sections.slice(1).forEach((s) => visit(s.blocks)); // skip hero art
  return out;
}
function templateFor(p) {
  if (inMirror.has(PATHS[p.id])) return PATHS[p.id];
  let cur = p;
  while (cur.parent && byId[cur.parent]) {
    cur = byId[cur.parent];
    if (inMirror.has(PATHS[cur.id])) return PATHS[cur.id];
  }
  return "/technology/aws";
}
function imagesFor(p) {
  let imgs = liveImages(PATHS[p.id]);
  if (!imgs.length) imgs = liveImages(templateFor(p));
  return imgs;
}
const firstImage = (id) => (byId[id] ? imagesFor(byId[id])[0] : null);

function caseInfo(p) {
  const lp = LX.get(p);
  if (!lp) return null;
  const bl = lp.sections.flatMap((s) => s.blocks);
  const t = bl.findIndex((b) => b.t === "h2");
  const title = t >= 0 ? bl[t].text : lp.title;
  const industry = t >= 0 && bl[t + 1] && bl[t + 1].t === "p" && bl[t + 1].text.split(/\s+/).length <= 4 ? bl[t + 1].text : "";
  const pic = bl.find((b) => b.t === "img");
  const oi = bl.findIndex((b) => /^h[3-6]$/.test(b.t) && /^outcome$/i.test(b.text));
  const summary = oi >= 0 && bl[oi + 1] && bl[oi + 1].t === "p" ? bl[oi + 1].text : (bl.find((b) => b.t === "p" && b.text.length > 60) || {}).text || "";
  return { path: p, title, industry, pic, summary };
}

// ---------- section renderers (new content in the live design) ----------
const section = (inner, cls = "") => `<section class="q-section ${cls}"><div class="q-container">${inner}</div></section>`;
const head = (title, body, kicker) => `<div class="q-head q-reveal">${kicker ? `<span class="q-kicker">${esc(kicker)}</span>` : ""}${title ? `<h2 class="q-h2">${accent(title)}</h2>` : ""}${body ? `<div class="q-lede">${pHtml(body)}</div>` : ""}</div>`;
const checks = (list) => (list && list.length ? `<ul class="q-checks">${list.map((x) => `<li>${esc(typeof x === "string" ? x : x.text || x.body || "")}</li>`).join("")}</ul>` : "");
const closing = (t) => (t ? `<div class="q-closing q-reveal">${pHtml(t)}</div>` : "");
const imgTag = (b, w = 1600) => `<img src="${escA(localImg(b.src, w))}" alt="${escA(b.alt || "")}" loading="lazy" decoding="async">`;

// Quadra's own platforms, with the official logos from the product-logo set (site_src/logos/: a version for light and
// one for dark backgrounds, trimmed and sized; manifest.json holds their sizes). Wherever new copy names a platform,
// its logo is shown there, with no plate behind it. Max-IT and Thankz have no logo in the set, so they stay text.
const LOGOS = JSON.parse(fs.readFileSync(path.join(SRC, "logos", "manifest.json"), "utf8").replace(/^﻿/, "")); // PowerShell writes a BOM
const PRODUCTS = [
  { name: "BluForge IntelliGuard", re: /\bBluForge IntelliGuard\b/, slug: "bluforge-intelliguard", href: "/solutions/platforms-ip/bluforge" },
  { name: "BluForge", re: /\bBluForge\b(?! IntelliGuard)/, slug: "bluforge", href: "/solutions/platforms-ip/bluforge" },
  { name: "Intellient", re: /\bIntellient\b/, slug: "intellient", href: "/solutions/platforms-ip/intellient" },
  { name: "IntelliLink", re: /\bIntelliLink\b/, slug: "intellilink", href: "/solutions/platforms-ip/intellilink" },
  { name: "IntelliSphere", re: /\bIntelliSphere\b/, slug: "intellisphere", href: pagePath("aig-governance") },
  { name: "IntelliAssure", re: /\bIntelliAssure\b/, slug: "intelliassure", href: null },
  { name: "IntelliXperience", re: /\bIntelliXperience\b/, slug: "intellixperience", href: pagePath("coe") },
  { name: "Quadra AIR", re: /\bQuadra AIR\b/, slug: "quadra-air", href: null },
];
// the platforms a piece of copy names, in the order it names them
function productsIn(...texts) {
  const all = texts.map((t) => (typeof t === "string" ? t : JSON.stringify(t || ""))).join(" ");
  return PRODUCTS.map((pr) => ({ pr, at: all.search(pr.re) })).filter((x) => x.at >= 0).sort((a, b) => a.at - b.at).map((x) => x.pr);
}
// Logos look the same size when their lettering is the same height: each is sized so its wordmark letters are 16px
// (text = measured lettering height in the prepared image), within 18-56px overall. CSS scales this per place.
const logoHeight = (v) => Math.min(56, Math.max(18, Math.round((16 * v.h) / (v.text || v.h * 0.5))));
// decorative: the product name is already written next to the logo (a card titled "Intellient")
function logoHtml(pr, { link, decorative, text } = {}) {
  const light = LOGOS[pr.slug + "-on-light"], dark = LOGOS[pr.slug + "-on-dark"];
  // a BluForge service ("BluForge Pulse") links to its own live page
  const sub = pr.name === "BluForge" && (String(text || "").match(/\bBluForge (Ops|Pulse|Assist|Shield)\b/) || [])[1];
  const subPath = sub && `${pr.href}/bluforge-${sub.toLowerCase()}`;
  const href = subPath && ALL.has(subPath) ? subPath : pr.href;
  // the theme shows the version drawn for its background
  // both versions share one height (measured on the light one), so switching theme moves nothing
  const lh = logoHeight(light || dark);
  const img = (v, kind) => (v ? `<img class="q-logo-${kind}" src="/_q/logos/${pr.slug}-on-${kind}.png" width="${v.w}" height="${v.h}" style="--q-logo-h:${lh}px" alt="${decorative ? "" : escA(pr.name)}" loading="lazy" decoding="async">` : "");
  const inner = img(light, "light") + img(dark, "dark");
  return link && href ? `<a class="q-logo" href="${escA(href)}" title="${escA(sub ? "BluForge " + sub : pr.name)}">${inner}</a>` : `<span class="q-logo">${inner}</span>`;
}
const logoRow = (prods, cls = "") => (prods.length ? `<div class="q-logos${cls ? " " + cls : ""}">${prods.map((pr) => logoHtml(pr, { link: true })).join("")}</div>` : "");

// art: a card with no photo in a row of photo cards gets a quiet branded tile instead, so the row stays aligned.
// cover: the image is a 2:1 artwork with words in it (founder post covers), shown uncropped.
function card({ title, body, href, external, image, num, question, foot, tag, logos, art, cover }) {
  // a card about one of Quadra's platforms carries its logo at its foot (linked unless the card itself is a link)
  const marks = (logos || []).map((pr) => logoHtml(pr, { link: !href, decorative: norm(title).startsWith(pr.name), text: title })).join("");
  const media = image ? imgTag(image, 1024) : art ? '<span class="q-card-art" aria-hidden="true"></span>' : "";
  const inner = `${media}${tag ? `<span class="q-tag">${esc(tag)}</span>` : ""}${num && !marks ? `<span class="q-num">${esc(num)}</span>` : ""}<h3>${esc(title || "")}</h3>${question ? `<p class="q-question">${esc(question)}</p>` : ""}${pHtml(body)}${marks ? `<div class="q-logos q-card-logos">${marks}</div>` : ""}${foot ? `<span class="q-foot">${foot}</span>` : ""}`;
  const cls = `q-card${cover ? " q-cover" : ""} q-reveal`;
  if (href) return `<a class="${cls}" href="${escA(href)}"${external ? ' target="_blank" rel="noopener noreferrer"' : ""}>${inner}</a>`;
  return `<div class="${cls}">${inner}</div>`;
}

// The founder's latest published perspectives on the live site (title, date, cover artwork), newest first.
function founderPosts(n) {
  const posts = [];
  for (const [p, lp] of LX) {
    if (!/^\/foundersblog\/[^/]+$/.test(p) || !inMirror.has(p)) continue;
    const flat = [];
    const visit = (bs) => bs.forEach((b) => (b.t === "card" ? visit(b.blocks) : flat.push(b)));
    lp.sections.forEach((s) => visit(s.blocks));
    const title = flat.find((b) => b.t === "h1" || b.t === "h2");
    const date = flat.find((b) => b.t === "p" && /^[A-Z][a-z]{2} \d{1,2}, \d{4}$/.test(b.text));
    const cover = flat.filter((b) => b.t === "img")[1]; // the first image is the author's portrait
    if (title && date && cover) posts.push({ path: p, title: title.text, date: date.text, when: Date.parse(date.text), cover });
  }
  return posts.sort((a, b) => b.when - a.when).slice(0, n);
}

// "Outcomes to work toward: A, B, C, and D." -> { label, items: [A, B, C, D] } (wording kept as written)
function outcomesOf(t) {
  const m = norm(t).match(/^(Outcomes to work toward)\s*:\s*(.+?)\.?$/i);
  if (!m) return null;
  let items = m[2].split(/,\s*(?:and\s+)?/).map((x) => x.trim()).filter(Boolean);
  const last = items[items.length - 1];
  if (!/,\s*and\s/.test(m[2]) && / and /.test(last)) items = items.slice(0, -1).concat(last.slice(0, last.lastIndexOf(" and ")), last.slice(last.lastIndexOf(" and ") + 5));
  return items.length >= 2 ? { label: m[1], items } : null;
}

// a short, unpunctuated first paragraph is a subtitle ("Turn Operational Exceptions into Faster Resolutions")
const isLead = (x) => x.length < 100 && !/[.!?:;]$/.test(x);
function bodyHtml(t) { const ps = paras(t); return ps.map((x, n) => `<p${n === 0 && ps.length > 1 && isLead(x) ? ' class="q-lead"' : ""}>${esc(x)}</p>`).join(""); }

function renderSection(s, i, imgs, state) {
  if (s.cards && s.cards.length) {
    // numbers drop out where some cards carry a product logo, so every title starts on the same line;
    // where every card is a platform with its logo, the logo is the visual (no borrowed photo)
    const anyLogo = s.cards.some((c) => productsIn(c.title, c.body).length);
    const allLogo = s.cards.every((c) => productsIn(c.title, c.body).length);
    const withImgs = !allLogo && s.cards.every((c) => c.target && byId[c.target] && firstImage(c.target));
    const anyLinked = s.cards.some((c) => c.target && byId[c.target]);
    const cards = s.cards
      .map((c, n) => {
        const linked = c.target && byId[c.target];
        return card({
          title: c.title,
          body: c.body,
          href: linked ? pagePath(c.target) : null,
          image: withImgs ? firstImage(c.target) : null,
          num: withImgs || anyLogo ? null : String(n + 1).padStart(2, "0"),
          foot: linked ? `<span class="q-link">Explore${ARROW}</span>` : anyLinked ? `<span class="q-link q-foot-spacer" aria-hidden="true">Explore${ARROW}</span>` : "",
          logos: productsIn(c.title, c.body),
        });
      })
      .join("");
    return section(`${head(s.heading, s.body)}${logoRow(productsIn(s.heading, s.body), "q-center q-head-logos")}${checks(s.bullets)}<div class="q-grid q-cols-${colsFor(s.cards.length)}">${cards}</div>${closing(s.closing_body)}`, state.band++ % 2 ? "q-band" : "");
  }
  const image = imgs[state.img] || null;
  if (image) state.img++;
  const flip = state.split++ % 2 === 1;
  // the section names one of Quadra's platforms: its logo follows the copy
  const marks = logoRow(productsIn(s.heading, s.body, s.bullets));
  const copy = `<div class="q-copy q-reveal"><span class="q-kicker">${String(i + 1).padStart(2, "0")}</span><h2 class="q-h2">${accent(s.heading)}</h2><div class="q-body">${bodyHtml(s.body)}${checks(s.bullets)}${marks}${closing(s.closing_body)}</div></div>`;
  if (image) return section(`<div class="q-split${flip ? " q-flip" : ""}">${copy}<div class="q-media q-reveal">${imgTag(image)}</div></div>`);
  // no live photo left for this section: its own outcomes list becomes the visual in the image slot
  const out = outcomesOf(s.closing_body);
  if (out) {
    const lead = `<div class="q-copy q-reveal"><span class="q-kicker">${String(i + 1).padStart(2, "0")}</span><h2 class="q-h2">${accent(s.heading)}</h2><div class="q-body">${bodyHtml(s.body)}${checks(s.bullets)}${marks}</div></div>`;
    const panel = `<div class="q-media q-outcomes q-reveal"><div class="q-outcomes-card"><span class="q-outcomes-label">${esc(out.label)}</span><ul>${out.items.map((x) => `<li>${esc(x)}</li>`).join("")}</ul></div></div>`;
    return section(`<div class="q-split${flip ? " q-flip" : ""}">${lead}${panel}</div>`);
  }
  return section(`<div class="q-split q-noimg"><div class="q-copy q-reveal"><span class="q-kicker">${String(i + 1).padStart(2, "0")}</span><h2 class="q-h2">${accent(s.heading)}</h2></div><div class="q-body q-reveal">${bodyHtml(s.body)}${checks(s.bullets)}${marks}${closing(s.closing_body)}</div></div>`);
}

function ctaBand(heading, body, actionsHtml) {
  return section(`<div class="q-cta-card q-reveal"><h2 class="q-h2">${accent(heading)}</h2>${body ? `<div class="q-lede">${pHtml(body)}</div>` : ""}${actionsHtml}</div>`);
}

function renderGeneric(p, hero) {
  const imgs = imagesFor(p);
  const state = { img: 0, split: 0, band: 0 };
  const out = [];
  if (hero.rest.length) out.push(`<section class="q-section q-intro"><div class="q-container q-reveal">${hero.rest.map((x) => `<p>${esc(x)}</p>`).join("")}</div></section>`);
  if (p.stage === "release_gated") out.push(section(`<p class="q-gate">Internal review only. The 21-year statement remains conditional on the public award announcement; no launch approval is implied.</p>`));
  (p.sections || []).forEach((s, i) => out.push(renderSection(s, i, imgs, state)));
  if (p.id === "contact") {
    out.push(section(`<div class="q-panel q-reveal"><p class="q-note">Contact form preview · no submission or data collection</p><div class="q-filters" style="grid-template-columns:1fr 1fr"><label class="q-field">Name<input disabled></label><label class="q-field">Work email<input type="email" disabled></label></div><label class="q-field">What would you like to achieve?<textarea rows="4" disabled></textarea></label><button class="q-btn" type="button" disabled>Start a Conversation</button></div>`));
  }
  const children = pages.filter((q) => q.parent === p.id);
  if (children.length) {
    const withImgs = children.every((c) => firstImage(c.id));
    out.push(
      `<section class="q-section q-band" id="explore"><div class="q-container">${head("Explore this area")}<div class="q-grid q-cols-${colsFor(children.length)}">${children
        .map((c, n) => card({ title: c.title, body: c.intro, href: pagePath(c.id), image: withImgs ? firstImage(c.id) : null, num: withImgs ? null : String(n + 1).padStart(2, "0"), foot: `<span class="q-link">Explore${ARROW}</span>`, logos: productsIn(c.title, c.intro) }))
        .join("")}</div></div></section>`
    );
  }
  const rel = (p.related || []).filter((id) => byId[id] && id !== p.id);
  if (rel.length) out.push(section(`${head("Connected expertise")}<div class="q-chips q-reveal">${rel.map((id) => `<a class="q-chip" href="${escA(pagePath(id))}">${esc(byId[id].title)}${ARROW}</a>`).join("")}</div>`));
  // the closing call to action is returned separately so restored live sections can sit before it
  const end = p.cta && p.id !== "contact" ? ctaBand(p.cta_heading || p.cta.label || "Talk to an Architect", p.cta_body, `<div class="q-actions q-center">${btn(p.cta.label || "Talk to an Architect", { href: pagePath(p.cta.target || "contact") })}</div>`) : "";
  return { main: out.join("\n"), end };
}

function renderModule(m, p) {
  const f = m.fields || {};
  const items = m.items || [];
  switch (m.kind) {
    case "hero":
    case "footer":
      return "";
    case "recognition":
      return section(`<div class="q-head q-reveal" style="margin-bottom:0"><h2 class="q-h2 q-accent">${esc(f.heading)}</h2>${f.body ? `<div class="q-lede">${pHtml(f.body)}</div>` : ""}${actionsRow(m.actions)}</div>`);
    case "compass":
      return section(`${head(f.heading, f.body)}<div class="q-compass-stage q-reveal">${chatHtml("inline")}</div>`, "q-band q-compass-section");
    case "routes":
      return section(`${head(f.heading, f.body)}<div class="q-grid q-cols-${colsFor(items.length)}">${items
        .map((i) => {
          const a = (i.actions || [])[0];
          const t = a ? target(a) : null;
          const id = t && !t.external ? Object.keys(PATHS).find((k) => PATHS[k] === t.href) : null;
          return card({ title: i.fields.heading, question: i.fields.question, body: i.fields.body, href: t && t.href, external: t && t.external, image: id ? firstImage(id) : null, foot: a ? `<span class="q-link">${esc(a.label)}${ARROW}</span>` : "" });
        })
        .join("")}</div>${actionsRow(m.actions)}`);
    case "proposition":
      return section(`${head(f.heading, f.body)}${actionsRow(m.actions)}`);
    case "perspectives": {
      // the invitation to read the founder's perspectives shows the three latest ones from the live site
      const posts = founderPosts(3);
      const grid = posts.length
        ? `<div class="q-grid q-cols-3">${posts.map((x) => card({ title: x.title, href: x.path, image: { src: x.cover.src, alt: "" }, tag: x.date, cover: true, foot: `<span class="q-link">Read${ARROW}</span>` })).join("")}</div>`
        : "";
      return section(`${head(f.heading, f.body)}${grid}${actionsRow(m.actions)}`, "q-band");
    }
    case "expertise_strip":
      return section(`${head(f.heading)}<div class="q-chips q-reveal">${String(f.body || "").split(/\s+·\s+/).map((c) => `<span class="q-chip">${esc(c.trim())}</span>`).join("")}</div>${actionsRow(m.actions)}`);
    case "proof":
      return section(`${head(f.heading, f.body)}<div class="q-grid q-cols-${colsFor(items.length)}">${items
        .map((i) => {
          const a = (i.actions || [])[0];
          const t = a ? target(a) : null;
          const ci = t && !t.external ? caseInfo(t.href) : null;
          return card({ title: i.fields.heading, body: i.fields.body, href: t && t.href, external: t && t.external, image: ci && ci.pic, art: !!ci && !ci.pic, tag: ci && ci.industry, foot: a ? `<span class="q-link">${esc(a.label)}${ARROW}</span>` : "" });
        })
        .join("")}</div>${actionsRow(m.actions)}`, "q-band");
    case "call_to_action":
    case "contact_cta":
      return ctaBand(f.heading, f.body, actionsRow(m.actions));
    case "newsletter":
      return section(`<div class="q-panel q-reveal" style="text-align:center"><h2 class="q-h2" style="font-size:clamp(28px,3vw,40px)">${accent(f.heading)}</h2>${f.body ? `<div class="q-lede">${pHtml(f.body)}</div>` : ""}<p class="q-note" style="justify-content:center;margin-top:22px">Newsletter preview · no information collected</p><div class="q-row"><input class="q-input" type="email" disabled placeholder="${escA(f.email_label || "Email address")}" aria-label="${escA(f.email_label || "Email address")}">${(m.actions || []).map((a) => btn(a.label, null)).join("")}</div></div>`);
    case "collection_controls":
      return section(`${head(f.heading, f.body)}<div class="q-panel q-reveal" style="max-width:none"><p class="q-note">Filter and search preview · not connected to the case library</p><div class="q-filters"><label class="q-field">${esc(f.search_label)}<input disabled placeholder="${escA(f.search_placeholder)}"></label><label class="q-field">${esc(f.industry_label)}<select disabled><option>${esc(f.industry_default)}</option></select></label><label class="q-field">${esc(f.priority_label)}<select disabled><option>${esc(f.priority_default)}</option>${items.map((i) => `<option>${esc(i.fields.label)}</option>`).join("")}</select></label><button class="q-btn q-btn-ghost" type="button" disabled style="margin-bottom:16px">${esc(f.clear_filters)}</button></div></div>`);
    case "existing_case_collection": {
      const samples = (p.existing_case_sample || []).map((c) => {
        const t = target({ url: c.url });
        const ci = t && !t.external ? caseInfo(t.href) : null;
        return card({ title: c.title, body: c.body, href: t && t.href, external: t && t.external, image: ci && ci.pic, art: !(ci && ci.pic), tag: ci && ci.industry, foot: `<span class="q-link">${esc(f.card_cta || "Read the Case Study")}${ARROW}</span>` });
      });
      const all = mirrorPaths.filter((x) => /^\/happy\/[^/]+$/.test(x)).map(caseInfo).filter(Boolean).sort((a, b) => a.title.localeCompare(b.title));
      return (
        section(`<p class="q-note" style="justify-content:center">Representative existing cases · original titles and summaries retained</p><div class="q-grid q-cols-${colsFor(samples.length)}">${samples.join("")}</div>${actionsRow(m.actions)}`) +
        section(`${head((f.results_plural || "{count} case studies").replace("{count}", all.length))}<div class="q-grid q-cols-3">${all
          .map((c) => card({ title: c.title, body: c.summary, href: c.path, image: c.pic, art: !c.pic, tag: c.industry, foot: `<span class="q-link">${esc(f.card_cta || "Read the Case Study")}${ARROW}</span>` }))
          .join("")}</div>`, "q-band")
      );
    }
    case "solution_links":
      return section(`${head(f.heading, f.body)}<div class="q-chips q-reveal">${(m.actions || []).map((a) => { const t = target(a); return t ? `<a class="q-chip" href="${escA(t.href)}">${esc(a.label)}${ARROW}</a>` : `<span class="q-chip">${esc(a.label)}</span>`; }).join("")}</div>`);
    default:
      return section(`${head(f.heading, f.body)}${actionsRow(m.actions)}`);
  }
}

// ---------- hero text from the pack ----------
function heroFor(p) {
  if (p.kind === "approved_modules") {
    const h = p.modules.find((m) => m.kind === "hero") || { fields: {}, actions: [] };
    const ps = paras(h.fields.body);
    return { eyebrow: h.fields.eyebrow || "", title: h.fields.heading || p.title, intro: ps[0] || "", rest: ps.slice(1), actions: (h.actions || []).map((a) => ({ label: a.label, t: target(a) })) };
  }
  const parent = p.parent && byId[p.parent];
  // the pack's eyebrow where it has one; otherwise the page's name (or its parent's, when the name is the heading)
  const eyebrow = p.eyebrow || (norm(p.title) !== norm(p.heading) ? p.title : parent ? parent.title : "");
  const ip = paras(p.intro);
  let intro, rest;
  if (p.subheading) { intro = p.subheading; rest = (p.lead ? [p.lead] : []).concat(ip); }
  else if (p.lead) { intro = p.lead; rest = ip; }
  else { intro = ip[0] || ""; rest = ip.slice(1); }
  const actions = [];
  if (p.cta && p.id !== "contact") actions.push({ label: p.cta.label || "Talk to an Architect", t: { href: pagePath(p.cta.target || "contact") } });
  if (pages.some((q) => q.parent === p.id)) actions.push({ label: "Explore this area", t: { href: "#explore" } });
  return { eyebrow, kicker: !!p.eyebrow, title: p.heading || p.title, intro, rest, actions };
}

// Which texts in the live hero are the eyebrow, title, intro and buttons (from the desktop extraction).
function heroRoles(tpl) {
  const lp = LX.get(tpl);
  if (!lp) return null;
  let si = lp.sections.findIndex((s) => s.blocks.some((b) => b.t === "h1"));
  let lvl = "h1";
  if (si < 0) { si = lp.sections.findIndex((s) => s.blocks.some((b) => b.t === "h2")); lvl = "h2"; }
  if (si < 0) return null;
  const bl = lp.sections[si].blocks;
  const t = bl.findIndex((b) => b.t === lvl);
  const eyebrow = bl.slice(0, t).filter((b) => (/^h[1-6]$/.test(b.t) || b.t === "p") && b.text.length < 90).map((b) => b.text);
  let k = t;
  const title = [];
  while (k < bl.length && bl[k].t === lvl) title.push(bl[k++].text);
  // small lines (h5/h6 taglines) may sit between the title and the intro paragraph
  while (k < bl.length && /^h[56]$/.test(bl[k].t)) k++;
  const intro = [];
  while (k < bl.length && bl[k].t === "p") intro.push(bl[k++].text);
  const links = bl.filter((b) => b.t === "link").map((b) => b.text);
  return { eyebrow, title, intro, links };
}

// ---------- editing the live markup ----------
function setText(node, str) {
  const fill = H.find(node, (n) => n.tag === "span" && "data-text-fill" in n.attrs);
  node.children = fill ? [{ tag: "span", attrs: { ...fill.attrs }, children: [H.textNode(str)] }] : [H.textNode(str)];
}
const parentMap = (rootNode) => { const m = new Map(); H.walk(rootNode, (n, par) => { if (par) m.set(n, par); }); return m; };
const ancestors = (n, pm) => { const out = []; for (let c = pm.get(n); c; c = pm.get(c)) out.push(c); return out; };
const container = (a, pm) => { const par = pm.get(a); return par && /-container\b/.test(par.attrs.class || "") ? par : a; };

function rewriteHero(heroNode, roles, hero) {
  const pm = parentMap(heroNode);
  // a live title made of a small line over a large one ("Real Results" / "Customer Success Stories"):
  // the large line is the title slot, the small one the eyebrow slot
  if (roles.title.length > 1) {
    const size = (t) => { const n = H.find(heroNode, (x) => /^h[1-6]$/.test(x.tag) && H.text(x) === t); return n ? +((n.attrs.style || "").match(/--framer-font-size:\s*([\d.]+)px/) || [0, 0])[1] : 0; };
    const last = roles.title[roles.title.length - 1];
    if (size(last) > size(roles.title[0])) roles = { ...roles, eyebrow: roles.title.slice(0, -1).concat(roles.eyebrow), title: [last] };
  }
  const kept = new Set();
  const drop = [];
  const introNodes = [];
  const titleNodes = [];
  const eyebrowNodes = [];
  const inLink = (n) => ancestors(n, pm).some((a) => a.tag === "a");
  for (const { node } of H.findAll(heroNode, (n) => /^(h[1-6]|p)$/.test(n.tag))) {
    if (inLink(node)) continue;
    const t = H.text(node);
    if (!t) continue;
    // roles are marked so q.js can fit the live boxes to the new (often longer) copy
    if (t === roles.eyebrow[0]) { if (hero.eyebrow) { setText(node, hero.eyebrow); kept.add(node); eyebrowNodes.push(node); node.attrs["data-q-eyebrow"] = ""; if (hero.kicker) node.attrs["data-q-kicker"] = ""; } else drop.push(node); }
    else if (t === roles.title[0]) { setText(node, hero.title); kept.add(node); titleNodes.push(node); node.attrs["data-q-title"] = ""; }
    else if (t === roles.intro[0]) { if (hero.intro) { setText(node, hero.intro); kept.add(node); introNodes.push(node); node.attrs["data-q-intro"] = ""; } else drop.push(node); }
    else if (roles.eyebrow.includes(t) || roles.title.includes(t) || roles.intro.includes(t)) drop.push(node);
    else drop.push({ unmapped: node });
  }
  // buttons: the live hero's buttons carry the pack's actions; extras are cloned, unused ones removed.
  // A button label seen only on another breakpoint (e.g. a shorter phone label) is the same first button.
  const isButton = (n) => n.tag === "a" && H.text(n) && H.find(n, (x) => x.tag === "p");
  const slot = (a) => { const i = roles.links.indexOf(H.text(a)); return i >= 0 ? i : 0; };
  const anchors = roles.links.length ? H.findAll(heroNode, isButton).map((x) => x.node) : [];
  const firsts = anchors.filter((a) => slot(a) === 0);
  for (const a of anchors) {
    const i = slot(a);
    const act = hero.actions[i];
    if (!act) { drop.push(container(a, pm)); continue; }
    applyButton(a, act);
    // the first action is the solid orange pill; any further one is its orange outline version (q.css)
    if (i > 0) a.attrs["data-q-secondary"] = "";
    kept.add(a);
  }
  if (roles.links.length && hero.actions.length > roles.links.length) {
    for (const a of firsts) {
      const box = container(a, pm);
      const par = pm.get(box);
      if (!par) continue;
      let at = par.children.indexOf(box);
      for (const act of hero.actions.slice(roles.links.length)) {
        const copy = H.clone(box);
        H.walk(copy, (n) => { if (H.isEl(n)) delete n.attrs.id; }); // a copied id would appear twice on the page
        const ca = copy.tag === "a" ? copy : H.find(copy, (n) => n.tag === "a");
        applyButton(ca, act);
        ca.attrs["data-q-secondary"] = "";
        par.children.splice(++at, 0, copy);
      }
    }
  }
  if (!roles.links.length && hero.actions.length) {
    const html = `<div class="q-hero-actions">${hero.actions.map((a, i) => btn(a.label, a.t, i > 0)).join("")}</div>`;
    for (const n of introNodes.length ? introNodes : titleNodes) {
      const par = pm.get(n);
      if (par) par.children.splice(par.children.indexOf(n) + 1, 0, H.htmlNode(html));
    }
  }
  // the hero names one of Quadra's platforms: its logo sits above the eyebrow (or the title)
  if (hero.logos) {
    for (const n of eyebrowNodes.length ? eyebrowNodes : titleNodes) {
      const par = pm.get(n);
      if (par) { const box = H.htmlNode(`<div class="q-hero-logos">${hero.logos}</div>`); par.children.splice(par.children.indexOf(n), 0, box); kept.add(box); }
    }
  }
  // remove leftover live text; an unmapped line takes its whole block with it (e.g. a logo strip and its label)
  const keepAnc = new Set();
  for (const k of kept) for (const a of ancestors(k, pm)) keepAnc.add(a);
  for (const d of drop) {
    let n = d.unmapped || d;
    if (d.unmapped) {
      for (const a of ancestors(n, pm)) { if (a === heroNode || keepAnc.has(a)) break; n = a; }
      // a logo strip ("Trusted by Business Leaders" + client logos) is design, not old copy: keep it
      if (H.findAll(n, (x) => x.tag === "img").length >= 3 && H.text(n).length < 120) continue;
    }
    H.remove(n, pm.get(n));
  }
  return { title: titleNodes.length > 0, intro: introNodes.length > 0 };
}
function applyButton(a, act) {
  const label = H.find(a, (n) => n.tag === "p") || a;
  setText(label, act.label);
  if (act.t) { a.attrs.href = act.t.href; if (act.t.external) { a.attrs.target = "_blank"; a.attrs.rel = "noopener noreferrer"; } }
}

function stripFramerRuntime(doc) {
  for (const { node, parent } of H.findAll(doc, (n) => n.tag === "script" || n.tag === "link")) {
    const a = node.attrs;
    const drop =
      (node.tag === "script" && (a.type === "module" || a.type === "framer/appear" || "data-framer-appear-animation" in a || /^\s*var animator/.test(node.raw || ""))) ||
      (node.tag === "link" && a.rel === "modulepreload");
    if (drop) H.remove(node, parent);
  }
  // elements waiting for Framer's entrance animation start invisible (opacity 0 / 0.001, often with a slide); show them.
  // The hero's "Highlighted Text" waits half-faded and shrunk (opacity 0.5, translateX(-5px) scale(0.9)): same fix.
  H.walk(doc, (n) => {
    if (!H.isEl(n) || !n.attrs.style) return;
    const st = n.attrs.style;
    const op = (st.match(/(?:^|;)\s*opacity:\s*([\d.]+)/) || [])[1];
    const moved = /(?:^|;)\s*transform:\s*(?!none)[a-z]/.test(st);
    const waiting = /opacity:\s*0\.001/.test(st) || (/opacity:\s*0(;|$)/.test(st) && (/will-change|transform/.test(st) || "data-framer-appear-id" in n.attrs)) || (op !== undefined && +op < 1 && moved);
    if (!waiting) return;
    n.attrs.style = st.split(";").filter((d) => d.trim() && !/^\s*(opacity|transform|filter|will-change)\s*:/.test(d)).join(";");
  });
}
function absolutizeLinks(doc, fromPath) {
  for (const { node } of H.findAll(doc, (n) => n.tag === "a" && n.attrs.href)) {
    const h = node.attrs.href;
    if (/^(#|https?:|mailto:|tel:|data:|\/)/.test(h)) continue;
    const u = new URL(h, "http://x" + (fromPath === "/" ? "/" : fromPath));
    node.attrs.href = (decodeURI(u.pathname).replace(/\/+$/, "") || "/") + u.search + u.hash;
  }
}
function relabelNav(doc) {
  const insights = NAV.header.find((n) => n.page === "insights");
  for (const { node: navEl } of H.findAll(doc, (n) => n.tag === "nav")) {
    for (const { node: a } of H.findAll(navEl, (n) => n.tag === "a")) {
      const t = H.text(a);
      const label = H.find(a, (n) => n.tag === "p");
      if (t === "Newsroom" && insights && label) { setText(label, insights.label); a.attrs.href = pagePath("insights"); }
      if (t === "Contact Us" && label) { setText(label, NAV.cta.label); a.attrs.href = pagePath(NAV.cta.page); }
      // Framer draws the theme icon with its script; without it the switch is empty, so draw it here
      if (a.attrs["aria-label"] === "Theme switch" && !H.text(a) && !H.find(a, (n) => n.tag === "svg")) a.children = [H.htmlNode(THEME_ICONS)];
    }
  }
}
const THEME_ICONS =
  '<svg class="q-moon" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>' +
  '<svg class="q-sun" viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
function setMeta(doc, title, description) {
  const t = H.find(doc, (n) => n.tag === "title");
  if (t) t.children = [H.textNode(title)];
  for (const { node } of H.findAll(doc, (n) => n.tag === "meta")) {
    const k = node.attrs.name || node.attrs.property;
    if (/^(og:title|twitter:title)$/.test(k)) node.attrs.content = title;
    if (/^(description|og:description|twitter:description)$/.test(k) && description) node.attrs.content = description;
  }
}

function themeBlock(html) {
  const dark = (html.match(/@media\s*\(prefers-color-scheme:\s*dark\)\s*\{\s*body\s*\{([^}]*)\}/) || [])[1] || "";
  const light = (html.match(/(?:^|[};])\s*body\s*\{(--token-[^}]*)\}/) || [])[1] || "";
  // q-js: content fades in on scroll only while q.js is running; if it hasn't started within 4s, everything shows
  return `<script>(function(){var d=document.documentElement,t="dark";try{if(localStorage.getItem("theme")==="Light")t="light"}catch(e){}d.setAttribute("data-q-theme",t);d.classList.add("q-js");setTimeout(function(){if(!window.Q_REVEAL)d.classList.remove("q-js")},4000)})()</script>
<style id="q-theme">html[data-q-theme="dark"] body{${dark}}html[data-q-theme="light"] body{${light}}</style>
<link rel="stylesheet" href="/_q/q.css">`;
}

function menusHtml(currentPath) {
  const link = (label, id, sub) => `<li><a class="q-ml${sub ? " q-sub" : ""}" href="${escA(pagePath(id))}"${pagePath(id) === currentPath ? ' aria-current="page"' : ""}>${esc(label.replace(/^↳\s*/, ""))}</a></li>`;
  const groups = (n) => `<div class="q-menu-grid">${n.groups.map((g) => `<div><h4>${esc(g.title)}</h4><ul>${g.links.map(([l, id]) => link(l, id, l.startsWith("↳"))).join("")}</ul></div>`).join("")}</div>`;
  const desktop = NAV.header.filter((n) => n.groups).map((n) => `<div class="q-menu" data-q-label="${escA(n.label)}"><div class="q-menu-top"><a href="${escA(pagePath(n.page))}">Explore ${esc(n.label)}</a></div>${groups(n)}</div>`).join("");
  const mobile = `<div class="q-mobile" role="dialog" aria-label="Menu"><button class="q-mobile-close" type="button" aria-label="Close menu">×</button>${NAV.header
    .map((n) => (n.groups ? `<details><summary>${esc(n.label)}</summary><a class="q-ml" href="${escA(pagePath(n.page))}" style="display:block;padding:0 4px 12px">Explore ${esc(n.label)}</a>${groups(n)}</details>` : `<a href="${escA(pagePath(n.page))}">${esc(n.label)}</a>`))
    .join("")}${btn(NAV.cta.label, { href: pagePath(NAV.cta.page) })}</div>`;
  return desktop + mobile;
}

function pageRoot(doc) {
  const main = H.find(doc, (n) => n.attrs && n.attrs.id === "main");
  if (!main) return null;
  const kids = (n) => (n.children || []).filter((c) => H.isEl(c) && c.raw === undefined && H.text(c));
  let r = main;
  for (let i = 0; i < 8 && kids(r).length === 1; i++) r = kids(r)[0];
  return r;
}

// ---------- The Compass: chat interface (answers come from this copy's own pages, see site_src/compass.js) ----------
const COMPASS = (() => {
  const m = (byId.home && byId.home.modules || []).find((x) => x.kind === "compass");
  if (!m) return null;
  const f = m.fields || {};
  return {
    heading: f.heading, intro: f.body, inputLabel: f.input_label, placeholder: f.placeholder, submit: f.submit_label,
    starterLabel: f.starter_label, privacy: f.privacy_helper, loading: f.loading, answerLabel: f.answer_label, sourceLabel: f.source_label, fallback: f.fallback,
    starters: (m.items || []).map((i) => i.fields.question).filter(Boolean),
    actions: (m.actions || []).map((a) => ({ label: a.label, href: (target(a) || {}).href })).filter((a) => a.href),
    index: "/_q/compass-index.json",
  };
})();
// the live site's own Compass icon: the four-point star on its "The Compass" button (home page)
const COMPASS_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z"/><path d="M20 2v4"/><path d="M22 4h-4"/><circle cx="4" cy="20" r="2"/></svg>';
if (COMPASS) {
  COMPASS.icon = COMPASS_ICON; // compass.js draws new bot messages with the same icon
  COMPASS.products = PRODUCTS.map((pr) => ({ name: pr.name, html: logoHtml(pr, { link: true }) })); // logos for answers naming a platform
}
const SEND_ICON = '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
function chatHtml(mode) {
  if (!COMPASS) return "";
  const c = COMPASS;
  const id = "q-chat-" + mode;
  return `<div class="q-chat q-chat-${mode}" data-q-chat="${mode}">
  <div class="q-chat-head"><span class="q-chat-avatar">${COMPASS_ICON}</span><div class="q-chat-title"><b>${esc(c.heading)}</b><span class="q-chat-status"><i></i>Local preview · answers from this site's pages</span></div>
    <button class="q-chat-new" type="button" title="Start a new chat" aria-label="Start a new chat"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg></button>${mode === "pop" ? '<button class="q-chat-close" type="button" aria-label="Close The Compass">×</button>' : ""}</div>
  <div class="q-chat-log" role="log" aria-live="polite" aria-label="Conversation with ${escA(c.heading)}">
    <div class="q-msg q-bot"><span class="q-msg-av">${COMPASS_ICON}</span><div class="q-bubble"><p>${esc(c.intro)}</p></div></div>
    <div class="q-starter-block"><span class="q-starter-label">${esc(c.starterLabel || "Try a question")}</span><div class="q-starter-list">${c.starters.map((s) => `<button type="button" class="q-starter">${esc(s)}</button>`).join("")}</div></div>
  </div>
  <form class="q-chat-form" autocomplete="off"><label class="q-sr" for="${id}">${esc(c.inputLabel)}</label><textarea id="${id}" rows="1" placeholder="${escA(c.placeholder)}" maxlength="400"></textarea><button class="q-chat-send" type="submit" aria-label="${escA(c.submit)}" title="${escA(c.submit)}">${SEND_ICON}</button></form>
  <p class="q-chat-foot">${esc(c.privacy)}</p>
</div>`;
}
const launcherHtml = () => (COMPASS ? `<button class="q-launch" type="button" aria-haspopup="dialog" aria-label="Open ${escA(COMPASS.heading)}"><span class="q-launch-orb">${COMPASS_ICON}</span><span>${esc(COMPASS.heading)}</span></button><div class="q-chat-pop" role="dialog" aria-label="${escA(COMPASS.heading)}" hidden>${chatHtml("pop")}</div>` : "");

// Search index for The Compass: the new content of every rebuilt page, plus the existing case studies.
function compassIndex() {
  const docs = [];
  for (const p of REBUILT) {
    if (isPlaceholder(p)) continue;
    const x = [];
    const push = (h, t) => paras(t).forEach((s) => x.push([h || "", s]));
    push(p.heading, p.intro);
    push(p.heading, p.subheading);
    push(p.heading, p.lead);
    for (const s of p.sections || []) {
      push(s.heading, s.body);
      (s.bullets || []).forEach((b) => push(s.heading, typeof b === "string" ? b : b.text));
      (s.cards || []).forEach((c) => push(c.title, c.body));
      push(s.heading, s.closing_body);
    }
    for (const m of p.modules || []) {
      if (m.kind === "compass" || m.kind === "footer") continue;
      push(m.fields && m.fields.heading, m.fields && m.fields.body);
      (m.items || []).forEach((i) => push(i.fields.heading, [i.fields.question, i.fields.body].filter(Boolean).join("\n\n")));
    }
    if (x.length) docs.push({ t: p.title, u: PATHS[p.id], k: "page", x });
  }
  for (const mp of mirrorPaths.filter((q) => /^\/happy\/[^/]+$/.test(q))) {
    const ci = caseInfo(mp);
    if (ci && ci.summary) docs.push({ t: ci.title, u: ci.path, k: "case", tag: ci.industry, x: [[ci.industry || "Case study", ci.summary]] });
  }
  return { built: new Date().toISOString(), docs };
}

// Dropped live sections worth restoring (placed after the new sections, before the closing call to action):
// customer-proof highlights (a case study's results), logo/award walls with little text, office addresses.
const STAT_RE = /^[₹$]?[\d.,]+\s?(%|x|X|\+|K|M|Mn|Cr|hrs?|days?)?\+?%?$/;
function restoreReason(sec) {
  const t = H.text(sec);
  const visual = H.findAll(sec, (n) => n.tag === "img").length + H.findAll(sec, (n) => n.attrs["data-framer-component-type"] === "SVG").length;
  const stats = H.findAll(sec, (n) => /^h[1-6]$/.test(n.tag) && STAT_RE.test(H.text(n))).length;
  const longP = H.findAll(sec, (n) => n.tag === "p" && H.text(n).length > 250).length;
  if (stats >= 2 && t.length < 1600) return "customer proof";
  if (visual >= 6 && t.length < 700 && !longP) return "logos";
  if (/Our Offices/.test(t)) return "offices";
  return null;
}

// Live sections kept on a rebuilt page (design the pack has no replacement for, or that carries a pack module).
// module: the pack module whose copy goes into the live section; null keeps the section as it is.
const LIVE_KEEP = {
  home: [
    { name: "recognition card", match: (c) => /Consecutive Years of/.test(H.text(c)) && !H.find(c, (n) => n.tag === "h1"), module: "recognition" },
    { name: "partner logos", match: (c) => H.text(c) === "Top Tier Recognition from Industry Leaders", module: null },
  ],
};

// Framer's logo ticker is laid out and moved by its script: show it and let CSS scroll a doubled row instead.
function fixTickers(node) {
  const pm = parentMap(node);
  for (const { node: ul } of H.findAll(node, (n) => n.tag === "ul" && /list-style-type:none/.test(n.attrs.style || "") && /will-change:transform/.test(n.attrs.style || ""))) {
    const box = pm.get(ul);
    if (box && box.attrs.style) box.attrs.style = box.attrs.style.replace(/(^|;)\s*opacity:\s*0(?=;|$)/, "$1");
    const gap = ((ul.attrs.style.match(/gap:\s*(\d+)px/) || [])[1] || "60") + "px";
    ul.attrs.style = ul.attrs.style.replace(/transform:[^;]*;?/, "").replace(/gap:\s*\d+px/, "gap:0");
    ul.attrs.class = ((ul.attrs.class || "") + " q-ticker").trim();
    const items = ul.children.filter((c) => c.tag === "li");
    for (const li of items) li.attrs.style = `padding-right:${gap}`;
    ul.children.push(...items.map((li) => ({ ...H.clone(li), attrs: { ...li.attrs, "aria-hidden": "true" } })));
  }
}
// The live globe (cobe, inside Framer's Globe module) can be run directly; the page gets its location.
const GLOBE_MODULE = (() => {
  const sites = path.join(MIRROR, "_mirror", "framerusercontent.com", "sites");
  if (!fs.existsSync(sites)) return null;
  for (const id of fs.readdirSync(sites)) {
    const f = fs.readdirSync(path.join(sites, id)).find((x) => /^Globe\.[\w-]+\.mjs$/.test(x));
    if (f) return `/_mirror/framerusercontent.com/sites/${id}/${f}`;
  }
  return null;
})();

// Live two-tone heading: <span>first line</span><span><br></span>orange second line
function setTwoTone(h, str) {
  const words = norm(str).split(" ");
  const k = words.length >= 4 ? Math.max(1, Math.round(words.length * 0.4)) : 0;
  const spans = h.children.filter((c) => c.tag === "span");
  const tails = h.children.filter((c) => c.tag === "#text" && H.decode(c.raw).trim());
  const firstSpan = spans.find((s) => H.text(s));
  if (k && firstSpan && tails.length) {
    firstSpan.children = [H.textNode(words.slice(0, -k).join(" "))];
    tails.forEach((t) => (t.raw = ""));
    tails[tails.length - 1].raw = H.escText(words.slice(-k).join(" "));
    h.children = h.children.filter((c) => !(c.tag === "span" && c !== firstSpan && H.text(c)));
    return;
  }
  setText(h, str);
}

// Put a pack module's copy into a kept live section: heading, body, button; short labels (badges) stay.
function rewriteLiveBlock(node, m) {
  const pm = parentMap(node);
  const f = m.fields || {};
  const acts = (m.actions || []).map((a) => ({ label: a.label, t: target(a) }));
  for (const { node: h } of H.findAll(node, (n) => /^h[1-6]$/.test(n.tag))) setTwoTone(h, f.heading);
  for (const { node: el } of H.findAll(node, (n) => n.tag === "p")) {
    if (ancestors(el, pm).some((a) => a.tag === "a")) continue;
    if (H.text(el).split(/\s+/).length <= 4) continue;
    if (f.body) setText(el, paras(f.body)[0]);
    else H.remove(el, pm.get(el));
  }
  for (const { node: a } of H.findAll(node, (n) => n.tag === "a" && H.text(n) && H.find(n, (x) => x.tag === "p"))) {
    if (acts[0]) applyButton(a, acts[0]);
    else H.remove(a, pm.get(a));
  }
}

function buildRebuilt(p) {
  const tpl = templateFor(p);
  const html = fs.readFileSync(mirrorFile(tpl), "utf8");
  const doc = H.parse(html);
  stripFramerRuntime(doc);
  absolutizeLinks(doc, tpl);
  relabelNav(doc);
  const root = pageRoot(doc);
  const roles = heroRoles(tpl);
  const hero = heroFor(p);
  const heroProducts = productsIn(hero.eyebrow, hero.title, hero.intro);
  if (heroProducts.length) hero.logos = heroProducts.map((pr) => logoHtml(pr, { link: true, text: [hero.eyebrow, hero.title].join(" ") })).join("");

  const isNav = (c) => !!H.find(c, (n) => n.tag === "nav");
  const isFooter = (c) => /All rights reserved/.test(H.text(c));
  const els = root.children.filter((c) => H.isEl(c));
  // the hero: sections Framer names "Hero Section" (one per breakpoint variant); otherwise the section holding the live title
  const content = els.filter((c) => !isNav(c) && !isFooter(c));
  // live sections this page keeps (each breakpoint variant), with a pack module's copy where one applies
  const keepRules = LIVE_KEEP[p.id] || [];
  const keptLive = content.filter((c) => keepRules.some((r) => r.match(c)));
  const usedModules = new Set();
  for (const c of keptLive) {
    const rule = keepRules.find((r) => r.match(c));
    const m = rule.module && (p.modules || []).find((x) => x.kind === rule.module);
    if (m) { rewriteLiveBlock(c, m); usedModules.add(m.kind); }
  }
  const named = content.filter((c) => !keptLive.includes(c) && c.attrs["data-framer-name"] === "Hero Section");
  let heroes = named.filter((c) => H.find(c, (n) => n.tag === "h1"));
  if (!heroes.length) heroes = named.filter((c) => H.find(c, (n) => /^h[1-3]$/.test(n.tag)));
  if (!heroes.length && roles && roles.title[0]) heroes = content.filter((c) => H.text(c).includes(roles.title[0])).slice(0, 1);
  if (!heroes.length) heroes = content.filter((c) => H.find(c, (n) => n.tag === "h1")).slice(0, 1);
  let placed = { title: false, intro: false };
  for (const h of heroes) {
    const r = rewriteHero(h, roles || { eyebrow: [], title: [], intro: [], links: [] }, hero);
    placed = { title: placed.title || r.title, intro: placed.intro || r.intro };
  }
  if (!placed.title) {
    for (const h of heroes) for (const { node } of H.findAll(h, (n) => n.tag === "h1")) { setText(node, hero.title); node.attrs["data-q-title"] = ""; }
  }
  // a "Hero Section" that held only old live text (e.g. a phone-only banner) is left empty: drop it
  for (const h of heroes.filter((x) => !H.text(x))) H.remove(h, root);
  heroes = heroes.filter((x) => H.text(x));
  // a live hero without a paragraph slot: the intro opens the page body instead
  if (!placed.intro && hero.intro) hero.rest.unshift(hero.intro);

  const body =
    p.kind === "approved_modules"
      ? { main: p.modules.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).filter((m) => !usedModules.has(m.kind)).map((m) => renderModule(m, p)).join("\n"), end: "" }
      : renderGeneric(p, hero);
  // dropped live sections worth restoring (only where the page has its own live original)
  const restored = tpl === PATHS[p.id] ? content.filter((c) => !heroes.includes(c) && !keptLive.includes(c) && restoreReason(c)) : [];
  restoreLog.push(...[...new Set(restored.map((c) => restoreReason(c) + ": " + (H.text(H.find(c, (n) => /^h[1-6]$/.test(n.tag)) || c).slice(0, 60))))].map((x) => p.id + " — " + x));
  // keep navigation, hero, kept live sections and footer; the other live sections are replaced by the new content
  const kept = heroes.concat(keptLive);
  for (const k of kept.concat(restored)) fixTickers(k);
  root.children = root.children.filter((c) => !H.isEl(c) || isNav(c) || isFooter(c) || kept.includes(c));
  for (const k of kept) k.attrs["data-q-keep"] = "";
  for (const h of heroes) h.attrs["data-q-hero"] = "";
  for (const k of keptLive) k.attrs["data-q-live"] = "";
  for (const r of restored) r.attrs["data-q-after"] = "";
  // new sections go after the last kept section that comes before the footer
  const firstFooter = root.children.findIndex((c) => H.isEl(c) && isFooter(c));
  const before = kept.map((k) => root.children.indexOf(k)).filter((i) => firstFooter < 0 || i < firstFooter);
  const insertAt = before.length ? Math.max(...before) + 1 : firstFooter;
  // Framer orders sections with CSS `order` (per breakpoint). New sections take the highest order among the visible
  // kept sections (+1 when such a section comes later in the page); restored sections follow, then the closing band.
  const ORDER_JS = `<script>(function(){function v(x){return parseInt(getComputedStyle(x).order)||0}function s(x){return getComputedStyle(x).display!=="none"}function o(){var a=document.querySelector(".q-wrap"),b=document.querySelector(".q-wrap-end");if(!a)return;var k=[].slice.call(document.querySelectorAll("[data-q-keep]")).filter(s);var m=0;k.forEach(function(x){m=Math.max(m,v(x))});var t=k.some(function(x){return v(x)===m&&(a.compareDocumentPosition(x)&4)});var qa=m+(t?1:0);a.style.order=qa;var ma=qa;[].slice.call(document.querySelectorAll("[data-q-after]")).filter(s).forEach(function(x){x.style.order="";if(v(x)<qa)x.style.order=qa;ma=Math.max(ma,v(x))});if(b)b.style.order=ma}o();document.addEventListener("DOMContentLoaded",o);addEventListener("resize",o)})()</script>`;
  const seq = [H.htmlNode(`<div class="q-wrap">${body.main}</div>`), ...restored, H.htmlNode(`<div class="q-wrap q-wrap-end">${body.end}<p class="q-badge"><b>New content</b> · local copy</p></div>${ORDER_JS}`)];
  root.children.splice(insertAt < 0 ? root.children.length : insertAt, 0, ...seq);

  const seo = p.seo || {};
  setMeta(doc, seo.title || seo.seo_title || p.title + " | Quadra", seo.description || seo.meta_description || "");
  const headEl = H.find(doc, (n) => n.tag === "head");
  headEl.children.push(H.htmlNode(themeBlock(html)));
  const bodyEl = H.find(doc, (n) => n.tag === "body");
  const globe = keptLive.length && GLOBE_MODULE ? `<script>window.Q_GLOBE=${JSON.stringify(GLOBE_MODULE)}</script>` : "";
  const compass = COMPASS ? `${launcherHtml()}<script>window.Q_COMPASS=${JSON.stringify(COMPASS).replace(/</g, "\\u003c")}</script><script src="/_q/compass.js" defer></script>` : "";
  bodyEl.children.push(H.htmlNode(`${menusHtml(PATHS[p.id])}${globe}${compass}<script src="/_q/q.js" defer></script>`));
  return H.serialize(doc);
}

function buildLive(livePath) {
  const html = fs.readFileSync(livePath === "/404" ? path.join(MIRROR, "404.html") : mirrorFile(livePath), "utf8");
  const tag = `<script>window.Q_REBUILT=${JSON.stringify([...rebuiltPaths])}</script><script src="/_q/live_links.js"></script>`;
  return html.includes("</body>") ? html.replace("</body>", tag + "</body>") : html + tag;
}

// ---------- write ----------
if (fs.existsSync(OUT)) {
  if (!fs.existsSync(path.join(OUT, MARKER))) throw new Error(OUT + " exists but was not made by build_live_copy.js");
  fs.rmSync(OUT, { recursive: true, force: true });
}
fs.mkdirSync(path.join(OUT, "_q"), { recursive: true });
fs.writeFileSync(path.join(OUT, MARKER), "Generated by build_live_copy.js from live_mirror/ + content.json. Rebuild instead of editing.\n");
for (const f of ["q.css", "q.js", "live_links.js", "compass.js"]) fs.copyFileSync(path.join(SRC, f), path.join(OUT, "_q", f));
fs.mkdirSync(path.join(OUT, "_q", "logos"));
for (const f of fs.readdirSync(path.join(SRC, "logos")).filter((x) => x.endsWith(".png"))) fs.copyFileSync(path.join(SRC, "logos", f), path.join(OUT, "_q", "logos", f));
const restoreLog = [];
const write = (p, html) => {
  const file = p === "/" ? path.join(OUT, "index.html") : path.join(OUT, ...p.split("/").filter(Boolean), "index.html");
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
};
const errors = [];
for (const p of REBUILT) {
  try { write(PATHS[p.id], buildRebuilt(p)); } catch (e) { errors.push(p.id + ": " + e.message); }
}
let live = 0;
for (const mp of mirrorPaths) if (!rebuiltPaths.has(mp)) { write(mp, buildLive(mp)); live++; }
fs.writeFileSync(path.join(OUT, "404.html"), buildLive("/404"));
fs.writeFileSync(path.join(OUT, "routes.json"), JSON.stringify({ rebuilt: REBUILT.map((p) => ({ id: p.id, path: PATHS[p.id], template: templateFor(p) })), unchangedLive: mirrorPaths.filter((x) => !rebuiltPaths.has(x)) }, null, 1));
if (COMPASS) fs.writeFileSync(path.join(OUT, "_q", "compass-index.json"), JSON.stringify(compassIndex()));
console.log(JSON.stringify({ out: OUT, rebuilt: REBUILT.length - errors.length, unchangedLive: live, errors, restoredLiveSections: restoreLog }, null, 1));
