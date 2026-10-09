import { useAuthStore } from "../store/auth.store";

export function useAuth() {

  const accessToken = useAuthStore(
    (state) => state.accessToken
  );

  const idToken = useAuthStore(
    (state) => state.idToken
  );

  const user = useAuthStore(
    (state) => state.user
  );
  const isAuthenticated = useAuthStore(
    (state) => state.isAuthenticated
  );

  const isLoading = useAuthStore(
    (state) => state.isLoading
  );

  const isSubmitting = useAuthStore(
    (state) => state.isSubmitting
  );

  const hasHydrated = useAuthStore(
    (state) => state.hasHydrated
  );

  const otpChallenge = useAuthStore(
    (state) => state.otpChallenge
  );

  const authError = useAuthStore(
    (state) => state.authError
  );

  const restoreSession = useAuthStore(
    (state) => state.restoreSession
  );

  const retryRestore = useAuthStore(
    (state) => state.retryRestore
  );

  const sendOtp = useAuthStore(
    (state) => state.sendOtp
  );

  const verifyOtp = useAuthStore(
    (state) => state.verifyOtp
  );

  const resendOtp = useAuthStore(
    (state) => state.resendOtp
  );

  const signOut = useAuthStore(
    (state) => state.signOut
  );

  const clearAuthError = useAuthStore(
    (state) => state.clearAuthError
  );

  
  return {
    accessToken,
    idToken,
    user,
    isAuthenticated,
    isLoading,
    isSubmitting,
    hasHydrated,
    otpChallenge,
    authError,
    restoreSession,
    retryRestore,
    sendOtp,
    verifyOtp,
    resendOtp,
    signOut,
    clearAuthError,
  };
}
