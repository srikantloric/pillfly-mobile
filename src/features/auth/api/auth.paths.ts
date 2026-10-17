export const AUTH_PATHS = {
  sendOtp: "/customer/send-otp",
  verifyOtp: "/customer/verify-otp",
  resendOtp: "/customer/resend-otp",
  refresh: "/customer/refresh",
  logout: "/customer/logout",
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
