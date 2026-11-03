// Read-only extraction of the published Quadra website (the Framer project's live output).
// Fetches each page listed in the live sitemap, keeps what a desktop visitor sees, and saves
// headings, paragraphs, list items, links and images in page order to ./live_extract.
// Usage: node extract_live.js            (all pages)
//        node extract_live.js /happy /technology/aws   (only these paths, for testing)
// Nothing is sent to Framer or the website other than ordinary page requests.
"use strict";
const fs = require("fs");
const path = require("path");

const BASE = "https://www.quadrasystems.net";
const OUT = path.join(__dirname, "live_extract");
const DESKTOP_WIDTH = 1440;
const UA = { "user-agent": "Mozilla/5.0 (Quadra content extraction, read-only)" };

// ---------- minimal HTML parser (Framer output is well-formed React markup) ----------
const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "noscript", "template", "svg", "textarea"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", copy: "©", reg: "®", trade: "™", middot: "·", bull: "•" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) => {
    if (e[0] === "#") return String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
    return ENT[e.toLowerCase()] ?? m;
  });

function parseAttrs(s) {
  const attrs = {};
  for (const m of s.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  }
  return attrs;
}

function parseHTML(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)|</gi;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const node = { tag, attrs: parseAttrs(m[3] || ""), children: [] };
      top.children.push(node);
      if (RAW.has(tag)) {
        const end = html.toLowerCase().indexOf("</" + tag, re.lastIndex);
        node.raw = html.slice(re.lastIndex, end < 0 ? html.length : end);
        if (end >= 0) re.lastIndex = html.indexOf(">", end) + 1;
      } else if (!VOID.has(tag) && !m[4]) {
        stack.push(node);
      }
    } else if (m[5]) {
      top.children.push({ tag: "#text", text: decode(m[5]) });
    }
  }
  return root;
}

