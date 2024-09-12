import { UserRegisteredResponse } from "@/src/models/account";
import { PrismaClient } from "@prisma/client";

export const checkUserRegistered = async (
  email: string,
): Promise<UserRegisteredResponse> => {
  const prismaClient = new PrismaClient();
  try {
    const user = await prismaClient.user.findUnique({
      where: {
        email: email,
      },
    });

    if (!user) {
      return {};
    }

    return {
      subOrganizationId: user.subOrganizationId,
      hasPasskey: user.hasPasskey,
    };
  } finally {
    prismaClient.$disconnect();
  }
};

export const upsertUser = async (user: {
  email: string;
  subOrganizationId: string;
  hasPasskey: boolean;
}) => {
  const prismaClient = new PrismaClient();
  try {
    await prismaClient.user.upsert({
      where: {
        email: user.email,
      },
      update: {
        subOrganizationId: user.subOrganizationId,
        hasPasskey: user.hasPasskey,
      },
      create: {
        email: user.email,
        subOrganizationId: user.subOrganizationId,
        hasPasskey: user.hasPasskey,
      },
    });
  } finally {
    prismaClient.$disconnect();
  }
};
