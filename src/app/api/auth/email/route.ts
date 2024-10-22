import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { turnkeySupportClient } from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as EmailAuthRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, redirectUrl, key, origin } = payload;

  console.info(
    "Received request to login with email bundle.",
    email,
    redirectUrl,
  );

  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerified) {
    return NextResponse.json(
      { error: "User email not verified" },
      { status: 400 },
    );
  }

  const { subOrganizationId } = user;

  // TODO: need to move this to a service, and set the correct logoUrl
  const response = await turnkeySupportClient.emailAuth({
    organizationId: subOrganizationId!,
    email: email,
    targetPublicKey: key,
    invalidateExisting: true
  });

  console.info("Initiated email auth for .", email, response);

  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

export { POST };
