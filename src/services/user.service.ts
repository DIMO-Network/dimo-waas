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
