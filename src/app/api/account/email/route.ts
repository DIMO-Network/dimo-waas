import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { createOrganizationAndSendEmail } from "@/src/services/wallet.service";
import {turnkeySupportClient} from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
  let payload: EmailAuthRequest;

  try {
    payload = (await request.json()) as EmailAuthRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, key, origin, redirectUrl } = payload;

  console.info("Received request to initiate email.", payload);
  //TODO: make this a function to validate the payload
  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  if (!key) {
    return NextResponse.json({ error: "No key provided" }, { status: 400 });
  }

  const user = await getUserByEmail(email);

  if (user) {
    const { emailVerified, subOrganizationId } = user;
    if (!emailVerified) {
      // TODO: need to move this to a service, and set the correct logoUrl
      const response = await turnkeySupportClient.emailAuth({
        organizationId: subOrganizationId!,
        email: email,
        targetPublicKey: key,
        invalidateExisting: true
      });

      console.info("resending verification email for .", email, response);

      // this is so vercel doesn't complain about not returning a response
      return new Response(null, { status: 204 });
    }

    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  await createOrganizationAndSendEmail(payload);

  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

export { POST };
