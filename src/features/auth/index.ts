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

export {
  getCurrentCustomer,
  logoutCustomer,
  refreshCustomerTokens,
  resendCustomerOtp,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "./api/auth.api";

export { AuthRequestError } from "./utils/authRequestError";

export {
  clearMemoryTokens,
  clearSessionTokens,
  getAccessToken,
  persistSessionTokens,
  setMemoryTokens,
} from "./api/authSession";

export { useAuthStore } from "./store/auth.store";
export { useAuth } from "./hooks/useAuth";

export { default as LoginScreen } from "./screens/LoginScreen";
