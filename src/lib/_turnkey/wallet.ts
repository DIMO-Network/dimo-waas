import {DEFAULT_ETHEREUM_ACCOUNTS} from '@turnkey/sdk-server';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';
import {WalletRequest} from '@/lib/utils/types';

export const createWallet = async () => {
  return turnkeyApiClient
    .createWallet({
      walletName: 'testWallet15',
      accounts: DEFAULT_ETHEREUM_ACCOUNTS,
    })
    .catch(error => {
      console.error('error creating wallet', error);
      throw Error(`error creating wallet, ${JSON.stringify(error)}`);
    })
    .then(response => {
      console.log('response from create wallet', response);
      return response;
    });
};
