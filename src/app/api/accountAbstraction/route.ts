import {NextRequest, NextResponse} from 'next/server';
import {sendSponsoredWrite} from '@/lib/_zerodev/sendSponsoredWrite';

export async function POST (request: NextRequest): Promise<NextResponse<Promise<any>>> {
  const response = request.json().then(() => {
    return sendSponsoredWrite();
  });

  return NextResponse.json(response);
}
