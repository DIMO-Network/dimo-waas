'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import Divider from '@mui/material/Divider';
import {useState} from 'react';
import {createWallet} from '@/lib/_turnkey/wallet';
import {createTransactionBase} from '@/lib/_turnkey/transaction';
import {createWalletWithPasskey} from '@/lib/_turnkey/passkey';
import {sendSponsoredWrite} from '@/lib/_zerodev/sendSponsoredWrite';
import {turnkeyPasskeyClient} from '@/lib/_turnkey/turnkeyClient';

const toObject = (data: any) => {
  return JSON.parse(
    JSON.stringify(
      data,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    ),
  );
};


export default function Home () {
  const [accountData, setAccountData] = useState({});
  const [transactionData, setTransactionData] = useState({});
  const [writeData, setWriteData] = useState({});
  const [newAccountPasskeyData, setNewAccountPasskeyData] = useState({});
  const [existingAccountPasskeyData, setExistingAccountPasskeyData] = useState({});

  const handleOnClickAccount = () => {
    createWallet().then(response => {
      console.log('response from create wallet', response);
      setAccountData(toObject(response));
      createTransactionBase(response).then(response => {
        console.log('transactData::: ', response);
        setTransactionData(toObject(response));
      });
    });
  };

  const handleSponsoredWrite = async () => {
    try {
      const resp = await sendSponsoredWrite();
      console.log({resp});
      setWriteData(resp.receipt.transactionHash);
    } catch (error) {
      console.log(error);
    }
  };

  const handlePasskeyOnClick = async () => {
    console.log('turnkey client: ', JSON.stringify(turnkeyPasskeyClient));
    const {encodedChallenge, attestation} =
      await turnkeyPasskeyClient?.createUserPasskey();
    try {
      const resp = await createWalletWithPasskey(encodedChallenge, attestation);
      console.log({resp});
      setNewAccountPasskeyData(resp);
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Create Turnkey Account Button Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto">
          <p>{'Wallet Data'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(accountData, null, 2)}
          </pre>
          <p>{'Signer Data'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(transactionData, null, 2)}
          </pre>
        </div>
        <LoadingButton
          color="primary"
          variant="contained"
          onClick={handleOnClickAccount}>
          {'Create a Turnkey Account and Populate Transaction'}
        </LoadingButton>
      </div>
      <Divider flexItem color="gray" sx={{marginTop: 5, marginBottom: 5}}/>
      {/* AA sentUserOp TX Hash Button Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto">
          <p>{'AA sendUserOp tx hash'}</p>
          <pre className="text-lg font-medium">{JSON.stringify(writeData, null, 2)}</pre>
        </div>
        <LoadingButton
          color="primary"
          variant="contained"
          onClick={handleSponsoredWrite}>
          Send example sponsored tx
        </LoadingButton>
      </div>
      <Divider flexItem color="gray" sx={{marginTop: 5, marginBottom: 5}}/>
      {/*  Create Turnkey Wallet with a Passcode Button Section */}
        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left"/>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <div className="text-center pt-6 pb-6 space-y-4 overflow-auto">
            <p>{'Create Turnkey Wallet with Passcode'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(newAccountPasskeyData, null, 2)}
            </pre>
          </div>
          <LoadingButton
            color="primary"
            variant="contained"
            onClick={handlePasskeyOnClick}>
            {'Create Turnkey Wallet with Passkey'}
          </LoadingButton>
        </div>
        <Divider flexItem color="gray" sx={{marginTop: 5, marginBottom: 5}}/>
        {/*TODO */}
        {/*  Adding Passkey to Existing Wallet Button Section */}
        <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left"/>
        <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
          <div className="text-center pt-6 pb-6 space-y-4 overflow-auto">
            <p>{'Add Passkey to Existing Turnkey Wallet'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(existingAccountPasskeyData, null, 2)}
            </pre>
          </div>
          <LoadingButton
            color="primary"
            variant="contained"
            onClick={() => {}}
            disabled={true}>
            {'Add Passkey to Existing Turnkey Wallet'}
          </LoadingButton>
        </div>
      <Divider flexItem color="gray" sx={{marginTop: 5, marginBottom: 5}}/>
    </main>
  );
}
