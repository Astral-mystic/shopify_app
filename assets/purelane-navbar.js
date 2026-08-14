(function () {
  function initNavbar(root) {
    var header = root.querySelector('[data-pl-header]');
    var burger = root.querySelector('[data-pl-burger]');
    var menu = root.querySelector('[data-pl-mmenu]');
    if (!header || header.dataset.plInit) return;
    header.dataset.plInit = '1';

    // Shrink the pill slightly once the page has scrolled, like the prototype.
    var lastToggle = false;
    function onScroll() {
      var shrink = window.scrollY > 12;
      if (shrink !== lastToggle) {
        header.classList.toggle('pl-nav-up', shrink);
        lastToggle = shrink;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    if (!burger || !menu) return;

    function closeMenu() {
      menu.classList.remove('pl-open');
      burger.setAttribute('aria-expanded', 'false');
    }
    function openMenu() {
      menu.classList.add('pl-open');
      burger.setAttribute('aria-expanded', 'true');
    }
    function toggleMenu() {
      menu.classList.contains('pl-open') ? closeMenu() : openMenu();
    }

    burger.addEventListener('click', toggleMenu);
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
    document.addEventListener('click', function (e) {
      if (!menu.classList.contains('pl-open')) return;
      if (!root.contains(e.target)) closeMenu();
    });
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-section-type="navbar"]').forEach(initNavbar);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }
  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });
})();
