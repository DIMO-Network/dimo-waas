export interface ServiceProvider {
  id: string;
  name: string;
  walletAddress: string;
}
export interface WalletRequest {
  userId: string;
  walletAddresses?: string[];
}

export interface WalletResponse {
  walletId: string;
  addresses: string[];
}

export interface TransactionRequest extends WalletRequest {
  walletAddresses: string[];
  serviceProvider: ServiceProvider;
  value: bigint;
  type: number;
}

export interface TransactionTemplate {
  id: string;
  data: TransactionTemplateData
}

export interface TransactionTemplateData {
  serviceProvider: ServiceProvider;
  amount: bigint;
}

export interface PasskeyWalletRequest {
  email: string;
  encodedChallenge: string;
  attestation: {
    credentialId: string
    clientDataJson: string
    attestationObject: string
    transports: ('AUTHENTICATOR_TRANSPORT_BLE' | 'AUTHENTICATOR_TRANSPORT_INTERNAL' | 'AUTHENTICATOR_TRANSPORT_NFC' | 'AUTHENTICATOR_TRANSPORT_USB' | 'AUTHENTICATOR_TRANSPORT_HYBRID')[]
  }
}

// export interface PasskeyWalletResponse {
//   walletId: string;
//   addresses: string[];
// }

export interface AddPasskeyToExistingWalletRequest extends PasskeyWalletRequest {
  wallet: object;
}
