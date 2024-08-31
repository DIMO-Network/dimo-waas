import {NextRequest, NextResponse} from 'next/server';
import {PasskeyWalletRequest} from '@/lib/utils/types';
import {
  createAccountAndWallet,
  createAccountAndWalletWithPasskey,
} from '@/lib/_turnkey/passkeyWallet';
import {PrismaClient} from '@prisma/client';

export async function POST(request: NextRequest) {
  const prismaClient = new PrismaClient();
  try {
    const payload: {email: string} = await request.json();

    console.info(payload);

    if (!payload) {
      return NextResponse.json({error: 'No payload provided'}, {status: 400});
    }

    const wallet = await createAccountAndWallet(payload);

    if (!wallet) {
      return NextResponse.json({error: 'Error creating wallet'}, {status: 500});
    }

    await prismaClient.user.create({
      data: {
        email: payload.email,
        subOrganizationId: wallet.subOrganizationId,
      },
    });

    return NextResponse.json(wallet, {status: 200});
  } finally {
    await prismaClient.$disconnect();
  }
}
