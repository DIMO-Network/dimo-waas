import {PrismaClient} from '@prisma/client';
import {NextRequest, NextResponse} from 'next/server';
import {turnkeyApiClient} from '@/lib/_turnkey/turnkeyClient';

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const prismaClient = new PrismaClient();

  try {
    const user = await prismaClient.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (!user) {
      return NextResponse.json({subOrganizationId: null});
    }

    const {userId, apiKeyId} = await turnkeyApiClient.emailAuth({
      organizationId: user.subOrganizationId,
      email: body.email,
      targetPublicKey: body.targetPublicKey,
      emailCustomization: {
        appName: 'DIMO',
        logoUrl: 'https://explorer.dimo.zone/images/misc/dimo.svg',
        magicLinkTemplate: 'http://localhost:3000/email-auth?token=%s',
      },
    });

    return NextResponse.json({
      subOrganizationId: user.subOrganizationId,
      userId: userId,
      apiKeyId: apiKeyId,
    });
  } finally {
    await prismaClient.$disconnect();
  }
};
