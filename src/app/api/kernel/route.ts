import {NextRequest, NextResponse} from "next/server";
import {PrismaClient} from "@prisma/client";
import {PasskeyWalletRequest} from "@/lib/utils/types";
import {createAccountAndWalletWithPasskey} from "@/lib/_turnkey/passkeyWallet";
import {TurnkeyClient} from "@turnkey/http";
import {ApiKeyStamper} from "@turnkey/sdk-server";
import {createAccount} from "@turnkey/viem";
import {createPublicClient, createWalletClient, http} from "viem";
import {polygon, polygonAmoy} from "viem/chains";
import {BUNDLER_RPC, sponsorUserOperation} from "@/lib/_zerodev/signer";
import {turnkeyApiClient} from "@/lib/_turnkey/turnkeyClient";
import {bundlerActions, ENTRYPOINT_ADDRESS_V07, walletClientToSmartAccountSigner} from "permissionless";
import {signerToEcdsaValidator} from "@zerodev/ecdsa-validator";
import {KERNEL_V3_1} from "@zerodev/sdk/constants";
import {createKernelAccount, createKernelAccountClient} from "@zerodev/sdk";
import { TurnkeySDKApiTypes } from "@turnkey/sdk-server";
import {TCreateSubOrganizationResponse} from "@turnkey/sdk-server/dist/__generated__/sdk_api_types";

export async function POST (request: NextRequest) {
    const prismaClient = new PrismaClient();
    try {
        const payload: {email: string;} = await request.json();

        if (!payload) {
            return NextResponse.json({error: 'No payload provided'}, {status: 400});
        }
/*
        const storedUser = await prismaClient.user.findUnique({
            where: {
                email: payload.email,
            },
        });*/

        console.info("create turnkey client");
        const turnkey = new TurnkeyClient(
            {
                baseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
            },
            new ApiKeyStamper({
                apiPublicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY!,
                apiPrivateKey: process.env.NEXT_PUBLIC_TURNKEY_API_PRIVATE_KEY!,
            })
        );

        const dimoUser = {
            userName: 'DIMO USER',
            apiKeys:  [{
                apiKeyName: 'DIMO API KEY',
                publicKey: process.env.NEXT_PUBLIC_TURNKEY_API_PUBLIC_KEY! // this should be an environment variable
                curveType: "API_KEY_CURVE_P256"
            }],
            authenticators: [],
            oauthProviders: [],
        };

        const subOrgPayload : TurnkeySDKApiTypes.TCreateSubOrganizationBody = {
            subOrganizationName: `${payload.email} sub org ${Date.now()}`,
            rootQuorumThreshold: 1,
            rootUsers: [
                dimoUser,
            ],
            wallet: {
                walletName: 'Default wallet',
                accounts: [
                    {
                        curve: 'CURVE_SECP256K1',
                        pathFormat: 'PATH_FORMAT_BIP32',
                        path: "m/44'/60'/0'/0/0",
                        addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
                    },
                ],
            }
        };

        const { activity } : { activity : { result: { createSubOrganizationResultV6 : TurnkeySDKApiTypes.TCreateSubOrganizationResponse } } } = await turnkey.createSubOrganization({
            type: "ACTIVITY_TYPE_CREATE_SUB_ORGANIZATION_V6",
            organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
            timestampMs: Date.now().toString(),
            parameters: subOrgPayload,
        });

        const { subOrganizationId, rootUserIds } = activity.result.createSubOrganizationResultV6;

        console.info("sub org with id %s created, DIMO USER is root user", subOrganizationId);

        const {wallets} = await turnkey.getWallets({
            organizationId: subOrganizationId,
        });

        const {accounts} = await turnkey.getWalletAccounts({
            organizationId: subOrganizationId,
            walletId: wallets[0].walletId,
        });

        console.info("got turnkey wallet account with address %s", accounts[0].address);

        console.info("prepare kernel account")
        const localAccount = await createAccount({
            client: turnkey,
            organizationId: subOrganizationId,
            signWith: accounts[0].address,
            ethereumAddress: accounts[0].address,
        });

        const smartAccountClient = createWalletClient({
            account: localAccount,
            chain: polygon,
            transport: http(BUNDLER_RPC),
        });

        const smartAccountSigner = walletClientToSmartAccountSigner(smartAccountClient)

        const publicClient = createPublicClient({
            chain: polygon,
            transport: http(BUNDLER_RPC),
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
            chain: polygon,
            entryPoint: ENTRYPOINT_ADDRESS_V07,
            bundlerTransport: http(BUNDLER_RPC),
            middleware: {
                sponsorUserOperation: sponsorUserOperation,
            },
        });

        const {address: kernelAddress} = zeroDevKernelAccount;

        console.info("got kernel account with address %s", kernelAddress);

        const callData = await kernelClient.account.encodeCallData({
            to: kernelAddress,
            value: BigInt(0),
            data: '0x',
        });

        console.info("sending user operation");
        const transaction = await kernelClient.sendUserOperation({
            userOperation: {
                callData,
            },
        });

        const bundlerClient = kernelClient.extend(bundlerActions(ENTRYPOINT_ADDRESS_V07));

        console.info("waiting for user operation receipt");
        const { success, reason,  } = await bundlerClient.waitForUserOperationReceipt({
            hash: transaction,
        });

        console.info("user operation receipt success: %s, reason: %s", success, reason);

        const userTagPayload: TurnkeySDKApiTypes.TCreateUserTagBody = {
            userTagName: 'USER TAG',
            userIds: [],
        };

        const { activity : tagActivity }: { activity: { result: {createUserTagResult: TurnkeySDKApiTypes.TCreateUserTagResponse } } } = await turnkey.createUserTag({
            type: "ACTIVITY_TYPE_CREATE_USER_TAG",
            organizationId: subOrganizationId,
            timestampMs: Date.now().toString(),
            parameters: userTagPayload
        });

        const { userTagId } = tagActivity.result.createUserTagResult;

        console.info("user tag created with id %s", userTagId);

        const user = {
            userName: payload.email,
            userEmail: payload.email,
            apiKeys: [],
            authenticators: [],
            oauthProviders: [],
            userTags: [userTagId],
        };

        const createUserPayload : TurnkeySDKApiTypes.TCreateUsersBody = {
            users: [
                user,
            ]
        };

        const { activity: userCreateActivity }: { activity: { result: { createUsersResult : TurnkeySDKApiTypes.TCreateUsersResponse } } } = await turnkey.createUsers({
            type: "ACTIVITY_TYPE_CREATE_USERS_V2",
            organizationId: subOrganizationId,
            timestampMs: Date.now().toString(),
            parameters: createUserPayload,
        });

        const { userIds } = userCreateActivity.result.createUsersResult;

        console.info("user created with id %s", userIds[0]);

        console.info("removing dimo user with id %s from sub org root users and leaving user with id %s", rootUserIds![0], userIds[0]);

        const quorumPayload : TurnkeySDKApiTypes.TUpdateRootQuorumBody = {
            threshold: 1,
            userIds: userIds,
        };
        await turnkey.updateRootQuorum({
            type: "ACTIVITY_TYPE_UPDATE_ROOT_QUORUM",
            organizationId: subOrganizationId,
            timestampMs: Date.now().toString(),
            parameters: quorumPayload
        });

        return NextResponse.json({
            walletAddress: kernelAddress,
            subOrganizationId,
        }, {status: 200});
    } finally {
        await prismaClient.$disconnect();
    }
}
