/* =============================================================================
 * residents-ui.js - renders the residents area
 *   1) Compensation apartment catalog (table) + full type catalog (cards)
 *   2) Selection-order explainer + demo queue
 *   3) Vertical availability map (tower)
 *   4) Personal resident area (login gate → dashboard)
 *   5) Data-verification panel (DH.dataFlags)
 * Depends on: data/*.js + ui/common.js
 * ========================================================================== */
window.DH = window.DH || {};
var icon = function (n, c) { return DH.ui.icon(n, c); };
var sqm = function (v) { return DH.ui.fmtSqm(v); };

/* ---- 1a. Compensation mix table ------------------------------------------ */
DH.renderCompTable = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var rows = DH.compensationMix.map(function (m) {
    var v = m.verified || {};
    var areaCell = '<b>' + (m.briefArea) + ' מ״ר</b>' +
      (v.gross ? '<div class="muted" style="font-size:.8rem">תשריט: ' + v.gross + (v.net ? ' / ' + v.net : '') + ' מ״ר</div>' : '');
    var countCell = m.count + (m.countVerified ? '' : ' <span class="chip chip--warn" title="לא מאומת">' + icon('alert') + 'לאימות</span>');
    var dot = (DH.roomColors[m.rooms] || {}).tint || 'var(--muted)';
    return '<tr>' +
      '<td><span class="roomdot" style="background:' + dot + '"></span><b>' + m.model + '</b></td>' +
      '<td>' + m.rooms + '</td>' +
      '<td>' + areaCell + '</td>' +
      '<td>' + (m.briefBalcony) + ' מ״ר</td>' +
      '<td>' + m.floors + '</td>' +
      '<td style="text-align:center">' + countCell + '</td>' +
      '</tr>';
  }).join('');
  el.innerHTML =
    '<div class="table-wrap"><table class="data">' +
    '<thead><tr><th>דגם</th><th>חדרים</th><th>שטח דירה</th><th>מרפסת</th><th>קומות</th><th style="text-align:center">יח׳</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<p class="muted mt-2" style="font-size:.88rem">' + icon('info', '') +
    ' השטחים מוצגים לפי התדריך, ולצידם הנתון מהתשריט המקורי. פערים מרוכזים בלשונית אימות נתונים למטה.</p>';
};

/* ---- 1b. Full verified type catalog (cards) ------------------------------ */
DH.renderTypeCatalog = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  // only show types that have a floor plan and aren't catalog-hidden
  // (3D1/3D2 - the taken duplex - open from the tower map, not the catalog)
  var planIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 12h7V3"/><path d="M10 12v4"/><path d="M14 21v-6h7"/></svg>';
  el.innerHTML = DH.apartmentTypes.filter(function (t) { return t.img && !t.catalogHide; }).map(function (t) {
    var dot = (DH.roomColors[t.rooms] || {}).tint || 'var(--muted)';
    var areas = sqm(t.gross);
    return '<article class="card model-card model-card--click reveal" data-model="' + t.code + '" tabindex="0" role="button" aria-label="דגם ' + t.code + ' - לצפייה בתשריט ובפרטים">' +
      '<div class="model-card__icon" style="color:' + dot + '">' + planIcon + '</div>' +
      '<div class="model-card__body">' +
      '<div style="display:flex;align-items:center;gap:.5rem">' +
      '<span class="roomdot" style="background:' + dot + ';width:12px;height:12px"></span>' +
      '<span class="model-card__code">' + t.code + '</span>' +
      '<span class="chip chip--market" style="margin-inline-start:auto">' + t.rooms + ' חד׳</span></div>' +
      '<div class="model-card__meta">' +
      '<span>' + areas + '</span>' +
      (t.balcony ? '<span>מרפסת ' + sqm(t.balcony) + '</span>' : '') +
      (t.terrace ? '<span>מרפסת גג ' + sqm(t.terrace) + '</span>' : '') +
      '</div>' +
      (t._note ? '<p class="muted mt-1" style="font-size:.8rem">' + t._note + '</p>' : '') +
      '<span class="model-card__go">לצפייה בתשריט ובפרטים ' + icon('arrow') + '</span>' +
      '</div></article>';
  }).join('');
  // click / keyboard → model popup (image + details)
  el.querySelectorAll('[data-model]').forEach(function (node) {
    var openIt = function () { DH.openModelPopup(node.getAttribute('data-model')); };
    node.addEventListener('click', openIt);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openIt(); } });
  });
};

