/* =============================================================================
 * common.js - shared UI behaviour (nav, reveal, icons, modal, formatting)
 * Loaded on every page. Depends on nothing.
 * ========================================================================== */
window.DH = window.DH || {};

DH.ui = DH.ui || {};

/* Inline SVG icon set (no emojis, consistent 24×24 viewBox). */
DH.ui.icon = function (name, cls) {
  var p = {
    menu:   '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    phone:  '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail:   '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 5L2 7"/>',
    pin:    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    check:  '<path d="M20 6 9 17l-5-5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    car:    '<path d="M5 13l1.5-4.5A2 2 0 0 1 8.4 7h7.2a2 2 0 0 1 1.9 1.5L19 13"/><path d="M4 13h16v5H4z"/><circle cx="7.5" cy="18.5" r="1.5"/><circle cx="16.5" cy="18.5" r="1.5"/>',
    box:    '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5"/><path d="M12 13v8"/>',
    layers: '<path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>',
    ruler:  '<path d="M21 3 3 21"/><path d="M9 3H3v6"/><path d="M21 15v6h-6"/>',
    bed:    '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
    info:   '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    alert:  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><path d="M12 9v4"/><path d="M12 17h.01"/>',
    lock:   '<rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    arrow:  '<path d="M19 12H5"/><path d="m12 19-7-7 7-7"/>',
    user:   '<circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0 1 16 0"/>',
    users:  '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9.5" r="2.8"/><path d="M15.5 14.5a5.4 5.4 0 0 1 6 5.5"/>',
    calendar:'<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    download:'<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M7 10l5 5 5-5"/><path d="M12 15V3"/>',
    printer: '<path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    tower:  '<path d="M9 22V12h6v10"/><path d="M6 22V8l6-5 6 5v14"/><path d="M10 8h.01M14 8h.01M10 12h.01M14 12h.01"/>',
    sparkle:'<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2 2M16 16l2 2M18 6l-2 2M8 16l-2 2"/>',
    tree:   '<path d="M12 22v-7"/><path d="M9 8a3 3 0 1 1 6 0 3 3 0 0 0 3 3 3 3 0 0 1-3 5H9a3 3 0 0 1-3-5 3 3 0 0 0 3-3z"/>',
  }[name] || '';
  return '<svg class="' + (cls || '') + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + p + '</svg>';
};

DH.ui.fmtSqm = function (v) { return v == null ? '-' : String(v).replace(/\.0$/, '') + ' מ״ר'; };
DH.ui.fmtDate = function (iso) {
  if (!iso) return '-';
  var d = new Date(iso + 'T00:00:00');
  return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

/* Navbar: mobile toggle + scroll-reveal + active link highlight. */
DH.ui.initChrome = function () {
  // mobile menu toggle
  var toggle = document.querySelector('[data-nav-toggle]');
  var menu = document.querySelector('[data-nav-mobile]');
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.toggle('open'); });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { menu.classList.remove('open'); });
    });
  }

  // reveal on scroll - stagger cards within a grid for a nicer cascade
  document.querySelectorAll('.grid').forEach(function (g) {
    var i = 0;
    Array.prototype.forEach.call(g.children, function (c) {
      if (c.classList.contains('reveal')) { c.style.transitionDelay = (i * 70) + 'ms'; i++; }
    });
  });
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.classList.add('in');
      io.unobserve(t);
      // the stagger delay (set above) is only for the reveal cascade — clear it
      // afterwards, or every hover/interaction transition waits it out too
      if (t.style.transitionDelay) {
        setTimeout(function () { t.style.transitionDelay = ''; }, parseFloat(t.style.transitionDelay) + 750);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal:not(.in)').forEach(function (el) { io.observe(el); });

  // active section link (only for same-page anchors)
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav__links a[href^="#"]'));
  if (links.length) {
    var sections = links.map(function (l) { return document.querySelector(l.getAttribute('href')); }).filter(Boolean);
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          links.forEach(function (l) { l.classList.toggle('is-active', l.getAttribute('href') === '#' + e.target.id); });
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    sections.forEach(function (s) { so.observe(s); });
  }

  DH.ui.countUp();
};

/* Animated count-up for any element with data-count (runs once, on scroll-in).
 * Optional: data-suffix, data-prefix, data-dur (ms). Respects reduced-motion. */
DH.ui.countUp = function () {
  var els = document.querySelectorAll('[data-count]');
  if (!els.length) return;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      var el = e.target;
      var to = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      var prefix = el.getAttribute('data-prefix') || '';
      var dur = parseInt(el.getAttribute('data-dur') || '1400', 10);
      if (reduce) { el.textContent = prefix + to + suffix; return; }
      var start = null;
      el.textContent = prefix + '0' + suffix;
      (function frame(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); // ease-out cubic
        el.textContent = prefix + Math.round(eased * to) + suffix;
        if (p < 1) requestAnimationFrame(frame);
        else el.textContent = prefix + to + suffix;
      })(performance.now());
    });
  }, { threshold: 0.5 });
  els.forEach(function (el) { io.observe(el); });
};

/* Tiny modal helper. */
DH.ui.modal = {
  el: null,
  open: function (title, html, variant) {
    if (!DH.ui.modal.el) {
      var m = document.createElement('div');
      m.className = 'modal';
      m.innerHTML = '<div class="modal__box" role="dialog" aria-modal="true">' +
        '<div class="modal__head"><h3 style="margin:0" data-modal-title></h3>' +
        '<button class="modal__close" aria-label="סגירה" data-modal-close>&times;</button></div>' +
        '<div class="modal__body" data-modal-body></div></div>';
      document.body.appendChild(m);
      m.addEventListener('click', function (e) { if (e.target === m || e.target.hasAttribute('data-modal-close')) DH.ui.modal.close(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape') DH.ui.modal.close(); });
      DH.ui.modal.el = m;
    }
    // variant: e.g. 'wide' → .modal__box--wide (image + details side by side)
    DH.ui.modal.el.querySelector('.modal__box').className = 'modal__box' + (variant ? ' modal__box--' + variant : '');
    DH.ui.modal.el.querySelector('[data-modal-title]').textContent = title;
    DH.ui.modal.el.querySelector('[data-modal-body]').innerHTML = html;
    DH.ui.modal.el.classList.add('open');
  },
  close: function () { if (DH.ui.modal.el) DH.ui.modal.el.classList.remove('open'); },
};

/* Help/contact form → Web3Forms (AJAX, stays on page). */
DH.ui.initHelpForm = function () {
  var form = document.getElementById('help-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var ok = document.getElementById('lead-ok');
    var err = document.getElementById('lead-err');
    ok.classList.add('hidden'); err.classList.add('hidden');
    var btn = form.querySelector('button[type="submit"]');
    var btnText = btn.textContent;
    btn.disabled = true; btn.textContent = 'שולח...';
    fetch(form.action, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: new FormData(form),
    }).then(function (res) { return res.json(); }).then(function (data) {
      if (data.success) { form.reset(); ok.classList.remove('hidden'); }
      else { err.classList.remove('hidden'); }
    }).catch(function () {
      err.classList.remove('hidden');
    }).finally(function () {
      btn.disabled = false; btn.textContent = btnText;
    });
  });
};

document.addEventListener('DOMContentLoaded', DH.ui.initChrome);
document.addEventListener('DOMContentLoaded', DH.ui.initHelpForm);
