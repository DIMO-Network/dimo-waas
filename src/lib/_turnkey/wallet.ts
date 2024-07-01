import {DEFAULT_ETHEREUM_ACCOUNTS} from '@turnkey/sdk-server';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';

const dropActivityFromResponse = (response: any) => {
  const {activity, ...rest} = response;
  return rest;
}

export const createWallet = async () => {
  return turnkeyApiClient
    .createWallet({
      walletName: 'testWallet28',
      accounts: DEFAULT_ETHEREUM_ACCOUNTS,
    })
    .catch(error => {
      console.error('error creating wallet', error);
      throw Error(`error creating wallet, ${JSON.stringify(error)}`);
    })
    .then(response => {
      console.log('response from create wallet', response);

      return dropActivityFromResponse(response);
    });
};

export const createWalletWithPasskey = async () => {};