/* ---- 1c. Model popup: plan image (left) + details (right) ----------------- */
/* Print sheet: project header + the model's basic details + the plan image. */
DH.printPlan = function (t, imgSrc) {
  var w = window.open('', '_blank');
  if (!w) return; // popup blocked
  var facts = [
    'חדרים: ' + t.rooms,
    'שטח דירה: ' + sqm(t.gross),
    t.balcony ? 'מרפסת: ' + sqm(t.balcony) : '',
    t.terrace ? 'מרפסת גג: ' + sqm(t.terrace) : '',
  ].filter(Boolean).join(' &nbsp;·&nbsp; ');
  w.document.write('<!DOCTYPE html><html dir="rtl" lang="he"><head><meta charset="UTF-8">' +
    '<title>תשריט דגם ' + t.code + ' - דרך חברון 116</title></head>' +
    '<body style="margin:0;padding:24px;font-family:Arial,sans-serif;color:#1d2b33;text-align:center">' +
    '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:2px solid #1d2b33;padding-bottom:12px">' +
    '<h1 style="margin:0;font-size:32px">דגם ' + t.code + ' · ' + t.rooms + ' חדרים</h1>' +
    '<span style="font-size:19px;color:#555">דרך חברון 116, ירושלים · קבוצת גלנור</span></div>' +
    '<p style="font-size:21px;font-weight:600;margin:16px 0 20px">' + facts + '</p>' +
    '<img src="' + (imgSrc || t.img) + '" style="max-width:100%;max-height:74vh" onload="setTimeout(function(){window.print();},150)">' +
    (t._note ? '<p style="font-size:16px;color:#555;margin-top:14px">' + t._note + '</p>' : '') +
    '<p style="font-size:14px;color:#888;margin-top:16px">התשריט להמחשה. המסמכים המחייבים הם נספחי ההסכם החתומים.</p>' +
    '</body></html>');
  w.document.close();
};

/* Auto-crop a plan image to its colored apartment area (trims the big white
 * sheet margins). Works by scanning a downscaled canvas for saturated pixels;
 * silently keeps the original on failure (e.g. file:// canvas restrictions). */
DH._cropCache = {};
DH.autoCropPlan = function (imgEl) {
  if (!imgEl || imgEl.dataset.cropped) return;
  var srcKey = imgEl.getAttribute('src');
  if (DH._cropCache[srcKey]) { imgEl.dataset.cropped = '1'; imgEl.src = DH._cropCache[srcKey]; return; }
  try {
    var iw = imgEl.naturalWidth, ih = imgEl.naturalHeight;
    if (!iw || !ih) return;
    var W = 320, H = Math.max(1, Math.round(ih * W / iw));
    var c = document.createElement('canvas'); c.width = W; c.height = H;
    var ctx = c.getContext('2d');
    ctx.drawImage(imgEl, 0, 0, W, H);
    var d = ctx.getImageData(0, 0, W, H).data;
    var minX = W, minY = H, maxX = 0, maxY = 0, count = 0;
    for (var y = 0; y < H; y++) {
      for (var x = 0; x < W; x++) {
        var i = (y * W + x) * 4;
        var r = d[i], g = d[i + 1], b = d[i + 2];
        if (d[i + 3] > 100 && Math.max(r, g, b) - Math.min(r, g, b) > 40) {
          count++;
          if (x < minX) minX = x; if (x > maxX) maxX = x;
          if (y < minY) minY = y; if (y > maxY) maxY = y;
        }
      }
    }
    if (count < 150 || maxX - minX < 20 || maxY - minY < 20) return; // no clear colored area
    var padX = (maxX - minX) * 0.17, padY = (maxY - minY) * 0.17;
    minX = Math.max(0, minX - padX); maxX = Math.min(W, maxX + padX);
    minY = Math.max(0, minY - padY); maxY = Math.min(H, maxY + padY);
    var sx = minX / W * iw, sy = minY / H * ih, sw = (maxX - minX) / W * iw, sh = (maxY - minY) / H * ih;
    var out = document.createElement('canvas');
    out.width = Math.round(sw); out.height = Math.round(sh);
    out.getContext('2d').drawImage(imgEl, sx, sy, sw, sh, 0, 0, out.width, out.height);
    var url = out.toDataURL('image/png');
    DH._cropCache[srcKey] = url;
    imgEl.dataset.cropped = '1';
    imgEl.src = url;
  } catch (e) { /* canvas tainted (file://) or similar - keep original */ }
};

