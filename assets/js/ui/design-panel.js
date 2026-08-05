/* =============================================================================
 * design-panel.js — live design controls for the redesign concept page.
 * Floating button (bottom-left) opens a panel that edits the page's CSS
 * variables in real time. Choices persist in localStorage (this browser only)
 * and can be copied as CSS to make them permanent.
 * Loaded on redesign.html only. Safe to delete before production.
 * ========================================================================== */
(function () {
  'use strict';
  var STORE_KEY = 'dhDesignTokens';

  /* ---- control definitions --------------------------------------------------
   * color:  hex color input bound directly to a CSS variable
   * range:  slider; `make` turns the number into the CSS value(s) */
  var CONTROLS = [
    { group: 'צבעים' },
    { id: 'petrol',  type: 'color', label: 'צבע ראשי (כפתורים/קישורים)', varName: '--r-petrol',    def: '#1e6180' },
    { id: 'orange',  type: 'color', label: 'צבע הדגשה (כתום)',           varName: '--r-orange',    def: '#f1962d' },
    { id: 'terra',   type: 'color', label: 'צבע כותרות-משנה',            varName: '--r-terra',     def: '#b75f2f' },
    { id: 'navy',    type: 'color', label: 'רקע מקטעים כהים',            varName: '--r-navy-deep', def: '#0b2230' },
    { id: 'paper',   type: 'color', label: 'רקע העמוד',                  varName: '--r-paper',     def: '#fcfbf8' },
    { id: 'stone',   type: 'color', label: 'רקע מקטעים בהירים',          varName: '--r-stone',     def: '#f3f0e9' },
    { id: 'ink',     type: 'color', label: 'צבע כותרות',                 varName: '--r-ink',       def: '#1d2b33' },
    { id: 'text',    type: 'color', label: 'צבע טקסט',                   varName: '--r-text',      def: '#38424a' },

    { group: 'מספרי רקע' },
    { id: 'numColor', type: 'color', label: 'צבע המספרים', def: '#f1962d',
      make: function (v, all) { return numVars(v, all.numAlpha); } },
    { id: 'numAlpha', type: 'range', label: 'שקיפות המספרים', min: 0, max: 40, step: 1, def: 14, unit: '%',
      make: function (v, all) { return numVars(all.numColor, v); } },
    { id: 'numSize', type: 'range', label: 'גודל המספרים', min: 20, max: 64, step: 1, def: 48, unit: 'vw',
      make: function (v) { return { '--r-num-size': 'clamp(12rem, ' + v + 'vw, 50rem)' }; } },

    { group: 'טיפוגרפיה וריווח' },
    { id: 'typeScale', type: 'range', label: 'גודל כותרות', min: 85, max: 130, step: 1, def: 100, unit: '%',
      make: function (v) { return { '--r-type-scale': (v / 100) }; } },
    { id: 'bodySize', type: 'range', label: 'גודל טקסט רץ', min: 15, max: 20, step: 0.5, def: 18.4, unit: 'px',
      make: function (v) { return { '--r-f-body': v + 'px' }; } },
    { id: 'spaceScale', type: 'range', label: 'ריווח בין מקטעים', min: 70, max: 130, step: 1, def: 100, unit: '%',
      make: function (v) { return { '--r-space-scale': (v / 100) }; } },
    { id: 'mediaRadius', type: 'range', label: 'עיגול פינות תמונות', min: 0, max: 28, step: 1, def: 16, unit: 'px',
      make: function (v) { return { '--r-media-radius': v + 'px' }; } },
  ];

  function hexToRgb(hex) {
    var m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex || '');
    return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [241, 150, 45];
  }
  function numVars(hex, alphaPct) {
    var rgb = hexToRgb(hex).join(', ');
    var a = (alphaPct == null ? 14 : parseFloat(alphaPct)) / 100;
    /* dark sections keep their whitish number regardless of this choice */
    return { '--r-num-color': 'rgba(' + rgb + ', ' + a.toFixed(2) + ')' };
  }

  var fields = CONTROLS.filter(function (c) { return !c.group; });

  function currentValues() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(STORE_KEY) || '{}'); } catch (e) {}
    var vals = {};
    fields.forEach(function (c) { vals[c.id] = (saved[c.id] != null ? saved[c.id] : c.def); });
    return vals;
  }

  function cssVarsFor(vals) {
    var out = {};
    fields.forEach(function (c) {
      var v = vals[c.id];
      if (c.varName) out[c.varName] = v;
      if (c.make) Object.assign(out, c.make(v, vals));
    });
    return out;
  }

  function apply(vals) {
    var vars = cssVarsFor(vals);
    Object.keys(vars).forEach(function (k) { document.documentElement.style.setProperty(k, String(vars[k])); });
  }

  function save(vals) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(vals)); } catch (e) {}
  }

  /* ---- panel UI ------------------------------------------------------------- */
  var css = '' +
    '.dh-dp-toggle{position:fixed;bottom:18px;left:18px;z-index:96;width:52px;height:52px;border-radius:50%;border:1px solid rgba(29,43,51,.15);background:#fff;color:#1e6180;cursor:pointer;display:grid;place-items:center;box-shadow:0 6px 22px rgba(11,34,48,.22);transition:transform .2s ease}' +
    '.dh-dp-toggle:hover{transform:scale(1.07)}' +
    '.dh-dp-toggle svg{width:24px;height:24px}' +
    '.dh-dp{position:fixed;bottom:82px;left:18px;z-index:96;width:320px;max-height:72vh;overflow-y:auto;background:#fff;border:1px solid rgba(29,43,51,.12);border-radius:14px;box-shadow:0 18px 48px rgba(11,34,48,.28);padding:1.1rem 1.2rem;display:none;font-family:Assistant,system-ui,sans-serif;font-size:.9rem;color:#38424a}' +
    '.dh-dp.open{display:block}' +
    '.dh-dp h4{margin:.2rem 0 .6rem;font-family:Heebo,sans-serif;font-size:1.02rem;color:#1d2b33}' +
    '.dh-dp .grp{font-family:Heebo,sans-serif;font-weight:700;font-size:.8rem;letter-spacing:.08em;color:#b75f2f;margin:1rem 0 .4rem;border-top:1px solid rgba(29,43,51,.08);padding-top:.8rem}' +
    '.dh-dp .grp:first-of-type{border-top:0;padding-top:0;margin-top:.4rem}' +
    '.dh-dp .row{display:flex;align-items:center;justify-content:space-between;gap:.7rem;padding:.28rem 0}' +
    '.dh-dp label{flex:1;line-height:1.3}' +
    '.dh-dp input[type=color]{inline-size:40px;block-size:28px;border:1px solid rgba(29,43,51,.2);border-radius:6px;background:#fff;padding:1px;cursor:pointer}' +
    '.dh-dp .rrow{display:block;padding:.34rem 0}' +
    '.dh-dp .rrow .top{display:flex;justify-content:space-between;margin-bottom:.15rem}' +
    '.dh-dp .rrow output{font-family:Heebo,sans-serif;font-weight:600;color:#1e6180}' +
    '.dh-dp input[type=range]{width:100%;accent-color:#1e6180;cursor:pointer}' +
    '.dh-dp .btns{display:flex;gap:.5rem;margin-top:1rem}' +
    '.dh-dp .btns button{flex:1;font-family:Heebo,sans-serif;font-weight:600;font-size:.85rem;padding:.55rem .6rem;border-radius:8px;cursor:pointer;border:1px solid rgba(29,43,51,.2);background:#fff;color:#1d2b33;transition:background .2s ease}' +
    '.dh-dp .btns button:hover{background:#f3f0e9}' +
    '.dh-dp .btns .primary{background:#1e6180;border-color:#1e6180;color:#fff}' +
    '.dh-dp .btns .primary:hover{background:#174e67}' +
    '.dh-dp .note{font-size:.76rem;color:#8a8f94;margin:.6rem 0 0;line-height:1.5}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  var toggle = document.createElement('button');
  toggle.className = 'dh-dp-toggle';
  toggle.setAttribute('aria-label', 'פתיחת כלי עיצוב');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="19" cy="13" r="2"/><circle cx="6" cy="12" r="3"/><path d="M12 22a10 10 0 1 1 10-10c0 2-1.5 3.5-3.5 3.5H16a2 2 0 0 0-1.5 3.3c.6.7.1 1.7-.8 1.9-.5.2-1.1.3-1.7.3z"/></svg>';

  var panel = document.createElement('div');
  panel.className = 'dh-dp';
  panel.setAttribute('dir', 'rtl');

  var vals = currentValues();
  var html = '<h4>עיצוב חופשי</h4>';
  CONTROLS.forEach(function (c) {
    if (c.group) { html += '<div class="grp">' + c.group + '</div>'; return; }
    if (c.type === 'color') {
      html += '<div class="row"><label for="dp-' + c.id + '">' + c.label + '</label>' +
        '<input type="color" id="dp-' + c.id + '" data-id="' + c.id + '" value="' + vals[c.id] + '" /></div>';
    } else {
      html += '<div class="rrow"><div class="top"><label for="dp-' + c.id + '">' + c.label + '</label>' +
        '<output id="dp-out-' + c.id + '">' + vals[c.id] + c.unit + '</output></div>' +
        '<input type="range" id="dp-' + c.id + '" data-id="' + c.id + '" min="' + c.min + '" max="' + c.max + '" step="' + c.step + '" value="' + vals[c.id] + '" /></div>';
    }
  });
  html += '<div class="btns">' +
    '<button type="button" class="primary" id="dp-copy">העתקת הגדרות</button>' +
    '<button type="button" id="dp-reset">איפוס</button>' +
    '</div>' +
    '<p class="note">השינויים נשמרים בדפדפן הזה בלבד. כדי להפוך אותם לקבועים באתר - לחצו "העתקת הגדרות" ושלחו לי את מה שהועתק.</p>';
  panel.innerHTML = html;

  document.body.appendChild(toggle);
  document.body.appendChild(panel);

  toggle.addEventListener('click', function () { panel.classList.toggle('open'); });

  panel.addEventListener('input', function (e) {
    var id = e.target.getAttribute('data-id');
    if (!id) return;
    vals[id] = e.target.type === 'range' ? parseFloat(e.target.value) : e.target.value;
    var def = fields.find(function (c) { return c.id === id; });
    var out = document.getElementById('dp-out-' + id);
    if (out && def) out.textContent = vals[id] + def.unit;
    apply(vals);
    save(vals);
  });

  document.getElementById('dp-copy').addEventListener('click', function () {
    var vars = cssVarsFor(vals);
    var text = ':root {\n' + Object.keys(vars).map(function (k) { return '  ' + k + ': ' + vars[k] + ';'; }).join('\n') + '\n}';
    (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () {
      var b = document.getElementById('dp-copy');
      b.textContent = 'הועתק ✓';
      setTimeout(function () { b.textContent = 'העתקת הגדרות'; }, 1600);
    }).catch(function () { window.prompt('העתיקו את הטקסט:', text); });
  });

  document.getElementById('dp-reset').addEventListener('click', function () {
    try { localStorage.removeItem(STORE_KEY); } catch (e) {}
    var vars = cssVarsFor(vals);
    Object.keys(vars).forEach(function (k) { document.documentElement.style.removeProperty(k); });
    vals = currentValues();
    fields.forEach(function (c) {
      var input = document.getElementById('dp-' + c.id);
      if (input) input.value = vals[c.id];
      var out = document.getElementById('dp-out-' + c.id);
      if (out) out.textContent = vals[c.id] + c.unit;
    });
  });

  // apply persisted choices on load
  if (localStorage.getItem(STORE_KEY)) apply(vals);
})();
