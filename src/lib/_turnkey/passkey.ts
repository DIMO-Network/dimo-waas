import {DEFAULT_ETHEREUM_ACCOUNTS} from '@turnkey/sdk-server';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';

export const createWalletWithPasskey: (
  challenge: any,
  attestation: any,
) => Promise<any> = async (challenge: any, attestation: any) => {
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
