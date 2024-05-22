import {ethers} from 'ethers';
import {TurnkeySigner} from '@turnkey/ethers';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';
import {TransactionRequest, TransactionTemplate} from '@/lib/utils/types';

const transactionRequest = {
  // to: <destination address>,
  // value: ethers.parseEther(<amount to send>),
  // type: 2
};
// const transactionResult = await connectedSigner.sendTransaction(transactionRequest);

// TODO update type for param
export const createTransactionBase = (data: any) => {
  const provider = new ethers.JsonRpcProvider('https://polygon-pokt.nodies.app/');
  const turnkeySigner = new TurnkeySigner({
    client: turnkeyApiClient,
    organizationId: process.env.TURNKEY_ORGANIZATION_ID || '9824a5dc-be8d-45c7-9009-90caddbb490c',
    signWith: data.addresses[0],
  });
  return turnkeySigner.connect(provider).populateTransaction({
    from: data.addresses[0],
    to: '0x9916caf06747F8a5458CE69c4A071555903F7b62',
    value: '0'
  });

};
