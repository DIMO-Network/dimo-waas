import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { createOrganizationAndSendEmail } from "@/src/services/wallet.service";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as EmailAuthRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, key, origin, redirectUrl } = payload;


  //TODO: make this a function to validate the payload
  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  if (!key) {
    return NextResponse.json({ error: "No key provided" }, { status: 400 });
  }

  const user = await getUserByEmail(email);

  if (user) {
    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  await createOrganizationAndSendEmail(payload);

  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

export { POST };
