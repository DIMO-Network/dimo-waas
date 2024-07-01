import {ethers} from 'ethers';
import {TurnkeySigner} from '@turnkey/ethers';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';
import {WalletResponse} from '@/lib/utils/types';

const rpcProvider = new ethers.JsonRpcProvider('https://polygon-pokt.nodies.app/');

const buildBasicTurnkeySigner = (data: WalletResponse) => {
  return new TurnkeySigner({
    client: turnkeyApiClient,
    organizationId: process.env.NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID!,
    signWith: data.addresses[0],
  });
};

const buildAATurnkeySigner = (data: WalletResponse) => {

}

const buildTransaction = (data: WalletResponse, transactionParams: any) => {
  return {
    from: data.addresses[0],
    to: transactionParams.to,
    value: transactionParams.value
  }
}

// TODO update type for param
export const createTransactionChannel = (data: any, transactionParams: any) => {
  const turnkeySigner = buildBasicTurnkeySigner(data);
  console.log(JSON.stringify(turnkeySigner));
  const transactionData = buildTransaction(data, transactionParams);
  return turnkeySigner.connect(rpcProvider).populateTransaction(transactionData);

};

export const sendTransaction = async (data: any, transactionParams: any) => {
  const transactionBase = createTransactionChannel(data, transactionParams);
  turnkeyApiClient
    .createTransaction(transactionBase)
    .catch((error: any) => {
      console.error('error creating transaction', error);
      return error
    })
    .then((response: any) => {
      return response;
    });
};
