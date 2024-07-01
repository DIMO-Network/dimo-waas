import {NextRequest, NextResponse} from 'next/server';
import {createWallet} from '@/lib/_turnkey/wallet';
import {TransactionRequest} from '@/lib/utils/types';
import {createTransactionChannel} from '@/lib/_turnkey/transaction';

export async function POST (request: NextRequest) {
  const response = request.json().then((data: TransactionRequest) => {
    const walletData = data.walletAddresses?.length > 0
      ? data.walletAddresses[0]
      : createWallet().then(response => response.addresses[0]);

    return createTransactionChannel(walletData)
  });

  return NextResponse.json(response);
}
