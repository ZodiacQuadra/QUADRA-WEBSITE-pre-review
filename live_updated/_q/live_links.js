// On unchanged live pages: links to pages rebuilt with new content must load the rebuilt page,
// not let Framer's in-page router render the old version. window.Q_REBUILT lists those paths.
(function () {
  var rebuilt = new Set(window.Q_REBUILT || []);
  window.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[href]") : null;
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || a.target === "_blank") return;
    var url;
    try { url = new URL(a.getAttribute("href"), location.href); } catch (err) { return; }
    if (url.origin !== location.origin) return;
    var p = decodeURI(url.pathname).replace(/\/+$/, "") || "/";
    if (!rebuilt.has(p)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(url.pathname + url.search + url.hash);
  }, true);
})();
