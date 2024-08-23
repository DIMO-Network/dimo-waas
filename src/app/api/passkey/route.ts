import {NextRequest, NextResponse} from 'next/server';
import {PasskeyWalletRequest} from '@/lib/utils/types';
import {createWalletWithPasskey} from '@/lib/_turnkey/passkeyWallet';
import {PrismaClient} from "@prisma/client";

export async function POST (request: NextRequest) {
  const prismaClient = new PrismaClient();
  try {
    const payload: PasskeyWalletRequest = await request.json();

    if (!payload) {
      return NextResponse.json({ error: 'No payload provided' }, { status: 400 });
    }

    console.info('Payload: ', payload);

    const wallet = await createWalletWithPasskey(payload);

    if (!wallet) {
      return NextResponse.json({ error: 'Error creating wallet' }, { status: 500 });
    }

    await prismaClient.user.create({
      data: {
        email: payload.email,
        subOrganizationId: wallet.subOrganizationId
      }
    });

    /*const response = request.json().then((data: PasskeyWalletRequest) => {
      return createWalletWithPasskey(data);
    });*/

    return NextResponse.json(wallet, { status: 200 });
  } finally {
    await prismaClient.$disconnect();
  }
}
