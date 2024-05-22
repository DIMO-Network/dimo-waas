'use client';

import LoadingButton from '@mui/lab/LoadingButton';
import {useState} from 'react';
import {createWallet} from '@/lib/_turnkey/wallet';
import {createTransactionBase} from '@/lib/_turnkey/transaction';

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

  const handleOnClick = () => {
    const userData = {userId: '123'};
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

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="text-center pt-6 space-y-4 overflow-auto">
          <p>
          {'Signer Data'}
          </p>
          <pre className="text-lg font-medium">
            {JSON.stringify(data, null, 2)}
          </pre>
          </div>
        <LoadingButton
          color="primary"
          variant="contained"
          loading={loading}
          onClick={handleOnClick}>
          {buttonText}
        </LoadingButton>
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:size-auto lg:bg-none">

        </div>
      </div>

      <div className="relative z-[-1] flex place-items-center before:absolute before:h-[300px] before:w-full before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-full after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 sm:before:w-[480px] sm:after:w-[240px] before:lg:h-[360px]"></div>

      <div className="mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-4 lg:text-left"></div>
    </main>
  );
}
