// Build a local static website from content.json + navigation.json in the live Quadra visual style.
// Usage: node build_site.js  → writes ./site (one folder per page). Serve it with the "quadra-site" launch config.
// No network access, no external services; forms, search and The Compass are rendered as non-working previews.
"use strict";
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const OUT = path.join(ROOT, "site");
const SRC = path.join(ROOT, "site_src");
const MARKER = ".generated-by-build_site";

const D = JSON.parse(fs.readFileSync(path.join(ROOT, "content.json"), "utf8"));
const NAV = JSON.parse(fs.readFileSync(path.join(ROOT, "navigation.json"), "utf8"));
const pages = D.pages;
const byId = Object.fromEntries(pages.map((p) => [p.id, p]));
if (Object.keys(byId).length !== pages.length) throw new Error("Duplicate page IDs in content.json");

// Live URL where one is established; otherwise a proposed local path under its parent (see site_paths.js).
const { PATHS } = require("./site_paths");
for (const p of pages) if (!PATHS[p.id]) throw new Error("No path for page " + p.id);
if (new Set(Object.values(PATHS)).size !== Object.keys(PATHS).length) throw new Error("Duplicate page paths");

// Live URLs written into the content that should open the local page instead (same overrides as render_mockup.py).
const LIVE = "https://www.quadrasystems.net";
const KNOWN = Object.fromEntries(pages.map((p) => [LIVE + (PATHS[p.id] === "/" ? "/" : PATHS[p.id]), p.id]));
Object.assign(KNOWN, { [LIVE + "/newsroom"]: "founder", [LIVE + "/awards"]: "recognition" });

// ---------- live pages (read-only extraction in ./live_extract, see extract_live.js) ----------
const LIVE_DIR = path.join(ROOT, "live_extract");
const livePages = new Map();
if (fs.existsSync(path.join(LIVE_DIR, "index.json"))) {
  for (const e of JSON.parse(fs.readFileSync(path.join(LIVE_DIR, "index.json"), "utf8")).pages) {
    if (e.error || e.status !== 200 || !e.file) continue;
    const lp = JSON.parse(fs.readFileSync(path.join(LIVE_DIR, e.file), "utf8"));
    livePages.set(lp.path, lp);
  }
}
// Pack pages that only hold a placeholder keep the existing live page, as the pack itself states.
const isPlaceholder = (p) => /^Existing content will be retained/.test(p.intro || "");
const retainedLive = (p) => (isPlaceholder(p) ? livePages.get(PATHS[p.id]) || null : null);

// Every local page by path: pack content, retained live content, or a live-only page.
const LOCAL = new Map();
for (const p of pages) LOCAL.set(PATHS[p.id], { kind: retainedLive(p) ? "retained" : "content", id: p.id, live: retainedLive(p) });
for (const [lpPath, lp] of livePages) {
  if (!LOCAL.has(lpPath) && lpPath !== "/404") LOCAL.set(lpPath, { kind: "live", live: lp });
}
const hrefFor = (p) => (p === "/" ? "/" : encodeURI(p) + "/");

// Resolve a link found on a live page (or a live URL in the pack) to a local page when one exists.
function resolveLive(href, fromPath = "/") {
  if (!href || href.startsWith("#")) return null;
  if (/^(mailto|tel):/i.test(href)) return { href, external: true };
  let u;
  try { u = new URL(href, LIVE + fromPath); } catch { return null; }
  if (!/(^|\.)quadrasystems\.net$/.test(u.hostname)) return { href: u.href, external: true };
  let p;
  try { p = decodeURI(u.pathname); } catch { p = u.pathname; }
  p = p.replace(/\/+$/, "") || "/";
  if (LOCAL.has(p)) return { href: hrefFor(p) + (u.hash || ""), external: false };
  return { href: LIVE + u.pathname + u.search + u.hash, external: true };
}
const NAV_TOP = [
  [/^\/solutions/, "solutions"],
  [/^\/technology/, "technology"],
  [/^\/(why-quadra|awards|legacy-wall|coe-)/, "why-quadra"],
  [/^\/happy/, "happy-customers"],
  [/^\/(newsroom|blogs|foundersblog|pressrelease|edm)/, "insights"],
];
const navTopForPath = (p) => (NAV_TOP.find(([re]) => re.test(p)) || [null, null])[1];

const STATUS = {
  live: "Existing live content",
  live_retained: "Existing live content (retained)",
  prior_review_copy: "Previously reviewed copy",
  review_draft: "Updated draft for review",
  awaiting_source: "Updated content awaited",
  structure_only: "Structure placeholder",
  classification_review: "Portfolio classification to confirm",
  release_gated: "Launch claim — confirmation pending",
  form_preview: "Form layout preview",
};

// ---------- helpers ----------
const esc = (x) => String(x == null ? "" : x).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const paras = (text, cls) => {
  const ps = String(text || "").split(/\n\s*\n/).map((s) => s.trim()).filter(Boolean);
  if (!ps.length) return "";
  const html = ps.map((s) => "<p>" + esc(s).replace(/\n/g, "<br>") + "</p>").join("");
  return cls ? `<div class="${cls}">${html}</div>` : html;
};
const href = (id) => (PATHS[id] === "/" ? "/" : PATHS[id] + "/");
const ICON = {
  arrow: '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M6 3l5 5-5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev: '<svg class="chev" viewBox="0 0 10 10" fill="none" aria-hidden="true"><path d="M2 3.5l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  moon: '<svg class="icon-moon" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  sun: '<svg class="icon-sun" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  mark: '<svg class="wordmark-mark" viewBox="0 0 20 20" aria-hidden="true"><defs><linearGradient id="qg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f26202"/><stop offset="1" stop-color="#a418f5"/></linearGradient></defs><rect x="1" y="1" width="8" height="8" rx="2.5" fill="url(#qg)"/><rect x="11" y="1" width="8" height="8" rx="2.5" fill="currentColor" opacity=".9"/><rect x="1" y="11" width="8" height="8" rx="2.5" fill="currentColor" opacity=".9"/><rect x="11" y="11" width="8" height="8" rx="2.5" fill="url(#qg)"/></svg>',
};

