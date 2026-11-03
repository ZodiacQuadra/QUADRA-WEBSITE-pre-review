// Interactions for rebuilt pages in the updated live copy: theme toggle, navigation panels, phone menu, reveal.
// Uses the same localStorage key ("theme": "Dark"/"Light") as the live site, so the choice carries across pages.
(function () {
  var root = document.documentElement;
  var nav = document.querySelectorAll("nav");

  // Theme: the live nav's moon link (href="#") toggles dark/light
  nav.forEach(function (n) {
    n.querySelectorAll('a[href="#"]').forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var next = root.getAttribute("data-q-theme") === "light" ? "dark" : "light";
        root.setAttribute("data-q-theme", next);
        try { localStorage.setItem("theme", next === "light" ? "Light" : "Dark"); } catch (err) {}
      });
    });
  });

  // Desktop panels: open from the live nav items that have dropdowns
  var panels = {};
  document.querySelectorAll(".q-menu").forEach(function (p) { panels[p.getAttribute("data-q-label")] = p; });
  var openPanel = null, closeTimer = null;
  function place(panel, anchor) {
    var shell = anchor.closest("nav") || anchor;
    panel.style.top = shell.getBoundingClientRect().bottom + 8 + "px";
  }
  function open(panel, anchor) {
    clearTimeout(closeTimer);
    if (openPanel && openPanel !== panel) openPanel.classList.remove("q-open");
    place(panel, anchor);
    panel.classList.add("q-open");
    openPanel = panel;
  }
  function close() { if (openPanel) openPanel.classList.remove("q-open"); openPanel = null; }
  function later() { clearTimeout(closeTimer); closeTimer = setTimeout(close, 220); }
  document.querySelectorAll('nav a[data-framer-name="Menu Item Dropdown"], nav a[data-framer-name="Menu Item Simple"]').forEach(function (a) {
    var label = (a.textContent || "").trim();
    var panel = panels[label];
    if (!panel) { a.addEventListener("mouseenter", later); return; }
    a.addEventListener("mouseenter", function () { open(panel, a); });
    a.addEventListener("mouseleave", later);
    a.addEventListener("click", function (e) { if (openPanel !== panel) { e.preventDefault(); open(panel, a); } });
  });
  Object.keys(panels).forEach(function (k) {
    panels[k].addEventListener("mouseenter", function () { clearTimeout(closeTimer); });
    panels[k].addEventListener("mouseleave", later);
  });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { close(); setMobile(false); } });
  document.addEventListener("click", function (e) { if (openPanel && !openPanel.contains(e.target) && !e.target.closest("nav")) close(); });
  window.addEventListener("scroll", function () { if (openPanel) close(); }, { passive: true });

  // Phone menu: the live hamburger opens the full navigation
  var mobile = document.querySelector(".q-mobile");
  function setMobile(on) { if (mobile) mobile.classList.toggle("q-open", on); document.body.style.overflow = on ? "hidden" : ""; }
  document.querySelectorAll('[data-framer-name="Mobile Menu"]').forEach(function (m) {
    m.style.cursor = "pointer";
    m.addEventListener("click", function (e) { e.preventDefault(); setMobile(true); });
  });
  if (mobile) mobile.querySelector(".q-mobile-close").addEventListener("click", function () { setMobile(false); });

  // Rebuilt heroes: the live hero boxes were sized for the old, shorter copy. Let them grow with the new text, keep a
  // steady eyebrow → title → intro → buttons rhythm, and lay a soft scrim behind text that sits on a photo.
  var touched = [];
  function setStyle(el, prop, val) {
    if (prop.indexOf("--") === 0) { touched.push([el, prop, el.style.getPropertyValue(prop), 1]); el.style.setProperty(prop, val); return; }
    touched.push([el, prop, el.style[prop]]); el.style[prop] = val;
  }
  function shown(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== "hidden"; }
  function lca(a, b) { var s = []; for (var x = a; x; x = x.parentElement) s.push(x); for (var y = b; y; y = y.parentElement) if (s.indexOf(y) >= 0) return y; return null; }
  // the child of `anc` that holds `n`, stepping through Framer's display:contents wrappers (margins don't apply to them)
  function childOn(anc, n) {
    var x = n;
    while (x && x.parentElement !== anc) x = x.parentElement;
    while (x && x !== n && getComputedStyle(x).display === "contents") { var y = n; while (y.parentElement !== x) y = y.parentElement; x = y; }
    return x;
  }
  function fitHero() {
    while (touched.length) { var t = touched.pop(); if (t[3]) t[0].style.setProperty(t[1], t[2]); else t[0].style[t[1]] = t[2]; }
    var phone = innerWidth < 810, gaps = phone ? [14, 10, 16, 22] : [18, 14, 20, 28];
    document.querySelectorAll("[data-q-hero]").forEach(function (hero) {
      if (!shown(hero)) return;
      var pick = function (sel) { return [].slice.call(hero.querySelectorAll(sel)).filter(shown)[0] || null; };
      // a product logo placed in one breakpoint's copy of the hero is repeated in the copy showing now
      [].slice.call(hero.querySelectorAll(".q-hero-logos[data-q-copy]")).forEach(function (x) { x.remove(); });
      var logoSrc = hero.querySelector(".q-hero-logos");
      if (logoSrc && !pick(".q-hero-logos")) {
        var at = pick("[data-q-eyebrow]") || pick("[data-q-title]");
        if (at) { var cp = logoSrc.cloneNode(true); cp.setAttribute("data-q-copy", ""); at.parentNode.insertBefore(cp, at); }
      }
      var eyebrow = pick("[data-q-eyebrow]"), title = pick("[data-q-title]"), intro = pick("[data-q-intro]"), logos = pick(".q-hero-logos");
      if (intro) intro.classList.remove("q-long");
      // a product logo above the copy follows the title's alignment
      if (logos && title && getComputedStyle(title).textAlign !== "center") setStyle(logos, "justifyContent", "flex-start");
      var last = intro || title;
      var actions = pick(".q-hero-actions") || (last ? [].slice.call(hero.querySelectorAll("a")).filter(function (a) { return shown(a) && a.querySelector("p") && last.compareDocumentPosition(a) & 4; })[0] || null : null);
      var heroH = hero.getBoundingClientRect().height;
      // text boxes stay inside the side gutters (some live phone title boxes are wider than the screen)
      var vw = document.documentElement.clientWidth, gut = phone ? 20 : 32;
      var parts = [actions, intro, title, eyebrow].filter(Boolean);
      var out = function (n) { var r = n.getBoundingClientRect(); return r.left < gut - 1 || r.right > vw - gut + 1; };
      if (parts.some(out)) {
        // 1. the column holding the copy gets the gutter as padding when it runs edge to edge
        var col = parts.reduce(function (a, b) { return a === b ? a : lca(a, b); });
        if (col && col !== hero && col.getBoundingClientRect().width > vw - 2 * gut) {
          setStyle(col, "paddingLeft", gut + "px"); setStyle(col, "paddingRight", gut + "px"); setStyle(col, "boxSizing", "border-box");
        }
        // 2. nothing wider than the space between the gutters; an over-long button label wraps inside the pill
        parts.forEach(function (n) {
          if (n === actions && n.tagName === "A" && out(n)) {
            var label = n.querySelector("p");
            if (label) { setStyle(label, "whiteSpace", "normal"); setStyle(label, "--framer-text-alignment", "center"); setStyle(label, "textAlign", "center"); }
            setStyle(n, "height", "auto");
          }
          if (n.getBoundingClientRect().width > vw - 2 * gut + 1) setStyle(n, "maxWidth", vw - 2 * gut + "px");
        });
        // 3. anything still outside moves in (centred text centres; the rest shifts by the overflow)
        parts.forEach(function (n) {
          if (!out(n)) return;
          if (getComputedStyle(n).textAlign === "center" && n !== actions) { setStyle(n, "marginLeft", "auto"); setStyle(n, "marginRight", "auto"); return; }
          var r = n.getBoundingClientRect(), shift = Math.min(Math.max(r.left, gut), vw - gut - r.width) - r.left;
          setStyle(n, "marginLeft", (parseFloat(getComputedStyle(n).marginLeft) || 0) + shift + "px");
        });
      }
      // an unusually long title steps down one size rather than running to 3+ lines (4+ on a phone)
      if (title) {
        var cs = getComputedStyle(title), fs = parseFloat(cs.fontSize), lh = parseFloat(cs.lineHeight) || fs * 1.1;
        if (Math.round(title.getBoundingClientRect().height / lh) > (phone ? 3 : 2)) { setStyle(title, "--framer-font-size", Math.round(fs * 0.82) + "px"); setStyle(title, "fontSize", Math.round(fs * 0.82) + "px"); }
      }
      // a readable measure for the longer intro copy (about 75 characters a line)
      if (intro && intro.getBoundingClientRect().width > 660) {
        setStyle(intro, "maxWidth", "640px");
        if (getComputedStyle(intro).textAlign === "center") { setStyle(intro, "marginLeft", "auto"); setStyle(intro, "marginRight", "auto"); }
      }
      [logos, eyebrow, title, intro].forEach(function (n) {
        if (!n) return;
        for (var a = n.parentElement; a && a !== hero; a = a.parentElement) {
          if (getComputedStyle(a).display === "contents") continue;
          var r = a.getBoundingClientRect(), b = n.getBoundingClientRect();
          if (b.top < r.top - 1 || b.bottom > r.bottom + 1) { setStyle(a, "height", "auto"); setStyle(a, "minHeight", "0"); }
        }
      });
      // minimum gap before each piece that is present: after the logo row, then before the title, intro, buttons
      var seq = [logos, eyebrow, title, intro, actions].filter(Boolean);
      var gapBefore = function (q, p) { return p === logos ? gaps[0] : q === title ? gaps[1] : q === intro ? gaps[2] : gaps[3]; };
      for (var i = 1; i < seq.length; i++) {
        var p = seq[i - 1], q = seq[i];
        var need = gapBefore(q, p) - (q.getBoundingClientRect().top - p.getBoundingClientRect().bottom);
        var c = need > 1 ? childOn(lca(p, q), q) : null;
        if (c) setStyle(c, "marginTop", (parseFloat(getComputedStyle(c).marginTop) || 0) + need + "px");
      }
      // an intro longer than 6 lines (at its final width) can't be balanced: let it avoid a lone last word instead
      if (intro) {
        // widths of the rendered lines, top to bottom
        var lineWidths = function () {
          var rg = document.createRange(), byTop = {};
          rg.selectNodeContents(intro);
          [].forEach.call(rg.getClientRects(), function (r) { if (r.width > 1) { var t = Math.round(r.top); byTop[t] = (byTop[t] || 0) + r.width; } });
          return Object.keys(byTop).sort(function (a, b) { return a - b; }).map(function (t) { return byTop[t]; });
        };
        var lw = lineWidths();
        if (lw.length > 6) {
          // balance it by hand: step in from the full width until the last line is at least 60% of the longest
          intro.classList.add("q-long");
          var orig = intro.style.maxWidth, full = intro.getBoundingClientRect().width, best = null;
          for (var w = full; w >= full * 0.8; w -= 6) {
            intro.style.maxWidth = w + "px";
            var ls = lineWidths();
            if (ls.length === lw.length && ls[ls.length - 1] >= 0.6 * Math.max.apply(null, ls)) { best = w; break; }
          }
          intro.style.maxWidth = orig;
          if (best && best < full) {
            setStyle(intro, "maxWidth", Math.ceil(best) + "px");
            if (getComputedStyle(intro).textAlign === "center") { setStyle(intro, "marginLeft", "auto"); setStyle(intro, "marginRight", "auto"); }
          }
        }
      }
      // hero buttons stacked on a narrow screen: one shared width and a tight 12px gap between them
      var btns = [].slice.call(hero.querySelectorAll(".q-hero-actions .q-btn, a")).filter(function (a) { return shown(a) && (a.classList.contains("q-btn") || a.querySelector("p")) && (!last || last.compareDocumentPosition(a) & 4); });
      if (btns.length > 1 && btns[1].getBoundingClientRect().top >= btns[0].getBoundingClientRect().bottom - 2) {
        var bw = Math.max.apply(null, btns.map(function (a) { return a.getBoundingClientRect().width; }));
        btns.forEach(function (a) { setStyle(a, "minWidth", Math.ceil(bw) + "px"); setStyle(a, "justifyContent", "center"); });
        for (var j = 1; j < btns.length; j++) {
          var extra = btns[j].getBoundingClientRect().top - btns[j - 1].getBoundingClientRect().bottom - 12;
          var wrap = extra > 1 ? childOn(lca(btns[j - 1], btns[j]), btns[j]) : null;
          if (wrap) setStyle(wrap, "marginTop", (parseFloat(getComputedStyle(wrap).marginTop) || 0) - extra + "px");
        }
      }
      // the grown text must not spill out of a fixed-height hero
      var end = (actions || last || hero).getBoundingClientRect().bottom, hb = hero.getBoundingClientRect().bottom;
      if (end > hb - 24) { setStyle(hero, "height", "auto"); setStyle(hero, "minHeight", heroH + "px"); }
      var hr = hero.getBoundingClientRect();
      var photo = [].slice.call(hero.querySelectorAll("img, video")).some(function (m) { var r = m.getBoundingClientRect(); return shown(m) && r.width * r.height > 0.5 * hr.width * hr.height; });
      hero.classList.toggle("q-photo-hero", photo);
      [].slice.call(hero.querySelectorAll(".q-hero-text")).forEach(function (x) { x.classList.remove("q-hero-text"); });
      var box = title && intro ? lca(title, intro) : title && title.parentElement;
      if (box && box !== hero) { box.classList.add("q-hero-text"); if (getComputedStyle(box).position === "static") setStyle(box, "position", "relative"); }
    });
    // EB Garamond's g, y, p, q paint past a 1.1 line box. Framer's gradient titles
    // (data-text-fill) are that full height, inside a wrapper exactly as tall as the
    // line with overflow hidden, so the tail is cut off. Let it paint when the clip
    // edge sits on the text. A tall card or section that merely contains the heading is left alone.
    document.querySelectorAll("[data-text-fill], h1, h2, h3").forEach(function (el) {
      if (!shown(el)) return;
      var box = el.getBoundingClientRect();
      if (box.height < 2) return;
      var inkBottom = box.bottom;
      [].forEach.call(el.querySelectorAll("[data-text-fill]"), function (s) {
        if (shown(s)) inkBottom = Math.max(inkBottom, s.getBoundingClientRect().bottom);
      });
      if (!el.hasAttribute("data-text-fill")) {
        var cs = getComputedStyle(el), fs = parseFloat(cs.fontSize) || 0, lh = parseFloat(cs.lineHeight) || fs;
        if (fs && lh < fs * 1.2 && /[gjpqy]/i.test(el.textContent || "")) inkBottom = Math.max(inkBottom, box.bottom + fs * 0.1);
      }
      if (inkBottom < box.bottom + 0.6) return;
      for (var a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        var st = getComputedStyle(a);
        if (st.display === "contents") continue;
        var oy = st.overflowY;
        if (oy !== "hidden" && oy !== "clip") continue;
        var r = a.getBoundingClientRect();
        if (inkBottom > r.bottom - 0.5 && r.bottom - box.bottom < 14) setStyle(a, "overflow", "visible");
      }
    });
  }
  var fitQueued = 0;
  // a short timer rather than requestAnimationFrame: it still runs in a background tab (e.g. a rotated, unfocused one)
  function queueFit() { clearTimeout(fitQueued); fitQueued = setTimeout(function () { fitQueued = 0; fitHero(); }, 60); }
  fitHero();
  addEventListener("resize", queueFit);
  addEventListener("load", queueFit);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(queueFit);

  // Live card effects (recognition card): Framer draws a starfield and a cobe globe with its script.
  // Draw them here: the globe runs the live site's own cobe code with the live settings.
  // Framer pre-renders an empty canvas for each: the globe's sits in a square, round-masked wrapper.
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isGlobe = function (cv) { return /aspect-ratio:\s*1\s*\/\s*1/.test(cv.parentElement.getAttribute("style") || ""); };
  function stars(cv) {
    var ctx = cv.getContext("2d"), dpr = Math.min(2, window.devicePixelRatio || 1), pts = [];
    function size() {
      var r = cv.getBoundingClientRect();
      cv.width = r.width * dpr; cv.height = r.height * dpr; pts = [];
      for (var i = 0, n = Math.round((r.width * r.height) / 2600); i < n; i++) pts.push({ x: Math.random(), y: Math.random(), r: (Math.random() * 1.1 + 0.4) * dpr, p: Math.random() * 6.28, s: 0.4 + Math.random() * 1.2 });
    }
    function frame(t) {
      ctx.clearRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#fff";
      for (var i = 0; i < pts.length; i++) {
        var q = pts[i];
        ctx.globalAlpha = 0.2 + 0.6 * (0.5 + 0.5 * Math.sin(q.p + t * 0.0012 * q.s));
        ctx.beginPath();
        ctx.arc(q.x * cv.width, (q.y * cv.height + (reduce ? 0 : t * 0.004 * q.s)) % cv.height, q.r, 0, 6.283);
        ctx.fill();
      }
      if (!reduce) requestAnimationFrame(frame);
    }
    size(); addEventListener("resize", size); requestAnimationFrame(frame);
  }
  function globe(cv) {
    if (!window.Q_GLOBE) return;
    import(window.Q_GLOBE).then(function (G) {
      G.i();
      if (typeof G.r !== "function") return;
      var size = cv.getBoundingClientRect().width, dpr = Math.min(2, window.devicePixelRatio || 1), phi = 0;
      cv.width = Math.round(size * dpr); // cobe draws at the canvas's own pixel size
      cv.height = Math.round(size * dpr);
      G.r(cv, {
        devicePixelRatio: dpr, width: size * dpr, height: size * dpr, phi: 0, theta: 0.3, dark: 1, diffuse: 3,
        mapSamples: 26154, mapBrightness: 12, baseColor: [105 / 255, 105 / 255, 105 / 255], markerColor: [1, 1, 1], glowColor: [84 / 255, 84 / 255, 84 / 255],
        markers: [{ location: [52.3676, 4.9041], size: 0.1 }], scale: 1, offset: [0, 0],
        onRender: function (s) { s.phi = phi; if (!reduce) phi += 0.0015; },
      });
    }).catch(function () {});
  }
  function effects() {
    document.querySelectorAll("[data-q-live]").forEach(function (sec) {
      if (getComputedStyle(sec).display === "none") return;
      sec.querySelectorAll("canvas").forEach(function (cv) {
        if (cv.__q || cv.getBoundingClientRect().width < 50) return;
        cv.__q = 1;
        if (isGlobe(cv)) globe(cv); else stars(cv);
      });
    });
  }
  effects(); addEventListener("resize", effects);

  // Reveal on scroll (the page head hides .q-reveal only while this runs; see q.css)
  window.Q_REVEAL = true;
  var items = document.querySelectorAll(".q-reveal");
  if (!("IntersectionObserver" in window)) { items.forEach(function (i) { i.classList.add("q-in"); }); return; }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("q-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  items.forEach(function (i) { io.observe(i); });
})();
