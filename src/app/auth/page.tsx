'use client';

import React, {FormEvent, useCallback, useState} from 'react';
import {Button} from '@headlessui/react';
import {useTurnkey} from '@turnkey/sdk-react';
import {getWebAuthnAttestation} from '@turnkey/http';
import {
  passkeyStamper,
  turnkeyApiClient,
  turnkeyClientWithStamper,
} from '@/lib/_turnkey/turnkeyClient';
import {createPublicClient, createWalletClient, http} from 'viem';
import {
  ENTRYPOINT_ADDRESS_V07,
  walletClientToSmartAccountSigner,
} from 'permissionless';
import {polygon} from 'viem/chains';
import {createAccount} from '@turnkey/viem';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {KERNEL_V3_1} from '@zerodev/sdk/constants';
import {
  createKernelAccount,
  createKernelAccountClient,
  createZeroDevPaymasterClient,
} from '@zerodev/sdk';
import {SmartAccountSigner} from 'permissionless/accounts';
import Link from 'next/link';
import {
  BUNDLER_RPC,
  getAccountWallet,
  getDimoChallenge,
  getDimoToken,
  getSmartAccountSigner,
  getZeroDevKernelAccount,
  sponsorUserOperation,
} from '@/lib/_zerodev/signer';
import {WebauthnStamper} from '@turnkey/webauthn-stamper';

// All algorithms can be found here: https://www.iana.org/assignments/cose/cose.xhtml#algorithms
// We only support ES256, which is listed here
const es256 = -7;

// This constant designates the type of credential we want to create.
// The enum only supports one value, "public-key"
// https://www.w3.org/TR/webauthn-2/#enumdef-publickeycredentialtype
const publicKey = 'public-key';

const generateRandomBuffer = (): ArrayBuffer => {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return arr.buffer;
};

const base64UrlEncode = (challenge: ArrayBuffer): string => {
  return Buffer.from(challenge)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
};

/**
 * code to validate signature
 * const isValid = await verifyEIP6492Signature({
 *           signer: address,
 *           hash: hashMessage(challenge.challenge),
 *           signature: kernelSigned,
 *           client: publicClient,
 *         });
 * */

/* code to create private key tag and private key
        const h = await client.createPrivateKeyTag({
          type: 'ACTIVITY_TYPE_CREATE_PRIVATE_KEY_TAG',
          timestampMs: Date.now().toString(),
          organizationId: whoami.organizationId,
          parameters: {
            privateKeyTagName: 'DEFAULT_TAG',
            privateKeyIds: [],
          },e411d3bd-f2ed-40a9-846b-49c672c8d8f0
        });

      const p = await client.createPrivateKeys({
        type: 'ACTIVITY_TYPE_CREATE_PRIVATE_KEYS_V2',
        timestampMs: Date.now().toString(),
        organizationId: whoami.organizationId,
        parameters:{
          privateKeys: [
            {
              privateKeyName: 'DEFAULT_PRIVATE_KEY',
              privateKeyTags: ['e411d3bd-f2ed-40a9-846b-49c672c8d8f0'],
              curve: 'CURVE_SECP256K1',
              addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
            }
          ],
        },
      });
        console.info('PRIVATE KEY TAG::: ', p);*/

