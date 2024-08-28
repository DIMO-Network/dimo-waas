'use client';
// TODO Remove all of this stuff eventually, this is all POC around turnkey functionality
import {useState} from 'react';
import {createWallet} from '@/lib/_turnkey/wallet';
import {createTransactionChannel} from '@/lib/_turnkey/transaction';
import {
  addPasskeyToExistingWallet,
  createAccountAndWalletWithPasskey,
} from '@/lib/_turnkey/passkeyWallet';
import {turnkeyPasskeyClient} from '@/lib/_turnkey/turnkeyClient';

const toObject = (data: any) => {
  return JSON.parse(
    JSON.stringify(
      data,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    ),
  );
};

export default function Home() {
  const [walletData, setWalletData] = useState({});
  const [transactionData, setTransactionData] = useState({});
  const [newAccountPasskeyData, setNewAccountPasskeyData] = useState({});
  const [existingAccountPasskeyData, setExistingAccountPasskeyData] = useState(
    {},
  );

  const transactionParams = {
    to: '0x9916caf06747F8a5458CE69c4A071555903F7b62',
    value: '0',
  };

  const handleOnClickAccount = () => {
    createWallet().then(response => {
      console.log('response from create wallet', response);
      setWalletData(toObject(response));

      createTransactionChannel(response, transactionParams).then(response => {
        console.log('transactData::: ', response);
        setTransactionData(toObject(response));
      });
    });
  };

  const handlePasskeyOnClick = async () => {
    const {encodedChallenge, attestation} =
      await turnkeyPasskeyClient?.createUserPasskey();

    createAccountAndWalletWithPasskey({encodedChallenge, attestation})
      .catch(error => {
        console.log(error);
      })
      .then(response => {
        console.log({response});
        if (response) {
          setNewAccountPasskeyData(response);
        }
      });
  };

  const handleAddPasskeyOnClick = async () => {
    if (walletData?.walletId) {
      throw Error('No wallet data, create wallet first');
    }

    const {encodedChallenge, attestation} =
      await turnkeyPasskeyClient?.createUserPasskey();

    addPasskeyToExistingWallet({
      encodedChallenge,
      attestation,
      wallet: walletData,
    })
      .catch(error => {
        console.log(error);
      })
      .then(response => {
        console.log({response});
        setExistingAccountPasskeyData(response);
      });
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Create Turnkey Account Button Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto center">
          <p>{'Wallet Data'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(walletData, null, 2)}
          </pre>
          <p>{'Populated Transaction Data'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(transactionData, null, 2)}
          </pre>
        </div>
        <div className={'flex flex-col items-center'}>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleOnClickAccount}>
            {'Create a Turnkey Account and Populate Transaction'}
          </button>
        </div>
      </div>
      {/*  Create Turnkey Wallet with a Passcode Button Section */}
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left" />
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 pb-6 space-y-4 overflow-auto">
          <p>{'Create Turnkey Wallet with Passcode'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(newAccountPasskeyData, null, 2)}
          </pre>
        </div>
        <div className={'flex flex-col items-center'}>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handlePasskeyOnClick}>
            {'Create Turnkey Wallet with Passkey'}
          </button>
        </div>
      </div>
      {/* TODO */}
      {/*  Adding Passkey to Existing Wallet Button Section */}
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left" />
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 pb-6 space-y-4 overflow-auto">
          <p>{'Add Passkey to Existing Turnkey Wallet'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(existingAccountPasskeyData, null, 2)}
          </pre>
        </div>
        <div className={'flex flex-col items-center'}>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full"
            onClick={handleAddPasskeyOnClick}
            disabled={true}>
            {'Add Passkey to Existing Turnkey Wallet'}
          </button>
        </div>
      </div>
    </main>
  );
}
