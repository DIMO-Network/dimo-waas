import { TurnkeySDKApiTypes } from "@turnkey/sdk-server";

export interface CreateSubOrganizationActivityResponse {
  activity: {
    result: {
      createSubOrganizationResultV6: TurnkeySDKApiTypes.TCreateSubOrganizationResponse;
    };
  };
}

export interface CreateUserTagActivityResponse {
  activity: {
    result: {
      createUserTagResultV6: TurnkeySDKApiTypes.TCreateUserTagResponse;
    };
  };
}

export interface CreateUsersActivityResponse {
  activity: {
    result: {
      createUsersResult: TurnkeySDKApiTypes.TCreateUsersResponse;
    };
  };
}

export interface SubOrganizationRootUser {
  userName: string;
  userEmail?: string;
  apiKeys: {
    apiKeyName: string;
    publicKey: string;
    curveType:
      | "API_KEY_CURVE_P256"
      | "API_KEY_CURVE_SECP256K1"
      | "API_KEY_CURVE_ED25519";
    expirationSeconds?: string;
  }[];
  authenticators: RootUserAuthenticator[];
  oauthProviders: {
    providerName: string;
    oidcToken: string;
  }[];
  userTags: string[];
}

export interface RootUserAuthenticator {
  authenticatorName: string;
  challenge: string;
  attestation: {
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

export interface KernelAccountProcess {
  kernelAddress: `0x${string}`;
  success: boolean;
  reason?: string;
}
