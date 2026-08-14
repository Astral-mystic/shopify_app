(function () {
  function initHero(root) {
    var stage = root.querySelector('[data-hero-stage]');
    if (!stage || stage.dataset.plInit) return;
    stage.dataset.plInit = '1';

    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var slides = [].slice.call(stage.querySelectorAll('.pl-hslide'));
    var dots = [].slice.call(root.querySelectorAll('[data-hero-dots] button'));
    if (slides.length < 2) return;

    var i = 0;
    var timer = null;

    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, idx) { s.classList.toggle('pl-on', idx === i); });
      dots.forEach(function (d, idx) { d.classList.toggle('pl-on', idx === i); });
    }
    function play() { if (!timer && !reduce) timer = setInterval(function () { go(i + 1); }, 3800); }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    dots.forEach(function (d, idx) {
      d.addEventListener('click', function () { stop(); go(idx); play(); });
    });
    stage.addEventListener('mouseenter', stop);
    stage.addEventListener('mouseleave', play);
    stage.addEventListener('focusin', stop);
    stage.addEventListener('focusout', play);

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (e) { e.isIntersecting ? play() : stop(); });
      }, { threshold: 0.2 }).observe(stage);
    } else {
      play();
    }
  }

  function scan(root) {
    (root || document).querySelectorAll('[data-section-type="hero"]').forEach(initHero);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { scan(); });
  } else {
    scan();
  }
  document.addEventListener('shopify:section:load', function (e) { scan(e.target); });
})();
