/* =============================================================================
 * project.js - Core project facts & configuration (PUBLIC, non-sensitive)
 * -----------------------------------------------------------------------------
 * Derech Hevron 116 · Urban Renewal · Glanor Group · Jerusalem
 *
 * EDITING NOTES FOR ADMINS:
 *  - This file holds GENERAL project facts only. No private resident data here.
 *  - Fields marked `_todo: true` need verification against official documents.
 *    They are surfaced in the residents area "data verification" panel so nothing
 *    unverified is presented to residents as fact.
 *  - Marketing copy (about / location / developer) was NOT supplied - the source
 *    text files under תכנים/תוכן were empty (0 bytes). Placeholders below are
 *    clearly flagged and must be replaced with approved copy before go-live.
 * ========================================================================== */
window.DH = window.DH || {};

DH.project = {
  name: 'דרך חברון 116',
  shortName: 'דרך חברון 116',
  tagline: 'התחדשות עירונית במתחם תלפיות, ירושלים',
  developer: 'קבוצת גלנור',
  developerEn: 'Glanor Group',
  city: 'ירושלים',
  area: 'תלפיות / דרך חברון',
  projectType: 'התחדשות עירונית (פינוי־בינוי / הריסה ובנייה)',

  // Tower facts.
  tower: {
    floorsMarketing: 30,      // approved copy: "מגדל בן 30 קומות"
    floorsInPlans: 29,        // floor plans supplied run up to קומה 29 (see flag 'floors-29-30')
    residentialFrom: 2,
    penthouseFrom: 27,        // floors 27-29 are penthouse levels (7/8-room types)
    // Compensation (owners') apartments sit within floors 2-22 per the brief.
    compensationFloorsFrom: 2,
    compensationFloorsTo: 22,
  },

  // Project scope - from the approved marketing copy supplied by the client.
  scope: {
    evacuatedUnits: 40,       // 40 dwellings in an old 1970s "rail building" + an existing kindergarten
    newApartments: 127,       // total new apartments in the tower
    siteAreaDunam: 4,         // ~4 dunam
    planningStatus: 'אושר בתב״ע · בשלב בקשה להיתר חפירה ודיפון',
    mix: 'דירות 3-5 חדרים, דופלקסים ופנטהאוזים',
    views: 'נוף פתוח לכיוון מדבר יהודה וים המלח (בקומות הגבוהות)',
    commercial: 'חזית מסחרית פעילה בקומת הרחוב הפונה לדרך חברון',
    publicInstitutions: 'שלושה גני ילדים ובית כנסת חדש',
    lightRail: 'על תוואי הקו הכחול העתידי של הרכבת הקלה',
    nearby: ['בקעה', 'המושבה הגרמנית', 'ארנונה', 'אבו תור', 'גילה', 'הר חומה'],
  },

  // Every compensation apartment includes the following - per the brief.
  // TODO(admin): confirm against Appendix A (נספח א') of the signed agreement.
  entitlementsPerUnit: {
    parking: { label: 'חניה תת־קרקעית', count: 1, note: 'חניה אחת בחניון התת־קרקעי' },
    storage: { label: 'מחסן', count: 1, minSqm: 5, note: 'מחסן אחד בשטח מינימלי של 5 מ״ר' },
  },

  // Shown next to changing data (availability map, project status, updates).
  // TODO(admin): bump this date whenever statuses/queue/updates are edited.
  lastUpdated: '2026-07-07',

  contact: {
    phone: '',               // TODO(admin): add sales/owners office phone
    email: '',               // TODO(admin): add contact email
    officeAddress: 'דרך חברון 116, ירושלים',
    whatsapp: '',            // TODO(admin): add WhatsApp number
  },

  // Resident-relations manager — the human face of the portal.
  // TODO(admin): fill real name/phone/email/hours before go-live.
  residentManager: {
    name: '',                // e.g. 'שרה כהן'
    role: 'מנהל/ת קשרי דיירים',
    phone: '',
    email: '',
    hours: 'ימים א-ה, 9:00-17:00',
  },

  // Long-form marketing copy - supplied by the client (approved). The source
  // .txt files in source-materials/תוכן were empty; this is the real copy.
  // Rendered into index.html (#about, #location, #developer). Kept here too so
  // it can be edited in one place / later fed from a CMS.
  copy: { provided: true },
};

/* -----------------------------------------------------------------------------
 * DATA VERIFICATION LOG
 * Inconsistencies found between the brief and the source documents.
 * Rendered in the residents area so unverified numbers are never shown as fact.
 * Severity: 'high' = do not present publicly until resolved · 'medium' · 'low'
 * -------------------------------------------------------------------------- */
