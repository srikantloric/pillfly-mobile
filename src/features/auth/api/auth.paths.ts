export const AUTH_PATHS = {
  sendOtp: "/customer/send-otp",
  verifyOtp: "/customer/verify-otp",
  resendOtp: "/customer/resend-otp",
  refresh: "/customer/refresh",
  logout: "/customer/logout",
  me: "/customer/me",
} as const;

const PUBLIC_PATHS = new Set<string>([
  AUTH_PATHS.sendOtp,
  AUTH_PATHS.verifyOtp,
  AUTH_PATHS.resendOtp,
]);

export function getRequestPath(url: string | undefined, baseURL: string | undefined): string {
  if (!url) {
    return "";
  }

  try {
    const resolved = new URL(url, baseURL ?? "https://local.invalid");
    return resolved.pathname.replace(/\/+$/, "") || "/";
  } catch {
    const [path] = url.split("?");
    return path.startsWith("/") ? path.replace(/\/+$/, "") || "/" : `/${path.replace(/\/+$/, "")}`;
  }
}

export function isPublicAuthPath(path: string): boolean {
  return PUBLIC_PATHS.has(path);
}

export function isRefreshAuthPath(path: string): boolean {
  return path.endsWith(AUTH_PATHS.refresh);
}

export function isProtectedAuthPath(path: string): boolean {
  return path.endsWith(AUTH_PATHS.me) || path.endsWith(AUTH_PATHS.logout);
}
