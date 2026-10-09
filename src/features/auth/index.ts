export type {
  ApiError,
  AuthState,
  AuthTokens,
  Customer,
  GetMeResponse,
  ResendOtpRequest,
  ResendOtpResponse,
  SendOtpRequest,
  SendOtpResponse,
  TokenResponse,
  VerifyOtpRequest,
} from "./types/auth.types";

export { isValidOtp, normalizeIndianMobile } from "./utils/phoneValidation";
export type { PhoneValidationResult } from "./utils/phoneValidation";

export { getApiErrorMessage, isApiError, messageForHttpStatus } from "./utils/apiError";

export { clearAuthTokens, loadAuthTokens, saveAuthTokens } from "./storage/tokenStorage";
