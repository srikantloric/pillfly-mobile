const PERMITTED_FORMAT_CHARS = /[\s\-().]/g;

export type PhoneValidationResult =
  | { ok: true; mobile: string }
  | { ok: false; message: string };

function isAllDigits(value: string): boolean {
  return /^[0-9]+$/.test(value);
}

function isValidIndianSubscriber(digits: string): boolean {
  return digits.length === 10 && /^[6-9]/.test(digits);
}

export function normalizeIndianMobile(input: string): PhoneValidationResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return { ok: false, message: "Enter a valid Indian mobile number" };
  }

  const withoutFormat = trimmed.replace(PERMITTED_FORMAT_CHARS, "");

  if (!withoutFormat) {
    return { ok: false, message: "Enter a valid Indian mobile number" };
  }

  let digits: string;

  if (withoutFormat.startsWith("+")) {
    if (!withoutFormat.startsWith("+91")) {
      return { ok: false, message: "Enter a valid Indian mobile number" };
    }
    digits = withoutFormat.slice(3);
  } else if (withoutFormat.startsWith("91") && withoutFormat.length === 12) {
    digits = withoutFormat.slice(2);
  } else {
    digits = withoutFormat;
  }

  if (!isAllDigits(digits) || !isValidIndianSubscriber(digits)) {
    return { ok: false, message: "Enter a valid Indian mobile number" };
  }

  return { ok: true, mobile: digits };
}

export function isValidOtp(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
