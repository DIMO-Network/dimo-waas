import {parseAbi, parseEther} from 'viem';
import {useKernelClient, useSendUserOperation} from '@zerodev/waas';
import {useCreateKernelClientPasskey} from '@zerodev/waas';
export const abiBase = [
  {
    type: 'function',
    name: 'approve',
    stateMutability: 'nonpayable',
    inputs: [
      {name: 'spender', type: 'address'},
      {name: 'amount', type: 'uint256'},
    ],
    outputs: [{type: 'bool'}],
  },
  {
    type: 'function',
    name: 'transferFrom',
    stateMutability: 'nonpayable',
    inputs: [
      {name: 'sender', type: 'address'},
      {name: 'recipient', type: 'address'},
      {name: 'amount', type: 'uint256'},
    ],
    outputs: [{type: 'bool'}],
  },
] as const;

const ZerodevTransaction = () => {
  const {address} = useKernelClient();
  const {
    connectRegister,
    status,
    data: kernelData,
  } = useCreateKernelClientPasskey({
    version: 'v3',
  });
  const {
    data: userOpHash,
    write,
    isPending,
    error,
  } = useSendUserOperation({
    paymaster: {
      type: 'SPONSOR',
    },
  });
  // console.log('ZERODEVTRANSACTION', {address});
  // const tokenAddress = "0x3870419Ba2BBf0127060bCB37f69A1b1C090992B";
  // const tokenAddress = "0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582";
  const tokenAddress = '0x0000000000000000000000000000000000001010';
  // const abi = parseAbi(['function mint(address _to, uint256 amount) public']);
  // const abi = parseAbi(["function mint(address _to) public"]);
  // const abi = parseAbi(abiBase);
  // 0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0;
  console.log({kernelData});
  console.log({address});
  return (
    /* ...Create & Get Smart Account */
    <div>
      <button
        disabled={isPending}
        onClick={() => {
          connectRegister({username: 'zerodev_quickstart1111'});
        }}>
        {status === 'pending' ? 'Connecting...' : 'Create Smart Account'}
      </button>
      <button
        disabled={isPending}
        onClick={() => {
          write([
            // {
            //   address: tokenAddress,
            //   abi: abi,
            //   functionName: "approve",
            //   args: [address, parseEther("1000000000000000000")],
            // },
            {
              address: tokenAddress,
              abi: abiBase,
              functionName: 'transferFrom',
              args: [
                address,
                '0x9916caf06747F8a5458CE69c4A071555903F7b62',
                parseEther('10000'),
              ],
              // gas: BigInt(55000),
              value: BigInt(10000),
            },
            // {
            //   address: tokenAddress,
            //   abi: abi,
            //   functionName: 'mint',
            //   args: [address, parseEther('0')],
            //   value: BigInt(0),
            // },
          ]);
        }}>
        {isPending ? 'Minting...' : 'Mint'}
      </button>
      {userOpHash && <p>{`UserOp Hash: ${userOpHash}`}</p>}
      <p>{error ? `${error}` : 'no error'}</p>
    </div>
  );
};

export default ZerodevTransaction;