/* opts.onBack (optional): show a "back" button that re-opens the previous popup */
DH.openModelPopup = function (code, opts) {
  var t = DH.getType(code); if (!t) return;
  opts = opts || {};
  var rows =
    '<div class="kv__row"><div class="kv__k">חדרים</div><div class="kv__v">' + t.rooms + '</div></div>' +
    '<div class="kv__row"><div class="kv__k">שטח דירה</div><div class="kv__v">' + sqm(t.gross) + '</div></div>' +
    (t.balcony ? '<div class="kv__row"><div class="kv__k">מרפסת</div><div class="kv__v">' + sqm(t.balcony) + '</div></div>' : '') +
    (t.terrace ? '<div class="kv__row"><div class="kv__k">מרפסת גג</div><div class="kv__v">' + sqm(t.terrace) + '</div></div>' : '');
  var details =
    '<div>' +
    '<div class="kv model-pop__kv">' + rows + '</div>' +
    (t._note ? '<p class="muted mt-2" style="font-size:.88rem">' + icon('info') + ' ' + t._note + '</p>' : '') +
    '</div>';
  var img = t.img
    ? '<div class="model-pop__img"><img src="' + t.img + '" alt="תשריט דגם ' + t.code + '"></div>'
    : '<div class="model-pop__img model-pop__img--none">' + icon('tower') + '<span class="muted">תשריט יתווסף בקרוב</span></div>';
  // action bar: one row under the plan image; RTL order: back (right), download, print (left)
  var footer = (t.img || opts.onBack)
    ? '<div class="model-pop__footer">' +
      (opts.onBack
        ? '<button type="button" class="btn btn--ghost model-pop__back" data-modal-back-btn>' + icon('arrow') + ' חזרה לפרטי הדירה</button>'
        : '') +
      (t.img
        ? '<a class="btn btn--ghost" href="' + t.img + '" download="tashrit-' + t.code + '.png">' + icon('download') + ' הורדת התשריט</a>' +
          '<button type="button" class="btn btn--ghost" data-plan-print>' + icon('printer') + ' הדפסה</button>'
        : '') +
      '</div>'
    : '';
  // RTL: first child sits on the RIGHT (details), second on the LEFT (image)
  DH.ui.modal.open('דגם ' + t.code + ' · ' + t.rooms + ' חדרים', '<div class="model-pop">' + details + img + '</div>' + footer, 'wide');
  // trim the plan sheet's dead margins around the drawing
  var planImg = DH.ui.modal.el.querySelector('.model-pop__img img');
  if (planImg) {
    if (planImg.complete && planImg.naturalWidth) DH.autoCropPlan(planImg);
    else planImg.addEventListener('load', function () { DH.autoCropPlan(planImg); });
  }
  var printBtn = DH.ui.modal.el.querySelector('[data-plan-print]');
  if (printBtn) printBtn.addEventListener('click', function () {
    // print whatever is displayed (the cropped version once ready)
    DH.printPlan(t, planImg ? planImg.src : t.img);
  });
  var backBtn = DH.ui.modal.el.querySelector('[data-modal-back-btn]');
  if (backBtn) backBtn.addEventListener('click', opts.onBack);
};

