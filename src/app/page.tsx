'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from 'react';
import {createWallet} from '@/lib/_turnkey/wallet';
import {createTransactionBase} from '@/lib/_turnkey/transaction';
import {sendSponsoredWrite} from '@/lib/_zerodev/sendSponsoredWrite';

const toObject = (data: any) => {
  return JSON.parse(
    JSON.stringify(
      data,
      (key, value) => (typeof value === 'bigint' ? value.toString() : value), // return everything else unchanged
    ),
  );
};

export default function Home () {
  let buttonText = 'Send a Transaction';
  let loading = false;
  let [data, setData] = useState({});
  const [writeData, setWriteData] = useState({});

  const handleOnClickAccount = () => {
    buttonText = 'Waiting for response...';
    loading = true;
    createWallet().then(response => {
      console.log('response from create wallet', response);
      createTransactionBase(response).then(response => {
        console.log('transactData::: ', response);
        setData(toObject(response));
        loading = false;
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      {/* Create Turnkey Account Button Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto">
          <p>{'Signer Data'}</p>
          <pre className="text-lg font-medium">
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        <LoadingButton
          color="primary"
          variant="contained"
          loading={loading}
          onClick={handleOnClickAccount}>
          {buttonText}
        </LoadingButton>
        <div
          className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none"></div>
      </div>
      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left"></div>
      {/* AA sentUserOp TX Hash Button Section */}
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto">
          <p>{'AA sendUserOp tx hash'}</p>
          <pre className="text-lg font-medium">{JSON.stringify(writeData, null, 2)}</pre>
        </div>
        <LoadingButton
          color="primary"
          variant="contained"
          // loading={loading}
          onClick={handleSponsoredWrite}>
          Send example sponsored tx
        </LoadingButton>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none"></div>
      </div>
    </main>
  );
}
