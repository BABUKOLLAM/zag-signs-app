// Shared server-side input validation. API routes are the last line of
// defense — client-side checks can be bypassed by calling the API directly.

/** Exactly 10 digits, and not a degenerate value like 0000000000 or 1111111111. */
export function isValidPhone(phone: unknown): boolean {
  if (typeof phone !== "string") return false;
  const digits = phone.trim();
  if (!/^\d{10}$/.test(digits)) return false;
  return !/^(\d)\1{9}$/.test(digits);
}

/** Reasonably strict email format check. */
export function isValidEmail(email: unknown): boolean {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** True if the text has at least one letter or digit — rejects "", whitespace-only, and special-characters-only input. */
export function hasRealText(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /[a-zA-Z0-9]/.test(value);
}

/** True if the value contains an HTML/script tag — used to reject XSS payloads outright. */
export function containsHtmlTag(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return /<[a-z][\s\S]*>/i.test(value);
}

/**
 * Validates a required free-text field: non-empty, has real characters, no
 * HTML tags. Returns an error message to show the user, or null if valid.
 */
export function validateText(value: unknown, fieldName: string, opts: { maxLength?: number } = {}): string | null {
  if (typeof value !== "string" || !value.trim()) return `${fieldName} is required`;
  if (containsHtmlTag(value)) return `${fieldName} contains invalid characters`;
  if (!hasRealText(value)) return `${fieldName} must contain valid characters`;
  if (opts.maxLength && value.trim().length > opts.maxLength) return `${fieldName} is too long (max ${opts.maxLength} characters)`;
  return null;
}

/** Validates an optional phone field — passes through blank, rejects a non-blank invalid value. */
export function validatePhone(phone: unknown, fieldName = "Phone"): string | null {
  if (phone === undefined || phone === null || phone === "") return null;
  if (!isValidPhone(phone)) return `${fieldName} must be a valid 10-digit number`;
  return null;
}

/** Validates an optional email field — passes through blank, rejects a non-blank invalid value. */
export function validateEmail(email: unknown, fieldName = "Email"): string | null {
  if (email === undefined || email === null || email === "") return null;
  if (!isValidEmail(email)) return `${fieldName} must be a valid email address`;
  return null;
}

/** True if the number is present and negative (0 is allowed). */
export function isNegative(value: unknown): boolean {
  const n = Number(value);
  return Number.isFinite(n) && n < 0;
}
