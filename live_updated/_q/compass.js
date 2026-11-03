// The Compass — chat interface for the local copy. The live Compass AI service is not connected:
// answers are passages taken word for word from this site's own pages (search index built by build_live_copy.js),
// with links to the pages they come from. Nothing is sent anywhere.
(function () {
  var C = window.Q_COMPASS;
  if (!C) return;
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ICON = C.icon || ""; // the live Compass star, passed in by build_live_copy.js
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); };

  // ---------- search over the site's content ----------
  var STOP = new Set("a an the and or of to for in on with by how what why when where which who can could does do did is are was were be been our we us you your me my i show tell about from into at as it its this that these those quadra help helps get more any some there their them".split(" "));
  var SYN = {
    cost: ["finops", "spend", "optimization", "optimisation", "savings", "budget"], control: ["governance", "visibility"],
    ai: ["genai", "generative", "agentic", "intelligence", "machine", "learning", "models"], pilot: ["production", "scale", "prototype"],
    production: ["pilot", "scale", "operations"], security: ["secure", "cybersecurity", "threat", "protection", "defence", "defense", "zero", "trust"],
    people: ["workforce", "employees", "teams", "users"], workplace: ["workforce", "work", "collaboration", "workspace", "microsoft", "365"],
    life: ["pharma", "pharmaceutical", "biotech", "healthcare", "sciences"], science: ["pharma", "pharmaceutical", "biotech", "life"],
    cloud: ["azure", "aws", "google", "hybrid", "migration"], data: ["analytics", "databases", "database", "insights"], prem: ["premises", "hybrid", "datacenter"],
  };
  var stem = function (w) { return w.length > 4 ? w.replace(/ies$/, "y").replace(/(ing|ed|es|s)$/, "") : w; };
  var words = function (s) { return String(s).toLowerCase().replace(/[’']/g, "").split(/[^a-z0-9]+/).filter(Boolean); };
  var terms = function (s) { return words(s).filter(function (w) { return !STOP.has(w) && w.length > 1; }).map(stem); };

  var index = null, loading = null;
  function loadIndex() {
    if (loading) return loading;
    loading = fetch(C.index).then(function (r) { return r.json(); }).then(function (data) {
      var passages = [], df = {};
      data.docs.forEach(function (d, di) {
        d.x.forEach(function (pair, pos) {
          var toks = terms(pair[0] + " " + pair[1] + (d.tag ? " " + d.tag : ""));
          var tf = {};
          toks.forEach(function (t) { tf[t] = (tf[t] || 0) + 1; });
          Object.keys(tf).forEach(function (t) { df[t] = (df[t] || 0) + 1; });
          passages.push({ doc: di, pos: pos, head: pair[0], headTerms: new Set(terms(pair[0])), text: pair[1], tf: tf, list: /^[^.]{0,40}:\s/.test(pair[1]) });
        });
      });
      index = { docs: data.docs, passages: passages, df: df, n: passages.length, titleTerms: data.docs.map(function (d) { return new Set(terms(d.t + " " + (d.tag || ""))); }) };
      return index;
    });
    return loading;
  }
  function search(q) {
    var base = terms(q), weighted = {};
    base.forEach(function (t) { weighted[t] = 1; (SYN[t] || []).forEach(function (s) { s = stem(s); if (!weighted[s]) weighted[s] = 0.5; }); });
    var qt = Object.keys(weighted);
    if (!qt.length) return [];
    var wantsCases = /\b(work|case|cases|customers?|examples?|stories|story|projects?)\b/i.test(q);
    var best = {};
    index.passages.forEach(function (p) {
      var s = 0;
      qt.forEach(function (t) { var f = p.tf[t]; if (f) s += weighted[t] * (1 + Math.log(f)) * Math.log(1 + index.n / index.df[t]); });
      if (!s) return;
      var d = index.docs[p.doc];
      qt.forEach(function (t) { if (index.titleTerms[p.doc].has(t)) s += 1.5 * weighted[t]; if (p.headTerms.has(t)) s += 0.8 * weighted[t]; });
      if (p.pos < 2) s *= 1.4; // a page's own introduction answers "what do you offer" best
      if (p.list) s *= 0.6; // "Databases: SQL Server, …" style detail lines make poor answers
      // case studies answer "show me your work" questions; otherwise service pages come first
      s *= d.k === "case" ? (wantsCases ? 1.35 : 0.7) : 1;
      if (HUBS.test(d.u)) s *= 0.85; // overview pages repeat the summaries of the pages they link to
      if (!best[p.doc] || best[p.doc].score < s) best[p.doc] = { score: s, p: p };
    });
    return Object.keys(best).map(function (k) { return { doc: index.docs[k], score: best[k].score, p: best[k].p }; }).sort(function (a, b) { return b.score - a.score; });
  }
  var HUBS = /^\/(solutions|technology|why-quadra)?$/;
  // the sentences of a passage that carry the most of the question's words (a sentence ends at . ! ? followed by a space,
  // so figures such as "₹1.7 crores" stay whole)
  function excerpt(text, q, max) {
    var qt = new Set(terms(q));
    var sents = String(text).split(/(?<=[.!?])\s+(?=[A-Z0-9“"(₹$])/);
    var scored = sents.map(function (s, i) { var hit = 0; terms(s).forEach(function (t) { if (qt.has(t)) hit++; }); return { s: s.trim(), i: i, hit: hit }; });
    var pick = scored.slice().sort(function (a, b) { return b.hit - a.hit || a.i - b.i; }).slice(0, max).sort(function (a, b) { return a.i - b.i; });
    return { text: pick.map(function (x) { return x.s; }).join(" "), hits: pick.reduce(function (n, x) { return n + x.hit; }, 0) };
  }
  function answer(q) {
    var hits = search(q);
    if (!hits.length || hits[0].score < 2) return null;
    var top = hits[0], first = excerpt(top.p.text, q, 2), parts = [first.text];
    var second = hits[1];
    if (second && second.score > top.score * 0.8 && second.doc.u !== top.doc.u && second.doc.k === top.doc.k) {
      var more = excerpt(second.p.text, q, 1);
      var norm = function (s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(); };
      // add it only when it says something new and relevant
      if (more.hits >= 3 && norm(first.text).indexOf(norm(more.text)) < 0) parts.push(more.text);
    }
    var sources = [], seen = new Set();
    hits.slice(0, 8).forEach(function (h, i) {
      if (sources.length >= 3 || seen.has(h.doc.u) || h.score < top.score * 0.55) return;
      if (i > 0 && HUBS.test(h.doc.u)) return; // overview pages only when they are the best answer
      seen.add(h.doc.u); sources.push(h.doc);
    });
    return { text: parts.join(" "), sources: sources };
  }

  // ---------- chat interface ----------
  function setup(root) {
    var log = root.querySelector(".q-chat-log"), form = root.querySelector(".q-chat-form"), input = form.querySelector("textarea"), send = form.querySelector(".q-chat-send");
    var welcome = log.innerHTML, busy = false;
    var scroll = function () { log.scrollTop = log.scrollHeight; };
    function autosize() { input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 140) + "px"; send.disabled = busy || !input.value.trim(); }
    function bot(html) {
      var el = document.createElement("div");
      el.className = "q-msg q-bot";
      el.innerHTML = '<span class="q-msg-av">' + ICON + '</span><div class="q-bubble">' + html + "</div>";
      log.appendChild(el); scroll();
      return el.querySelector(".q-bubble");
    }
    function stream(target, text, done) {
      var w = text.split(" "), i = 0;
      if (reduce) { target.textContent = text; return done(); }
      (function step() {
        i = Math.min(w.length, i + 2);
        target.textContent = w.slice(0, i).join(" ");
        scroll();
        if (i < w.length) setTimeout(step, 28); else done();
      })();
    }
    function tools(bubble, text) {
      var bar = document.createElement("div");
      bar.className = "q-msg-tools";
      bar.innerHTML = '<button type="button" data-a="copy" title="Copy answer" aria-label="Copy answer"><svg viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.7"/><path d="M5 15V5a1 1 0 0 1 1-1h10" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg></button>' +
        '<button type="button" data-a="up" title="Helpful" aria-label="Helpful" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none"><path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button>' +
        '<button type="button" data-a="down" title="Not helpful" aria-label="Not helpful" aria-pressed="false"><svg viewBox="0 0 24 24" fill="none" style="transform:rotate(180deg)"><path d="M7 11v9H4v-9h3Zm0 0 4-7a2 2 0 0 1 3 2l-1 4h5a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></button><span class="q-tool-note" aria-live="polite"></span>';
      bar.addEventListener("click", function (e) {
        var b = e.target.closest("button"); if (!b) return;
        var note = bar.querySelector(".q-tool-note");
        if (b.dataset.a === "copy") { try { navigator.clipboard.writeText(text); note.textContent = "Copied"; } catch (err) { note.textContent = ""; } setTimeout(function () { note.textContent = ""; }, 1500); return; }
        bar.querySelectorAll('[data-a="up"],[data-a="down"]').forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
        note.textContent = "Thanks for the feedback";
      });
      bubble.appendChild(bar);
    }
    function ask(q) {
      q = String(q || "").trim();
      if (!q || busy) return;
      busy = true;
      var starters = log.querySelector(".q-starter-block");
      if (starters) starters.remove();
      var me = document.createElement("div");
      me.className = "q-msg q-me";
      me.innerHTML = '<div class="q-bubble">' + esc(q) + "</div>";
      log.appendChild(me);
      input.value = ""; autosize();
      var thinking = bot('<span class="q-typing" aria-label="' + esc(C.loading) + '"><i></i><i></i><i></i></span><span class="q-typing-text">' + esc(C.loading) + "</span>");
      var started = Date.now();
      loadIndex().then(function () {
        var a = answer(q);
        setTimeout(function () {
          thinking.innerHTML = "";
          if (!a) {
            thinking.innerHTML = "<p></p>";
            stream(thinking.querySelector("p"), C.fallback, function () {
              var acts = document.createElement("div");
              acts.className = "q-msg-actions";
              acts.innerHTML = (C.actions || []).map(function (x, i) { return '<a class="q-chip-btn' + (i ? "" : " q-primary") + '" href="' + esc(x.href) + '">' + esc(x.label) + "</a>"; }).join("");
              thinking.appendChild(acts); tools(thinking, C.fallback); busy = false; autosize(); scroll();
            });
            return;
          }
          thinking.innerHTML = '<span class="q-msg-label">' + esc(C.answerLabel) + "</span><p></p>";
          stream(thinking.querySelector("p"), a.text, function () {
            // the answer names one of Quadra's platforms: show its real logo, linked to its page
            var named = (C.products || []).filter(function (pr) { return new RegExp("\\b" + pr.name + "\\b").test(a.text + " " + a.sources.map(function (d) { return d.t; }).join(" ")); });
            if (named.length) {
              var marks = document.createElement("div");
              marks.className = "q-logos q-msg-logos";
              marks.innerHTML = named.map(function (pr) { return pr.html; }).join("");
              thinking.appendChild(marks);
            }
            var src = document.createElement("div");
            src.className = "q-sources";
            src.innerHTML = '<span class="q-msg-label">' + esc(C.sourceLabel) + "</span>" + a.sources.map(function (d, i) {
              return '<a class="q-source" href="' + esc(d.u) + '"><span class="q-source-n">' + (i + 1) + '</span><span class="q-source-t"><b>' + esc(d.t) + "</b><small>" + esc(d.k === "case" ? "Case study" + (d.tag ? " · " + d.tag : "") : d.u) + '</small></span><span class="q-source-go">↗</span></a>';
            }).join("");
            thinking.appendChild(src); tools(thinking, a.text); busy = false; autosize(); scroll();
          });
        }, Math.max(0, 900 - (Date.now() - started)));
      }).catch(function () {
        thinking.innerHTML = "<p>" + esc(C.fallback) + "</p>"; busy = false; autosize();
      });
    }
    form.addEventListener("submit", function (e) { e.preventDefault(); ask(input.value); });
    input.addEventListener("input", autosize);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); ask(input.value); } });
    log.addEventListener("click", function (e) { var s = e.target.closest(".q-starter"); if (s) ask(s.textContent); });
    root.querySelector(".q-chat-new").addEventListener("click", function () { if (busy) return; log.innerHTML = welcome; input.focus(); });
    autosize();
    return { ask: ask, focus: function () { input.focus(); } };
  }

  var chats = {};
  document.querySelectorAll("[data-q-chat]").forEach(function (el) { chats[el.getAttribute("data-q-chat")] = setup(el); });

  // floating launcher → popover chat (on the homepage it opens the chat in the page instead)
  var launch = document.querySelector(".q-launch"), pop = document.querySelector(".q-chat-pop");
  function openPop(on) {
    if (!pop) return;
    pop.hidden = !on;
    launch.classList.toggle("q-hide", on);
    if (on) { loadIndex(); setTimeout(function () { chats.pop && chats.pop.focus(); }, 50); }
  }
  if (launch) launch.addEventListener("click", function () {
    var inline = document.querySelector('[data-q-chat="inline"]');
    if (inline && inline.getBoundingClientRect().height) { inline.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" }); chats.inline.focus(); loadIndex(); return; }
    openPop(true);
  });
  if (pop) {
    pop.querySelector(".q-chat-close").addEventListener("click", function () { openPop(false); launch.focus(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && !pop.hidden) openPop(false); });
  }
})();
