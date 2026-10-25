import { authClient } from "@/services/api/auth.client";

import type { AuthTokens, Customer } from "../types/auth.types";
import {
  parseGetMeResponse,
  parseResendOtpResponse,
  parseSendOtpResponse,
  parseTokenResponse,
} from "./auth.parsers";
import { AUTH_PATHS } from "./auth.paths";
import { toAuthError } from "./authErrors";
import { attachAuthInterceptors } from "./authInterceptors";
import { persistSessionTokens } from "./authSession";

attachAuthInterceptors(authClient);

async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toAuthError(error);
  }
}

/** Callers pass an already-normalised 10-digit mobile (see `normalizeIndianMobile`). */
export function sendCustomerOtp(mobile: string): Promise<string> {
  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.sendOtp, { mobile });
    return parseSendOtpResponse(response.data);
  });
}

/** Verifies the OTP and persists the issued tokens. */
export function verifyCustomerOtp(input: {
  mobile: string;
  otp: string;
  session: string;
}): Promise<AuthTokens> {
  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.verifyOtp, input);
    const tokens = parseTokenResponse(response.data);
    await persistSessionTokens(tokens);
    return tokens;
  });
}

export function resendCustomerOtp(mobile: string): Promise<void> {
  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.resendOtp, { mobile });
    parseResendOtpResponse(response.data);
  });
}

export function logoutCustomer(): Promise<void> {
  return request(async () => {
    await authClient.post(AUTH_PATHS.logout);
  });
}

export function getCurrentCustomer(): Promise<Customer> {
  return request(async () => {
    const response = await authClient.get<unknown>(AUTH_PATHS.me);
    return parseGetMeResponse(response.data);
  });
}
