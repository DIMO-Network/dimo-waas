import { NextRequest, NextResponse } from "next/server";
import {
  AccountCreateRequest,
  AccountCreateResponse,
  UserRegisteredRequest,
} from "@/src/models/account";
import { createOnChainAccount } from "@/src/services/wallet.service";
import { checkUserRegistered } from "@/src/services/user.service";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as AccountCreateRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const user = await checkUserRegistered(payload.email);

  if (user.subOrganizationId) {
    return NextResponse.json(
      { error: "User already registered" },
      { status: 400 },
    );
  }

  const account = await createOnChainAccount(payload);

  return NextResponse.json(account);
};

const GET = async (request: NextRequest) => {
  const queryString = request.nextUrl.search.split("?")[1];

  if (!queryString) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  const email = queryString.split("=")[1];

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }
  console.info(`Checking user registration for ${email}`);

  const response = await checkUserRegistered(email);

  if (!response) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(response);
};

export { POST, GET };
