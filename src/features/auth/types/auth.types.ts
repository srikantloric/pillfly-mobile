export type CustomerStatus = "ACTIVE" | "BLOCKED";

export type Customer = {
  id: string;
  phoneNumber: string;
  name?: string;
  status: CustomerStatus;
};

export type AuthTokens = {
  accessToken: string;
  idToken: string;
};
