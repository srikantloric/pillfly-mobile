export type ApiError = {
  success: false;
  message: string;
};

export type SendOtpRequest = {
  mobile: string;
};

export type VerifyOtpRequest = {
  mobile: string;
  otp: string;
  session: string;
};

export type ResendOtpRequest = {
  mobile: string;
};

export type SendOtpResponse = {
  success: true;
  message: "OTP sent successfully";
  session: string;
  challengeName: "CUSTOM_CHALLENGE";
};

export type ResendOtpResponse = {
  success: true;
  message: "OTP resent successfully";
};

export type TokenResponse = {
  success: true;
  accessToken: string;
  idToken: string;
  expiresIn?: number;
  tokenType?: string;
};

export type CustomerStatus = "ACTIVE" | "BLOCKED";

export type Customer = {
  id: string;
  phoneNumber: string;
  name?: string;
  status: CustomerStatus;
  createdAt: string;
  updatedAt: string;
};

export type GetMeResponse = {
  success: true;
  user: Customer;
};

export type AuthTokens = {
  accessToken: string;
  idToken: string;
};

export type AuthState = {
  accessToken: string | null;
  idToken: string | null;
  user: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};