// Internal page, live URL mapped to a local page, external URL (new tab) or plain label.
function link(label, { target, url, cls = "text-link", arrow = true } = {}) {
  if (url && KNOWN[url]) { target = KNOWN[url]; url = null; }
  if (url && url.startsWith(LIVE)) {
    const r = resolveLive(url);
    if (r && !r.external) return `<a class="${cls}" href="${esc(r.href)}">${esc(label)}${arrow ? ICON.arrow : ""}</a>`;
  }
  if (target) {
    if (!byId[target]) throw new Error("Unknown internal target " + target);
    return `<a class="${cls}" href="${href(target)}">${esc(label)}${arrow ? ICON.arrow : ""}</a>`;
  }
  if (url && /^https:\/\//.test(url)) {
    return `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(label)} <span class="ext" aria-label="(opens the live site)">↗</span></a>`;
  }
  return `<span>${esc(label)}</span>`;
}
function action(a, primary) {
  const cls = "btn " + (primary ? "btn-primary" : "btn-ghost");
  const type = a.type || "link";
  if (type === "open_menu" || type === "menu") return link(a.label, { target: "technology", cls });
  if (type === "form") return `<button class="${cls}" type="button" disabled title="Preview only — not connected">${esc(a.label)}</button>`;
  return link(a.label || "Explore", { target: byId[a.target] ? a.target : null, url: a.url, cls });
}
const actions = (list, center = true) => (list && list.length ? `<div class="actions${center ? " center" : ""}">${list.map((a, i) => action(a, i === 0)).join("")}</div>` : "");
const placeholder = (label = "Image placeholder") => `<div class="placeholder" role="img" aria-label="${esc(label)}"><span>Image placeholder</span></div>`;
const stageChip = (stage) => `<span class="stage-chip stage-${esc(stage)}" title="Review stage in content.json">${esc(STATUS[stage] || "Draft for review")}</span>`;

function ancestors(p) {
  const chain = [];
  let cur = p;
  while (cur && cur.parent && byId[cur.parent]) { cur = byId[cur.parent]; chain.unshift(cur); }
  return chain;
}
function topLevel(p) {
  if (p.id === "home") return null;
  const chain = ancestors(p);
  return (chain[0] || p).id;
}
function breadcrumb(p) {
  if (p.id === "home") return "";
  const parts = [`<a href="/">Home</a>`].concat(ancestors(p).map((a) => `<a href="${href(a.id)}">${esc(a.title)}</a>`));
  parts.push(`<span aria-current="page">${esc(p.title)}</span>`);
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join('<span class="sep">/</span>')}</nav>`;
}
const colsFor = (n) => (n === 1 ? 1 : n === 2 || n === 4 ? 2 : 3);

// ---------- shell: header, footer, document ----------
function header(current, navTop) {
  const currentTop = current ? topLevel(current) : navTop || null;
  const items = NAV.header.map((n) => {
    if (!n.groups) {
      const cur = currentTop === n.page ? ' aria-current="page"' : "";
      return `<a href="${href(n.page)}"${cur}>${esc(n.label)}</a>`;
    }
    const groups = n.groups.map((g) => `<div class="mega-group"><h3>${esc(g.title)}</h3><ul>${g.links
      .map(([label, id]) => {
        const sub = label.startsWith("↳");
        const text = sub ? label.replace(/^↳\s*/, "") : label;
        const cur = current && current.id === id ? ' aria-current="page"' : "";
        return `<li><a class="${sub ? "sub" : ""}" href="${href(id)}"${cur}>${esc(text)}</a></li>`;
      })
      .join("")}</ul></div>`).join("");
    const isCur = currentTop === n.page ? " is-current" : "";
    return `<details class="nav-item${isCur}"><summary>${esc(n.label)}${ICON.chev}</summary><div class="mega"><div class="mega-top"><a href="${href(n.page)}">Explore ${esc(n.label)}</a></div><div class="mega-grid">${groups}</div></div></details>`;
  });
  const cta = NAV.cta;
  return `<header class="site-header">
  <div class="nav-shell">
    <a class="wordmark" href="/" aria-label="Quadra home">${ICON.mark}Quadra</a>
    <nav class="primary-nav" id="primary-nav" aria-label="Main">${items.join("")}<a class="btn btn-primary mobile-cta" href="${href(cta.page)}">${esc(cta.label)}${ICON.arrow}</a></nav>
    <div class="nav-tools">
      <button class="icon-btn theme-toggle" type="button" data-theme-toggle aria-label="Switch to light theme">${ICON.moon}${ICON.sun}</button>
      <a class="btn btn-primary btn-sm" href="${href(cta.page)}">${esc(cta.label)}${ICON.arrow}</a>
      <button class="icon-btn nav-toggle" type="button" data-nav-toggle aria-expanded="false" aria-controls="primary-nav" aria-label="Menu">${ICON.menu}</button>
    </div>
  </div>
</header>`;
}

function footer() {
  const home = byId.home;
  const f = ((home.modules || []).find((m) => m.kind === "footer") || {}).fields || {};
  const cols = NAV.header.map((n) => {
    let links;
    if (!n.groups) links = [[n.label, n.page]];
    else if (n.page === "technology") links = n.groups.map((g) => [g.title, g.links[0][1]]);
    else links = n.groups.flatMap((g) => g.links);
    return `<div><h3>${esc(n.label)}</h3><ul>${links.map(([l, id]) => `<li><a href="${href(id)}">${esc(l.replace(/^↳\s*/, ""))}</a></li>`).join("")}</ul></div>`;
  });
  return `<footer class="site-footer">
  <div class="container">
    <div class="footer-top">
      <div class="footer-brand">
        <a class="wordmark" href="/">${ICON.mark}${esc(f.brand || "Quadra")}</a>
        <p class="footer-tagline">${esc(f.tagline || "")}</p>
        ${link(NAV.cta.label, { target: NAV.cta.page, cls: "btn btn-primary" })}
      </div>
      <div class="footer-cols">${cols.slice(0, 4).join("")}</div>
    </div>
    <div class="footer-bottom">
      <span>Local build of content master v${esc(D.version)} (${esc(D.as_of)}) · image placeholders · forms and The Compass are not connected</span>
      <nav aria-label="Footer">${["happy-customers", "careers", "privacy", "terms"].map((id) => `<a href="${href(id)}">${esc(byId[id].title)}</a>`).join("")}<a href="/site-index/">Site index</a></nav>
    </div>
  </div>
</footer>`;
}

function documentHtml({ title, description, body, current, navTop }) {
  return `<!doctype html>
