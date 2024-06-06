import {NextRequest, NextResponse} from 'next/server';
import {PasskeyWalletRequest} from '@/lib/utils/types';
import {createWalletWithPasskey} from '@/lib/_turnkey/passkey';

export async function POST (request: NextRequest) {
  const response = request.json().then(({encodedChallenge, attestation}: PasskeyWalletRequest) => {
    return createWalletWithPasskey(encodedChallenge, attestation);
  });

  return NextResponse.json(response);
}
