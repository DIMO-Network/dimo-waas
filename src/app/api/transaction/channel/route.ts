import {NextRequest, NextResponse} from 'next/server';
import {TransactionRequest} from '@/lib/utils/types';
import {createTransactionChannel} from '@/lib/_turnkey/transaction';

export async function POST (request: NextRequest) {
  return request.json().then((data: TransactionRequest) => {
    if (data.walletAddresses?.length == 0) {
      return NextResponse.json({error: 'No wallet data found'}, {status: 400});
    }

    const transactionBase = createTransactionChannel(data.walletAddresses[0]);
    return NextResponse.json(transactionBase);
  });
}
