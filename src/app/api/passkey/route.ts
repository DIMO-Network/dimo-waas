import {NextRequest, NextResponse} from 'next/server';
import {PasskeyWalletRequest} from '@/lib/utils/types';
import {createWalletWithPasskey} from '@/lib/_turnkey/passkeyWallet';

export async function POST (request: NextRequest) {
  const response = request.json().then((data: PasskeyWalletRequest) => {
    return createWalletWithPasskey(data);
  });

  return NextResponse.json(response);
}
