/* =============================================================================
 * models.js - Apartment type catalog & compensation mix
 * -----------------------------------------------------------------------------
 * SOURCE OF TRUTH for areas = the architectural type sheets (טיפוסי דירות.pptx)
 * and floor plans (תשריטי קומה). Every number below was read directly off those
 * drawings - see `_source` per entry.
 *
 * Each plan shows TWO areas: gross (שטח כולל, the larger) and net (the smaller).
 * We keep both so nothing is rounded away. `img` points at the real type plan.
 * ========================================================================== */
window.DH = window.DH || {};

/* ---- 1. Full verified type catalog (all 14 types in the building) ---------- */
DH.apartmentTypes = [
  // 3-room
  { code: '3A',   rooms: 3, gross: 78.1,  net: 75.5,  balcony: 10.5, terrace: 0,    img: 'assets/img/plans/type-3A.png',   _source: 'PPTX slide 1' },
  { code: '3B',   rooms: 3, gross: 74.8,  net: 71.6,  balcony: 12.0, terrace: 0,    img: 'assets/img/plans/type-3B.png',   _source: 'PPTX slide 2' },
  { code: '3C',   rooms: 3, gross: 80.8,  net: 77.5,  balcony: 12.0, terrace: 0,    img: 'assets/img/plans/type-3C.png',   _source: 'PPTX slide 3' },
  { code: '3D1',  rooms: 3, gross: 81.0,  net: 77.7,  balcony: 0,    terrace: 0,    img: '',                                _source: 'תשריט קומה 11 (ג\'1)', _note: 'דגם מיוחד בקומה 11' },
  { code: '3D2',  rooms: 3, gross: 66.9,  net: 64.4,  balcony: 0,    terrace: 0,    img: '',                                _source: 'תשריט קומה 12 (ג\'2)', _note: 'דגם מיוחד בקומה 12' },
  // 4-room
  { code: '4A',   rooms: 4, gross: 104.3, net: null,  balcony: 12.0, terrace: 0,    img: 'assets/img/plans/type-4A.png',   _source: 'PPTX slide 4' },
  { code: '4B',   rooms: 4, gross: 105.7, net: 101.1, balcony: 10.6, terrace: 0,    img: 'assets/img/plans/type-4B.png',   _source: 'PPTX slide 5' },
  { code: '4C',   rooms: 4, gross: 96.0,  net: 92.7,  balcony: 10.5, terrace: 0,    img: 'assets/img/plans/type-4C.png',   _source: 'PPTX slide 6' },
  // 5-room
  { code: '5A-L', rooms: 5, gross: 126.5, net: 120.9, balcony: 10.6, terrace: 0,    img: 'assets/img/plans/type-5A-L.png', _source: 'PPTX slide 7' },
  { code: '5A-S', rooms: 5, gross: 122.8, net: 116.6, balcony: 10.6, terrace: 0,    img: 'assets/img/plans/type-5A-S.png', _source: 'PPTX slide 8' },
  { code: '5B',   rooms: 5, gross: 126.6, net: 122.4, balcony: 12.0, terrace: 0,    img: 'assets/img/plans/type-5B.png',   _source: 'PPTX slide 9' },
  { code: '5C',   rooms: 5, gross: 134.1, net: 128.7, balcony: 15.1, terrace: 0,    img: 'assets/img/plans/type-5C.png',   _source: 'PPTX slide 10' },
  { code: '5D',   rooms: 5, gross: 175.5, net: 168.1, balcony: 10.6, terrace: 57.6, img: 'assets/img/plans/type-5D.png',   _source: 'PPTX slide 11', _note: 'גרסת דף הטיפוסים - בתשריט ד מופיע 5D בשטח ~147.7' },
  // 6-room (penthouse-grade)
  { code: '6A',   rooms: 6, gross: 193.1, net: 184.8, balcony: 10.6, terrace: 82.8, img: 'assets/img/plans/type-6A.png',   _source: 'PPTX slide 12' },
  { code: '6B',   rooms: 6, gross: 148.4, net: 141.8, balcony: 40.2, terrace: 0,    img: 'assets/img/plans/type-6B.png',   _source: 'PPTX slide 13' },
  { code: '6C',   rooms: 6, gross: 156.3, net: 150.4, balcony: 15.1, terrace: 0,    img: 'assets/img/plans/type-6C.png',   _source: 'PPTX slide 14' },
];

/* Helper: look up a verified type by code */
DH.getType = function (code) {
  return DH.apartmentTypes.find(function (t) { return t.code === code; }) || null;
};

/* ---- 2. Compensation mix (owners' apartments) -----------------------------
 * As stated in the brief. `briefArea`/`briefBalcony` = the brief's numbers.
 * `verified` = matching figure from the source plans, when found, so the gap is
 * visible. DO NOT silently overwrite the brief - discrepancies are tracked in
 * DH.dataFlags and shown in the verification panel.
 * NOTE: counts here sum to 52, while the brief headline says 40 (see flag
 * 'total-count'). `count` is therefore marked unverified.
 * -------------------------------------------------------------------------- */
DH.compensationMix = [
  {
    model: '3B', rooms: 3, count: 8, countVerified: false,
    briefArea: 75, briefBalcony: 12,
    verified: { gross: 74.8, net: 71.6, balcony: 12.0, ref: '3B' },
    floors: 'קומות זוגיות 2-22 (לסירוגין)', floorsVerified: true,
  },
  {
    model: '3C', rooms: 3, count: 7, countVerified: false,
    briefArea: 81, briefBalcony: 12,
    verified: { gross: 80.8, net: 77.5, balcony: 12.0, ref: '3C' },
    floors: 'קומות אי־זוגיות 2-22 (לסירוגין)', floorsVerified: true,
  },
  {
    model: '4B', rooms: 4, count: 36, countVerified: false,
    briefArea: 104, briefBalcony: '10.4 / 12',
    verified: { gross: 105.7, net: 101.1, balcony: 10.6, ref: '4B', note: 'שים לב: 4A=104.3 קרוב יותר ל"104"' },
    floors: 'קומות 2-22', floorsVerified: true,
  },
  {
    model: '5D', rooms: 5, count: 1, countVerified: false,
    briefArea: 146.9, briefBalcony: 12,
    verified: { gross: 147.7, net: 142.3, balcony: null, ref: '5D (תשריט ד, קומות 23-26)', note: 'התדריך מציין קומות 11-12 - לא תואם לתשריטים' },
    floors: 'התדריך: 11-12 · המקור: 23-26', floorsVerified: false,
  },
];

/* Visual room-type accent colors (match the architectural plan color coding) */
DH.roomColors = {
  3: { key: '3', label: '3 חדרים', tint: '#3f7d63' }, // green plans
  4: { key: '4', label: '4 חדרים', tint: '#b86fa0' }, // pink plans
  5: { key: '5', label: '5 חדרים', tint: '#c98a3c' }, // orange plans
  6: { key: '6', label: '6 חדרים', tint: '#5a93b8' }, // blue plans
};
