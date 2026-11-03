// Minimal, lossless-enough HTML tree for editing Framer's published markup (React output is well-formed).
// parse() → tree; serialize() → HTML. Text nodes keep their original source so untouched parts round-trip.
"use strict";

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
const RAW = new Set(["script", "style", "noscript", "template", "svg", "textarea"]);
const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘", rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…", copy: "©", reg: "®", trade: "™", middot: "·" };
const decode = (s) =>
  s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (m, e) =>
    e[0] === "#" ? String.fromCodePoint(e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : ENT[e.toLowerCase()] ?? m
  );
const escText = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function parseAttrs(s) {
  const attrs = {};
  for (const m of s.matchAll(/([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g)) attrs[m[1].toLowerCase()] = decode(m[2] ?? m[3] ?? m[4] ?? "");
  return attrs;
}

function parse(html) {
  const root = { tag: "#root", attrs: {}, children: [] };
  const stack = [root];
  const lower = html.toLowerCase();
  const re = /<!--[\s\S]*?-->|<!doctype[^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>|([^<]+)|</gi;
  let m;
  while ((m = re.exec(html))) {
    const top = stack[stack.length - 1];
    if (m[0].startsWith("<!")) top.children.push({ tag: "#raw", raw: m[0] });
    else if (m[1]) {
      const tag = m[1].toLowerCase();
      for (let i = stack.length - 1; i > 0; i--) if (stack[i].tag === tag) { stack.length = i; break; }
    } else if (m[2]) {
      const tag = m[2].toLowerCase();
      const node = { tag, attrs: parseAttrs(m[3] || ""), children: [] };
      top.children.push(node);
      if (RAW.has(tag) && !m[4]) {
        const end = lower.indexOf("</" + tag, re.lastIndex);
        node.raw = html.slice(re.lastIndex, end < 0 ? html.length : end);
        re.lastIndex = end < 0 ? html.length : html.indexOf(">", end) + 1;
      } else if (!VOID.has(tag) && !m[4]) stack.push(node);
    } else top.children.push({ tag: "#text", raw: m[0] });
  }
  return root;
}

function serialize(n) {
  if (n.tag === "#root") return n.children.map(serialize).join("");
  if (n.tag === "#text" || n.tag === "#raw") return n.raw;
  const attrs = Object.entries(n.attrs).map(([k, v]) => ` ${k}="${escAttr(v)}"`).join("");
  if (VOID.has(n.tag)) return `<${n.tag}${attrs}>`;
  if (n.raw !== undefined) return `<${n.tag}${attrs}>${n.raw}</${n.tag}>`;
  return `<${n.tag}${attrs}>${n.children.map(serialize).join("")}</${n.tag}>`;
}

// ---------- helpers ----------
const BLOCK = new Set(["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ul", "ol", "section", "br", "a", "article", "nav"]);
function textOf(n) {
  if (n.tag === "#text") return decode(n.raw);
  if (n.tag === "#raw" || n.raw !== undefined) return "";
  return (n.children || []).map((c) => (BLOCK.has(c.tag) ? " " + textOf(c) + " " : textOf(c))).join("");
}
const clean = (s) => s.replace(/\s+/g, " ").trim();
const text = (n) => clean(textOf(n));
const isEl = (n) => n && n.tag && n.tag[0] !== "#";

function walk(n, fn, parent = null) {
  if (fn(n, parent) === false) return;
  for (const c of n.children ? [...n.children] : []) walk(c, fn, n);
}
function findAll(n, pred) {
  const out = [];
  walk(n, (x, p) => { if (isEl(x) && pred(x, p)) out.push({ node: x, parent: p }); });
  return out;
}
const find = (n, pred) => (findAll(n, pred)[0] || {}).node || null;
function remove(node, parent) {
  if (!parent) return;
  const i = parent.children.indexOf(node);
  if (i >= 0) parent.children.splice(i, 1);
}
const textNode = (s) => ({ tag: "#text", raw: escText(s) });
const htmlNode = (html) => ({ tag: "#raw", raw: html });
const clone = (n) => JSON.parse(JSON.stringify(n));

module.exports = { parse, serialize, decode, escText, escAttr, text, textOf, clean, isEl, walk, findAll, find, remove, textNode, htmlNode, clone };
