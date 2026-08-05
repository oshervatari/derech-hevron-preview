/* =============================================================================
 * tower.js - Vertical tower composition & per-unit availability
 * -----------------------------------------------------------------------------
 * Built from the floor plans (תשריטי קומה):
 *   • קומה טיפוסית א' → even floors 2,4,6,8,10,14,16,18,20,22
 *   • קומה טיפוסית ב' → odd  floors 3,5,7,9,13,15,17,19,21
 *   • קומה 11 (ג'1), קומה 12 (ג'2)  → special mid-floors
 *   • קומה טיפוסית ד' → floors 23-26
 *   • קומות 27-29     → penthouse levels
 *
 * HOW TO UPDATE STATUSES (admin):
 *   1) Find the floor in DH.towerLayout.
 *   2) Each unit has a `status`: 'available' | 'reserved' | 'selected'.
 *      → To mark a unit taken: set status:'selected' and (optionally) residentId.
 *   3) Statuses below are DEMO seed data. Replace with live data, or later wire
 *      DH.loadTowerStatus() to a backend/CRM (see stub at bottom).
 *
 * `kind`: 'compensation' (owners' apartment) | 'market' (developer sale).
 *   ⚠ The compensation/market split per unit is a PLACEHOLDER pending the
 *   official unit schedule (see DH.dataFlags 'total-count'/'count-3b-3c').
 *   It is centralised here so it can be corrected in one place.
 * ========================================================================== */
window.DH = window.DH || {};

/* Floor templates: ordered list of apartment model codes on that floor type. */
DH._floorTemplates = {
  A:    ['4B', '4A', '4C', '3A', '3B', '5A-L'], // even 2-22
  B:    ['4B', '4A', '4C', '3A', '3C', '5B'],   // odd  3-21
  F11:  ['4B', '4A', '4C', '3A', '3D1', '5B'],
  F12:  ['4B', '4A', '4C', '3A', '3D2', '5A-L'],
  D:    ['4B', '4C', '5C', '5B', '5D'],          // 23-26
  PH:   ['5E1', '5C', '7A1', '8A1'],             // 27-29 penthouses (market)
};

/* Which models count as owners' compensation apartments (floors ≤ 22). */
DH._compensationModels = ['3B', '3C', '4B', '5D'];

/* Assign each floor number to a template. */
DH._floorPlanFor = function (floor) {
  if (floor === 11) return 'F11';
  if (floor === 12) return 'F12';
  if (floor >= 27) return 'PH';
  if (floor >= 23) return 'D';
  return floor % 2 === 0 ? 'A' : 'B';
};

/* PDF plan available for download per floor (see assets/plans/). */
DH._planPdfFor = function (floor) {
  if (floor === 11) return 'assets/plans/floor-11.pdf';
  if (floor === 12) return 'assets/plans/floor-12.pdf';
  if (floor === 27) return 'assets/plans/floor-27.pdf';
  if (floor === 28) return 'assets/plans/floor-28.pdf';
  if (floor === 29) return 'assets/plans/floor-29.pdf';
  if (floor >= 23) return 'assets/plans/floor-typical-D-23-26.pdf';
  return floor % 2 === 0 ? 'assets/plans/floor-typical-A.pdf'
                         : 'assets/plans/floor-typical-B.pdf';
};

/* Build the layout (floors 29 → 2, top first for a natural vertical map). */
DH.towerLayout = (function () {
  var floors = [];
  for (var f = 29; f >= 2; f--) {
    var tpl = DH._floorTemplates[DH._floorPlanFor(f)];
    var units = tpl.map(function (model, i) {
      var isComp = f <= 22 && DH._compensationModels.indexOf(model) !== -1;
      return {
        id: 'F' + f + '-' + (i + 1),
        floor: f,
        model: model,
        kind: isComp ? 'compensation' : 'market',
        status: 'available',  // overridden below by demo seed
        residentId: null,     // link to DH.residents[].id once selected
      };
    });
    floors.push({ floor: f, plan: DH._floorPlanFor(f), pdf: DH._planPdfFor(f), units: units });
  }
  return floors;
})();

/* ---- DEMO seed: mark some compensation units as selected/reserved --------- */
/* Format: { 'F<floor>-<index>': 'selected'|'reserved' }  (compensation only) */
DH._statusSeed = {
  'F2-5': 'selected',   // 3B
  'F2-1': 'selected',   // 4B
  'F4-5': 'selected',   // 3B
  'F3-5': 'reserved',   // 3C
  'F5-1': 'selected',   // 4B
  'F6-1': 'reserved',   // 4B
  'F7-5': 'selected',   // 3C
  'F8-5': 'selected',   // 3B
  'F9-1': 'reserved',   // 4B
  'F10-1': 'selected',  // 4B
  'F14-5': 'selected',  // 3B
  'F16-1': 'reserved',  // 4B
};
DH.towerLayout.forEach(function (fl) {
  fl.units.forEach(function (u) {
    if (DH._statusSeed[u.id]) u.status = DH._statusSeed[u.id];
  });
});

/* ---- Aggregate stats for the availability legend -------------------------- */
DH.towerStats = function () {
  var s = { compensation: 0, available: 0, reserved: 0, selected: 0, market: 0 };
  DH.towerLayout.forEach(function (fl) {
    fl.units.forEach(function (u) {
      if (u.kind === 'compensation') {
        s.compensation++;
        s[u.status]++;
      } else {
        s.market++;
      }
    });
  });
  return s;
};

DH.statusMeta = {
  available: { label: 'פנויה',  color: 'var(--status-available)' },
  reserved:  { label: 'בהמתנה', color: 'var(--status-reserved)' },
  selected:  { label: 'נבחרה',  color: 'var(--status-selected)' },
  market:    { label: 'דירת קבלן', color: 'var(--status-market)' },
};

/* ---- Backend hook (future) ------------------------------------------------
 * Replace the demo seed with live data, e.g.:
 *   DH.loadTowerStatus = async function () {
 *     const res = await fetch('/api/tower/status', { headers: authHeaders() });
 *     const map = await res.json(); // { 'F2-5': {status, residentId}, ... }
 *     DH.towerLayout.forEach(fl => fl.units.forEach(u => {
 *       if (map[u.id]) Object.assign(u, map[u.id]);
 *     }));
 *     DH.renderTowerMap && DH.renderTowerMap();
 *   };
 * -------------------------------------------------------------------------- */
