/* =============================================================================
 * residents.js - PRIVATE resident records + selection-order logic + auth stub
 * -----------------------------------------------------------------------------
 * ⚠ PRIVACY: The records below are FICTIONAL DEMO DATA only. Real owners' names,
 *   phone numbers and entitlements must NOT be committed to a public repo.
 *   Before go-live, move this to a protected backend (see the auth stub at the
 *   bottom) and serve resident data only after authentication.
 *
 * The current "login" is a lightweight client-side gate so the residents area
 * can be demonstrated. It is NOT real security - anyone with the file can read
 * it. It exists purely to shape the UI and the data flow for a future real login.
 * ========================================================================== */
window.DH = window.DH || {};

/* ---- Resident record schema (one object per owner) ------------------------
 * id                 internal id
 * accessCode         temporary per-resident code for the demo gate (→ replace
 *                    with real auth: email+password / OTP / national-ID, etc.)
 * name               full name
 * originalAptNo      original apartment number (pre-renewal)
 * signingDate        date the agreement was signed (ISO yyyy-mm-dd) → drives queue
 * lotteryNo          tie-breaker when several owners signed the same date
 * entitlementSqm     compensation apartment size per Appendix A (נספח א')
 * entitlementRooms   entitled room count
 * parking            { included:true, count:1 }
 * storage            { included:true, minSqm:5 }
 * selected           filled once the owner has chosen (else null):
 *                    { unitId, model, floor, aptNo }
 * adminNotes         internal notes (never shown to the resident)
 * -------------------------------------------------------------------------- */
DH.residents = [
  {
    id: 'r-001', accessCode: 'demo-101',
    name: 'ישראל ישראלי', originalAptNo: '7', signingDate: '2023-11-02', lotteryNo: 1,
    entitlementSqm: 104, entitlementRooms: 4,
    parking: { included: true, count: 1 }, storage: { included: true, minSqm: 5 },
    selected: { unitId: 'F2-1', model: '4B', floor: 2, aptNo: '2-1' },
    adminNotes: 'בחר דירה. ממתין לחתימת נספח בחירה.',
  },
  {
    id: 'r-002', accessCode: 'demo-102',
    name: 'מרים כהן', originalAptNo: '3', signingDate: '2023-11-02', lotteryNo: 2,
    entitlementSqm: 75, entitlementRooms: 3,
    parking: { included: true, count: 1 }, storage: { included: true, minSqm: 5 },
    selected: { unitId: 'F2-5', model: '3B', floor: 2, aptNo: '2-5' },
    adminNotes: '',
  },
  {
    id: 'r-003', accessCode: 'demo-103',
    name: 'דוד לוי', originalAptNo: '12', signingDate: '2023-12-15', lotteryNo: 1,
    entitlementSqm: 81, entitlementRooms: 3,
    parking: { included: true, count: 1 }, storage: { included: true, minSqm: 5 },
    selected: null,
    adminNotes: 'טרם בחר. תור קרוב.',
  },
  {
    id: 'r-004', accessCode: 'demo-104',
    name: 'פרידה אברהם', originalAptNo: '21', signingDate: '2024-01-09', lotteryNo: 1,
    entitlementSqm: 120, entitlementRooms: 5,
    parking: { included: true, count: 1 }, storage: { included: true, minSqm: 5 },
    selected: null,
    adminNotes: 'זכאות 120 מ״ר - לאמת מול נספח א\' (ר\' אזהרת נתונים).',
  },
  {
    id: 'r-005', accessCode: 'demo-105',
    name: 'יוסף מזרחי', originalAptNo: '9', signingDate: '2024-02-20', lotteryNo: 1,
    entitlementSqm: 104, entitlementRooms: 4,
    parking: { included: true, count: 1 }, storage: { included: true, minSqm: 5 },
    selected: null,
    adminNotes: '',
  },
];

/* ---- Selection order -------------------------------------------------------
 * Rule: earlier signing date → earlier in the queue.
 *       Same signing date → internal order decided by lottery (lotteryNo asc).
 * Returns residents sorted, each annotated with `queuePosition` (1-based).
 * -------------------------------------------------------------------------- */
DH.computeSelectionOrder = function (residents) {
  var list = (residents || DH.residents).slice();
  list.sort(function (a, b) {
    if (a.signingDate !== b.signingDate) {
      return a.signingDate < b.signingDate ? -1 : 1;      // earlier date first
    }
    return (a.lotteryNo || 0) - (b.lotteryNo || 0);        // lottery tie-break
  });
  list.forEach(function (r, i) { r.queuePosition = i + 1; });
  return list;
};

/* Convenience: queue position for one resident id. */
DH.queuePositionOf = function (residentId) {
  var ordered = DH.computeSelectionOrder();
  var r = ordered.find(function (x) { return x.id === residentId; });
  return r ? r.queuePosition : null;
};

/* =============================================================================
 * AUTH - demo gate only. Swap the body of these two functions for a real login.
 * -----------------------------------------------------------------------------
 * Future real implementation, e.g.:
 *   DH.auth.login = async (email, password) => {
 *     const res = await fetch('/api/auth/login', { method:'POST', body:... });
 *     if (!res.ok) return null;
 *     const { token, residentId } = await res.json();
 *     sessionStorage.setItem('dh_token', token);
 *     return residentId;
 *   };
 * and resident records would be fetched per-request, never shipped to the client.
 * ========================================================================== */
DH.auth = {
  _key: 'dh_resident_session',

  /** Demo: match an access code → resident id. Replace with server auth. */
  login: function (code) {
    var r = DH.residents.find(function (x) {
      return x.accessCode && x.accessCode.toLowerCase() === String(code).trim().toLowerCase();
    });
    if (!r) return null;
    try { sessionStorage.setItem(DH.auth._key, r.id); } catch (e) {}
    return r.id;
  },

  current: function () {
    var id;
    try { id = sessionStorage.getItem(DH.auth._key); } catch (e) { id = null; }
    return id ? DH.residents.find(function (x) { return x.id === id; }) || null : null;
  },

  logout: function () {
    try { sessionStorage.removeItem(DH.auth._key); } catch (e) {}
  },
};
