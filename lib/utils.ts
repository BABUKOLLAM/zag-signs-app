// Shared formatting helpers used across all pages

/** Full Indian-locale currency: ₹1,20,000 */
export const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** Abbreviated for dashboard KPI cards: ₹1.2L / ₹50K */
export const fmtShort = (n: number) =>
  n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;

/** Lakhs with 2 decimal places for report charts: ₹12.50L */
export const fmtL = (n: number) => `₹${(n / 100000).toFixed(2)}L`;

/** Safe average — returns 0 instead of NaN when the array is empty */
export const safeAvg = (nums: number[]) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
