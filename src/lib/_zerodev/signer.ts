import {TurnkeySigner} from '@turnkey/ethers';
import {passkeyStamper, turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';
import {createAccount} from '@turnkey/viem';
import {createPublicClient, createWalletClient, http} from 'viem';
import {polygon} from 'viem/chains';
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from 'permissionless';
import {SmartAccountSigner} from 'permissionless/accounts';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {KERNEL_V3_1} from '@zerodev/sdk/constants';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import {WebauthnStamper} from '@turnkey/webauthn-stamper';
import {TurnkeyClient} from '@turnkey/http';
import {IframeStamper} from '@turnkey/iframe-stamper';
import {TurnkeyBrowserClient, TurnkeyIframeClient} from '@turnkey/sdk-browser';
import {TStamper} from '@turnkey/http/dist/base';

const PROJECT_ID = 'c3526d90-4977-44e3-8584-8820693a7fd9';
export const BUNDLER_RPC = `https://rpc.zerodev.app/api/v2/bundler/${PROJECT_ID}`;
export const PAYMASTER_RPC = `https://rpc.zerodev.app/api/v2/paymaster/${PROJECT_ID}`;

export const getAccountWallet = async (subOrganizationId: string) => {
  const {wallets} = await turnkeyApiClient.getWallets({
    organizationId: subOrganizationId,
  });

  const {accounts} = await turnkeyApiClient.getWalletAccounts({
    organizationId: subOrganizationId,
    walletId: wallets[0].walletId,
  });

  return accounts;
};

export const getSmartAccountSigner = async (
  subOrganizationId: string,
  walletAddress: string,
  stamper: TStamper,
) => {
  const turnkeyClient = getTurnkeyClientWithStamper(stamper);

  const localAccount = await createAccount({
    client: turnkeyClient,
    organizationId: subOrganizationId,
    signWith: walletAddress,
    ethereumAddress: walletAddress,
  });

  const smartAccountClient = createWalletClient({
    account: localAccount,
    chain: polygon,
    transport: http(BUNDLER_RPC),
  });

  return walletClientToSmartAccountSigner(smartAccountClient);
};

export const getZeroDevKernelAccount = async (
  smartAccountSigner: SmartAccountSigner<'custom', `0x${string}`>,
) => {
  const publicClient = createPublicClient({
    chain: polygon,
    transport: http(BUNDLER_RPC),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: smartAccountSigner,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    kernelVersion: KERNEL_V3_1,
  });

  return await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    kernelVersion: KERNEL_V3_1,
  });
};

export const sponsorUserOperation = async ({userOperation}) => {
  const zerodevPaymaster = createZeroDevPaymasterClient({
    chain: polygon,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    transport: http(PAYMASTER_RPC),
  });
  return zerodevPaymaster.sponsorUserOperation({
    userOperation,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
};

export const getDimoChallenge = async (address: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIMO_AUTH_SERVER_URL}/auth/web3/generate_challenge`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        scope: 'openid email',
        response_type: 'code',
        client_id: process.env.NEXT_PUBLIC_DIMO_CLIENT_ID!,
        domain: process.env.NEXT_PUBLIC_DIMO_DOMAIN!,
        address: address,
      }),
    },
  );

  return (await response.json()) as {challenge: string; state: string};
};

export const getDimoToken = async (state: string, signedChallenge: string) => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_DIMO_AUTH_SERVER_URL}/auth/web3/submit_challenge`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.NEXT_PUBLIC_DIMO_CLIENT_ID!,
        domain: process.env.NEXT_PUBLIC_DIMO_DOMAIN!,
        state: state,
        grant_type: 'authorization_code',
        signature: signedChallenge,
      }),
    },
  );

  return (await response.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
    id_token: string;
  };
};

const getTurnkeyClientWithStamper = (stamper: TStamper) => {
  return new TurnkeyClient(
    {
      baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    },
    stamper,
  );
};
