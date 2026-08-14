(function () {
  if (window.__purelaneRevealInit) {
    window.__purelaneRevealScan && window.__purelaneRevealScan();
    return;
  }
  window.__purelaneRevealInit = true;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ro = null;

  function reveal(el) { el.classList.add('pl-in'); }

  function scan(root) {
    var scope = root || document;
    var els = scope.querySelectorAll('.pl-rv:not(.pl-in)');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(reveal);
      return;
    }
    if (!ro) {
      ro = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            ro.unobserve(entry.target);
          }
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
    }
    els.forEach(function (el) { ro.observe(el); });
  }

  window.__purelaneRevealScan = scan;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }

  // Theme Editor: re-scan a section when it's added or re-rendered.
  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });
})();