DH.dataFlags = [
  {
    id: 'total-count',
    severity: 'medium',
    title: 'סך דירות התמורה: 40 מול פירוט של 52',
    detail: 'מספר דירות התמורה - 40 - מאומת כעת ע״י נוסח הפרויקט ("יפונו 40 יחידות דיור"). עם זאת, פירוט הדגמים שבתדריך (3B=8, 3C=7, 4B=36, 5D=1) מסתכם ב־52. נדרש להתאים את הפירוט ל־40.',
    needs: 'טבלת איזון / נספח א\' עם מספר היחידות המדויק לכל דגם (סך 40).',
  },
  {
    id: 'floors-29-30',
    severity: 'low',
    title: 'מספר קומות: 29 (תשריטים) מול 30 (נוסח מאושר)',
    detail: 'נוסח הפרויקט מציין "מגדל בן 30 קומות", בעוד תשריטי הקומות שסופקו מגיעים עד קומה 29. ייתכן הבדל בספירה (קומת קרקע/לובי).',
    needs: 'אישור מספר הקומות הסופי לתצוגה.',
  },
  {
    id: 'new-apartments',
    severity: 'low',
    title: '127 דירות חדשות - לאימות מול התשריטים',
    detail: 'נוסח הפרויקט מציין 127 דירות חדשות בסך הכל. סכימת היחידות בתשריטי הקומות שסופקו לא אומתה מול מספר זה.',
    needs: 'טבלת שטחים/יחידות סופית לאימות הסך.',
  },
  {
    id: 'model-5d',
    severity: 'high',
    title: 'דגם 5D - שטח וקומות לא תואמים',
    detail: 'התדריך: 5D = 146.9 מ״ר, קומות 11-12. בתשריטים: קומות 11-12 כוללות דגמים 3D1/3D2 + 5A/5B (אין 5D). דגם 5D מופיע בקומות 23-26 בשטח נטו ~142-148 מ״ר (קרוב ל־146.9). בנוסף, דף הטיפוסים (PPTX) מציג 5D = 175.5 מ״ר עם מרפסת 57.6 מ״ר - סתירה פנימית במקורות.',
    needs: 'אישור איזה 5D ובאיזו קומה רלוונטי לדירות התמורה.',
  },
  {
    id: 'model-4b',
    severity: 'medium',
    title: 'דגם 4B - מיפוי אות הדגם',
    detail: 'התדריך: 4B = 104 מ״ר, מרפסת 10.4 או 12. במקור: 4B = 105.7/101.1 מ״ר, מרפסת 10.6; ואילו 4A = 104.3 מ״ר, מרפסת 12 - כלומר "4B=104, מרפסת 12" מהתדריך תואם דווקא לדגם 4A שבמקור.',
    needs: 'אישור מיפוי אותיות הדגמים בין התדריך לתשריטים.',
  },
  {
    id: 'entitlement-120',
    severity: 'low',
    title: 'זכאות 120 מ״ר ללא דגם תואם בקטלוג',
    detail: 'באזור האישי הוזכרה זכאות של 120 מ״ר, אך אין בקטלוג דגם 120 מ״ר. במקור קיים דגם 5A‑L בשטח נטו 120.9 מ״ר (5 חדרים) - ככל הנראה הכוונה אליו.',
    needs: 'אישור ששטח זכאות 120 מ״ר = דגם 5A.',
  },
  {
    id: 'count-3b-3c',
    severity: 'medium',
    title: 'כמות 3B / 3C מול הקומות',
    detail: 'התדריך: 3B=8, 3C=7. בתשריטים 3B מופיע בקומות הזוגיות (2-22, ללא 12) ו־3C בקומות האי־זוגיות - מספר מופעים גדול מהכמות שבתדריך, כלומר דירות התמורה הן תת־קבוצה.',
    needs: 'רשימת יחידות התמורה המדויקת (קומה + דגם) מתוך כלל הדירות.',
  },
  {
    id: 'model-3a',
    severity: 'medium',
    title: 'דגם 3A קיים במקור ולא בתמהיל התדריך',
    detail: 'בכל קומה טיפוסית קיים דגם 3A (3 חדרים, ~76-78 מ״ר) שאינו מופיע בתמהיל דירות התמורה שבתדריך.',
    needs: 'האם 3A נכלל בדירות התמורה?',
  },
];
