export interface ServiceProvider {
  id: string;
  name: string;
  walletAddress: string;
}
export interface WalletRequest {
  userId: string;
  walletAddresses?: string[];
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