// ---------- desktop visibility (Framer hides off-breakpoint variants with .hidden-xxxx classes) ----------
function mediaMatches(q, w) {
  let ok = true;
  for (const m of q.matchAll(/\((min|max)-width:\s*([\d.]+)px\)/g)) ok = ok && (m[1] === "min" ? w >= +m[2] : w <= +m[2]);
  return ok;
}
function hiddenClassesAt(css, width) {
  const hidden = new Set();
  for (const m of css.matchAll(/@media\s*([^{]+)\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)) {
    if (!mediaMatches(m[1], width)) continue;
    for (const r of m[2].matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      if (!/display:\s*none/.test(r[2])) continue;
      for (const c of r[1].matchAll(/\.(hidden-[\w-]+)/g)) hidden.add(c[1]);
    }
  }
  return hidden;
}

// Block-level boundaries become spaces so separate lines don't run together; inline spans stay joined.
const BLOCK = new Set(["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "section", "br", "a", "article"]);
const text = (n) =>
  n.tag === "#text" ? n.text : n.raw !== undefined ? "" : (n.children || []).map((c) => (BLOCK.has(c.tag) ? " " + text(c) + " " : text(c))).join("");
const clean = (s) => s.replace(/\s+/g, " ").trim();
const find = (n, pred) => { if (pred(n)) return n; for (const c of n.children || []) { const r = find(c, pred); if (r) return r; } return null; };
const any = (n, pred) => !!find(n, pred);

function extractPage(html, pagePath) {
  const doc = parseHTML(html);
  const css = [];
  (function collect(n) { if (n.tag === "style" && n.raw) css.push(n.raw); (n.children || []).forEach(collect); })(doc);
  const hidden = hiddenClassesAt(css.join("\n"), DESKTOP_WIDTH);
  const isHidden = (n) => {
    if (!n.attrs) return false;
    const cls = (n.attrs.class || "").split(/\s+/);
    if (cls.some((c) => hidden.has(c))) return true;
    return /(^|;)\s*display:\s*none/.test(n.attrs.style || "");
  };

  const meta = (name) => { const m = find(doc, (n) => n.tag === "meta" && (n.attrs.name === name || n.attrs.property === name)); return m ? m.attrs.content || "" : ""; };
  const titleNode = find(doc, (n) => n.tag === "title");
  const main = find(doc, (n) => n.attrs && n.attrs.id === "main");
  if (!main) throw new Error("no #main element");

  // page root: descend through wrappers that hold the only visible, non-empty content
  const elems = (n) => (n.children || []).filter((c) => c.tag !== "#text" && c.raw === undefined && !isHidden(c));
  const contentful = (n) => elems(n).filter((c) => clean(text(c)));
  let rootNode = main;
  for (let i = 0; i < 8 && contentful(rootNode).length === 1; i++) rootNode = contentful(rootNode)[0];
  const flatten = (list) => list.flatMap((c) => (/\bssr-variant\b/.test(c.attrs.class || "") ? flatten(elems(c)) : [c]));
  const sectionNodes = flatten(elems(rootNode));

  const named = (n, re) => any(n, (x) => x.attrs && re.test(x.attrs["data-framer-name"] || ""));
  const out = [];
  for (const sec of sectionNodes) {
    const seen = new Set(); // duplicates (carousel/marquee loops) repeat within a section; listings may legitimately repeat across sections
    const all = clean(text(sec));
    if (!all) continue;
    if (named(sec, /^(Menu \[Desktop\]|Mobile Menu|Main Area|Menu Item Dropdown)$/)) continue; // navigation
    if (/Quadrasystems\.net © All rights reserved/.test(all) || named(sec, /^Footer/i)) continue; // footer
    const blocks = [];
    const walk = (n, into) => {
      if (n.tag === "#text" || isHidden(n) || n.raw !== undefined) return;
      const t = n.tag;
      if (t === "li" && any(n, (x) => x !== n && (/^h[1-6]$/.test(x.tag) || x.tag === "p"))) {
        (n.children || []).forEach((c) => walk(c, into)); // structured list item: keep its heading/paragraphs
        return;
      }
      if (/^h[1-6]$/.test(t) || t === "p" || t === "li") {
        const s = clean(text(n));
        if (!s) return;
        const key = t[0] + ":" + s;
        if (s.length > 20 && seen.has(key)) return; // carousel / marquee duplicates
        seen.add(key);
        into.push({ t: t === "li" ? "li" : t, text: s });
        return;
      }
      if (t === "a" && n.attrs.href) {
        const s = clean(text(n));
        const big = any(n, (x) => /^h[1-6]$/.test(x.tag) || x.tag === "img") || s.length > 90;
        if (!big) {
          if (s) into.push({ t: "link", text: s, href: n.attrs.href });
          return;
        }
        const card = { t: "card", href: n.attrs.href, blocks: [] };
        (n.children || []).forEach((c) => walk(c, card.blocks));
        const sig = "card:" + n.attrs.href + JSON.stringify(card.blocks.slice(0, 2));
        if (card.blocks.length && !seen.has(sig)) { seen.add(sig); into.push(card); }
        return;
      }
      if (t === "pre" || t === "code") {
        const s = text(n).trim();
        if (s) into.push({ t: "pre", text: s });
        return;
      }
      // loose text sitting directly in a container (e.g. plain-text embeds)
      const loose = clean((n.children || []).filter((c) => c.tag === "#text").map((c) => c.text).join(" "));
      if (loose.length > 20 && !seen.has("p:" + loose)) { seen.add("p:" + loose); into.push({ t: "p", text: loose }); }
      if (t === "img" && n.attrs.src) {
        const sizes = n.attrs.sizes || "";
        const w = +((sizes.match(/(\d+(?:\.\d+)?)px/) || [])[1] || n.attrs.width || 0);
        if (w && w < 64) return; // icons, small logos
        const src = n.attrs.src.split("?")[0];
        if (seen.has("img:" + src)) return;
        seen.add("img:" + src);
        into.push({ t: "img", src, alt: n.attrs.alt || "", w: Math.round(w) || null });
        return;
      }
      (n.children || []).forEach((c) => walk(c, into));
    };
    walk(sec, blocks);
    if (blocks.length) out.push({ name: sec.attrs["data-framer-name"] || "", blocks });
  }
  return {
    path: pagePath,
    url: BASE + pagePath,
    title: clean(titleNode ? text(titleNode) : ""),
    description: meta("description"),
    ogImage: meta("og:image"),
    robots: meta("robots"),
    sections: out,
  };
}

// ---------- run ----------
const fileFor = (p) => (p === "/" ? "home" : p.slice(1).replace(/[^\w.-]+/g, "__")) + ".json";

async function listPaths() {
  const xml = await (await fetch(BASE + "/sitemap.xml", { headers: UA })).text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => decodeURI(new URL(m[1].trim()).pathname).replace(/\/+$/, "") || "/")
    .filter((p) => !/^\/[A-Za-z0-9_-]{9}$/.test(p) || !/[A-Z0-9_]/.test(p.slice(1))) // drop legacy "/:id" kit pages
    .concat(["/404"])
    .filter((p, i, a) => a.indexOf(p) === i);
}

(async () => {
  const only = process.argv.slice(2);
  const paths = only.length ? only : await listPaths();
  fs.mkdirSync(path.join(OUT, "pages"), { recursive: true });
  const index = [];
  let i = 0;
  const worker = async () => {
    while (i < paths.length) {
      const p = paths[i++];
      try {
        // Under parallel load the site sometimes returns a page without its content; retry those.
        let res, page;
        for (let attempt = 1; attempt <= 4; attempt++) {
          res = await fetch(BASE + encodeURI(p), { headers: UA });
          page = extractPage(await res.text(), p);
          if (page.sections.length || res.status !== 200) break;
          await new Promise((r) => setTimeout(r, 1500 * attempt));
        }
        page.status = res.status;
        fs.writeFileSync(path.join(OUT, "pages", fileFor(p)), JSON.stringify(page, null, 1));
        const blocks = page.sections.reduce((n, s) => n + s.blocks.length, 0);
        index.push({ path: p, file: "pages/" + fileFor(p), status: res.status, title: page.title, sections: page.sections.length, blocks });
      } catch (e) {
        index.push({ path: p, error: String(e.message || e) });
      }
    }
  };
  await Promise.all([worker(), worker(), worker()]);
  index.sort((a, b) => a.path.localeCompare(b.path));
  if (!only.length) {
    fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify({ source: BASE, extractedAt: new Date().toISOString(), note: "Read-only extraction of the published Framer site. Desktop view; navigation and footer removed.", pages: index }, null, 1));
  }
  const errors = index.filter((x) => x.error || x.status !== 200);
  console.log(JSON.stringify({ pages: index.length, errors: errors.length, sample: errors.slice(0, 5) }));
})();
