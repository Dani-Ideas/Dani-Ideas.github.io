(function () {
  var container = document.getElementById('globe-bg');
  if (!container) return;

  var globe = new ENCOM.Globe(window.innerWidth, window.innerHeight, {
    tiles: grid.tiles,
    baseColor: '#c6c7f5',
    scale: 1.0,
    viewAngle: 0.210,
    dayLength: 28000,
    introLinesDuration: 5000,
    maxPins: 120,
    maxMarkers: 2
  });
  container.appendChild(globe.domElement);

  globe.init(function () {
    var _eX = 0, _eY = 0, _pX = 0, _tX = 0, _tY = 0;
    var _baseV = globe.viewAngle;

    window.addEventListener('mousemove', function (e) {
      _tX = (e.clientX / window.innerWidth  - 0.5) * 0.30;
      _tY = (e.clientY / window.innerHeight - 0.5) * 0.15;
    });

    window.addEventListener('touchmove', function (e) {
      var t = e.touches[0];
      _tX = (t.clientX / window.innerWidth  - 0.5) * 0.30;
      _tY = (t.clientY / window.innerHeight - 0.5) * 0.35;
    }, { passive: true });

    window.addEventListener('touchend', function () {
      _tX = 0; _tY = 0;
    }, { passive: true });

    (function animate() {
      _eX += (_tX - _eX) * 0.05;
      _eY += (_tY - _eY) * 0.05;
      globe.cameraAngle += (_eX - _pX);
      _pX = _eX;
      globe.viewAngle = _baseV - _eY;
      globe.tick();
      requestAnimationFrame(animate);
    })();
  });

  window.addEventListener('resize', function () {
    globe.camera.aspect = window.innerWidth / window.innerHeight;
    globe.camera.updateProjectionMatrix();
    globe.renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();
