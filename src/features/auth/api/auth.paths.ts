export const AUTH_PATHS = {
  sendOtp: "/auth/send-otp",
  verifyOtp: "/auth/app/verify-otp",
  resendOtp: "/auth/resend-otp",
  refresh: "/auth/app/refresh",
  logout: "/auth/app/logout",
  me: "/customer/me",
} as const;

const PUBLIC_PATHS: readonly string[] = [AUTH_PATHS.sendOtp, AUTH_PATHS.verifyOtp, AUTH_PATHS.resendOtp];

/** Request URLs here are relative constants; strip the query and trailing slash for matching. */
export function getRequestPath(url: string | undefined): string {
  return (url ?? "").split("?")[0].replace(/\/+$/, "");
}

export function isPublicAuthPath(path: string): boolean {
  return PUBLIC_PATHS.some((publicPath) => path.endsWith(publicPath));
}

export function isRefreshAuthPath(path: string): boolean {
  return path.endsWith(AUTH_PATHS.refresh);
}
