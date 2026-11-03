/* Progressive enhancement for the local review navigation only. No network or storage. */
(() => {
  'use strict';
  const menus = Array.from(document.querySelectorAll('details.nav-menu'));
  const summaryOf = menu => menu.querySelector('summary');
  const sync = menu => summaryOf(menu).setAttribute('aria-expanded', String(menu.open));
  const close = menu => { menu.open = false; sync(menu); };
  const closeAll = except => menus.forEach(menu => { if (menu !== except) close(menu); });
  const currentPage = () => {
    let id;
    try { id = decodeURIComponent(window.location.hash.slice(1)); } catch (_) { return null; }
    return document.getElementById(id || 'home');
  };
  const focusPage = () => {
    const page = currentPage();
    if (page && page.classList.contains('page')) page.focus({ preventScroll: true });
  };
  menus.forEach(menu => {
    const summary = summaryOf(menu);
    sync(menu);
    summary.addEventListener('click', () => {
      if (!menu.open) closeAll(menu);
      // Let native details activation handle both pointer and keyboard input.
    });
    menu.addEventListener('toggle', () => {
      if (menu.open) { closeAll(menu); menu.querySelector('.menu-panel').scrollTop = 0; }
      sync(menu);
    });
  });
  document.addEventListener('pointerdown', event => {
    if (!menus.some(menu => menu.contains(event.target))) closeAll();
  });
  document.addEventListener('focusin', event => {
    menus.forEach(menu => { if (menu.open && !menu.contains(event.target)) close(menu); });
  });
  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    const openMenu = menus.find(menu => menu.open);
    if (!openMenu) return;
    event.preventDefault();
    closeAll();
    summaryOf(openMenu).focus();
  });
  document.addEventListener('click', event => {
    const closeButton = event.target.closest && event.target.closest('[data-menu-close]');
    if (closeButton) {
      const menu = closeButton.closest('details.nav-menu');
      closeAll();
      if (menu) summaryOf(menu).focus();
      return;
    }
    const anchor = event.target.closest && event.target.closest('a[href]');
    if (!anchor) return;
    closeAll();
    if (anchor.getAttribute('href').startsWith('#')) {
      window.requestAnimationFrame(focusPage);
    }
  });
  window.addEventListener('hashchange', () => { closeAll(); focusPage(); });
})();
