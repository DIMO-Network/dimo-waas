import {
  createKernelAccount,
  createZeroDevPaymasterClient,
  createKernelAccountClient,
} from '@zerodev/sdk';
import {signerToEcdsaValidator} from '@zerodev/ecdsa-validator';
import {ENTRYPOINT_ADDRESS_V07, bundlerActions} from 'permissionless';
import {http, Hex, createPublicClient, zeroAddress} from 'viem';
import {privateKeyToAccount} from 'viem/accounts';
import {polygonAmoy} from 'viem/chains';
import {getZerodevSigner} from './getZerodevSigner';

if (
  !process.env.NEXT_PUBLIC_BUNDLER_RPC ||
  !process.env.NEXT_PUBLIC_PAYMASTER_RPC ||
  !process.env.NEXT_PUBLIC_PRIVATE_KEY
) {
  throw new Error('BUNDLER_RPC or PAYMASTER_RPC or PRIVATE_KEY is not set');
}

const publicClient = createPublicClient({
  transport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
});

const signer = privateKeyToAccount(process.env.NEXT_PUBLIC_PRIVATE_KEY as Hex);
const chain = polygonAmoy;
const entryPoint = ENTRYPOINT_ADDRESS_V07;

export const sendSponsoredWrite = async (
  accounto: any,
  transactionData: any,
) => {
  const ecdsaValidator = await getZerodevSigner(accounto);

  const account = await createKernelAccount(publicClient, {
    plugins: {
      sudo: ecdsaValidator,
    },
    entryPoint,
  });
  console.log('My account:', account.address);

  const kernelClient = createKernelAccountClient({
    account,
    entryPoint,
    chain,
    bundlerTransport: http(process.env.NEXT_PUBLIC_BUNDLER_RPC),
    middleware: {
      sponsorUserOperation: async ({userOperation}) => {
        const paymasterClient = createZeroDevPaymasterClient({
          chain,
          transport: http(process.env.NEXT_PUBLIC_PAYMASTER_RPC),
          entryPoint,
        });
        return paymasterClient.sponsorUserOperation({
          userOperation,
          entryPoint,
        });
      },
    },
  });
  console.log({kernelClient});
  const userOpHash = await kernelClient.sendUserOperation({
    userOperation: {
      callData: await account.encodeCallData({
        to: transactionData.to,
        value: BigInt(0),
        data: '0x',
      }),
    },
  });

  console.log('userOp hash:', userOpHash);

  const bundlerClient = kernelClient.extend(bundlerActions(entryPoint));
  const _receipt = await bundlerClient.waitForUserOperationReceipt({
    hash: userOpHash,
  });

  console.log('userOp completed');
  _receipt.logs.forEach(log => {
    console.log(log);
  });
  return _receipt;
};

// main()