/* ---- 2. Selection order: 4 compensation groups (DH.selectionOrder) --------
 * One white accordion bar per group; rows show position, plot NUMBER (תת חלקה),
 * signing date and note chips — never owners' names. */
DH.renderSelectionOrder = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var caret = '<svg class="caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  function chips(o) {
    var out = [];
    if (o.byLottery) out.push('<span class="chip chip--lottery">הגרלה פנימית</span>');
    if (o.amidar) out.push('<span class="chip chip--market">עמידר החדשה</span>');
    if (!o.date) out.push('<span class="chip chip--warn">טרם נחתם</span>');
    return out.join(' ');
  }
  el.innerHTML = DH.selectionOrder.groups.map(function (g, i) {
    var rows = g.owners.map(function (o) {
      return '<tr>' +
        '<td class="pos">' + o.pos + '</td>' +
        // plot number only (תת חלקה) — no names
        '<td class="plot"><b>' + o.plot + '</b></td>' +
        '<td>' + (o.date ? DH.ui.fmtDate(o.date) : '-') + '</td>' +
        '<td>' + chips(o) + '</td>' +
        '</tr>';
    }).join('');
    var table = '<div class="twrap' + (g.owners.length > 5 ? ' twrap--scroll' : '') + '">' +
      '<table class="gtable">' +
      '<thead><tr><th style="text-align:center">מקום בתור</th><th>בעל חלקה</th><th>תאריך חתימה</th><th>הערות</th></tr></thead>' +
      '<tbody>' + rows + '</tbody></table></div>';
    var count = g.owners.length === 1 ? 'בעל/ת חלקה אחד/ת' : g.owners.length + ' בעלי חלקות';
    // name= makes the group exclusive (one open at a time) in modern browsers
    return '<details class="gacc" name="order-group"' + (i === 0 ? ' open' : '') + '>' +
      '<summary><b>תמורה ' + g.sqm + ' מ״ר</b>' + caret + '<small>' + count + '</small></summary>' +
      table +
      '</details>';
  }).join('') +
  '<p class="muted mt-2" style="font-size:.85rem">' + icon('lock') +
  ' מטעמי פרטיות מוצגים מספרי חלקה בלבד, ללא שמות.</p>';
  // fallback for browsers without <details name> support
  el.querySelectorAll('details.gacc').forEach(function (d) {
    d.addEventListener('toggle', function () {
      if (!d.open) return;
      el.querySelectorAll('details.gacc[open]').forEach(function (o) {
        if (o !== d) o.open = false;
      });
    });
  });
};

