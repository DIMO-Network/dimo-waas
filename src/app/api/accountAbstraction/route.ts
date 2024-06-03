import {NextRequest, NextResponse} from 'next/server';
import {sendSponsoredWrite} from '@/lib/_zerodev/sendSponsoredWrite';

export async function POST(request: NextRequest) {
  const response = request.json().then(() => {
    return sendSponsoredWrite();
  });

  return NextResponse.json(response);
}
