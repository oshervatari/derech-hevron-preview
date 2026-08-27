/* =============================================================================
 * tower.js - Vertical tower composition & per-unit availability
 * -----------------------------------------------------------------------------
 * Built from the floor plans (תשריטי קומה) - unit counts verified against the
 * PDFs 2026-08-22 (5 apts on 2-22, 4 on 23-26, 4 on 27-28, 2 penthouses on 29):
 *   • קומה טיפוסית א' → even floors 2,4,6,8,10,14,16,18,20,22 (5 apts)
 *   • קומה טיפוסית ב' → odd  floors 3,5,7,9,13,15,17,19,21    (5 apts)
 *   • קומה 11+12 → special mid-floors; 3D1+3D2 are ONE resident duplex
 *     spanning both floors (shown once, on the 11 row; plans to follow)
 *   • קומה טיפוסית ד' → floors 23-26                            (4 apts)
 *   • קומה 27 / 28    → 4 apts each (distinct model codes per plan)
 *   • קומה 29         → 2 penthouses (5F, 6A)
 * NOTE: type 4C exists on the architects' type sheets but appears on NO floor
 * plan - pending client confirmation it is excluded from the tower map.
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
  A:    ['4B', '4A', '3A', '3B', '5A-L'],  // even 2-22 (תשריט א': 4B,4A,3A,3B,5A)
  B:    ['4B', '4A', '3A', '3C', '5B'],    // odd  3-21 (תשריט ב': 4B,4A,3A,3C,5B)
  // floors 11-12: 3D1 (floor 11) + 3D2 (floor 12) together form ONE resident
  // duplex apartment — shown per floor, per client; duplex plans to follow.
  F11:  ['4B', '4A', '3A', '3D1', '5B'],
  F12:  ['4B', '4A', '3A', '3D2', '5A-L'],
  D:    ['4B', '5C', '5B', '5D'],          // 23-26 (תשריט ד': 4B,5C,5B,5D)
  PH27: ['5E1', '5C', '7A1', '8A1'],       // קומה 27 per plan
  PH28: ['5E2', '5C', '7A2', '9A2'],       // קומה 28 per plan
  PH29: ['5F', '6A'],                      // קומה 29: two penthouses per plan
};

/* Which units are OPEN FOR OWNERS to choose (compensation pool).
 * Per client instruction 2026-08-24:
 *   3B / 3C   → all their floors (2-22)
 *   4A        → all floors 2-22
 *   4B        → floors 2-16; from floor 17 and up → developer (יזם)
 *   3D1/3D2   → the floors 11-12 resident duplex (already taken - תפוסה) */
DH._isCompensation = function (floor, model) {
  if (floor > 22) return false;
  if (model === '3B' || model === '3C' || model === '4A') return true;
  if (model === '4B') return floor <= 16;
  if (model === '3D1' || model === '3D2') return true; // the 11-12 duplex
  return false;
};

/* Assign each floor number to a template. */
DH._floorPlanFor = function (floor) {
  if (floor === 11) return 'F11';
  if (floor === 12) return 'F12';
  if (floor === 29) return 'PH29';
  if (floor === 28) return 'PH28';
  if (floor === 27) return 'PH27';
  if (floor >= 23) return 'D';
  return floor % 2 === 0 ? 'A' : 'B';
};

/* PDF plan available for download per floor (see assets/plans/). */
DH._planPdfFor = function (floor) {
  if (floor === 11) return 'assets/plans/floor-11.pdf?v=2';
  if (floor === 12) return 'assets/plans/floor-12.pdf?v=2';
  if (floor === 27) return 'assets/plans/floor-27.pdf';
  if (floor === 28) return 'assets/plans/floor-28.pdf';
  if (floor === 29) return 'assets/plans/floor-29.pdf';
  if (floor >= 23) return 'assets/plans/floor-typical-D-23-26.pdf';
  return floor % 2 === 0 ? 'assets/plans/floor-typical-A.pdf?v=2'
                         : 'assets/plans/floor-typical-B.pdf?v=2';
};

/* Build the layout (floors 29 → 2, top first for a natural vertical map). */
DH.towerLayout = (function () {
  var floors = [];
  for (var f = 29; f >= 2; f--) {
    var tpl = DH._floorTemplates[DH._floorPlanFor(f)];
    var units = tpl.map(function (model, i) {
      var isComp = DH._isCompensation(f, model);
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

/* ---- Status overrides ------------------------------------------------------
 * The selection process has not started - every compensation apartment is
 * 'available'. When owners start choosing, mark taken units here:
 * Format: { 'F<floor>-<index>': 'selected'|'reserved'|'taken' }  (compensation only)
 * e.g.  'F2-1': 'selected',  // 4B קומה 2 */
DH._statusSeed = {
  'F11-4': 'reserved',  // 3D1 - the 11-12 duplex belongs to an owner (בהמתנה)
  'F12-4': 'reserved',  // 3D2 - the 11-12 duplex belongs to an owner (בהמתנה)
};
DH.towerLayout.forEach(function (fl) {
  fl.units.forEach(function (u) {
    if (DH._statusSeed[u.id]) u.status = DH._statusSeed[u.id];
  });
});

/* ---- Aggregate stats for the availability legend -------------------------- */
DH.towerStats = function () {
  var s = { compensation: 0, available: 0, reserved: 0, selected: 0, taken: 0, market: 0 };
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
  taken:     { label: 'תפוסה',  color: 'var(--status-taken)' },
  market:    { label: 'דירת יזם', color: 'var(--status-market)' },
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
