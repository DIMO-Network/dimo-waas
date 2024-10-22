import { NextRequest, NextResponse } from "next/server";
import { UserRegisteredRequest } from "@/src/models/account";
import { getUserByEmail } from "@/src/services/user.service";
import { deploySmartContractAccount } from "@/src/services/wallet.service";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as UserRegisteredRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email } = payload;

  console.info("Received request to deploy smart contract account.", payload);
  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { emailVerified, smartContractAddress } = user;

  if (!emailVerified) {
    return NextResponse.json({ error: "Email not verified" }, { status: 400 });
  }

  if (smartContractAddress) {
    return NextResponse.json(
      { error: "Smart contract already deployed" },
      { status: 400 },
    );
  }

  const deployedUserData = await deploySmartContractAccount(email);

  return NextResponse.json(deployedUserData, { status: 201 });
};

export { POST };
