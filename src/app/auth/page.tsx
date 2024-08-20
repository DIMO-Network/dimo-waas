'use client'

import {PasskeySignupComponent} from '@/components/passkey/PasskeySignup';
import React, {FormEvent, useCallback, useState} from 'react';
import {useAuthenticate, useSignerStatus} from '@alchemy/aa-alchemy/react';
import {Button} from '@headlessui/react';

export default function Auth () {

  // TODO look into `useAuthModal` from alchemy-aa/react

  const [email, setEmail] = useState<string>('');
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );

  const {authenticate} = useAuthenticate();
  const login = (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    authenticate({type: 'email', email});
  };

  const {status} = useSignerStatus();
  console.log('SIGNER STATUS::: ', status);
  const isAwaitingEmail = status === 'AWAITING_EMAIL_AUTH';

  return (
    <div>
      {isAwaitingEmail ? (
        <div className="text-[18px] font-semibold">Check your email!</div>
      ) : (
        <form className="flex flex-col gap-8" onSubmit={login}>
          <div>
            Log in with DIMO
          </div>
          <div className="flex flex-col items-center justify-between">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={onEmailChange}
            />
            <Button type="submit" className="rounded-md p-2.5 bg-blue-400">Log in</Button>
          </div>
        </form>
      )}
    <div>
      <PasskeySignupComponent/>
    </div>
    </div>
  );
}
