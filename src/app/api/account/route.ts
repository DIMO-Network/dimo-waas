import { NextRequest, NextResponse } from "next/server";
import { AccountCreateRequest } from "@/src/models/account";
import { createOnChainAccount } from "@/src/services/wallet.service";
import { getUserByEmail } from "@/src/services/user.service";

const POST = async (request: NextRequest) => {
  let payload: AccountCreateRequest;

  try {
    payload = (await request.json()) as AccountCreateRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const user = await getUserByEmail(payload.email);

  if (user) {
    return NextResponse.json(
      { error: "User already registered" },
      { status: 400 },
    );
  }

  const account = await createOnChainAccount(payload);

  return NextResponse.json(account);
};

export { POST };
