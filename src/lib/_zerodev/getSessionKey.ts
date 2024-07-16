import {toRemoteSigner, RemoteSignerMode} from '@zerodev/remote-signer';
import {toECDSASigner} from '@zerodev/permissions/signers';
import {
  ModularSigner,
  deserializePermissionAccount,
  serializePermissionAccount,
  toPermissionValidator,
} from '@zerodev/permissions';
// import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {http, Hex, createPublicClient, Address, zeroAddress} from 'viem';
import {
  createKernelAccount,
  createKernelAccountClient,
  addressToEmptyAccount,
} from '@zerodev/sdk';
import {getZerodevSigner} from './getZerodevSigner';
import {ENTRYPOINT_ADDRESS_V07} from 'permissionless';
// import { KERNEL_V3_1 } from "@zerodev/sdk/constants";

const entryPoint = ENTRYPOINT_ADDRESS_V07;

export const getSessionKey = async (accounto: any) => {
  if (
    !process.env.NEXT_PUBLIC_BUNDLER_RPC ||
    !process.env.NEXT_PUBLIC_PAYMASTER_RPC ||
    !process.env.NEXT_PUBLIC_PRIVATE_KEY
  ) {
    throw new Error('BUNDLER_RPC or PAYMASTER_RPC or PRIVATE_KEY is not set');
  }
  const remoteSigner = await toRemoteSigner({
    apiKey: process.env.NEXT_PUBLIC_PRIVATE_KEY,
    mode: RemoteSignerMode.Create,
  });

  const sessionKeySigner = toECDSASigner({
    signer: remoteSigner,
  });

  // const ecdsaValidator = await signerToEcdsaValidator(publicClient, {
  //   entryPoint,
  //   kernelVersion,
  //   signer,
  // })

  const {ecdsaValidator, smartAccountSigner} = await getZerodevSigner(accounto);

  const sessionKeyAddress = sessionKeySigner.account.address;

  // Create an "empty account" as the signer -- you only need the public
  // key (address) to do this.
  const emptyAccount = addressToEmptyAccount(sessionKeyAddress);
  const emptySessionKeySigner = await toECDSASigner({signer: emptyAccount});

  const publicClient = createPublicClient({
    transport: http(process.env.BUNDLER_RPC),
  });

  const permissionPlugin = await toPermissionValidator(publicClient, {
    entryPoint,
    kernelVersion: 'KERNEL_V3_1',
    signer: emptySessionKeySigner,
    policies: [
      // your policies
    ],
  });

  const sessionKeyAccountKernel = await createKernelAccount(publicClient, {
    entryPoint,
    // kernelVersion: KERNEL_V3_1,
    plugins: {
      sudo: ecdsaValidator,
      regular: permissionPlugin,
    },
  });

  const approval = await serializePermissionAccount(sessionKeyAccountKernel);
};

// export const getDeserializedSessionKey

// Using a stored private key
// const sessionKeySignerUse = await toECDSASigner({
//   signer: smartAccountSigner,
// })

// const sessionKeyAccountDeserialized = await deserializePermissionAccount(
//   publicClient,
//   entryPoint,
//   KERNEL_V3_1,
//   approval,
//   sessionKeySigner
// )

// const kernelClient = createKernelAccountClient({
//   account: sessionKeyAccount,

//   // the other params
// })
