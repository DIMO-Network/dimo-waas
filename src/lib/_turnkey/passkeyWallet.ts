import {DEFAULT_ETHEREUM_ACCOUNTS} from '@turnkey/sdk-server';
import {turnkeyApiClient, turnkeyPasskeyClient} from '@/lib/_turnkey/turnkeyClient';
import {
  PasskeyWalletRequest,
  AddPasskeyToExistingWalletRequest,
} from '@/lib/utils/types';
import {computeAddress} from 'ethers';

const createSubOrgParams = (
  challenge: any,
  attestation: any,
  walletId?: string,
) => {
  const walletName = 'Default wallet';
  const wallet = walletId
    ? turnkeyApiClient.getWallets()
    : {
        walletName: walletName,
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      };
  return {
    subOrganizationName: 'user sub org 1',
    rootQuorumThreshold: 1,
    rootUsers: [
      {
        userName: 'New user',
        apiKeys: [],
        authenticators: [
          {
            authenticatorName: 'Passkey',
            challenge: challenge,
            attestation: attestation,
          },
        ],
      },
    ],
    wallet: {
      walletName: walletName,
      accounts: DEFAULT_ETHEREUM_ACCOUNTS,
    },
  };
};

export interface PasskeyWalletResponse {
    subOrganizationId: string;
    wallet: {
        walletId: string;
        addresses: string[];
    };
}

export const createWalletWithPasskey: (
  data: PasskeyWalletRequest,
) => Promise<PasskeyWalletResponse> = async ({encodedChallenge: challenge, attestation, email}) => {
  // const subOrgParams = createSubOrgParams(challenge, attestation);
  const walletName = 'Default wallet';
  const activity = await turnkeyApiClient
      .createSubOrganization({
        subOrganizationName: `${email} sub org ${Date.now()}`,
        rootQuorumThreshold: 1,
        rootUsers: [
          {
            userName: email,
            apiKeys: [],
            authenticators: [
              {
                authenticatorName: 'Passkey',
                challenge: challenge,
                attestation: attestation,
              },
            ],
            oauthProviders: [],
          },
        ],
        wallet: {
          walletName: walletName,
          // accounts: DEFAULT_ETHEREUM_ACCOUNTS,
          accounts: [
            {
              curve: 'CURVE_SECP256K1',
              pathFormat: 'PATH_FORMAT_BIP32',
              path: 'm/44\'/60\'/0\'/0/0',
              addressFormat: 'ADDRESS_FORMAT_ETHEREUM',
            },
          ],

        },
      });

  const walletResponse = await turnkeyApiClient.getActivity({
    activityId: activity.activity.id
  });

  const createSubOrgResponse: PasskeyWalletResponse = walletResponse.activity.result.createSubOrganizationResultV5;

  console.info('walletResponse: ', createSubOrgResponse);

  return createSubOrgResponse;
};

export const addPasskeyToExistingWallet: (
  data: AddPasskeyToExistingWalletRequest,
) => Promise<any> = async ({
  encodedChallenge: challenge,
  attestation,
  wallet,
}) => {};


export const authenticateWithPasskey = async () => {

};
