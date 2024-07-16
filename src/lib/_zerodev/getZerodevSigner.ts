import {TurnkeySigner} from '@turnkey/ethers';
import {Turnkey as TurnkeyServerSDK} from '@turnkey/sdk-server';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {
  walletClientToSmartAccountSigner,
  ENTRYPOINT_ADDRESS_V07,
} from 'permissionless';
import {http, createWalletClient, createPublicClient} from 'viem';
import {TurnkeyClient} from '@turnkey/http';
import {createAccount} from '@turnkey/viem';

export const getZerodevSigner = async (account: any) => {
  // Initialize a Turnkey Signer
  const turnkeyClient = new TurnkeyServerSDK({
    apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
    apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
    apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
    defaultOrganizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
  });

  const turnkeyAccount = await createAccount({
    client: turnkeyClient.apiClient(),
    organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    signWith: account.addresses[0],
  });

  const walletClient = createWalletClient({
    account: turnkeyAccount,
    transport: http('https://rpc-amoy.polygon.technology'),
  });
  // console.log({walletClient});

  const smartAccountSigner = walletClientToSmartAccountSigner(walletClient);

  // console.log({smartAccountSigner});
  const publicClient = createPublicClient({
    transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: smartAccountSigner,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });

  return {ecdsaValidator, smartAccountSigner};
};
