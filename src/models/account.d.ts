export interface AccountCreateRequest {
  email: string;
  encodedChallenge?: string;
  attestation?: {
    credentialId: string;
    clientDataJson: string;
    attestationObject: string;
    transports: (
      | "AUTHENTICATOR_TRANSPORT_BLE"
      | "AUTHENTICATOR_TRANSPORT_INTERNAL"
      | "AUTHENTICATOR_TRANSPORT_NFC"
      | "AUTHENTICATOR_TRANSPORT_USB"
      | "AUTHENTICATOR_TRANSPORT_HYBRID"
    )[];
  };
  deployAccount?: boolean;
}

export interface UserRegisteredResponse {
  subOrganizationId: string | null;
  hasPasskey: boolean;
  smartContractAddress: string | null;
  walletAddress: string | null;
  emailVerified: boolean;
}

export interface UserRegisteredRequest {
  email: string;
}

export interface User {
  email: string;
  subOrganizationId?: string | null;
  hasPasskey?: boolean;
  smartContractAddress?: string | null;
  walletAddress?: string | null;
  emailVerified?: boolean;
}
