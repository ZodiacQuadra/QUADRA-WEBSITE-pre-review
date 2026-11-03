// Quadra local site: theme toggle, menus, reveal-on-scroll. No network calls, no data collection.
(function () {
  var root = document.documentElement;

  // Theme toggle (dark is the default, matching the live site)
  var toggle = document.querySelector("[data-theme-toggle]");
  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
      root.setAttribute("data-theme", next);
      toggle.setAttribute("aria-label", next === "light" ? "Switch to dark theme" : "Switch to light theme");
      try { localStorage.setItem("quadra-theme", next); } catch (e) {}
    });
  }

  // Menus: one open at a time; close on outside click or Escape
  var header = document.querySelector(".site-header");
  var menus = Array.prototype.slice.call(document.querySelectorAll(".nav-item"));
  menus.forEach(function (menu) {
    var summary = menu.querySelector("summary");
    summary.setAttribute("aria-expanded", "false");
    menu.addEventListener("toggle", function () {
      summary.setAttribute("aria-expanded", menu.open ? "true" : "false");
      if (menu.open) menus.forEach(function (other) { if (other !== menu) other.open = false; });
    });
  });
  document.addEventListener("click", function (event) {
    if (header && !header.contains(event.target)) {
      menus.forEach(function (m) { m.open = false; });
      setNavOpen(false);
    }
  });
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var open = menus.filter(function (m) { return m.open; })[0];
    menus.forEach(function (m) { m.open = false; });
    if (open) open.querySelector("summary").focus();
    else if (header && header.classList.contains("nav-open")) { setNavOpen(false); navToggle.focus(); }
  });

  // Mobile navigation
  var navToggle = document.querySelector("[data-nav-toggle]");
  function setNavOpen(open) {
    if (!header || !navToggle) return;
    header.classList.toggle("nav-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  if (navToggle) {
    navToggle.addEventListener("click", function () { setNavOpen(!header.classList.contains("nav-open")); });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < items.length; i++) items[i].classList.add("is-in");
    return;
  }
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); observer.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
  for (var j = 0; j < items.length; j++) observer.observe(items[j]);
})();
