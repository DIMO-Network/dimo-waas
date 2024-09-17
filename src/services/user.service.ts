import { User, UserRegisteredResponse } from "@/src/models/account";
import { PrismaClient } from "@prisma/client";

export const getUserByEmail = async (
  email: string,
): Promise<UserRegisteredResponse | null> => {
  const prismaClient = new PrismaClient();
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return null;
    }

    return {
      subOrganizationId: user.subOrganizationId,
      hasPasskey: user.hasPasskey,
      emailVerified: user.emailVerified,
      walletAddress: user.walletAddress,
      smartContractAddress: user.smartContractAddress,
    };
  } finally {
    prismaClient.$disconnect();
  }
};

export const upsertUser = async (user: User) => {
  const prismaClient = new PrismaClient();
  try {
    await prismaClient.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        ...user,
      },
      create: {
        ...user,
      },
    });
  } finally {
    prismaClient.$disconnect();
  }
};