/* ---- 3. Vertical availability map ---------------------------------------- */
DH.renderTowerMap = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var legend = '<div class="legend">' +
    '<span><i style="background:var(--status-available)"></i> פנויה</span>' +
    '<span><i style="background:var(--status-reserved)"></i> בהמתנה</span>' +
    '<span><i style="background:var(--status-selected)"></i> נבחרה</span>' +
    '<span><i style="background:var(--status-market)"></i> דירת יזם</span>' +
    '</div>';

  var floorsHtml = DH.towerLayout.map(function (fl) {
    var isPh = fl.floor >= 27;
    var units = fl.units.map(function (u) {
      var cls = ['unit'];
      if (u.kind === 'compensation') { cls.push('is-compensation', 's-' + u.status); }
      else { cls.push('is-market'); }
      var tag = u.kind === 'compensation' ? (DH.statusMeta[u.status] || {}).label : 'יזם';
      return '<div class="' + cls.join(' ') + '" data-unit="' + u.id + '" ' +
        (u.kind === 'compensation' ? 'tabindex="0" role="button" aria-label="דירה ' + u.model + ' קומה ' + u.floor + ', ' + tag + '"' : '') + '>' +
        '<span class="unit__model">' + u.model + '</span>' +
        '<span class="unit__tag">' + tag + '</span></div>';
    }).join('');
    // a floor with a plan PDF becomes a link — icon + hover make it discoverable
    var fnum = fl.pdf
      ? '<a class="tower__fnum tower__fnum--link' + (isPh ? ' is-ph' : '') + '" href="' + fl.pdf + '" target="_blank" rel="noopener" title="לצפייה בתשריט קומה ' + fl.floor + '" aria-label="תשריט קומה ' + fl.floor + '">קומה ' + fl.floor + icon('download') + '</a>'
      : '<div class="tower__fnum' + (isPh ? ' is-ph' : '') + '">קומה ' + fl.floor + '</div>';
    return '<div class="tower__floor">' +
      fnum +
      '<div class="tower__units">' + units + '</div></div>';
  }).join('');

  // Mobile alternative: accordion list by floor (CSS decides which view shows)
  var caret = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
  var accHtml = DH.towerLayout.map(function (fl) {
    var isPh = fl.floor >= 27;
    var comp = fl.units.filter(function (u) { return u.kind === 'compensation'; });
    var avail = comp.filter(function (u) { return u.status === 'available'; }).length;
    var sum = fl.units.length + ' דירות' +
      (comp.length ? ' · <span class="tacc-avail">' + avail + ' פנויות</span>' : ' · דירות יזם');
    var rows = fl.units.map(function (u) {
      var t = DH.getType(u.model) || {};
      var meta = t.rooms ? (t.rooms + ' חד׳ · ' + sqm(t.gross)) : '';
      var isComp = u.kind === 'compensation';
      var tag = isComp ? (DH.statusMeta[u.status] || {}).label : 'יזם';
      return '<div class="tacc-unit' + (isComp ? '' : ' is-market') + '"' +
        (isComp ? ' data-acc-unit="' + u.id + '" role="button" tabindex="0" aria-label="דירה ' + u.model + ' קומה ' + u.floor + ', ' + tag + '"' : '') + '>' +
        '<b>' + u.model + '</b>' +
        '<span class="meta">' + meta + '</span>' +
        '<span class="chip chip--' + (isComp ? u.status : 'market') + '">' + tag + '</span>' +
        '</div>';
    }).join('');
    return '<details class="tacc-floor' + (isPh ? ' is-ph' : '') + '">' +
      '<summary><span class="fnum">קומה ' + fl.floor + '</span><span class="tacc-sum">' + sum + '</span>' +
      '<span class="tacc-caret">' + caret + '</span></summary>' +
      '<div class="tacc-body">' + rows +
      (fl.pdf ? '<a class="tacc-pdf" href="' + fl.pdf + '" target="_blank" rel="noopener">' + icon('download') + ' תשריט קומה ' + fl.floor + '</a>' : '') +
      '</div></details>';
  }).join('');

  el.innerHTML = legend + '<div class="tower">' + floorsHtml + '</div>' +
    '<div class="tower-acc">' + accHtml + '</div>';

  // Click / keyboard → details modal (compensation units only)
  function openUnitModal(id) {
    var unit = null, floorObj = null;
    DH.towerLayout.forEach(function (fl) { fl.units.forEach(function (u) { if (u.id === id) { unit = u; floorObj = fl; } }); });
    if (!unit) return;
    var t = DH.getType(unit.model) || {};
    var meta = DH.statusMeta[unit.status] || {};
    var body =
      '<div class="kv" style="grid-template-columns:1fr 1fr">' +
      '<div class="kv__row"><div class="kv__k">דגם</div><div class="kv__v">' + unit.model + '</div></div>' +
      '<div class="kv__row"><div class="kv__k">קומה</div><div class="kv__v">' + unit.floor + '</div></div>' +
      '<div class="kv__row"><div class="kv__k">חדרים</div><div class="kv__v">' + (t.rooms || '-') + '</div></div>' +
      '<div class="kv__row"><div class="kv__k">שטח</div><div class="kv__v">' + sqm(t.gross) + '</div></div>' +
      '</div>' +
      '<p class="mt-2"><span class="chip chip--' + unit.status + '">' + (meta.label || '') + '</span></p>' +
      (t.img ? '<button type="button" class="btn btn--ghost mt-1" data-unit-plan="' + unit.model + '">' + icon('layers') + ' תשריט דירה</button>' : '');
    DH.ui.modal.open('דירה ' + unit.model + ' · קומה ' + unit.floor, body);
    var planBtn = DH.ui.modal.el.querySelector('[data-unit-plan]');
    if (planBtn) planBtn.addEventListener('click', function () {
      // plan popup gets a "back" button that re-opens this unit's popup
      DH.openModelPopup(unit.model, { onBack: function () { openUnitModal(id); } });
    });
  }
  el.querySelectorAll('.unit.is-compensation').forEach(function (node) {
    var handler = function () { openUnitModal(node.getAttribute('data-unit')); };
    node.addEventListener('click', handler);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
  // accordion (mobile) unit rows → same details popup
  el.querySelectorAll('[data-acc-unit]').forEach(function (node) {
    var handler = function () { openUnitModal(node.getAttribute('data-acc-unit')); };
    node.addEventListener('click', handler);
    node.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handler(); } });
  });
};

