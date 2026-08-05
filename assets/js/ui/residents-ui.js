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
  // only show types that have a floor plan (drops e.g. 3D1 / 3D2 which have no תשריט)
  el.innerHTML = DH.apartmentTypes.filter(function (t) { return t.img; }).map(function (t) {
    var dot = (DH.roomColors[t.rooms] || {}).tint || 'var(--muted)';
    var img = '<img src="' + t.img + '" alt="תשריט דגם ' + t.code + '" loading="lazy">';
    var areas = sqm(t.gross) + (t.net ? ' <span class="muted">/ ' + t.net + ' נטו</span>' : '');
    return '<article class="card model-card reveal">' +
      '<div class="model-card__img">' + img + '</div>' +
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
      '</div></article>';
  }).join('');
};

/* ---- 2. Selection order (demo queue) ------------------------------------- */
DH.renderQueue = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var ordered = DH.computeSelectionOrder();
  var rows = ordered.map(function (r) {
    var status = r.selected
      ? '<span class="chip chip--selected">בחר/ה: ' + r.selected.model + ' · קומה ' + r.selected.floor + '</span>'
      : '<span class="chip chip--available">בהמתנה לבחירה</span>';
    // privacy: show initials only in the public demo queue
    var initials = r.name.split(' ').map(function (p) { return p.charAt(0); }).join('. ') + '.';
    return '<tr>' +
      '<td style="text-align:center"><b>' + r.queuePosition + '</b></td>' +
      '<td>' + initials + '</td>' +
      '<td>' + DH.ui.fmtDate(r.signingDate) + '</td>' +
      '<td style="text-align:center">' + r.lotteryNo + '</td>' +
      '<td>' + status + '</td>' +
      '</tr>';
  }).join('');
  el.innerHTML =
    '<div class="table-wrap"><table class="data">' +
    '<thead><tr><th style="text-align:center">מקום בתור</th><th>בעל/ת דירה</th><th>תאריך חתימה</th><th style="text-align:center">הגרלה</th><th>סטטוס</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table></div>' +
    '<p class="muted mt-2" style="font-size:.85rem">' + icon('lock') +
    ' מטעמי פרטיות מוצגים ראשי תיבות בלבד. כל דייר/ת רואה את מיקומו המלא באזור האישי לאחר התחברות.</p>';
};

/* ---- 3. Vertical availability map ---------------------------------------- */
DH.renderTowerMap = function (sel) {
  var el = document.querySelector(sel); if (!el) return;
  var legend = '<div class="legend">' +
    '<span><i style="background:var(--status-available)"></i> פנויה</span>' +
    '<span><i style="background:var(--status-reserved)"></i> בהמתנה</span>' +
    '<span><i style="background:var(--status-selected)"></i> נבחרה</span>' +
    '<span><i style="background:var(--status-market)"></i> דירת קבלן</span>' +
    '</div>';

  var floorsHtml = DH.towerLayout.map(function (fl) {
    var isPh = fl.floor >= 27;
    var units = fl.units.map(function (u) {
      var cls = ['unit'];
      if (u.kind === 'compensation') { cls.push('is-compensation', 's-' + u.status); }
      else { cls.push('is-market'); }
      var tag = u.kind === 'compensation' ? (DH.statusMeta[u.status] || {}).label : 'קבלן';
      return '<div class="' + cls.join(' ') + '" data-unit="' + u.id + '" ' +
        (u.kind === 'compensation' ? 'tabindex="0" role="button" aria-label="דירה ' + u.model + ' קומה ' + u.floor + ', ' + tag + '"' : '') + '>' +
        '<span class="unit__model">' + u.model + '</span>' +
        '<span class="unit__tag">' + tag + '</span></div>';
    }).join('');
    return '<div class="tower__floor">' +
      '<div class="tower__fnum' + (isPh ? ' is-ph' : '') + '">' + fl.floor + '</div>' +
      '<div class="tower__units">' + units + '</div></div>';
  }).join('');

  el.innerHTML = legend + '<div class="tower">' + floorsHtml + '</div>';

  // Click / keyboard → details modal (compensation units only)
  el.querySelectorAll('.unit.is-compensation').forEach(function (node) {
    var handler = function () {
      var id = node.getAttribute('data-unit');
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
        (floorObj.pdf ? '<a class="btn btn--ghost mt-1" href="' + floorObj.pdf + '" target="_blank" rel="noopener">' + icon('download') + ' תשריט הקומה</a>' : '') +
        '<p class="muted mt-2" style="font-size:.82rem">' + icon('info') + ' עדכון סטטוס מתבצע ע״י מנהל הפרויקט. (אזור זה מוכן לחיבור CRM.)</p>';
      DH.ui.modal.open('דירה ' + unit.model + ' · קומה ' + unit.floor, body);
    };
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
