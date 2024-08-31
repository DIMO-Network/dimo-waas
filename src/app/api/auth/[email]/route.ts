import {NextRequest, NextResponse} from 'next/server';
import {PrismaClient} from '@prisma/client';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';

export const GET = async (
  _: NextRequest,
  {params}: {params: {email: string}},
) => {
  const prismaClient = new PrismaClient();
  try {
    console.info(params);

    const user = await prismaClient.user.findUnique({
      where: {
        email: params.email,
      },
    });

    if (!user) {
      return NextResponse.json({subOrganizationId: null});
    }

    return NextResponse.json({
      subOrganizationId: user.subOrganizationId,
      hasPasskey: user.hasPasskey,
    });
  } finally {
    await prismaClient.$disconnect();
  }
};