<html lang="en-IN" data-theme="dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description || "")}">
<meta name="robots" content="noindex, nofollow">
<script>try{var t=localStorage.getItem("quadra-theme");if(t==="light"||t==="dark")document.documentElement.setAttribute("data-theme",t)}catch(e){}document.documentElement.classList.add("js")</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Raleway:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="/assets/site.css">
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<div class="review-strip"><div class="container"><span><strong>Quadra · local build</strong><span class="strip-detail"> &nbsp;Content master v${esc(D.version)} · ${esc(D.as_of)} · internal review, not the live website</span></span><a href="/site-index/">All pages</a></div></div>
${header(current, navTop)}
<main id="main">
${body}
</main>
${footer()}
<script src="/assets/site.js" defer></script>
</body>
</html>
`;
}

// ---------- generic page ----------
function card(c, i) {
  const title = c.title || c.heading || "";
  const inner = `<span class="card-num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(title)}</h3>${paras(c.body)}`;
  if (c.target && byId[c.target]) {
    return `<a class="card reveal" href="${href(c.target)}">${inner}<span class="card-foot"><span class="text-link">Explore${ICON.arrow}</span></span></a>`;
  }
  return `<div class="card reveal">${inner}</div>`;
}
const checkList = (items) => (items && items.length ? `<ul class="check-list">${items.map((t) => `<li>${esc(typeof t === "string" ? t : t.text || t.body || "")}</li>`).join("")}</ul>` : "");
const closing = (text) => (text ? `<div class="closing reveal">${paras(text)}</div>` : "");

function renderSection(s, idx) {
  const id = s.id ? ` id="${esc(s.id)}"` : "";
  if (s.cards && s.cards.length) {
    return `<section class="section"${id}><div class="container">
  <div class="section-head center reveal"><h2>${esc(s.heading)}</h2>${paras(s.body, "lede")}</div>
  ${checkList(s.bullets)}
  <div class="card-grid cols-${colsFor(s.cards.length)}">${s.cards.map(card).join("")}</div>
  ${closing(s.closing_body)}
</div></section>`;
  }
  return `<section class="section"${id}><div class="container split">
  <div class="split-head reveal"><span class="section-index">${String(idx + 1).padStart(2, "0")}</span><h2>${esc(s.heading)}</h2></div>
  <div class="split-body reveal">${paras(s.body)}${checkList(s.bullets)}${closing(s.closing_body)}</div>
</div></section>`;
}

function pageHero(p, children) {
  const ctas = [];
  if (p.cta && p.id !== "contact") ctas.push(link(p.cta.label || "Talk to an Architect", { target: p.cta.target || "contact", cls: "btn btn-primary" }));
  if (children.length) ctas.push(`<a class="btn btn-ghost" href="#explore">Explore this area${ICON.arrow}</a>`);
  return `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner">
  <div class="hero-meta">${breadcrumb(p)}${stageChip(p.stage)}</div>
  <p class="badge">${esc(p.eyebrow || p.title)}</p>
  <h1 class="display"><span class="grad">${esc(p.heading || p.title)}</span></h1>
  ${p.subheading ? `<p class="hero-sub">${esc(p.subheading)}</p>` : ""}
  ${p.lead ? `<p class="hero-lead">${esc(p.lead)}</p>` : ""}
  ${paras(p.intro, "hero-intro")}
  ${ctas.length ? `<div class="actions center">${ctas.join("")}</div>` : ""}
</div></section>`;
}

function contactPreview() {
  return `<section class="section"><div class="container">
  <div class="panel reveal" style="max-width:760px;margin-inline:auto">
    <p class="preview-note">Contact form preview · no submission or data collection</p>
    <div class="field-row">
      <label class="field">Name<input disabled autocomplete="off"></label>
      <label class="field">Work email<input type="email" disabled autocomplete="off"></label>
    </div>
    <label class="field">What would you like to achieve?<textarea rows="4" disabled></textarea></label>
    <button class="btn btn-primary" type="button" disabled>Start a Conversation</button>
  </div>
</div></section>`;
}

function ctaBand(p) {
  if (!p.cta || p.id === "contact") return "";
  const heading = p.cta_heading || p.cta.label || "Talk to an Architect";
  return `<section class="cta-band"><div class="container"><div class="cta-card reveal">
  <h2>${esc(heading)}</h2>${paras(p.cta_body)}
  <div class="actions center">${link(p.cta.label || "Talk to an Architect", { target: p.cta.target || "contact", cls: "btn btn-primary" })}</div>
</div></div></section>`;
}

function renderGeneric(p) {
  const children = pages.filter((q) => q.parent === p.id);
  const out = [pageHero(p, children)];
  if (p.stage === "release_gated") {
    out.push(`<div class="container"><p class="gate-note">Internal review only. The 21-year statement remains conditional on the public award announcement; no launch approval is implied.</p></div>`);
  }
  (p.sections || []).forEach((s, i) => out.push(renderSection(s, i)));
  if (p.id === "contact") out.push(contactPreview());
  if (children.length) {
    out.push(`<section class="section" id="explore"><div class="container">
  <div class="section-head center reveal"><h2>Explore this area</h2></div>
  <div class="card-grid cols-${colsFor(children.length)}">${children
      .map((q, i) => `<a class="card reveal" href="${href(q.id)}"><span class="card-num">${String(i + 1).padStart(2, "0")}</span><h3>${esc(q.title)}</h3>${paras(q.intro)}<span class="card-foot"><span class="text-link">Explore${ICON.arrow}</span></span></a>`)
      .join("")}</div>
</div></section>`);
  }
  const rel = (p.related || []).filter((id) => byId[id] && id !== p.id);
  if (rel.length) {
    out.push(`<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>Connected expertise</h2></div>
  <div class="chip-row reveal">${rel.map((id) => `<a class="chip" href="${href(id)}">${esc(byId[id].title)}${ICON.arrow}</a>`).join("")}</div>
</div></section>`);
  }
  out.push(ctaBand(p));
  return out.join("\n");
}

