import { isValidOtp, normalizeIndianMobile } from "../utils/phoneValidation";

describe("normalizeIndianMobile", () => {
  it("accepts a 10-digit number starting with 6-9", () => {
    expect(normalizeIndianMobile("9876543210")).toEqual({ ok: true, mobile: "9876543210" });
    expect(normalizeIndianMobile("6123456789")).toEqual({ ok: true, mobile: "6123456789" });
  });

  it("accepts +91 and 91 prefixes with spaces", () => {
    expect(normalizeIndianMobile("+91 98765 43210")).toEqual({ ok: true, mobile: "9876543210" });
    expect(normalizeIndianMobile("919876543210")).toEqual({ ok: true, mobile: "9876543210" });
    expect(normalizeIndianMobile("98765-43210")).toEqual({ ok: true, mobile: "9876543210" });
  });

  it("rejects numbers that do not start with 6-9", () => {
    expect(normalizeIndianMobile("5876543210").ok).toBe(false);
  });

  it("rejects letters and malformed prefixes", () => {
    expect(normalizeIndianMobile("98abc43210").ok).toBe(false);
    expect(normalizeIndianMobile("+1 9876543210").ok).toBe(false);
    expect(normalizeIndianMobile("449876543210").ok).toBe(false);
  });

  it("rejects empty or short input", () => {
    expect(normalizeIndianMobile("").ok).toBe(false);
    expect(normalizeIndianMobile("98765").ok).toBe(false);
  });
});

describe("isValidOtp", () => {
  it("accepts exactly six digits", () => {
    expect(isValidOtp("123456")).toBe(true);
  });

  it("rejects other values", () => {
    expect(isValidOtp("12345")).toBe(false);
    expect(isValidOtp("1234567")).toBe(false);
    expect(isValidOtp("12a456")).toBe(false);
  });
});
