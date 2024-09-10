'use client';
import {useRouter} from 'next/navigation';
import {Button} from '@headlessui/react';
import {turnkeyPasskeyClient} from '@/lib/_turnkey/turnkeyClient';
import {createAccountAndWalletWithPasskey} from '@/lib/_turnkey/passkeyWallet';

// TODO Will need tweaking to add user email/auth for our system right now just creates a passkey and turnkey suborg

export const PasskeySignupComponent = () => {
  const router = useRouter();

  const handleAddPasskey = async () => {
    const credential = await turnkeyPasskeyClient?.createUserPasskey();

    if (credential) {
      return await createAccountAndWalletWithPasskey(credential);
    }
  };

  // TODO Passkey session

  return (
    <div>
      <div>
        <p>Add a passkey</p>
        <p>Follow your browsers prompts to add a passkey to your wallet.</p>
        <div>
          <Button
            className="rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={handleAddPasskey}>
            <p className="action-button-text">Add a passkey</p>
          </Button>
          <Button
            className="rounded bg-sky-600 py-2 px-4 text-sm text-white data-[hover]:bg-sky-500 data-[active]:bg-sky-700"
            onClick={() => router.push('')}>
            <p className="action-button-text">Cancel</p>
          </Button>
        </div>
      </div>
    </div>
  );
};
