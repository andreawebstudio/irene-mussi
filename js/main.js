/* Dott.ssa Irene Mussi · Osteopata D.O. — JavaScript essenziale */
(function () {
  'use strict';

  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.getElementById('main-nav');
  var mqMobile = window.matchMedia('(max-width: 1080px)');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: bordo allo scroll ---------- */
  function onScrollHeader() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScrollHeader, { passive: true });
  onScrollHeader();

  /* ---------- Menu mobile ---------- */
  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Chiudi il menu' : 'Apri il menu');
    nav.classList.toggle('is-open', open);
    document.body.classList.toggle('nav-open', open);
  }
  toggle.addEventListener('click', function () { setMenu(toggle.getAttribute('aria-expanded') !== 'true'); });
  nav.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  mqMobile.addEventListener('change', function (e) { if (!e.matches) setMenu(false); });

  /* ---------- Voce di menu attiva ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll('a[href^="#"]:not(.btn)'));
  if ('IntersectionObserver' in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (l) {
          var active = l.getAttribute('href') === '#' + entry.target.id;
          l.classList.toggle('is-active', active);
          if (active) l.setAttribute('aria-current', 'true'); else l.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach(function (l) { var s = document.querySelector(l.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Fade-in leggero ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (!reduce && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Come funziona: linea che si riempie e tappe che si attivano ---------- */
  var journey = document.getElementById('journey');
  if (journey) {
    var steps = Array.prototype.slice.call(journey.querySelectorAll('.journey-step'));
    if (reduce) {
      journey.style.setProperty('--progress', 1);
      steps.forEach(function (s) { s.classList.add('is-active'); });
    } else {
      var ticking = false;
      var update = function () {
        ticking = false;
        var r = journey.getBoundingClientRect();
        var vh = window.innerHeight;
        // 0 quando la sezione entra dal basso, 1 quando è ben dentro la viewport
        var p = (vh * 0.85 - r.top) / (r.height + vh * 0.2);
        p = Math.max(0, Math.min(1, p));
        journey.style.setProperty('--progress', p.toFixed(3));
        var n = steps.length;
        steps.forEach(function (s, i) {
          if (p >= (n === 1 ? 0 : i / (n - 1)) - 0.02) s.classList.add('is-active');
        });
      };
      var req = function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
      window.addEventListener('scroll', req, { passive: true });
      window.addEventListener('resize', req);
      update();
    }
  }

  /* ---------- FAQ accordion (tutte chiuse all'avvio) ---------- */
  document.querySelectorAll('.acc-trigger').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      if (open) {
        panel.classList.remove('is-open');
        var done = function () { if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true; };
        if (reduce) done(); else setTimeout(done, 360);
      } else {
        panel.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('is-open'); }); });
      }
    });
  });

  /* ---------- Servizi: "Scopri di più" ---------- */
  document.querySelectorAll('.service-toggle').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.firstChild.nodeValue = open ? 'Scopri di più' : 'Mostra meno';
      if (open) {
        panel.classList.remove('is-open');
        var done = function () { if (btn.getAttribute('aria-expanded') === 'false') panel.hidden = true; };
        if (reduce) done(); else setTimeout(done, 420);
      } else {
        panel.hidden = false;
        requestAnimationFrame(function () { requestAnimationFrame(function () { panel.classList.add('is-open'); }); });
      }
    });
  });

  /* ---------- Modulo contatti ----------
     L'invio avviene SOLO se data-endpoint contiene l'URL di un servizio configurato
     (es. Formspree). Senza endpoint nessun invio viene simulato: si mostra un avviso
     con il collegamento a Instagram. */
  var form = document.getElementById('contact-form');
  if (form) {
    var endpoint = form.getAttribute('data-endpoint');
    var status = form.querySelector('.form-status');
    var btn = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      if (!endpoint) {
        status.innerHTML = 'Il modulo non è ancora attivo. Nel frattempo puoi scrivermi su <a href="https://www.instagram.com/osteopatia_irene/" target="_blank" rel="noopener">Instagram</a>.';
        return;
      }
      btn.disabled = true;
      status.textContent = 'Invio in corso…';
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          status.textContent = 'Grazie, la richiesta è stata inviata. Ti risponderò il prima possibile.';
        })
        .catch(function () {
          status.innerHTML = 'Non è stato possibile inviare la richiesta. Puoi scrivermi su <a href="https://www.instagram.com/osteopatia_irene/" target="_blank" rel="noopener">Instagram</a>.';
        })
        .finally(function () { btn.disabled = false; });
    });
  }

  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
