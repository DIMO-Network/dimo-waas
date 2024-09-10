'use client';

import {Button} from '@headlessui/react';
import Link from 'next/link';
import React, {useEffect, useState} from 'react';
import {useTurnkey} from '@turnkey/sdk-react';
import {
  browserClient,
  passkeyStamper,
  turnkeyApiClient,
} from '@/lib/_turnkey/turnkeyClient';
import {
  BUNDLER_RPC,
  getAccountWallet,
  getDimoChallenge,
  getDimoToken,
  getSmartAccountSigner,
  getZeroDevKernelAccount,
  sponsorUserOperation,
} from '@/lib/_zerodev/signer';
import {createKernelAccountClient} from '@zerodev/sdk';
import {polygon} from 'viem/chains';
import {ENTRYPOINT_ADDRESS_V07} from 'permissionless';
import {http} from 'viem';
import {WebauthnStamper} from '@turnkey/webauthn-stamper';
import {IframeStamper} from '@turnkey/iframe-stamper';
import {TurnkeyBrowserClient} from '@turnkey/sdk-browser';
import {TurnkeyClient} from '@turnkey/http';
import {useSearchParams} from 'next/navigation';

/*
                       const d = await authIframeClient.signRawPayload({
                           signWith: address,
                           payload: '0xc151421fa91af258c9a72fc2b875022394aa88bdb51b81157058353ef2444181',
                           organizationId: organizationId,
                           encoding: "PAYLOAD_ENCODING_HEXADECIMAL",
                           hashFunction: "HASH_FUNCTION_NO_OP",
                       });

                       console.info('Signed: ', d);



                      console.info('Auth Bundle: ', authIframeClient);
               /*
                       const {privateKeyTagId} = await authIframeClient.createPrivateKeyTag({
                           privateKeyIds: [],
                           privateKeyTagName: 'DEFAULT_TAG',
                           organizationId
                       });

                       const {privateKeys} = await authIframeClient.createPrivateKeys({
                           organizationId: organizationId,
                           privateKeys: [{
                               privateKeyName: 'DEFAULT_PRIVATE_KEY',
                               privateKeyTags: [privateKeyTagId],
                               curve: 'CURVE_SECP256K1',
                               addressFormats: ['ADDRESS_FORMAT_ETHEREUM'],
                           }]
                       });

                       console.info('Private Key: ', privateKeyTagId);

                       console.info('Private Keys: ', privateKeys);

        const accounts = await getAccountWallet(organizationId);

        setWalletData(accounts[0]);

        ;*/

export default function EmailAuthPage () {
  const searchParams = useSearchParams();

  const [walletData, setWalletData] = useState({});
  const [zerDevAccountData, setZeroDevAccountData] = useState({});
  const [transactionData, setTransactionData] = useState({});
  const [tokenData, setTokenData] = useState();
  const [email, setEmail] = useState('');
  const [authBundle, setAuthBundle] = useState('');
  const [emailAuthInfo, setEmailAuthInfo] = useState();

  const {authIframeClient, turnkey} = useTurnkey();

  const onEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const onAuthBundleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAuthBundle(e.target.value);
  };

  const zeroDevAndDIMOLogin = async (
    organizationId: string,
    address: string,
  ) => {
    const smartAccountSigner = await getSmartAccountSigner(
      organizationId,
      address,
      authIframeClient?.config.stamper!,
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

    const transaction = await kernelClient.sendUserOperation({
      userOperation: {
        callData,
      },
    });

    setTransactionData(transaction);

    const {challenge, state} = await getDimoChallenge(kernelAddress);

    const kernelSigned = await kernelClient.signMessage({
      message: challenge,
      account: kernelAddress,
    });

    const token = await getDimoToken(state, kernelSigned);

    setTokenData(token);
  };

  const login = async () => {
    if (!authIframeClient) {
      return;
    }

    const response = await fetch('/api/auth', {
      method: 'POST',
      body: JSON.stringify({
        email: email,
        targetPublicKey: authIframeClient.iframePublicKey as string,
        magicLink: `http://${window.location.host}/email-auth?token=%s`,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Failed to authenticate email');
      return;
    }

    const authInfo = (await response.json()) as {
      subOrganizationId: string;
      userId: string;
      apiKeyId: string;
    };

    return authInfo;
  };

  const loginOrSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!authIframeClient) {
      return;
    }

    const authInfo = await login();

    if (authInfo!.subOrganizationId) {
      setEmailAuthInfo(authInfo);
    } else {
      const response = await fetch('/api/email', {
        method: 'POST',
        body: JSON.stringify({
          email: email,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.error('Failed to create account with email');
        return;
      }

      const {subOrganizationId, wallet} = await response.json();

      const authInfo = await login();

      setEmailAuthInfo(authInfo);
    }
  };

  const validateAuthBundle = async () => {
    if (!authIframeClient) {
      console.error('No auth iframe client');
      return;
    }

    const valid = await authIframeClient.injectCredentialBundle(authBundle);

    if (!valid) {
      console.error('Failed to validate auth bundle');
      return;
    }

    const {organizationId} = await authIframeClient.getWhoami();

    const accounts = await getAccountWallet(organizationId);

    setWalletData(accounts[0]);

    const {address} = accounts[0];

    await zeroDevAndDIMOLogin(organizationId, address);
  };

  useEffect(() => {
    const token = searchParams.get('token');
    console.info(token);
    if (token) {
      setEmailAuthInfo({});
      setAuthBundle(token);
      validateAuthBundle().catch(console.error);
    }
  }, [authIframeClient]);

  return (
    <div>
      <div>Log in with DIMO</div>
      {!emailAuthInfo && (
        <>
          <form className="flex flex-col gap-8" onSubmit={loginOrSignup}>
            <div className="flex flex-col items-center justify-between">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={onEmailChange}
              />
              <Button
                type="submit"
                className="rounded-md mt-2 p-2.5 bg-blue-400">
                Log in with Email
              </Button>
            </div>
          </form>
        </>
      )}
      {emailAuthInfo && !tokenData && (
        <>
          <div>Loading...</div>
        </>
      )}
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
