import { describe, it, expect } from "vitest";
import {
  isValidPhone, isValidEmail, hasRealText, containsHtmlTag,
  validateText, validatePhone, validateEmail, isNegative,
} from "@/lib/validation";

describe("isValidPhone", () => {
  it("accepts a real 10-digit number", () => {
    expect(isValidPhone("9876543210")).toBe(true);
  });
  it("rejects non-10-digit lengths", () => {
    expect(isValidPhone("98765")).toBe(false);
    expect(isValidPhone("98765432100")).toBe(false);
  });
  it("rejects all-same-digit numbers (the BUG-012/013 gap)", () => {
    expect(isValidPhone("0000000000")).toBe(false);
    expect(isValidPhone("1111111111")).toBe(false);
    expect(isValidPhone("9999999999")).toBe(false);
  });
  it("rejects non-numeric input", () => {
    expect(isValidPhone("98765abcde")).toBe(false);
    expect(isValidPhone(null)).toBe(false);
    expect(isValidPhone(undefined)).toBe(false);
  });
});

describe("isValidEmail", () => {
  it("accepts well-formed emails", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });
  it("rejects missing @ or domain", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
    expect(isValidEmail("user@")).toBe(false);
    expect(isValidEmail("user@example")).toBe(false);
  });
  it("rejects non-string input", () => {
    expect(isValidEmail(12345)).toBe(false);
  });
});

describe("hasRealText", () => {
  it("accepts text with real characters", () => {
    expect(hasRealText("Rajesh Kumar")).toBe(true);
  });
  it("rejects empty, whitespace-only, and special-characters-only input", () => {
    expect(hasRealText("")).toBe(false);
    expect(hasRealText("   ")).toBe(false);
    expect(hasRealText("!!!---###")).toBe(false);
  });
});

describe("containsHtmlTag", () => {
  it("flags script tags and other markup (XSS gap this session closed)", () => {
    expect(containsHtmlTag("<script>alert(1)</script>")).toBe(true);
    expect(containsHtmlTag("<img src=x onerror=alert(1)>")).toBe(true);
  });
  it("leaves plain text alone", () => {
    expect(containsHtmlTag("2 < 3 and 5 > 4")).toBe(false);
    expect(containsHtmlTag("Kumar & Sons")).toBe(false);
  });
});

describe("validateText", () => {
  it("requires a non-blank value", () => {
    expect(validateText("", "Name")).toMatch(/required/i);
    expect(validateText("   ", "Name")).toMatch(/required/i);
  });
  it("rejects HTML content", () => {
    expect(validateText("<b>Kumar</b>", "Name")).toMatch(/invalid characters/i);
  });
  it("rejects special-characters-only content", () => {
    expect(validateText("####", "Name")).toMatch(/valid characters/i);
  });
  it("enforces maxLength when given", () => {
    expect(validateText("a".repeat(300), "Notes", { maxLength: 50 })).toMatch(/too long/i);
  });
  it("passes valid text through as null", () => {
    expect(validateText("Kumar Enterprises", "Company")).toBeNull();
  });
});

describe("validatePhone / validateEmail (optional-field variants)", () => {
  it("allow blank", () => {
    expect(validatePhone("")).toBeNull();
    expect(validatePhone(undefined)).toBeNull();
    expect(validateEmail("")).toBeNull();
  });
  it("reject a non-blank invalid value", () => {
    expect(validatePhone("123")).toMatch(/10-digit/i);
    expect(validateEmail("not-an-email")).toMatch(/valid email/i);
  });
});

describe("isNegative", () => {
  it("flags negative numbers", () => {
    expect(isNegative(-1)).toBe(true);
    expect(isNegative("-500")).toBe(true);
  });
  it("allows zero and positive numbers", () => {
    expect(isNegative(0)).toBe(false);
    expect(isNegative(100)).toBe(false);
  });
});
