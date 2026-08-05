/* =============================================================================
 * redesign.js — behaviour for the redesign concept route only.
 * Loaded AFTER data (project.js, models.js) and common.js, so it reuses
 * DH.ui.icon / DH.ui.fmtDate / DH.ui.countUp and the shared reveal observer.
 * Adds: nav scroll state, staggered reveals, editorial mix summary, subtle
 * parallax, and the featured-image gallery with a fullscreen lightbox.
 * ========================================================================== */
(function () {
  'use strict';
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- inline icons (same pattern as the original page) -------------------- */
  document.querySelectorAll('[data-icon]').forEach(function (n) { n.insertAdjacentHTML('afterbegin', DH.ui.icon(n.getAttribute('data-icon'))); });
  document.querySelectorAll('[data-icon-after]').forEach(function (n) { n.insertAdjacentHTML('beforeend', ' ' + DH.ui.icon(n.getAttribute('data-icon-after'))); });

  /* ---- "last updated" from project.js -------------------------------------- */
  (function () {
    var d = DH.project.lastUpdated ? DH.ui.fmtDate(DH.project.lastUpdated) : '';
    document.querySelectorAll('[data-updated]').forEach(function (n) { n.textContent = 'עודכן לאחרונה: ' + d; });
  })();

  /* ---- staggered reveal for grouped items ----------------------------------- */
  document.querySelectorAll('[data-stagger]').forEach(function (g) {
    var i = 0;
    Array.prototype.forEach.call(g.children, function (c) {
      if (c.classList.contains('reveal')) { c.style.transitionDelay = (i * 80) + 'ms'; i++; }
    });
  });

  /* ---- apartment-mix summary: oversized numbers, no cards -------------------- */
  (function () {
    var el = document.getElementById('mix-summary'); if (!el) return;
    var groups = {};
    DH.apartmentTypes.forEach(function (t) { (groups[t.rooms] = groups[t.rooms] || []).push(t); });
    el.innerHTML = Object.keys(groups).sort().map(function (rooms) {
      var list = groups[rooms];
      var min = Math.min.apply(null, list.map(function (t) { return t.gross; }));
      var max = Math.max.apply(null, list.map(function (t) { return t.gross; }));
      return '<div class="mix__item reveal">' +
        '<div class="mix__n">' + rooms + '</div>' +
        '<div class="mix__bar"></div>' +
        '<div class="mix__l">חדרים</div>' +
        '<div class="mix__meta">' + Math.round(min) + '-' + Math.round(max) + ' מ״ר · ' + list.length + ' דגמים</div>' +
        '</div>';
    }).join('');
    var i = 0;
    Array.prototype.forEach.call(el.children, function (c) { c.style.transitionDelay = (i * 80) + 'ms'; i++; });
  })();

  /* ---- subtle parallax on full-bleed images (skipped: reduced motion/mobile) - */
  (function () {
    var els = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
    if (!els.length || reduceMotion || window.innerWidth < 768) return;
    var ticking = false;
    function apply() {
      ticking = false;
      var vh = window.innerHeight;
      els.forEach(function (el) {
        var img = el.querySelector('img'); if (!img) return;
        var r = el.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        // progress of the element through the viewport: 0 (entering) → 1 (leaving)
        var t = (vh - r.top) / (vh + r.height);
        t = Math.max(0, Math.min(1, t));
        // the img is 112–118% tall, so shift stays within the overflow
        var max = r.height * 0.08;
        img.style.transform = 'translateY(' + (-t * max).toFixed(1) + 'px)';
      });
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(apply); }
    }, { passive: true });
    apply();
  })();

  /* ---- process route decoration: responsive SVG, drawn in like a sketch ------ */
  (function () {
    var deco = document.querySelector('.route-deco');
    if (!deco) return;
    function px(min, vw, max) { return Math.max(min, Math.min(window.innerWidth * vw / 100, max)); }
    function build() {
      var W = deco.clientWidth, H = deco.clientHeight;
      if (!W || !H) { deco.innerHTML = ''; return; }   // hidden on mobile
      var r = px(120, 12, 210) / 2;                    // endpoint circle radius
      var corner = px(40, 5, 72);                      // rounded corner radius
      var inset = px(48, 6, 120);                      // edge-line distance from section edge
      var cy1 = px(70, 10, 160) + r;                   // start circle (top, physical right)
      var cx1 = W - inset - px(90, 10, 170) - r;
      var cy2 = H - px(50, 7, 120) - r;                // end circle (bottom, physical left)
      var cx2 = inset + px(70, 8, 140) + r;
      deco.innerHTML =
        '<svg viewBox="0 0 ' + W + ' ' + H + '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">' +
        '<circle pathLength="1" cx="' + cx1 + '" cy="' + cy1 + '" r="' + r + '"/>' +
        '<path pathLength="1" d="M' + (cx1 + r) + ' ' + cy1 + 'H' + (W - inset - corner) +
          'A' + corner + ' ' + corner + ' 0 0 1 ' + (W - inset) + ' ' + (cy1 + corner) + 'V' + H + '"/>' +
        '<path pathLength="1" d="M' + inset + ' 0V' + (cy2 - corner) +
          'A' + corner + ' ' + corner + ' 0 0 0 ' + (inset + corner) + ' ' + cy2 + 'H' + (cx2 - r) + '"/>' +
        '<circle pathLength="1" cx="' + cx2 + '" cy="' + cy2 + '" r="' + r + '"/>' +
        '</svg>';
    }
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(build, 150); }, { passive: true });
    window.addEventListener('load', build);
    build();
  })();

  /* ---- reveal-zoom: image reveal with soft zoom-settle ----------------------- */
  (function () {
    var els = document.querySelectorAll('.reveal-zoom');
    if (!els.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---- gallery: featured stage + arrows + thumbnails + fullscreen lightbox --- */
  (function () {
    var stage = document.getElementById('gallery-stage');
    var stageImg = document.getElementById('stage-img');
    var thumbsEl = document.getElementById('gallery-thumbs');
    if (!stage || !thumbsEl) return;

    var ITEMS = [
      { src: 'assets/img/renders/tower-evening.jpg', alt: 'מבט מהרחוב בשעת ערב',     cap: 'מבט מדרך חברון' },
      { src: 'assets/img/renders/tower-day.jpg',     alt: 'מבט כללי לאור יום',        cap: 'מבט כללי' },
      { src: 'assets/img/renders/tower-hills.jpg',   alt: 'המגדל על רקע נוף ירושלים', cap: 'על רקע הנוף' },
    ];
    var current = 0;

    // thumbnails
    thumbsEl.innerHTML = ITEMS.map(function (it, i) {
      return '<button class="thumb" role="option" data-i="' + i + '" aria-label="' + it.alt + '">' +
        '<img src="' + it.src + '" alt="" loading="lazy" /></button>';
    }).join('');
    var thumbs = Array.prototype.slice.call(thumbsEl.querySelectorAll('.thumb'));

    function setFeatured(i, instant) {
      current = (i + ITEMS.length) % ITEMS.length;
      var it = ITEMS[current];
      thumbs.forEach(function (t, j) {
        t.setAttribute('aria-current', j === current ? 'true' : 'false');
        t.setAttribute('aria-selected', j === current ? 'true' : 'false');
      });
      function swap() {
        stageImg.src = it.src;
        stageImg.alt = it.alt;
        stageImg.style.opacity = '1';
      }
      if (instant || reduceMotion) { swap(); return; }
      stageImg.style.opacity = '0';
      setTimeout(swap, 200);
    }
    thumbs.forEach(function (t) {
      t.addEventListener('click', function () { setFeatured(parseInt(t.getAttribute('data-i'), 10)); });
    });
    var stagePrev = document.getElementById('stage-prev');
    var stageNext = document.getElementById('stage-next');
    if (stagePrev) stagePrev.addEventListener('click', function () { setFeatured(current - 1); });
    if (stageNext) stageNext.addEventListener('click', function () { setFeatured(current + 1); });
    setFeatured(0, true);

    // lightbox
    var lb = document.getElementById('lightbox');
    var lbImg = document.getElementById('lb-img');
    var lbCounter = document.getElementById('lb-counter');
    var lbClose = document.getElementById('lb-close');
    var lbPrev = document.getElementById('lb-prev');
    var lbNext = document.getElementById('lb-next');
    var lastFocus = null;

    function lbShow(i) {
      current = (i + ITEMS.length) % ITEMS.length;
      var it = ITEMS[current];
      lbImg.src = it.src;
      lbImg.alt = it.alt;
      lbCounter.textContent = (current + 1) + ' / ' + ITEMS.length + ' · ' + it.cap;
      setFeatured(current, true);
    }
    function lbOpen(i) {
      lastFocus = document.activeElement;
      lb.classList.add('open');
      document.body.style.overflow = 'hidden';
      lbShow(i);
      lbClose.focus();
    }
    function lbCloseFn() {
      lb.classList.remove('open');
      document.body.style.overflow = '';
      if (lastFocus) lastFocus.focus();
    }
    stage.addEventListener('click', function () { lbOpen(current); });
    lbClose.addEventListener('click', lbCloseFn);
    lbPrev.addEventListener('click', function () { lbShow(current - 1); });
    lbNext.addEventListener('click', function () { lbShow(current + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target.classList.contains('lightbox__img')) lbCloseFn(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') lbCloseFn();
      else if (e.key === 'ArrowLeft') lbShow(current + 1);   /* RTL: left = forward */
      else if (e.key === 'ArrowRight') lbShow(current - 1);
    });
  })();
})();
