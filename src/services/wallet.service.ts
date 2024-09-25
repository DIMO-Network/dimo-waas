import {
  AccountCreateRequest,
  UserRegisteredResponse,
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
import { Chain, createPublicClient, createWalletClient, http } from "viem";
import { polygon, polygonAmoy } from "viem/chains";
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
import { getUserByEmail, upsertUser } from "@/src/services/user.service";
import { EmailAuthRequest } from "@/src/models/auth";

// Public functions
export const createOnChainAccount = async (
  payload: AccountCreateRequest,
): Promise<UserRegisteredResponse> => {
  const { email, deployAccount, attestation } = payload;

  const { subOrganizationId, walletAddress } =
    await createSubOrganization(email);

  if (attestation) {
    await createAuthenticator(payload, subOrganizationId);
  }

  let zeroDevAddress: string | null = null;
  if (deployAccount) {
    const { kernelAddress, success, reason } = await createKernelAccountAddress(
      subOrganizationId,
      walletAddress,
    );

    if (!success) {
      throw new Error(reason);
    }
    zeroDevAddress = kernelAddress;
    await removeDimoSigner(subOrganizationId, email);
  }

  await upsertUser({
    email: payload.email,
    subOrganizationId: subOrganizationId,
    hasPasskey: !!payload.attestation,
    walletAddress: walletAddress,
    smartContractAddress: zeroDevAddress,
    emailVerified: true,
  });

  return {
    subOrganizationId: subOrganizationId,
    hasPasskey: !!payload.attestation,
    walletAddress: walletAddress,
    smartContractAddress: zeroDevAddress,
    emailVerified: true,
  };
};

export const createOrganizationAndSendEmail = async (
  payload: EmailAuthRequest,
): Promise<void> => {
  const { email, key } = payload;

  const { subOrganizationId, walletAddress } =
    await createSubOrganization(email);

  await turnkeyClient.emailAuth({
    organizationId: subOrganizationId,
    email: email,
    targetPublicKey: key,
  });

  await upsertUser({
    email: payload.email,
    subOrganizationId: subOrganizationId,
    walletAddress: walletAddress,
  });
};

export const verifyAndCreateKernelAccount = async (
  payload: AccountCreateRequest,
) => {
  const { email, deployAccount } = payload;

  // @ts-ignore
  const { subOrganizationId, walletAddress, smartContractAddress } =
    await getUserByEmail(email);

  await createAuthenticator(payload, subOrganizationId);

  let zeroDevAddress: string | null = null;
  if (deployAccount && !smartContractAddress) {
    const { kernelAddress, success, reason } = await createKernelAccountAddress(
      subOrganizationId,
      walletAddress,
    );

    if (!success) {
      throw new Error(reason);
    }
    zeroDevAddress = kernelAddress;
    await removeDimoSigner(subOrganizationId, email);
  }

  await upsertUser({
    email: payload.email,
    smartContractAddress: zeroDevAddress,
    emailVerified: true,
  });
};

export const deploySmartContractAccount = async (
  email: string,
): Promise<UserRegisteredResponse> => {
  // @ts-ignore
  const { subOrganizationId, walletAddress } = await getUserByEmail(email);

  const { kernelAddress, success, reason } = await createKernelAccountAddress(
    subOrganizationId,
    walletAddress,
  );

  if (!success) {
    throw new Error(reason);
  }

  await removeDimoSigner(subOrganizationId, email);

  await upsertUser({
    email: email,
    smartContractAddress: kernelAddress,
  });

  const user = await getUserByEmail(email);
  return user!;
};

// Private functions
const createSubOrganization = async (
  userEmail: string,
): Promise<{ subOrganizationId: string; walletAddress: string }> => {
  const { organizationIds } = await turnkeyClient.getSubOrgIds({
    filterType: "NAME",
    filterValue: `DIMO ${userEmail}`,
  });

  if (organizationIds.length > 0) {
    const subOrganizationId = organizationIds[0];

    const { wallets } = await turnkeyClient.getWallets({
      organizationId: subOrganizationId,
    });

    const { accounts } = await turnkeyClient.getWalletAccounts({
      organizationId: subOrganizationId,
      walletId: wallets[0].walletId,
    });

    return {
      subOrganizationId: subOrganizationId!,
      walletAddress: accounts[0].address,
    };
  }

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

  const endUser: SubOrganizationRootUser = {
    userName: userEmail,
    userEmail: userEmail,
    apiKeys: [],
    authenticators: [],
    oauthProviders: [],
    userTags: [],
  };

  const subOrgPayload: TurnkeySDKApiTypes.TCreateSubOrganizationBody = {
    subOrganizationName: `DIMO ${userEmail}`,
    rootQuorumThreshold: 1,
    rootUsers: [dimoUser, endUser],
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

  const { subOrganizationId, wallet } =
    await turnkeyClient.createSubOrganization(subOrgPayload);

  return {
    subOrganizationId: subOrganizationId,
    walletAddress: wallet!.addresses[0],
  };
};

const createKernelAccountAddress = async (
  organizationId: string,
  turnkeyAddress: string,
): Promise<KernelAccountProcess> => {
  const chain = getChain();
  const localAccount = await createAccount({
    client: stamperClient,
    organizationId: organizationId,
    signWith: turnkeyAddress,
    ethereumAddress: turnkeyAddress,
  });

  const smartAccountClient = createWalletClient({
    account: localAccount,
    chain: chain,
    transport: http(bundleRpc),
  });

  const smartAccountSigner =
    walletClientToSmartAccountSigner(smartAccountClient);

  const publicClient = createPublicClient({
    chain: chain,
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
    chain: chain,
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

const createAuthenticator = async (
  payload: AccountCreateRequest,
  organizationId: string,
): Promise<void> => {
  const { email, encodedChallenge, attestation } = payload;

  const { users } = await turnkeyClient.getUsers({
    organizationId: organizationId,
  });

  const endUser = users.find((user) => user.userName === email);
  const dimoUser = users.find((user) => user.userName !== email);

  // @ts-ignore
  const { userId: dimoUserId } = dimoUser;

  await turnkeyClient.updateRootQuorum({
    organizationId: organizationId,
    threshold: 1,
    userIds: [dimoUserId],
  });

  if (endUser) {
    const { userId } = endUser;

    await turnkeyClient.deleteUsers({
      organizationId: organizationId,
      userIds: [userId],
    });
  }

  const userTagId = await getUserTag(organizationId);

  const authenticator: RootUserAuthenticator = {
    authenticatorName: "DIMO PASSKEY",
    challenge: encodedChallenge!,
    attestation: attestation!,
  };

  const newEndUser: SubOrganizationRootUser = {
    userName: payload.email,
    userEmail: payload.email,
    apiKeys: [],
    authenticators: [authenticator],
    oauthProviders: [],
    userTags: [userTagId],
  };

  await turnkeyClient.createUsers({
    organizationId: organizationId,
    users: [newEndUser],
  });

  await upsertUser({
    email: email,
    hasPasskey: true,
  });
};

const getUserTag = async (organizationId: string): Promise<string> => {
  const { userTags } = await turnkeyClient.listUserTags({
    organizationId: organizationId,
  });

  if (userTags.length > 0) {
    return userTags[0].tagId;
  }

  const { userTagId } = await turnkeyClient.createUserTag({
    organizationId: organizationId,
    userTagName: "END USER TAG",
    userIds: [],
  });

  return userTagId;
};

const removeDimoSigner = async (organizationId: string, email: string) => {
  const { users } = await turnkeyClient.getUsers({
    organizationId: organizationId,
  });

  const endUser = users.find((user) => user.userName === email);

  if (!endUser) {
    throw new Error("User not found");
  }

  const { userId } = endUser;

  await turnkeyClient.updateRootQuorum({
    organizationId: organizationId,
    threshold: 1,
    userIds: [userId],
  });
};

// @ts-ignore
const sponsorUserOperation = async ({ userOperation }) => {
  const chain = getChain();
  const zerodevPaymaster = createZeroDevPaymasterClient({
    chain: chain,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
    transport: http(paymasterRpc),
  });
  return zerodevPaymaster.sponsorUserOperation({
    userOperation,
    entryPoint: ENTRYPOINT_ADDRESS_V07,
  });
};

const getChain = (): Chain => {
  const { VERCEL_ENV: environment } = process.env;

  if (environment === "production") {
    return polygon;
  }

  return polygonAmoy;
};
