(function () {
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  /* Script loads at end of <body> — DOM is already ready */
  document.querySelectorAll('[data-section]').forEach(function (el) {
    observer.observe(el);
  });
})();

/* Desktop scroll-spy — marks the nav link whose section is in view.
   The .nav-link.active styling already lives in global.css; nothing was
   adding the class before, so the indicator never moved. */
(function () {
  var root = document.getElementById('desktop-scroll');
  if (!root) return;

  var links = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
  if (!links.length) return;

  var byId = {};
  links.forEach(function (a) {
    var id = (a.getAttribute('href') || '').slice(1);
    if (id) byId[id] = a;
  });

  var ratios = {};

  function refresh() {
    var best = null, bestRatio = 0;
    Object.keys(ratios).forEach(function (id) {
      if (ratios[id] > bestRatio) { bestRatio = ratios[id]; best = id; }
    });
    if (!best) return;
    links.forEach(function (a) { a.classList.remove('active'); });
    byId[best].classList.add('active');
  }

  var spy = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      ratios[e.target.id] = e.isIntersecting ? e.intersectionRatio : 0;
    });
    refresh();
  }, { root: root, threshold: [0, 0.25, 0.5, 0.75, 1] });

  Object.keys(byId).forEach(function (id) {
    var el = document.getElementById(id);
    if (el) spy.observe(el);
  });
})();
