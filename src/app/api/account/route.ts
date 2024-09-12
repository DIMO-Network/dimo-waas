import { NextResponse } from "next/server";
import { AccountCreateRequest } from "@/src/models/account";
import { createOnChainAccount } from "@/src/services/wallet.service";

const POST = async (request: NextResponse) => {
  const payload = (await request.json()) as AccountCreateRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const account = await createOnChainAccount(payload);

  return NextResponse.json(account);
};

export { POST };
