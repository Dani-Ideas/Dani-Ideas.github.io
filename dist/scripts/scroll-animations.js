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
