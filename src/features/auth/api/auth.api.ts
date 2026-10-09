import { authClient } from "@/services/api/auth.client";

import { isValidOtp, normalizeIndianMobile } from "../utils/phoneValidation";
import { AuthRequestError, toAuthRequestError } from "../utils/authRequestError";
import {
  parseGetMeResponse,
  parseResendOtpResponse,
  parseSendOtpResponse,
  parseTokenResponse,
} from "./auth.parsers";
import { AUTH_PATHS } from "./auth.paths";
import { attachAuthInterceptors } from "./authInterceptors";
import { persistSessionTokens } from "./authSession";
import type {
  GetMeResponse,
  ResendOtpResponse,
  SendOtpResponse,
  TokenResponse,
} from "../types/auth.types";

attachAuthInterceptors(authClient);

async function request<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    throw toAuthRequestError(error);
  }
}

export async function sendCustomerOtp(mobileInput: string): Promise<SendOtpResponse> {
  const mobile = normalizeIndianMobile(mobileInput);
  if (!mobile.ok) {
    throw new AuthRequestError(mobile.message, { status: 400, kind: "http" });
  }

  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.sendOtp, { mobile: mobile.mobile });
    return parseSendOtpResponse(response.data);
  });
}

export async function verifyCustomerOtp(input: {
  mobile: string;
  otp: string;
  session: string;
}): Promise<TokenResponse> {
  const mobile = normalizeIndianMobile(input.mobile);
  if (!mobile.ok) {
    throw new AuthRequestError(mobile.message, { status: 400, kind: "http" });
  }

  if (!isValidOtp(input.otp)) {
    throw new AuthRequestError("Enter the 6-digit OTP", { status: 400, kind: "http" });
  }

  if (!input.session.trim()) {
    throw new AuthRequestError("OTP session expired. Request a new OTP.", {
      status: 401,
      kind: "http",
    });
  }

  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.verifyOtp, {
      mobile: mobile.mobile,
      otp: input.otp,
      session: input.session,
    });
    const tokens = parseTokenResponse(response.data);
    await persistSessionTokens({
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
    });
    return tokens;
  });
}

export async function resendCustomerOtp(mobileInput: string): Promise<ResendOtpResponse> {
  const mobile = normalizeIndianMobile(mobileInput);
  if (!mobile.ok) {
    throw new AuthRequestError(mobile.message, { status: 400, kind: "http" });
  }

  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.resendOtp, { mobile: mobile.mobile });
    return parseResendOtpResponse(response.data);
  });
}

export async function refreshCustomerTokens(): Promise<TokenResponse> {
  return request(async () => {
    const response = await authClient.post<unknown>(AUTH_PATHS.refresh);
    const tokens = parseTokenResponse(response.data);
    await persistSessionTokens({
      accessToken: tokens.accessToken,
      idToken: tokens.idToken,
    });
    return tokens;
  });
}

export async function logoutCustomer(): Promise<void> {
  try {
    await authClient.post(AUTH_PATHS.logout);
  } catch (error) {
    throw toAuthRequestError(error);
  }
}

export async function getCurrentCustomer(): Promise<GetMeResponse> {
  return request(async () => {
    const response = await authClient.get<unknown>(AUTH_PATHS.me);
    return parseGetMeResponse(response.data);
  });
}
