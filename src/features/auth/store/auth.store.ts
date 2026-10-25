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
  /** Records a user-facing error and returns it so callers can `throw fail(...)`. */
  function fail(error: unknown): RequestError {
    const authError = toAuthError(error);
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
        return;
      }

      restoreInFlight ??= (async () => {
        set({ authError: null });

        try {
          const stored = await loadAuthTokens();
          if (!stored) {
            resetSessionCart();
            set({ ...initialState, hasHydrated: true });
            return;
          }

          setMemoryTokens(stored);
          const user = await fetchActiveCustomer();
          set({ user, isAuthenticated: true, hasHydrated: true });
        } catch (error) {
          const authError = toAuthError(error);
          // Network/server errors keep the stored tokens so the next launch can retry.
          set({ user: null, isAuthenticated: false, hasHydrated: true, authError: authError.message });
          if (shouldClearSession(authError)) {
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

      set({ isSubmitting: true, authError: null });
      try {
        const session = await sendCustomerOtp(normalized.mobile);
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

      set({ isSubmitting: true, authError: null });
      try {
        await verifyCustomerOtp({ ...challenge, otp });
      } catch (error) {
        // Wrong/expired OTP: keep the challenge so the user can retry or resend.
        throw fail(error);
      }

      // Tokens are stored; the challenge is spent whatever happens next.
      set({ otpChallenge: null });
      try {
        const user = await fetchActiveCustomer();
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

      set({ isSubmitting: true, authError: null });
      try {
        await resendCustomerOtp(challenge.mobile);
        set({ isSubmitting: false });
      } catch (error) {
        throw fail(error);
      }
    },

    signOut: async () => {
      set({ isSubmitting: true, authError: null });

      try {
        await logoutCustomer();
      } catch {
        // Cookie/API logout can fail; local credentials must still be removed.
      }

      // Clearing notifies listeners, which also resets the cart.
      await endSession();
      set({ ...initialState, hasHydrated: true });
    },
  };
});

// Tokens can be cleared outside the store (e.g. a failed refresh in the interceptor).
subscribeAuthTokens((tokens) => {
  if (!tokens) {
    useAuthStore.setState({ user: null, isAuthenticated: false });
  }
});

export function resetAuthStoreForTests(): void {
  restoreInFlight = null;
  useAuthStore.setState({ ...initialState });
}
