-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "subOrganizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hasPasskey" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
