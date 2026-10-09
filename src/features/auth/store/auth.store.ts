import { create } from "zustand";

import {
  getCurrentCustomer,
  logoutCustomer,
  resendCustomerOtp,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../api/auth.api";
import {
  clearSessionTokens,
  setMemoryTokens,
  subscribeAuthTokens,
} from "../api/authSession";
import { loadAuthTokens } from "../storage/tokenStorage";
import type { AuthState, Customer } from "../types/auth.types";
import { AuthRequestError, toAuthRequestError } from "../utils/authRequestError";
import { normalizeIndianMobile } from "../utils/phoneValidation";

export type OtpChallenge = {
  mobile: string;
  session: string;
};

export type AuthStoreState = AuthState & {
  otpChallenge: OtpChallenge | null;
  isSubmitting: boolean;
  hasHydrated: boolean;
  authError: string | null;
  restoreSession: () => Promise<void>;
  retryRestore: () => Promise<void>;
  sendOtp: (mobileInput: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

const inactiveAccountMessage = "This account cannot be used.";

function isAuthenticatedFrom(accessToken: string | null, user: Customer | null): boolean {
  return Boolean(accessToken && user?.status === "ACTIVE");
}

function shouldClearSession(error: AuthRequestError): boolean {
  return error.status === 401 || error.status === 403 || error.status === 404;
}

function requireActiveCustomer(user: Customer): Customer {
  if (user.status !== "ACTIVE") {
    throw new AuthRequestError(inactiveAccountMessage, { status: 403, kind: "http" });
  }
  return user;
}

let restoreInFlight: Promise<void> | null = null;

const initialState: Pick<
  AuthStoreState,
  | "accessToken"
  | "idToken"
  | "user"
  | "isAuthenticated"
  | "isLoading"
  | "otpChallenge"
  | "isSubmitting"
  | "hasHydrated"
  | "authError"
> = {
  accessToken: null,
  idToken: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,
  otpChallenge: null,
  isSubmitting: false,
  hasHydrated: false,
  authError: null,
};

export const useAuthStore = create<AuthStoreState>((set, get) => ({
  ...initialState,

  clearAuthError: () => set({ authError: null }),

  restoreSession: async () => {
    if (get().hasHydrated) {
      return;
    }

    if (restoreInFlight) {
      await restoreInFlight;
      return;
    }

    restoreInFlight = (async () => {
      set({ isLoading: true, authError: null });

      try {
        const stored = await loadAuthTokens();

        if (!stored) {
          set({
            ...initialState,
            isLoading: false,
            hasHydrated: true,
          });
          return;
        }

        setMemoryTokens(stored);
        set({
          accessToken: stored.accessToken,
          idToken: stored.idToken,
          isAuthenticated: false,
        });

        const { user } = await getCurrentCustomer();
        const activeUser = requireActiveCustomer(user);

        set({
          accessToken: stored.accessToken,
          idToken: stored.idToken,
          user: activeUser,
          isAuthenticated: true,
          isLoading: false,
          hasHydrated: true,
          authError: null,
        });
      } catch (error) {
        const authError = toAuthRequestError(error);

        if (shouldClearSession(authError)) {
          await clearSessionTokens();
          set({
            ...initialState,
            isLoading: false,
            hasHydrated: true,
            authError: authError.message,
          });
          return;
        }

        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          hasHydrated: true,
          authError: authError.message,
        });
      }
    })().finally(() => {
      restoreInFlight = null;
    });

    await restoreInFlight;
  },

  retryRestore: async () => {
    set({ hasHydrated: false });
    await get().restoreSession();
  },

  sendOtp: async (mobileInput) => {
    const normalized = normalizeIndianMobile(mobileInput);
    if (!normalized.ok) {
      set({ authError: normalized.message });
      throw new AuthRequestError(normalized.message, { status: 400, kind: "http" });
    }

    set({ isSubmitting: true, authError: null });

    try {
      const result = await sendCustomerOtp(normalized.mobile);
      set({
        otpChallenge: { mobile: normalized.mobile, session: result.session },
        isSubmitting: false,
        authError: null,
      });
    } catch (error) {
      const authError = toAuthRequestError(error);
      set({ isSubmitting: false, authError: authError.message });
      throw authError;
    }
  },

  verifyOtp: async (otp) => {
    const challenge = get().otpChallenge;
    if (!challenge) {
      const message = "OTP session expired. Request a new OTP.";
      set({ authError: message });
      throw new AuthRequestError(message, { status: 401, kind: "http" });
    }

    set({ isSubmitting: true, authError: null });

    try {
      const tokens = await verifyCustomerOtp({
        mobile: challenge.mobile,
        otp,
        session: challenge.session,
      });

      setMemoryTokens({
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
      });
      set({
        accessToken: tokens.accessToken,
        idToken: tokens.idToken,
        otpChallenge: null,
        isAuthenticated: false,
      });

      try {
        const { user } = await getCurrentCustomer();
        const activeUser = requireActiveCustomer(user);

        set({
          accessToken: tokens.accessToken,
          idToken: tokens.idToken,
          user: activeUser,
          isAuthenticated: true,
          isSubmitting: false,
          authError: null,
        });
      } catch (profileError) {
        const authError = toAuthRequestError(profileError);

        if (authError.status === 403 || authError.message.toLowerCase().includes("inactive")) {
          await clearSessionTokens();
          set({
            accessToken: null,
            idToken: null,
            user: null,
            isAuthenticated: false,
            isSubmitting: false,
            otpChallenge: null,
            authError: authError.status === 403 ? authError.message : inactiveAccountMessage,
          });
          throw authError;
        }

        set({
          user: null,
          isAuthenticated: false,
          isSubmitting: false,
          otpChallenge: null,
          authError: authError.message,
        });
        throw new AuthRequestError(
          "Signed in, but your profile could not be loaded. Please try again.",
          { status: authError.status, kind: authError.kind },
        );
      }
    } catch (error) {
      const authError = toAuthRequestError(error);
      if (get().isSubmitting) {
        set({ isSubmitting: false, authError: authError.message });
      }
      throw authError;
    }
  },

  resendOtp: async () => {
    const challenge = get().otpChallenge;
    if (!challenge) {
      const message = "OTP session expired. Request a new OTP.";
      set({ authError: message });
      throw new AuthRequestError(message, { status: 401, kind: "http" });
    }

    set({ isSubmitting: true, authError: null });

    try {
      await resendCustomerOtp(challenge.mobile);
      set({ isSubmitting: false, authError: null });
    } catch (error) {
      const authError = toAuthRequestError(error);
      set({ isSubmitting: false, authError: authError.message });
      throw authError;
    }
  },

  signOut: async () => {
    set({ isSubmitting: true, authError: null });

    try {
      await logoutCustomer();
    } catch {
      // Cookie/API logout can fail; local credentials must still be removed.
    } finally {
      await clearSessionTokens();
      set({
        ...initialState,
        isLoading: false,
        hasHydrated: true,
        isSubmitting: false,
      });
    }
  },
}));

subscribeAuthTokens((tokens) => {
  if (!tokens) {
    const { isLoading, hasHydrated, isSubmitting } = useAuthStore.getState();
    useAuthStore.setState({
      accessToken: null,
      idToken: null,
      user: null,
      isAuthenticated: false,
      isLoading,
      hasHydrated,
      isSubmitting,
    });
    return;
  }

  const { user } = useAuthStore.getState();
  useAuthStore.setState({
    accessToken: tokens.accessToken,
    idToken: tokens.idToken,
    isAuthenticated: isAuthenticatedFrom(tokens.accessToken, user),
  });
});

export function resetAuthStoreForTests(): void {
  restoreInFlight = null;
  useAuthStore.setState({ ...initialState });
}
