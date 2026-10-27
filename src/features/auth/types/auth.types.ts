export type CustomerStatus = "ACTIVE" | "BLOCKED";

export type Customer = {
  id: string;
  phoneNumber: string;
  name?: string;
  status: CustomerStatus;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
  idToken?: string;
};

/** Fields a refresh response is allowed to replace. Omitted fields keep the stored value. */
export type RefreshTokenUpdate = {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
};