DH.renderTowerStats = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var s = DH.towerStats();
  var items = [
    ['דירות תמורה', s.compensation],
    ['פנויות', s.available],
    ['בהמתנה', s.reserved],
    ['נבחרו', s.selected],
  ];
  el.innerHTML = items.map(function (it) {
    return '<div><div class="n">' + it[1] + '</div><div class="l">' + it[0] + '</div></div>';
  }).join('');
};

/* ---- 4. Personal resident area ------------------------------------------- */
DH.renderPersonalArea = function (sel) {
  var root = document.querySelector(sel); if (!root) return;

  function dashboard(r) {
    var pos = DH.queuePositionOf(r.id);
    var sel = r.selected;
    var selectedBlock = sel
      ? '<div class="kv mt-2">' +
        '<div class="kv__row"><div class="kv__k">דגם שנבחר</div><div class="kv__v">' + sel.model + '</div></div>' +
        '<div class="kv__row"><div class="kv__k">קומה</div><div class="kv__v">' + sel.floor + '</div></div>' +
        '<div class="kv__row"><div class="kv__k">מספר דירה</div><div class="kv__v">' + sel.aptNo + '</div></div>' +
        '<div class="kv__row"><div class="kv__k">סטטוס</div><div class="kv__v">נבחרה</div></div>' +
        '</div>'
      : '<div class="note mt-2">' + icon('info') + '<div>טרם בחרת דירת תמורה. נעדכן אותך כשמגיע תורך בהתאם למיקומך בתור.</div></div>';

    return '<div style="display:flex;flex-wrap:wrap;gap:1.4rem;align-items:center;justify-content:space-between">' +
      '<div><h3 style="margin:0">שלום, ' + r.name + '</h3>' +
      '<p class="muted" style="margin:.2rem 0 0">דירה מקורית מס׳ ' + r.originalAptNo + ' · נחתם ב־' + DH.ui.fmtDate(r.signingDate) + '</p></div>' +
      '<button class="btn btn--ghost" data-logout>התנתקות</button></div>' +

      '<div class="grid grid--2 mt-3" style="align-items:stretch">' +
        '<div class="card card--pad" style="display:flex;gap:1.2rem;align-items:center">' +
          '<div class="queuebadge"><span class="n">' + (pos || '-') + '</span><span class="l">מיקומך בתור</span></div>' +
          '<div><h4 style="margin:0 0 .3rem">סדר הבחירה</h4>' +
          '<p class="muted" style="margin:0;font-size:.92rem">נקבע לפי תאריך חתימת ההסכם. במקרה של תאריך זהה - לפי הגרלה (מספר הגרלה שלך: ' + r.lotteryNo + ').</p></div>' +
        '</div>' +
        '<div class="card card--pad">' +
          '<h4 style="margin:0 0 .6rem">זכאות לפי נספח א׳</h4>' +
          '<div class="kv">' +
          '<div class="kv__row"><div class="kv__k">שטח דירת תמורה</div><div class="kv__v">' + sqm(r.entitlementSqm) + '</div></div>' +
          '<div class="kv__row"><div class="kv__k">חדרים</div><div class="kv__v">' + r.entitlementRooms + '</div></div>' +
          '<div class="kv__row"><div class="kv__k">' + icon('car') + ' חניה</div><div class="kv__v">' + (r.parking.count) + ' תת״ק</div></div>' +
          '<div class="kv__row"><div class="kv__k">' + icon('box') + ' מחסן</div><div class="kv__v">≥ ' + r.storage.minSqm + ' מ״ר</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div class="card card--pad mt-3"><h4 style="margin:0 0 .4rem">הדירה שבחרת</h4>' + selectedBlock + '</div>' +

      '<p class="muted mt-2" style="font-size:.82rem">' + icon('lock') + ' המידע באזור זה אישי וחסוי. הנתונים המוצגים הם נתוני הדגמה - לפני עלייה לאוויר יוחלפו בנתוני אמת מאחורי התחברות מאובטחת.</p>';
  }

  function gate() {
    return '<div class="card card--pad gate">' +
      '<div class="feature__icon tint-petrol" style="margin-inline:auto">' + icon('lock') + '</div>' +
      '<h3 class="center">אזור דיירים אישי</h3>' +
      '<p class="muted center">התחברו כדי לראות את מיקומכם בתור, זכאותכם והדירה שבחרתם.</p>' +
      '<form data-login class="mt-2">' +
      '<div class="field"><label for="acc">קוד גישה אישי</label>' +
      '<input id="acc" name="acc" type="text" autocomplete="off" placeholder="התקבל מנציג הפרויקט" required></div>' +
      '<button class="btn btn--primary" type="submit" style="width:100%">כניסה</button>' +
      '<p data-login-err class="hidden mt-1" style="color:#c2412f;font-size:.9rem;text-align:center">קוד גישה שגוי. נסו שוב.</p>' +
      '</form>' +
      '<p class="muted center mt-2" style="font-size:.82rem">קודי הדגמה: <code>demo-101</code> … <code>demo-105</code></p>' +
      '</div>';
  }

  function paint() {
    var r = DH.auth.current();
    root.innerHTML = r ? dashboard(r) : gate();
    if (r) {
      root.querySelector('[data-logout]').addEventListener('click', function () { DH.auth.logout(); paint(); });
    } else {
      var form = root.querySelector('[data-login]');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var code = form.querySelector('#acc').value;
        var id = DH.auth.login(code);
        if (id) { paint(); root.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        else { root.querySelector('[data-login-err]').classList.remove('hidden'); }
      });
    }
  }
  paint();
};

/* ---- 5. Data-verification panel ------------------------------------------ */
DH.renderDataFlags = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var sevLabel = { high: 'דורש בירור', medium: 'לבדיקה', low: 'הערה' };
  el.innerHTML = DH.dataFlags.map(function (f) {
    return '<div class="flag sev-' + f.severity + ' reveal">' +
      '<div style="display:flex;align-items:center;gap:.6rem;flex-wrap:wrap">' +
      '<h4 style="flex:1">' + f.title + '</h4>' +
      '<span class="chip chip--warn">' + (sevLabel[f.severity] || f.severity) + '</span></div>' +
      '<p>' + f.detail + '</p>' +
      '<p class="needs"><b>נדרש:</b> ' + f.needs + '</p>' +
      '</div>';
  }).join('');
};
