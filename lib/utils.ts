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

/**
 * Generate a short client identifier from a company name.
 * "Baby Memorial Hospital" → "BMH"
 * "Malabar Gold EKM"      → "MGE"
 * "SBI Regional HO TVM"   → "SRHT"
 * "Federal Bank"          → "FB"
 */
const CODE_STOP = new Set(["and","of","the","pvt","ltd","llp","inc","co","hq","ho",
  "a","an","for","in","on","at","to","by","be","is","are"]);

export function makeClientCode(companyName: string): string {
  if (!companyName?.trim()) return "CLT";
  const words = companyName
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0 && !CODE_STOP.has(w.toLowerCase()));
  if (words.length === 0) return companyName.substring(0, 4).toUpperCase();
  if (words.length === 1) return words[0].substring(0, 4).toUpperCase();
  return words.slice(0, 4).map(w => w[0]).join("").toUpperCase();
}
