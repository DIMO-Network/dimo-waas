import {DEFAULT_ETHEREUM_ACCOUNTS} from '@turnkey/sdk-server';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';
import {PasskeyWalletRequest, AddPasskeyToExistingWalletRequest} from '@/lib/utils/types';

const createSubOrgParams = (challenge: any, attestation: any, walletId?: string) => {
  const walletName = 'Default wallet';
  const wallet = walletId ? turnkeyApiClient.getWallets() : {
    walletName: walletName,
    accounts: DEFAULT_ETHEREUM_ACCOUNTS,
  }
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
  }
}
export const createWalletWithPasskey: (data: PasskeyWalletRequest) => Promise<any> = async ({encodedChallenge: challenge, attestation}) => {
  
  // const subOrgParams = createSubOrgParams(challenge, attestation);
  const walletName = 'Default wallet';
  return turnkeyApiClient
    .createSubOrganization({
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
    })
    .catch(error => {
      console.error('error creating sub org', error);
      throw Error(`error creating sub org, ${JSON.stringify(error)}`);
    })
    .then(response => {
      console.log('response from create sub org', response);
      return response;
    });
};

export const addPasskeyToExistingWallet: (data: AddPasskeyToExistingWalletRequest) => Promise<any> = async ({encodedChallenge: challenge, attestation, wallet}) => {

};

