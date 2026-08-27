/* =============================================================================
 * order.js - REAL selection order, by compensation group (סדר בחירת הדירות)
 * -----------------------------------------------------------------------------
 * Source: client spreadsheet "סדר בחירת הדירות דרך חברון-116" (received 2026-08-22).
 * The 40 owners split into 4 selection groups by compensation size (תמורה):
 * 75 מ״ר (8) · 81 מ״ר (7) · 104 מ״ר (24) · 148 מ״ר (1). Each group has its OWN
 * queue: order inside a group is by signing date; owners who signed on the same
 * date were ordered by an internal lottery (הגרלה פנימית) - the positions below
 * are the FINAL resolved order from the client. Owners with no date have not
 * signed yet and currently stand at the end of their group.
 *
 * ⚠ PRIVACY: only plot numbers (תת חלקה), dates and group sizes are stored -
 * never owners' names. `amidar` marks state-owned plots held via עמידר החדשה
 * (public land-registry information, shown as-is in the client's sheet).
 * ========================================================================== */
window.DH = window.DH || {};

DH.selectionOrder = {
  updated: '2026-08-22',
  /* group order: ascending by size; colors mirror the client's spreadsheet */
  groups: [
    {
      sqm: 75, color: 'green',
      owners: [
        { pos: 1, plot: 1,  date: '2019-06-02' },
        { pos: 2, plot: 10, date: '2019-06-02' },
        { pos: 3, plot: 4,  date: '2019-06-06' },
        { pos: 4, plot: 7,  date: '2019-06-06' },
        { pos: 5, plot: 31, date: '2019-06-06' },
        { pos: 6, plot: 34, date: '2019-06-16' },
        { pos: 7, plot: 37, date: '2019-07-07' },
        { pos: 8, plot: 40, date: '2020-04-26' },
      ],
    },
    {
      sqm: 81, color: 'rose',
      owners: [
        { pos: 1, plot: 8,  date: '2019-06-02' },
        { pos: 2, plot: 33, date: '2019-06-02' },
        { pos: 3, plot: 2,  date: '2019-06-03' },
        { pos: 4, plot: 39, date: '2019-06-04' },
        { pos: 5, plot: 5,  date: '2020-12-21', amidar: true },
        { pos: 6, plot: 36, date: '2020-12-21', amidar: true },
        { pos: 7, plot: 11, date: null },
      ],
    },
    {
      sqm: 104, color: 'blue',
      owners: [
        { pos: 1,  plot: 35, date: '2016-06-02' },
        { pos: 2,  plot: 6,  date: '2019-06-02' },
        { pos: 3,  plot: 9,  date: '2019-06-02' },
        { pos: 4,  plot: 15, date: '2019-06-02' },
        { pos: 5,  plot: 26, date: '2019-06-02' },
        { pos: 6,  plot: 38, date: '2019-06-02' },
        { pos: 7,  plot: 3,  date: '2019-06-06' },
        { pos: 8,  plot: 19, date: '2019-06-06' },
        { pos: 9,  plot: 23, date: '2019-06-06' },
        { pos: 10, plot: 17, date: '2019-06-10' },
        { pos: 11, plot: 21, date: '2019-06-10' },
        { pos: 12, plot: 32, date: '2019-06-12' },
        { pos: 13, plot: 16, date: '2019-06-13' },
        { pos: 14, plot: 18, date: '2019-06-13' },
        { pos: 15, plot: 12, date: '2019-06-25' },
        { pos: 16, plot: 29, date: '2019-11-26' },
        { pos: 17, plot: 27, date: '2020-03-04' },
        { pos: 18, plot: 14, date: '2020-12-21', amidar: true },
        { pos: 19, plot: 20, date: '2022-11-15' },
        { pos: 20, plot: 13, date: '2025-03-04' },
        { pos: 21, plot: 24, date: '2025-03-23' },
        { pos: 22, plot: 22, date: null },
        { pos: 23, plot: 25, date: null },
        { pos: 24, plot: 28, date: null },
      ],
    },
    {
      sqm: 148, color: 'orange',
      owners: [
        { pos: 1, plot: 30, date: '2020-01-15' },
      ],
    },
  ],
};

/* Annotate each owner with whether their date is shared inside the group
 * (i.e. the position was decided by the internal lottery). Amidar plots that
 * share a date belong to the same entity, so no lottery chip for them. */
DH.selectionOrder.groups.forEach(function (g) {
  var perDate = {};
  g.owners.forEach(function (o) {
    if (o.date) perDate[o.date] = (perDate[o.date] || 0) + 1;
  });
  g.owners.forEach(function (o) {
    o.byLottery = !!(o.date && perDate[o.date] > 1 && !o.amidar);
  });
});
