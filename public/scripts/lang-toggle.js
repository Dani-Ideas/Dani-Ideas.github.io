(function () {
  var lang = 'es';

  var aboutHTML = {
    es: '<p>Ingeniero de Software enfocado en la transformación digital y la eficiencia operativa. Mi enfoque es resolver problemas de negocio mediante tecnología, no solo escribir código.</p><p>Como único responsable del desarrollo de software en una empresa de manufactura, lideré la transición de procesos manuales hacia ecosistemas digitales escalables: sistema de trazabilidad QR, control de inventario con lógica Kardex, dashboards de manufactura y arquitectura Full Stack con Next.js y PostgreSQL. Actualmente estudiante de Ingeniería en Computación en la UNAM.</p>',
    en: '<p>Software Engineer focused on digital transformation and operational efficiency. I solve business problems through technology — not just write code.</p><p>As the sole software developer in a manufacturing company, I led the transition from manual processes to scalable digital ecosystems: QR traceability system, inventory control with Kardex logic, manufacturing dashboards, and Full Stack architecture with Next.js and PostgreSQL. Currently studying Computer Engineering at UNAM.</p>',
  };

  function applyLang(l) {
    lang = l;
    document.documentElement.lang = l;

    document.querySelectorAll('[data-es]').forEach(function (el) {
      el.textContent = l === 'es' ? el.dataset.es : el.dataset.en;
    });

    var aboutEl = document.getElementById('about-text');
    if (aboutEl) aboutEl.innerHTML = aboutHTML[l];

    var btn = document.getElementById('lang-btn');
    if (btn) {
      btn.innerHTML = l === 'es' ? '🇺🇸' : '🇲🇽';
      btn.title = l === 'es' ? 'Switch to English' : 'Cambiar a Español';
    }

    try { localStorage.setItem('portfolio-lang', l); } catch (e) {}
  }

  function init() {
    var saved = 'es';
    try { saved = localStorage.getItem('portfolio-lang') || 'es'; } catch (e) {}

    var btn = document.createElement('button');
    btn.id = 'lang-btn';
    btn.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:9999;font-size:1.5rem;background:rgba(0,0,0,0.80);border:1px solid rgba(212,175,55,0.5);border-radius:50%;width:48px;height:48px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 16px rgba(0,0,0,0.5);outline:none;transition:border-color 0.15s;';
    btn.innerHTML = saved === 'es' ? '🇺🇸' : '🇲🇽';
    btn.title = saved === 'es' ? 'Switch to English' : 'Cambiar a Español';

    btn.addEventListener('mouseover', function () { this.style.borderColor = 'rgba(212,175,55,0.9)'; });
    btn.addEventListener('mouseout',  function () { this.style.borderColor = 'rgba(212,175,55,0.5)'; });
    btn.addEventListener('click', function () {
      this.classList.add('spinning');
      var self = this;
      setTimeout(function () { self.classList.remove('spinning'); }, 380);
      applyLang(lang === 'es' ? 'en' : 'es');
    });

    document.body.appendChild(btn);
    applyLang(saved);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
