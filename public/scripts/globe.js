/* Particle globe background (ENCOM.ParticleGlobe).
 *
 * Loading: this script is the only globe tag in Base.astro. The three heavy
 * assets (~1.18 MB gzip) are injected only AFTER window.load, so the portfolio
 * content paints first and the globe fades in behind it afterwards.
 *
 * Interaction: #globe-bg is pointer-events:none so the page stays clickable,
 * which means the canvas never receives pointer events on its own. We listen on
 * window and re-dispatch to the canvas, so the library's own handler drives the
 * cursor gravity well. `interactive: false` keeps drag-to-rotate off, so the
 * globe can never swallow a scroll or a click.
 */
(function () {
  var container = document.getElementById('globe-bg');
  if (!container) return;

  var ASSETS = [
    '/assets/grid-particles.js',   // var grid   (15,178 tiles)
    '/assets/globe-pins.js',       // var globePins
    '/assets/encom-particle-globe.min.js'  // window.ENCOM (new URL: /assets/* is immutable-cached)
  ];

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = function () { reject(new Error('globe: failed to load ' + src)); };
      document.head.appendChild(s);
    });
  }

  function start() {
    /* Loaded in parallel; nothing is instantiated until all three are present. */
    Promise.all(ASSETS.map(loadScript)).then(init).catch(function (err) {
      console.warn(err); /* no globe, rest of the page is unaffected */
    });
  }

  function init() {
    if (!window.ENCOM || !window.ENCOM.ParticleGlobe || typeof grid === 'undefined') {
      console.warn('globe: assets loaded but ENCOM.ParticleGlobe/grid missing');
      return;
    }

    var globe = new ENCOM.ParticleGlobe(window.innerWidth, window.innerHeight, {
      tiles: grid.tiles,
      baseColor: '#c6c7f5',
      introDuration: 5000,
      maxPins: 120,
      maxMarkers: 2,
      autoMorph: 0,        /* no automatic globe/map morph on the portfolio */
      interactive: false   /* never let a drag on the background steal page scroll */
    });
    container.appendChild(globe.domElement);

    globe.init(function () {
      container.classList.add('globe-ready');   /* fade in, see global.css */

      (function animate() {
        globe.tick();
        requestAnimationFrame(animate);
      })();

      /* Blue pins drop in as the intro sweep passes their longitude. */
      if (typeof globePins !== 'undefined') {
        globePins.forEach(function (d) {
          setTimeout(function () { globe.addPin(d.lat, d.lng, d.label); },
                     500 + globe.introDuration * ((180 + d.lng) / 360));
        });
      }

      /* Yellow markers with the connecting arc. */
      setTimeout(function () {
        globe.addMarker(49.25, -123.1, 'Vancouver');
        globe.addMarker(35.6895, 139.6917, 'Tokyo', true);
      }, 3000);

      /* Six-satellite constellation. */
      setTimeout(function () {
        globe.addConstellation([
          { lat:  45, lon: -120, altitude: 1.4 }, { lat:  45, lon:    0, altitude: 1.4 },
          { lat:  45, lon:  120, altitude: 1.4 }, { lat: -30, lon:  -60, altitude: 1.4 },
          { lat: -30, lon:   60, altitude: 1.4 }, { lat: -30, lon:  180, altitude: 1.4 }
        ], { coreColor: '#e31b1b', numWaves: 8 });
      }, 5000);
    });

    /* --- cursor gravity well -------------------------------------------- */
    /* Replay window pointer events onto the (pointer-events:none) canvas so
       ParticleGlobe's own _onPointerMove computes the well position. */
    function replay(type, e) {
      globe.domElement.dispatchEvent(new PointerEvent(type, {
        pointerId:   e.pointerId || 1,
        pointerType: e.pointerType || 'mouse',
        clientX:     e.clientX,
        clientY:     e.clientY
      }));
    }

    window.addEventListener('pointermove', function (e) {
      replay('pointermove', e);
    }, { passive: true });

    /* Release the well when the cursor leaves the window entirely. */
    document.addEventListener('pointerleave', function (e) {
      replay('pointerleave', e);
    });

    window.addEventListener('resize', function () {
      globe.resize(window.innerWidth, window.innerHeight);
    });
  }

  /* Defer until the page is done loading, then until the main thread is idle. */
  function schedule() {
    if (window.requestIdleCallback) {
      requestIdleCallback(start, { timeout: 2000 });
    } else {
      setTimeout(start, 200);
    }
  }

  if (document.readyState === 'complete') {
    schedule();
  } else {
    window.addEventListener('load', schedule);
  }
})();
