import { create } from "zustand";

import { resetSessionCart } from "@/features/cart/store/cart.store";
import { RequestError } from "@/services/api/requestError";

import {
  getCurrentCustomer,
  logoutCustomer,
  resendCustomerOtp,
  sendCustomerOtp,
  verifyCustomerOtp,
} from "../api/auth.api";
import { toAuthError } from "../api/authErrors";
import { authLog } from "../api/authLog";
import { clearSessionTokens, setMemoryTokens, subscribeAuthTokens } from "../api/authSession";
import { loadAuthTokens } from "../storage/tokenStorage";
import type { Customer } from "../types/auth.types";
import { isValidOtp, normalizeIndianMobile } from "../utils/phoneValidation";

export type OtpChallenge = {
  mobile: string;
  session: string;
};

export type AuthStoreState = {
  user: Customer | null;
  isAuthenticated: boolean;
  otpChallenge: OtpChallenge | null;
  isSubmitting: boolean;
  hasHydrated: boolean;
  authError: string | null;
  restoreSession: () => Promise<void>;
  sendOtp: (mobileInput: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  resendOtp: () => Promise<void>;
  signOut: () => Promise<void>;
  clearAuthError: () => void;
};

const OTP_EXPIRED_MESSAGE = "OTP session expired. Request a new OTP.";
const PROFILE_FAILED_MESSAGE = "Signed in, but your profile could not be loaded. Please try again.";

const initialState = {
  user: null,
  isAuthenticated: false,
  otpChallenge: null,
  isSubmitting: false,
  hasHydrated: false,
  authError: null,
} satisfies Partial<AuthStoreState>;

/** The session is unusable (expired, blocked or no profile) rather than temporarily failing. */
function shouldClearSession(error: RequestError): boolean {
  return error.status === 401 || error.status === 403 || error.status === 404;
}

async function fetchActiveCustomer(): Promise<Customer> {
  const user = await getCurrentCustomer();
  if (user.status !== "ACTIVE") {
    throw new RequestError("This account cannot be used.", { status: 403 });
  }
  return user;
}

/** Keychain failures must not block the UI from showing the logged-out state. */
async function endSession(): Promise<void> {
  await clearSessionTokens().catch(() => undefined);
}

let restoreInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthStoreState>((set, get) => {
  function fail(error: unknown): RequestError {
    const authError = toAuthError(error);
    authLog("error", {
      message: authError.message,
      status: authError.status,
      kind: authError.kind,
    });
    set({ isSubmitting: false, authError: authError.message });
    return authError;
  }

  function requireChallenge(): OtpChallenge {
    const challenge = get().otpChallenge;
    if (!challenge) {
      throw fail(new RequestError(OTP_EXPIRED_MESSAGE, { status: 401 }));
    }
    return challenge;
  }

  return {
    ...initialState,

    clearAuthError: () => set({ authError: null }),

    restoreSession: async () => {
      if (get().hasHydrated) {
        authLog("restore.skip");
        return;
      }

      restoreInFlight ??= (async () => {
        authLog("restore.start");
        set({ authError: null });

        try {
          const stored = await loadAuthTokens();
          if (!stored) {
            authLog("restore.no-tokens");
            resetSessionCart();
            set({ ...initialState, hasHydrated: true });
            return;
          }

          setMemoryTokens(stored);
          const user = await fetchActiveCustomer();
          authLog("restore.ok", { userId: user.id, status: user.status });
          set({ user, isAuthenticated: true, hasHydrated: true });
        } catch (error) {
          const authError = toAuthError(error);
          const cleared = shouldClearSession(authError);
          authLog("restore.fail", {
            message: authError.message,
            status: authError.status,
            kind: authError.kind,
            cleared,
          });
          // Network/server errors keep the stored tokens so the next launch can retry.
          set({ user: null, isAuthenticated: false, hasHydrated: true, authError: authError.message });
          if (cleared) {
            await endSession();
          }
        }
      })().finally(() => {
        restoreInFlight = null;
      });

      await restoreInFlight;
    },

    sendOtp: async (mobileInput) => {
      const normalized = normalizeIndianMobile(mobileInput);
      if (!normalized.ok) {
        throw fail(new RequestError(normalized.message, { status: 400 }));
      }

      authLog("sendOtp.start", { mobile: normalized.mobile });
      set({ isSubmitting: true, authError: null });
      try {
        const session = await sendCustomerOtp(normalized.mobile);
        authLog("sendOtp.ok", { mobile: normalized.mobile, hasSession: session.length > 0 });
        set({ otpChallenge: { mobile: normalized.mobile, session }, isSubmitting: false });
      } catch (error) {
        throw fail(error);
      }
    },

    verifyOtp: async (otp) => {
      const challenge = requireChallenge();
      if (!isValidOtp(otp)) {
        throw fail(new RequestError("Enter the 6-digit OTP", { status: 400 }));
      }

      authLog("verifyOtp.start", { mobile: challenge.mobile });
      set({ isSubmitting: true, authError: null });
      try {
        await verifyCustomerOtp({ ...challenge, otp });
      } catch (error) {
        // Wrong/expired OTP: keep the challenge so the user can retry or resend.
        throw fail(error);
      }

      // Tokens are stored; the challenge is spent whatever happens next.
      authLog("verifyOtp.tokens-stored", { mobile: challenge.mobile });
      set({ otpChallenge: null });
      try {
        const user = await fetchActiveCustomer();
        authLog("verifyOtp.ok", { userId: user.id, status: user.status });
        set({ user, isAuthenticated: true, isSubmitting: false });
      } catch (error) {
        const authError = fail(error);
        if (shouldClearSession(authError)) {
          await endSession();
          throw authError;
        }
        throw new RequestError(PROFILE_FAILED_MESSAGE, {
          status: authError.status,
          kind: authError.kind,
        });
      }
    },

    resendOtp: async () => {
      const challenge = requireChallenge();

      authLog("resendOtp.start", { mobile: challenge.mobile });
      set({ isSubmitting: true, authError: null });
      try {
        const updated = await resendCustomerOtp(challenge.mobile);
        authLog("resendOtp.ok", { mobile: challenge.mobile, sessionUpdated: Boolean(updated?.session) });
        set({
          isSubmitting: false,
          ...(updated?.session
            ? { otpChallenge: { mobile: challenge.mobile, session: updated.session } }
            : {}),
        });
      } catch (error) {
        throw fail(error);
      }
    },

    signOut: async () => {
      authLog("signOut.start");
      set({ isSubmitting: true, authError: null });

      try {
        await logoutCustomer();
        authLog("signOut.api-ok");
      } catch (error) {
        const authError = toAuthError(error);
        authLog("signOut.api-failed", {
          message: authError.message,
          status: authError.status,
          kind: authError.kind,
        });
        // Cookie/API logout can fail; local credentials must still be removed.
      }

      // Clearing notifies listeners, which also resets the cart.
      await endSession();
      authLog("signOut.local-cleared");
      set({ ...initialState, hasHydrated: true });
    },
  };
});

// Tokens can be cleared outside the store (e.g. a failed refresh in the interceptor).
subscribeAuthTokens((tokens) => {
  if (!tokens) {
    authLog("session.cleared");
    useAuthStore.setState({ user: null, isAuthenticated: false });
    return;
  }

  authLog("session.updated");
});

export function resetAuthStoreForTests(): void {
  restoreInFlight = null;
  useAuthStore.setState({ ...initialState });
}
