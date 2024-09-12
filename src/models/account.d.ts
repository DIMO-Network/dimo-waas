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
}

export interface AccountCreateResponse {
  subOrganizationId: string;
  walletAddress: string;
}

export interface UserRegisteredResponse {
  subOrganizationId?: string;
  hasPasskey?: boolean;
}

export interface UserRegisteredRequest {
  email: string;
}
