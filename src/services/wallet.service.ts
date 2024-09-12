import {
  AccountCreateRequest,
  AccountCreateResponse,
} from "@/src/models/account";
import { TurnkeySDKApiTypes } from "@turnkey/sdk-server";
import {
  KernelAccountProcess,
  RootUserAuthenticator,
  SubOrganizationRootUser,
} from "@/src/models/activity-response";
import {
  bundleRpc,
  dimoApiPublicKey,
  paymasterRpc,
  stamperClient,
  turnkeyClient,
} from "@/src/clients/turnkey";
import { createAccount } from "@turnkey/viem";
import { createPublicClient, createWalletClient, http } from "viem";
import { polygon } from "viem/chains";
import {
  bundlerActions,
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from "permissionless";
import { signerToEcdsaValidator } from "@zerodev/ecdsa-validator";
import { KERNEL_V3_1 } from "@zerodev/sdk/constants";
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from "@zerodev/sdk";
import { upsertUser } from "@/src/services/user.service";

export const createOnChainAccount = async (
  payload: AccountCreateRequest,
): Promise<AccountCreateResponse> => {
  const { organizationIds } = await turnkeyClient.getSubOrgIds({
    filterType: "NAME",
    filterValue: `DIMO ${payload.email}`,
  });

  let organizationId: string;
  let turnkeyAddress: string;

  if (organizationIds.length > 0) {
    const subOrganizationId = organizationIds[0];

    const { wallets } = await turnkeyClient.getWallets({
      organizationId: subOrganizationId,
    });

    const { accounts } = await turnkeyClient.getWalletAccounts({
      organizationId: subOrganizationId,
      walletId: wallets[0].walletId,
    });

    organizationId = subOrganizationId!;
    const { address } = accounts[0];
    turnkeyAddress = address;
  } else {
    const { subOrganizationId, wallet } = await createSubOrganization(
      payload.email,
    );

    const { addresses } = wallet!;

    turnkeyAddress = addresses[0];
    organizationId = subOrganizationId;
  }

  const { kernelAddress, success, reason } = await createKernelAccountAddress(
    organizationId,
    turnkeyAddress,
  );

  if (!success) {
    throw new Error(reason);
  }

  await configureSubOrganization(payload, organizationId);

  await upsertUser({
    email: payload.email,
    subOrganizationId: organizationId,
    hasPasskey: !!payload.attestation,
  });

  return {
    walletAddress: kernelAddress,
    subOrganizationId: organizationId,
  };
};

const createSubOrganization = async (
  userEmail: string,
): Promise<TurnkeySDKApiTypes.TCreateSubOrganizationResponse> => {
  const dimoUser: SubOrganizationRootUser = {
    userName: "DIMO USER",
    apiKeys: [
      {
        apiKeyName: "DIMO API KEY",
        publicKey: dimoApiPublicKey,
        curveType: "API_KEY_CURVE_P256",
      },
    ],
    authenticators: [],
    oauthProviders: [],
    userTags: [],
  };

  const subOrgPayload: TurnkeySDKApiTypes.TCreateSubOrganizationBody = {
    subOrganizationName: `DIMO ${userEmail}`,
    rootQuorumThreshold: 1,
    rootUsers: [dimoUser],
    wallet: {
      walletName: "Default wallet",
      accounts: [
        {
          curve: "CURVE_SECP256K1",
          pathFormat: "PATH_FORMAT_BIP32",
          path: "m/44'/60'/0'/0/0",
          addressFormat: "ADDRESS_FORMAT_ETHEREUM",
        },
      ],
    },
  };

  return await turnkeyClient.createSubOrganization(subOrgPayload);
};

const createKernelAccountAddress = async (
  organizationId: string,
  turnkeyAddress: string,
): Promise<KernelAccountProcess> => {
  const localAccount = await createAccount({
    client: stamperClient,
    organizationId: organizationId,
    signWith: turnkeyAddress,
    ethereumAddress: turnkeyAddress,
  });

  const smartAccountClient = createWalletClient({
    account: localAccount,
    transport: http(bundleRpc),
  });

  const smartAccountSigner =
    walletClientToSmartAccountSigner(smartAccountClient);

  const publicClient = createPublicClient({
    transport: http(bundleRpc),
  });

  const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
    signer: smartAccountSigner,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    kernelVersion: KERNEL_V3_1,
  });

  const zeroDevKernelAccount = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    kernelVersion: KERNEL_V3_1,
  });

  const kernelClient = createKernelAccountClient({
    account: zeroDevKernelAccount,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    bundlerTransport: http(bundleRpc),
    middleware: {
      sponsorUserOperation: sponsorUserOperation,
    },
  });

  const { address: kernelAddress } = zeroDevKernelAccount;

  const callData = await kernelClient.account.encodeCallData({
    to: kernelAddress,
    value: BigInt(0),
    data: "0x",
  });

  const transaction = await kernelClient.sendUserOperation({
    userOperation: {
      callData,
    },
  });

  const bundlerClient = kernelClient.extend(
    // @ts-ignore
    bundlerActions(ENTRYPOINT_ADDRESS_V07),
  );

  // TODO: check if this is really necessary
  const { success, reason } = await bundlerClient.waitForUserOperationReceipt({
    hash: transaction,
  });

  return {
    kernelAddress,
    success,
    reason,
  };
};

const configureSubOrganization = async (
  payload: AccountCreateRequest,
  organizationId: string,
) => {
  const { userTagId } = await turnkeyClient.createUserTag({
    organizationId: organizationId,
    userTagName: "END USER TAG",
    userIds: [],
  });

  const endUser: SubOrganizationRootUser = {
    userName: payload.email,
    userEmail: payload.email,
    apiKeys: [],
    authenticators: [],
    oauthProviders: [],
    userTags: [userTagId],
  };

  if (payload.attestation) {
    const authenticator: RootUserAuthenticator = {
      authenticatorName: "PASSKEY",
      challenge: payload.encodedChallenge!,
      attestation: payload.attestation!,
    };

    endUser.authenticators.push(authenticator);
  }

  const { userIds } = await turnkeyClient.createUsers({
    organizationId: organizationId,
    users: [endUser],
  });

  await turnkeyClient.updateRootQuorum({
    organizationId: organizationId,
    threshold: 1,
    userIds: userIds,
  });
};

// @ts-ignore
const sponsorUserOperation = async ({ userOperation }) => {
  const zerodevPaymaster = createZeroDevPaymasterClient({
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    transport: http(paymasterRpc),
  });
  return zerodevPaymaster.sponsorUserOperation({
    userOperation,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
};