// ---------- module pages (Home, Happy Customers) ----------
function renderModule(m, p) {
  const f = m.fields || {};
  const items = m.items || [];
  switch (m.kind) {
    case "footer":
      return "";
    case "hero": {
      const home = p.id === "home";
      return `<section class="hero${home ? " hero-home" : ""}"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner">
  ${home ? "" : `<div class="hero-meta">${breadcrumb(p)}${stageChip(p.stage)}</div>`}
  ${f.eyebrow ? `<p class="hero-eyebrow">${esc(f.eyebrow)}</p>` : ""}
  <h1 class="display"><span class="grad">${esc(f.heading)}</span></h1>
  ${paras(f.body, "hero-intro")}
  ${actions(m.actions)}
  ${home ? `<div style="margin-top:34px">${stageChip(p.stage)}</div>` : ""}
</div></section>`;
    }
    case "recognition":
      return `<section class="recognition-band"><div class="container reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}${actions(m.actions)}</div></section>`;
    case "compass":
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}</div>
  <div class="compass reveal"><div class="compass-inner">
    <p class="preview-note">Interface preview · no AI service connected</p>
    <label class="field" for="compass-input">${esc(f.input_label)}</label>
    <div class="compass-input"><input class="input" id="compass-input" disabled placeholder="${esc(f.placeholder)}"><button class="btn btn-primary" type="button" disabled>${esc(f.submit_label)}</button></div>
    <p class="small">${esc(f.starter_label || "Try a question")}</p>
    <ul class="starters">${items.map((i) => `<li>${esc(i.fields.question)}</li>`).join("")}</ul>
    <p class="small">${esc(f.privacy_helper)}</p>
  </div></div>
  ${actions(m.actions)}
</div></section>`;
    case "routes":
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}</div>
  <div class="card-grid cols-${colsFor(items.length)}">${items
        .map((i, n) => {
          const g = i.fields;
          return `<div class="card reveal"><span class="card-num">${String(n + 1).padStart(2, "0")}</span><h3>${esc(g.heading)}</h3>${g.question ? `<p class="card-question">${esc(g.question)}</p>` : ""}${paras(g.body)}<span class="card-foot">${(i.actions || []).map((a) => link(a.label, { target: byId[a.target] ? a.target : null, url: a.url })).join(" ")}</span></div>`;
        })
        .join("")}</div>
  ${actions(m.actions)}
</div></section>`;
    case "proposition":
    case "perspectives":
    case "call_to_action":
    case "contact_cta":
      if (m.kind === "call_to_action" || m.kind === "contact_cta") {
        return `<section class="cta-band"><div class="container"><div class="cta-card reveal"><h2>${esc(f.heading)}</h2>${paras(f.body)}${actions(m.actions)}</div></div></section>`;
      }
      return `<section class="section statement"><div class="container reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}${actions(m.actions)}</div></section>`;
    case "expertise_strip": {
      const chips = String(f.body || "").split(/\s+·\s+/).map((s) => s.trim()).filter(Boolean);
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2></div>
  <div class="chip-row reveal">${chips.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
  ${actions(m.actions)}
</div></section>`;
    }
    case "proof":
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}</div>
  <div class="card-grid cols-${colsFor(items.length)}">${items
        .map((i) => `<div class="card reveal">${placeholder("Customer story image placeholder")}<h3>${esc(i.fields.heading)}</h3>${paras(i.fields.body)}<span class="card-foot">${(i.actions || []).map((a) => link(a.label, { url: a.url, target: byId[a.target] ? a.target : null })).join(" ")}</span></div>`)
        .join("")}</div>
  ${actions(m.actions)}
</div></section>`;
    case "newsletter":
      return `<section class="section"><div class="container">
  <div class="panel reveal" style="max-width:760px;margin-inline:auto;text-align:center">
    <h2 style="font-weight:500;font-size:clamp(28px,3vw,40px);letter-spacing:-.02em">${esc(f.heading)}</h2>${paras(f.body, "lede")}
    <p class="preview-note" style="margin-top:22px">Newsletter preview · no information collected</p>
    <div class="compass-input" style="margin-bottom:0"><input class="input" id="nl-email" type="email" disabled placeholder="${esc(f.email_label || "Email address")}" aria-label="${esc(f.email_label || "Email address")}">${(m.actions || []).map((a) => action(a, true)).join("")}</div>
  </div>
</div></section>`;
    case "collection_controls":
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}</div>
  <div class="panel reveal">
    <p class="preview-note">Filter and search preview · not connected to the case library</p>
    <div class="filters">
      <label class="field">${esc(f.search_label)}<input disabled placeholder="${esc(f.search_placeholder)}"></label>
      <label class="field">${esc(f.industry_label)}<select disabled><option>${esc(f.industry_default)}</option></select></label>
      <label class="field">${esc(f.priority_label)}<select disabled><option>${esc(f.priority_default)}</option>${items.map((i) => `<option>${esc(i.fields.label)}</option>`).join("")}</select></label>
      <button class="btn btn-ghost" type="button" disabled style="margin-bottom:16px">${esc(f.clear_filters)}</button>
    </div>
  </div>
</div></section>`;
    case "existing_case_collection": {
      const cases = p.existing_case_sample || [];
      const all = caseCards();
      return `<section class="section" style="border-top:0;padding-top:20px"><div class="container">
  <p class="preview-note" style="display:flex;justify-content:center">Representative existing cases · original titles and summaries retained · not the full collection</p>
  <div class="card-grid cols-${colsFor(cases.length)}">${cases
        .map((c) => `<div class="card reveal">${placeholder("Case study image placeholder")}<h3>${esc(c.title)}</h3>${paras(c.body)}<span class="card-foot">${link(f.card_cta || "Read the Case Study", { url: c.url })}</span></div>`)
        .join("")}</div>
  ${all.length ? "" : `<div class="actions center"><button class="btn btn-ghost" type="button" disabled>${esc(f.load_more || "Load More")}</button></div>`}
  ${actions(m.actions)}
</div></section>${
        all.length
          ? `<section class="section" id="all-cases"><div class="container">
  <div class="section-head center reveal"><h2>${esc((f.results_plural || "{count} case studies").replace("{count}", all.length))}</h2><p class="small">Existing collection, extracted read-only from the live site.</p></div>
  <div class="card-grid cols-3">${all
              .map((c) => `<a class="card reveal" href="${hrefFor(c.path)}">${c.pic ? img(c.pic, "card-img", 800) : placeholder()}${c.industry ? `<span class="card-num">${esc(c.industry)}</span>` : ""}<h3>${esc(c.title)}</h3>${c.summary ? `<p>${esc(c.summary)}</p>` : ""}<span class="card-foot"><span class="text-link">${esc(f.card_cta || "Read the Case Study")}${ICON.arrow}</span></span></a>`)
              .join("")}</div>
</div></section>`
          : ""
      }`;
    }
    case "solution_links":
      return `<section class="section"><div class="container">
  <div class="section-head center reveal"><h2>${esc(f.heading)}</h2>${paras(f.body, "lede")}</div>
  <div class="chip-row reveal">${(m.actions || []).map((a) => link(a.label, { url: a.url, target: byId[a.target] ? a.target : null, cls: "chip" })).join("")}</div>
</div></section>`;
    default: {
      // Unknown module kinds still show their copy rather than disappearing.
      const cards = items.length
        ? `<div class="card-grid cols-${colsFor(items.length)}">${items.map((i, n) => card({ title: i.fields.heading || i.fields.label, body: i.fields.body }, n)).join("")}</div>`
        : "";
      return `<section class="section"><div class="container"><div class="section-head center reveal">${f.heading ? `<h2>${esc(f.heading)}</h2>` : ""}${paras(f.body, "lede")}</div>${cards}${actions(m.actions)}</div></section>`;
    }
  }
}
const renderModules = (p) => p.modules.slice().sort((a, b) => (a.order || 0) - (b.order || 0)).map((m) => renderModule(m, p)).join("\n");

// ---------- live pages: render extracted live content in the same design ----------
const STOPWORDS = new Set(["read post", "read more", "submit", "/", "learn more", "view more", "load more"]);
const isStat = (s) => s.length <= 12 && /^[₹$€£]?\s?[\d.,]+\s?(%|x|X|\+|k|K|M|Mn|Bn|Cr|hrs?|days?)?\s?\+?%?$/.test(s.trim());
const isQuestion = (s) => /\?$/.test(s.trim()) && s.length < 220;
const isArticlePath = (p) => /^\/(happy|newsroom|foundersblog|pressrelease)\/[^/]+$/.test(p) || /^\/(privacy|terms)$/.test(p);
const imgSrc = (src, w) => (src.includes("framerusercontent.com/images/") ? `${src}?scale-down-to=${w}` : src);
const img = (b, cls, w = 1024) => `<img class="${cls}" src="${esc(imgSrc(b.src, w))}" alt="${esc(b.alt || "")}" loading="lazy" decoding="async">`;

function liveAnchor(b, fromPath, cls = "text-link") {
  const r = resolveLive(b.href, fromPath);
  if (!r) return `<span>${esc(b.text)}</span>`;
  return r.external
    ? `<a class="${cls}" href="${esc(r.href)}" target="_blank" rel="noopener noreferrer">${esc(b.text)} <span class="ext" aria-label="(opens the live site)">↗</span></a>`
    : `<a class="${cls}" href="${esc(r.href)}">${esc(b.text)}${ICON.arrow}</a>`;
}
const usable = (blocks) => blocks.filter((b) => !((b.t === "p" || b.t === "link") && (STOPWORDS.has((b.text || "").toLowerCase()) || (b.text || "").length <= 1)));

// Leading headings form the section title; an eyebrow (h5/h6) may sit above a larger heading.
function takeHead(blocks) {
  const head = [];
  let i = 0;
  while (i < blocks.length && /^h[1-6]$/.test(blocks[i].t) && head.length < 3) {
    const lvl = +blocks[i].t[1];
    if (head.length) {
      const first = +head[0].t[1];
      if (!(lvl === first || (first >= 5 && lvl < first))) break;
    }
    head.push(blocks[i]);
    i++;
  }
  // a lone heading whose level repeats later is the first item, not the section title —
  // unless it sits directly above a linked card or image (a listing's section title)
  const after = blocks[i];
  if (head.length === 1 && !(after && (after.t === "card" || after.t === "img")) && blocks.slice(i).some((b) => b.t === head[0].t)) return { title: "", eyebrow: "", next: 0 };
  if (!head.length) return { title: "", eyebrow: "", next: 0 };
  const top = Math.min(...head.map((h) => +h.t[1]));
  return {
    title: head.filter((h) => +h.t[1] === top).map((h) => h.text).join(" "),
    eyebrow: head.filter((h) => +h.t[1] !== top).map((h) => h.text).join(" "),
    next: i,
  };
}

function groupItems(blocks) {
  const items = [];
  const loose = { paras: [], lis: [], imgs: [], links: [] };
  let cur = null;
  let pendingImg = null;
  const start = (extra) => { cur = { title: "", paras: [], lis: [], links: [], img: pendingImg, href: null, ...extra }; pendingImg = null; items.push(cur); return cur; };
  for (let k = 0; k < blocks.length; k++) {
    const b = blocks[k];
    if (b.t === "card") {
      const it = start({ href: b.href });
      for (const x of usable(b.blocks)) {
        if (/^h[1-6]$/.test(x.t) && !it.title) it.title = x.text;
        else if (x.t === "img" && !it.img) it.img = x;
        else if (x.t === "p" || x.t === "li" || x.t === "pre") it.paras.push(x.text);
        else if (x.t === "link") it.links.push(x);
      }
      continue;
    }
    if (/^h[1-6]$/.test(b.t)) {
      if (cur && cur.href && !cur.title) cur.title = b.text; // listing card: title follows the linked image
      else start({ title: b.text });
      continue;
    }
    if (b.t === "img") {
      const next = blocks[k + 1];
      if (next && /^h[1-6]$/.test(next.t)) pendingImg = b;
      else if (cur && !cur.img) cur.img = b;
      else loose.imgs.push(b);
      continue;
    }
    const bucket = cur || loose;
    if (b.t === "p" || b.t === "pre") bucket.paras.push(b.text);
    else if (b.t === "li") bucket.lis.push(b.text);
    else if (b.t === "link") bucket.links.push(b);
  }
  if (pendingImg) loose.imgs.push(pendingImg);
  // listing cards often carry their title as plain text: promote the first title-like line
  const DATE = /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}$/i;
  for (const it of items) {
    if (it.title || !it.href) continue;
    const ti = it.paras.findIndex((p) => !DATE.test(p) && p.length >= 15 && p.length <= 140 && !/[.!]$/.test(p));
    if (ti >= 0) it.title = it.paras.splice(ti, 1)[0];
  }
  return { items, loose };
}

function faqHtml(paras) {
  const out = [];
  const lead = [];
  let cur = null;
  for (const p of paras) {
    if (isQuestion(p)) { cur = { q: p, a: [] }; out.push(cur); }
    else if (cur) cur.a.push(p);
    else lead.push(p);
  }
  return {
    lead,
    html: `<div class="faq reveal">${out
      .map((f) => `<details${f.a.length ? "" : " class=\"no-answer\""}><summary>${esc(f.q)}</summary>${f.a.length ? `<div class="faq-a">${f.a.map((a) => `<p>${esc(a)}</p>`).join("")}</div>` : ""}</details>`)
      .join("")}</div>`,
  };
}

const chipsOrParas = (paras) => {
  // runs of very short labels (tab names such as "Establish · Architect · Build") read better as chips
  const out = [];
  let run = [];
  const flush = () => { if (run.length >= 2) out.push(`<div class="chip-row">${run.map((r) => `<span class="chip">${esc(r)}</span>`).join("")}</div>`); else run.forEach((r) => out.push(`<p>${esc(r)}</p>`)); run = []; };
  for (const p of paras) {
    if (p.split(/\s+/).length <= 3 && !/[.?!:]$/.test(p)) run.push(p);
    else { flush(); out.push(`<p>${esc(p)}</p>`); }
  }
  flush();
  return out.join("");
};

function liveCard(it, fromPath, i, statMode) {
  const r = it.href ? resolveLive(it.href, fromPath) : null;
  const tag = r ? "a" : "div";
  const attrs = r ? ` href="${esc(r.href)}"${r.external ? ' target="_blank" rel="noopener noreferrer"' : ""}` : "";
  if (statMode) return `<div class="card stat reveal"><span class="stat-num grad">${esc(it.title)}</span>${it.paras.map((p) => `<p>${esc(p)}</p>`).join("")}</div>`;
  return `<${tag} class="card reveal"${attrs}>${it.img ? img(it.img, "card-img", 800) : ""}${it.title ? `<h3>${esc(it.title)}</h3>` : ""}${it.paras.map((p) => `<p>${esc(p)}</p>`).join("")}${
    it.lis.length ? `<ul class="mini-list">${it.lis.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""
  }${it.links.length && !r ? `<span class="card-foot">${it.links.map((l) => liveAnchor(l, fromPath)).join(" ")}</span>` : ""}${r ? `<span class="card-foot"><span class="text-link">${r.external ? "Open ↗" : "Explore" + ICON.arrow}</span></span>` : ""}</${tag}>`;
}

function renderLiveSection(blocks, fromPath) {
  blocks = usable(blocks);
  if (!blocks.length) return "";
  const { title, eyebrow, next } = takeHead(blocks);
  let k = next;
  const intro = [];
  while (k < blocks.length && (blocks[k].t === "p" || blocks[k].t === "pre")) intro.push(blocks[k++].text);
  const actions = [];
  while (k < blocks.length && blocks[k].t === "link") actions.push(blocks[k++]);
  const { items, loose } = groupItems(blocks.slice(k));

  const allParas = intro.concat(loose.paras);
  const faq = allParas.filter(isQuestion).length >= 2 ? faqHtml(allParas) : null;
  const introParas = faq ? faq.lead : intro;
  const head = title || eyebrow || introParas.length || actions.length
    ? `<div class="section-head center reveal">${eyebrow ? `<p class="badge">${esc(eyebrow)}</p>` : ""}${title ? `<h2>${esc(title)}</h2>` : ""}${introParas.length ? `<div class="lede">${chipsOrParas(introParas)}</div>` : ""}${
        actions.length ? `<div class="actions center">${actions.map((a, i) => liveAnchor(a, fromPath, "btn " + (i ? "btn-ghost" : "btn-primary"))).join("")}</div>` : ""
      }</div>`
    : "";

  let body = "";
  if (items.length >= 2) {
    const stats = items.every((it) => isStat(it.title));
    const n = items.length;
    const cols = stats ? Math.min(n, 4) : n % 3 === 0 || n >= 5 ? 3 : n === 4 ? 2 : Math.min(n, 3);
    body += `<div class="card-grid cols-${cols}">${items.map((it, i) => liveCard(it, fromPath, i, stats)).join("")}</div>`;
  } else if (items.length === 1) {
    const it = items[0];
    const text = `${it.title ? `<h3 class="item-title">${esc(it.title)}</h3>` : ""}${it.paras.map((p) => `<p>${esc(p)}</p>`).join("")}${
      it.lis.length ? `<ul class="check-list">${it.lis.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>` : ""
    }${it.links.length ? `<div class="actions">${it.links.map((l, i) => liveAnchor(l, fromPath, "btn " + (i ? "btn-ghost" : "btn-primary"))).join("")}</div>` : ""}`;
    body += it.img ? `<div class="media-split reveal"><div>${text}</div>${img(it.img, "media-img", 1600)}</div>` : `<div class="prose-block reveal">${text}</div>`;
  }
  if (!faq && loose.paras.length) body += `<div class="prose-block reveal">${chipsOrParas(loose.paras)}</div>`;
  if (faq) body += faq.html;
  if (loose.lis.length) body += `<ul class="check-list reveal">${loose.lis.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`;
  if (loose.imgs.length === 1) body += `<figure class="figure reveal">${img(loose.imgs[0], "figure-img", 2048)}</figure>`;
  else if (loose.imgs.length > 1) body += `<div class="img-grid reveal">${loose.imgs.map((b) => img(b, "grid-img", 800)).join("")}</div>`;
  if (loose.links.length) body += `<div class="actions center">${loose.links.map((l, i) => liveAnchor(l, fromPath, "btn " + (i ? "btn-ghost" : "btn-primary"))).join("")}</div>`;
  if (!head && !body) return "";
  return `<section class="section"><div class="container">${head}${body}</div></section>`;
}

function proseHtml(blocks, fromPath) {
  const out = [];
  let list = [];
  const flush = () => { if (list.length) out.push(`<ul>${list.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`); list = []; };
  for (const b of usable(blocks)) {
    if (b.t !== "li") flush();
    if (/^h[1-2]$/.test(b.t)) out.push(`<h2>${esc(b.text)}</h2>`);
    else if (/^h[3-6]$/.test(b.t)) out.push(`<h3>${esc(b.text)}</h3>`);
    else if (b.t === "p") out.push(isQuestion(b.text) ? `<p><strong>${esc(b.text)}</strong></p>` : `<p>${esc(b.text)}</p>`);
    else if (b.t === "pre") out.push(`<pre>${esc(b.text)}</pre>`);
    else if (b.t === "li") list.push(b.text);
    else if (b.t === "img") out.push(`<figure>${img(b, "figure-img", 2048)}</figure>`);
    else if (b.t === "link") out.push(`<p>${liveAnchor(b, fromPath)}</p>`);
    else if (b.t === "card") {
      const { items } = groupItems([b]);
      if (items[0]) out.push(`<div class="card-grid cols-1">${liveCard(items[0], fromPath, 0, false)}</div>`);
    }
  }
  flush();
  return out.join("");
}

// Hero from the first section with an H1 (or the first H2 on CMS pages that have no H1).
function liveHero(lp, meta) {
  const sections = lp.sections.map((s) => ({ name: s.name, blocks: usable(s.blocks) })).filter((s) => s.blocks.length);
  const h1At = sections.findIndex((s) => s.blocks.some((b) => b.t === "h1"));
  const h2At = sections.findIndex((s) => s.blocks.some((b) => b.t === "h2"));
  // Articles carry their title as the first H2; an H1 further down sits inside the article body.
  const useH2 = h1At < 0 || (meta.article && h2At >= 0 && h2At < h1At);
  const level = useH2 ? "h2" : "h1";
  let hi = useH2 ? h2At : h1At;
  if (hi < 0) hi = 0;
  const sec = sections[hi] || { blocks: [] };
  const bl = sec.blocks;
  let t = bl.findIndex((b) => b.t === level);
  let title = "";
  const eyebrow = [];
  const carried = []; // text before the title that is not an eyebrow is kept, not dropped
  let k = 0;
  if (t >= 0) {
    const pre = bl.slice(0, t);
    if (pre.length <= 3 && pre.every((b) => /^h[1-6]$/.test(b.t) || (b.t === "p" && b.text.length < 60))) pre.forEach((b) => eyebrow.push(b.text));
    else carried.push(...pre);
    k = t;
    const parts = [];
    while (k < bl.length && bl[k].t === level) parts.push(bl[k++].text);
    title = parts.join(" ");
  } else {
    title = (lp.title || "").replace(/\s*\|\s*Quadra.*$/, "");
  }
  // a short line straight after the title is a category label (e.g. a case study's industry)
  if (k < bl.length && bl[k].t === "p" && bl[k].text.split(/\s+/).length <= 4 && !/[.?!]$/.test(bl[k].text)) eyebrow.push(bl[k++].text);
  const intro = [];
  while (k < bl.length && bl[k].t === "p" && intro.length < 3) intro.push(bl[k++].text);
  const links = [];
  while (k < bl.length && bl[k].t === "link") links.push(bl[k++]);
  let heroImg = null;
  if (k < bl.length && bl[k].t === "img") heroImg = bl[k++];
  const rest = carried.concat(bl.slice(k).filter((b) => !(b.t === "img" && !meta.article))); // decorative hero art is dropped outside articles
  return {
    html: `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner">
  <div class="hero-meta">${meta.breadcrumb}${stageChip(meta.stage)}</div>
  ${eyebrow.length ? `<p class="badge">${esc(eyebrow.join(" · "))}</p>` : ""}
  <h1 class="display"><span class="grad">${esc(title || meta.fallbackTitle)}</span></h1>
  ${intro.length ? `<div class="hero-intro">${intro.map((p) => `<p>${esc(p)}</p>`).join("")}</div>` : ""}
  ${links.length ? `<div class="actions center">${links.map((l, i) => liveAnchor(l, lp.path, "btn " + (i ? "btn-ghost" : "btn-primary"))).join("")}</div>` : ""}
</div></section>${meta.article && heroImg ? `<div class="container"><figure class="figure hero-figure">${img(heroImg, "figure-img", 2048)}</figure></div>` : ""}`,
    rest,
    before: sections.slice(0, hi),
    others: sections.slice(hi + 1),
    title: title || meta.fallbackTitle,
  };
}

function liveTitleOf(lp) {
  const h1 = [];
  for (const s of lp.sections) for (const b of s.blocks) if (b.t === "h1") h1.push(b.text);
  if (h1.length) return h1.join(" ");
  const h2 = lp.sections.flatMap((s) => s.blocks).find((b) => b.t === "h2");
  return h2 ? h2.text : (lp.title || lp.path).replace(/\s*\|\s*Quadra.*$/, "");
}

function liveBreadcrumb(p, title) {
  const segs = p.split("/").filter(Boolean);
  const parts = [`<a href="/">Home</a>`];
  for (let i = 1; i < segs.length; i++) {
    const sub = "/" + segs.slice(0, i).join("/");
    const loc = LOCAL.get(sub);
    if (!loc) continue;
    const name = loc.id ? byId[loc.id].title : liveTitleOf(loc.live);
    parts.push(`<a href="${hrefFor(sub)}">${esc(name)}</a>`);
  }
  parts.push(`<span aria-current="page">${esc(title)}</span>`);
  return `<nav class="breadcrumb" aria-label="Breadcrumb">${parts.join('<span class="sep">/</span>')}</nav>`;
}

function renderLivePage(lp, { stage, crumbs, fallbackTitle }) {
  const article = isArticlePath(lp.path);
  if (!lp.sections.length) {
    return `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner">
  <div class="hero-meta">${crumbs}${stageChip(stage)}</div>
  <h1 class="display"><span class="grad">${esc(fallbackTitle)}</span></h1>
  <div class="hero-intro"><p>This page's content could not be read as regular page text.</p></div>
  <div class="actions center"><a class="btn btn-primary" href="${esc(LIVE + lp.path)}" target="_blank" rel="noopener noreferrer">Open the live page ↗</a></div>
</div></section>`;
  }
  const hero = liveHero(lp, { stage, breadcrumb: crumbs, fallbackTitle, article });
  const out = [hero.html];
  if (article) {
    const blocks = hero.before.flatMap((s) => s.blocks).concat(hero.rest, hero.others.flatMap((s) => s.blocks));
    out.push(`<section class="section article"><div class="container"><div class="prose reveal">${proseHtml(blocks, lp.path)}</div></div></section>`);
  } else {
    for (const s of hero.before) out.push(renderLiveSection(s.blocks, lp.path));
    if (hero.rest.length) out.push(renderLiveSection(hero.rest, lp.path));
    for (const s of hero.others) out.push(renderLiveSection(s.blocks, lp.path));
  }
  out.push(`<div class="container"><p class="source-note">Existing content from the live page <a href="${esc(LIVE + lp.path)}" target="_blank" rel="noopener noreferrer">${esc(LIVE.replace("https://www.", "") + lp.path)} ↗</a> · extracted read-only.</p></div>`);
  return out.join("\n");
}

// Case study cards for Happy Customers, built from the extracted case pages.
function caseCards() {
  const cases = [...livePages.values()].filter((lp) => /^\/happy\/[^/]+$/.test(lp.path));
  return cases
    .map((lp) => {
      const bl = lp.sections.flatMap((s) => usable(s.blocks));
      const t = bl.findIndex((b) => b.t === "h2");
      const title = t >= 0 ? bl[t].text : liveTitleOf(lp);
      const industry = t >= 0 && bl[t + 1] && bl[t + 1].t === "p" && bl[t + 1].text.split(/\s+/).length <= 4 ? bl[t + 1].text : "";
      const pic = bl.find((b) => b.t === "img");
      const oi = bl.findIndex((b) => /^h[3-6]$/.test(b.t) && /^outcome$/i.test(b.text));
      const summary = oi >= 0 && bl[oi + 1] && bl[oi + 1].t === "p" ? bl[oi + 1].text : (bl.find((b) => b.t === "p" && b.text.length > 60) || {}).text || "";
      return { path: lp.path, title, industry, pic, summary };
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

// ---------- site index & 404 ----------
const stageOf = (p) => (LOCAL.get(PATHS[p.id]).kind === "retained" ? "live_retained" : p.stage);
const LIVE_GROUPS = [
  [/^\/happy\//, "Case studies (existing collection)"],
  [/^\/newsroom\//, "Blog posts"],
  [/^\/foundersblog\//, "Founder blogs"],
  [/^\/pressrelease\//, "Press releases"],
  [/^\/technology\/aws\/microsite\//, "AWS microsites"],
  [/^\/solutions\/platforms-ip\//, "Platforms & IP products"],
  [/./, "Other existing live pages"],
];

function siteIndex() {
  const tops = pages.filter((p) => !p.parent || !byId[p.parent]);
  const descendants = (id) => pages.filter((q) => q.parent === id).flatMap((q) => [q, ...descendants(q.id)]);
  const groups = tops.map((t) => {
    const list = [t, ...descendants(t.id)];
    return `<div class="index-group reveal"><h2>${esc(t.title)}</h2><ul class="index-list">${list
      .map((q) => `<li><a href="${href(q.id)}">${esc(q.title)}<code>${esc(PATHS[q.id])}</code>${stageChip(stageOf(q))}</a></li>`)
      .join("")}</ul></div>`;
  });
  const liveOnly = [...LOCAL.entries()].filter(([, v]) => v.kind === "live").sort(([a], [b]) => a.localeCompare(b));
  const byGroup = new Map(LIVE_GROUPS.map(([, name]) => [name, []]));
  for (const [p, v] of liveOnly) byGroup.get(LIVE_GROUPS.find(([re]) => re.test(p))[1]).push([p, v]);
  const liveGroups = [...byGroup].filter(([, list]) => list.length).map(
    ([name, list]) => `<div class="index-group reveal"><h2>${esc(name)} <span class="small">(${list.length})</span></h2><ul class="index-list">${list
      .map(([p, v]) => `<li><a href="${hrefFor(p)}">${esc(liveTitleOf(v.live))}<code>${esc(p)}</code>${stageChip("live")}</a></li>`)
      .join("")}</ul></div>`
  );
  return `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner">
  <p class="badge">Local build · ${LOCAL.size} pages</p>
  <h1 class="display"><span class="grad">All pages</span></h1>
  <div class="hero-intro"><p>${pages.length} pages from content master v${esc(D.version)}, plus ${liveOnly.length} existing live pages extracted read-only from quadrasystems.net.</p></div>
</div></section>
<section class="section"><div class="container">${groups.join("")}${liveGroups.length ? `<h2 class="index-divider">Existing live pages not in the content pack</h2>` + liveGroups.join("") : ""}</div></section>`;
}

// ---------- write ----------
function cleanOut() {
  if (fs.existsSync(OUT)) {
    if (!fs.existsSync(path.join(OUT, MARKER))) throw new Error(OUT + " exists but was not generated by build_site.js; refusing to overwrite it.");
    fs.rmSync(OUT, { recursive: true, force: true });
  }
  fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });
  fs.writeFileSync(path.join(OUT, MARKER), "Generated by build_site.js from content.json. Edit content.json, then rebuild.\n");
}
function writePage(urlPath, html) {
  const dir = urlPath === "/" ? OUT : path.join(OUT, ...urlPath.split("/").filter(Boolean));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "index.html"), html);
}

cleanOut();
fs.copyFileSync(path.join(SRC, "site.css"), path.join(OUT, "assets", "site.css"));
fs.copyFileSync(path.join(SRC, "site.js"), path.join(OUT, "assets", "site.js"));

const HOME_TITLE = /^Quadra \| Enterprise Cloud & AI Solutions for Intelligent Business$/; // live pages without their own SEO title fall back to this
for (const p of pages) {
  const loc = LOCAL.get(PATHS[p.id]);
  const seo = p.seo || {};
  if (loc.kind === "retained") {
    const lp = loc.live;
    const body = renderLivePage(lp, { stage: "live_retained", crumbs: breadcrumb(p), fallbackTitle: p.title });
    writePage(PATHS[p.id], documentHtml({ title: lp.title && !HOME_TITLE.test(lp.title) ? lp.title : p.title + " | Quadra", description: lp.description, body, current: p }));
    continue;
  }
  const body = p.kind === "approved_modules" ? renderModules(p) : renderGeneric(p);
  writePage(PATHS[p.id], documentHtml({ title: seo.title || seo.seo_title || p.title + " | Quadra", description: seo.description || seo.meta_description, body, current: p }));
}
for (const [lpPath, loc] of LOCAL) {
  if (loc.kind !== "live") continue;
  const lp = loc.live;
  const t = liveTitleOf(lp);
  const body = renderLivePage(lp, { stage: "live", crumbs: liveBreadcrumb(lpPath, t), fallbackTitle: t });
  writePage(lpPath, documentHtml({ title: lp.title && !HOME_TITLE.test(lp.title) ? lp.title : t + " | Quadra", description: lp.description, body, current: null, navTop: navTopForPath(lpPath) }));
}
writePage("/site-index", documentHtml({ title: "All pages | Quadra local build", description: "Index of every page in the local build.", body: siteIndex(), current: null }));
fs.writeFileSync(
  path.join(OUT, "404.html"),
  documentHtml({
    title: "Page not found | Quadra local build",
    description: "",
    current: null,
    body: `<section class="hero"><div class="hero-bg" aria-hidden="true"></div><div class="container hero-inner"><p class="badge">404</p><h1 class="display"><span class="grad">This page is not in the local build</span></h1><div class="actions center"><a class="btn btn-primary" href="/">Home${ICON.arrow}</a><a class="btn btn-ghost" href="/site-index/">All pages${ICON.arrow}</a></div></div></section>`,
  })
);
fs.writeFileSync(
  path.join(OUT, "routes.json"),
  JSON.stringify(
    {
      contentVersion: D.version,
      asOf: D.as_of,
      note: "Local paths. Existing live URLs are kept where established; other paths are proposals for this local build only. source: content = content.json, retained = live content kept for a pack placeholder, live = existing live page not in the pack.",
      pages: [...LOCAL.entries()].map(([p, v]) => ({ path: p, source: v.kind, id: v.id || null, title: v.id ? byId[v.id].title : liveTitleOf(v.live) })),
    },
    null,
    1
  )
);
const counts = {};
for (const v of LOCAL.values()) counts[v.kind] = (counts[v.kind] || 0) + 1;
console.log(JSON.stringify({ out: OUT, pages: LOCAL.size, ...counts, extra: ["site-index", "404"], version: D.version }));
