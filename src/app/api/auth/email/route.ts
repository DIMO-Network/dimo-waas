import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { checkUserRegistered } from "@/src/services/user.service";
import { turnkeyClient } from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as EmailAuthRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, redirectUrl, key, origin } = payload;

  const user = await checkUserRegistered(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { subOrganizationId } = user;

  // TODO: need to move this to a service, and set the correct logoUrl
  await turnkeyClient.emailAuth({
    organizationId: subOrganizationId,
    email: email,
    targetPublicKey: key,
    emailCustomization: {
      appName: `DIMO ${origin}`,
      logoUrl: "https://explorer.dimo.zone/images/misc/dimo.svg",
      magicLinkTemplate: `${redirectUrl}&token=%s`,
    },
  });
};

export { POST };
