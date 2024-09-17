-- AlterTable
ALTER TABLE "User" ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smartContractAddress" TEXT,
ADD COLUMN     "walletAddress" TEXT,
ALTER COLUMN "subOrganizationId" DROP NOT NULL;