export default function Auth () {
  // TODO look into `useAuthModal` from alchemy-aa/react

  const [email, setEmail] = useState<string>('');
  const onEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
    [],
  );

  const [walletData, setWalletData] = useState({});
  const [zerDevAccountData, setZeroDevAccountData] = useState({});
  const [transactionData, setTransactionData] = useState({});
  const [tokenData, setTokenData] = useState({});

  const {passkeyClient} = useTurnkey();

  const signUp = async (email: string) => {
    const challenge = generateRandomBuffer();
    const authenticatorUserId = generateRandomBuffer();

    const attestation = await getWebAuthnAttestation({
      publicKey: {
        rp: {
          id: passkeyClient?.rpId,
          name: 'Demo WaaS',
        },
        challenge,
        pubKeyCredParams: [
          {
            type: publicKey,
            alg: es256,
          },
        ],
        user: {
          id: authenticatorUserId,
          name: email,
          displayName: email,
        },
        authenticatorSelection: {
          requireResidentKey: true,
          residentKey: 'required',
          userVerification: 'preferred',
        },
      },
    });

    const response = await fetch('/api/passkey', {
      method: 'POST',
      body: JSON.stringify({
        email,
        attestation,
        encodedChallenge: base64UrlEncode(challenge),
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return (await response.json()) as {
      subOrganizationId: string;
      wallet: {walletId: string; addresses: string[]};
    };
  };

  const zeroDevAndDIMOLogin = async (
    organizationId: string,
    address: string,
  ) => {
    const smartAccountSigner = await getSmartAccountSigner(
      organizationId,
      address,
      passkeyStamper,
    );

    const zeroDevKernelAccount =
      await getZeroDevKernelAccount(smartAccountSigner);

    setZeroDevAccountData(zeroDevKernelAccount);

    const kernelClient = createKernelAccountClient({
      account: zeroDevKernelAccount,
      chain: polygon,
      entryPoint: ENTRYPOINT_ADDRESS_V07,
      bundlerTransport: http(BUNDLER_RPC),
      middleware: {
        sponsorUserOperation: sponsorUserOperation,
      },
    });

    const {address: kernelAddress} = zeroDevKernelAccount;

    const callData = await kernelClient.account.encodeCallData({
      to: kernelAddress,
      value: BigInt(0),
      data: '0x',
    });

    // @ts-ignore
    const transaction = await kernelClient.sendUserOperation({
      userOperation: {
        callData,
      },
    });

    setTransactionData(transaction);

    const {challenge, state} = await getDimoChallenge(kernelAddress);

    // @ts-ignore
    const kernelSigned = await kernelClient.signMessage({
      message: challenge,
    });

    const token = await getDimoToken(state, kernelSigned);

    setTokenData(token);
  };

  const loginOrSignup = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    const response = await fetch(`/api/auth/${email}`);

    const {subOrganizationId} = await response.json();

    if (subOrganizationId) {
      // @ts-ignore
      const {organizationId} = await passkeyClient?.getWhoami({
        organizationId: subOrganizationId,
      });

      const accounts = await getAccountWallet(organizationId);

      setWalletData(accounts[0]);

      const {address} = accounts[0];

      await zeroDevAndDIMOLogin(organizationId, address);
    } else {
      const {subOrganizationId, wallet} = await signUp(email);

      setWalletData(wallet);

      const {addresses} = wallet;

      const address = addresses[0];

      await zeroDevAndDIMOLogin(subOrganizationId, address);
    }
  };

  return (
    <div>
      <form className="flex flex-col gap-8" onSubmit={loginOrSignup}>
        <div>Log in with DIMO</div>
        <div className="flex flex-col items-center justify-between">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={onEmailChange}
          />
          <Button type="submit" className="rounded-md mt-2 p-2.5 bg-blue-400">
            Log in with Passkey
          </Button>
          <Button className="rounded-md mt-2 p-2.5 bg-blue-400">
            <Link href={'/email-auth'}>Log in with email</Link>
          </Button>
        </div>
      </form>
      <div>
        {/* Wallet info section */}
        <div className="z-10 w-full max-w-5xljustify-between font-mono text-sm lg:flex">
          <div className="pt-6 space-y-4 overflow-auto mr-10">
            <p className={'text-center'}>{'Turnkey Wallet Data'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(walletData, null, 2)}
            </pre>
            <p className={'text-center'}>{'Zero Dev Account Data'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(zerDevAccountData, null, 2)}
            </pre>
            <p className={'text-center'}>{'Populated Transaction Data'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(transactionData, null, 2)}
            </pre>
            <p className={'text-center'}>{'DIMO Token'}</p>
            <pre className="text-lg font-medium">
              {JSON.stringify(tokenData, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
