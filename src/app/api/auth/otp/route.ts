import { NextRequest, NextResponse } from "next/server";
import {
  EmailAuthRequest,
  CodeDeliveryRequest,
  CodeAuthenticationRequest,
} from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { turnkeySupportClient } from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as CodeDeliveryRequest;
  

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, redirectUrl } = payload;
  console.info("Received request to send otp code.", email);
  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: "User email not verified" }, { status: 400 });
  }

  const { subOrganizationId } = user;
<<<<<<< HEAD

=======
>>>>>>> staging
  // TODO: need to move this to a service, and set the correct logoUrl
  const initResponse = await turnkeySupportClient.initOtpAuth({
    organizationId: subOrganizationId!,
    otpType: "OTP_TYPE_EMAIL",
    contact: email,
    emailCustomization: {
      appName: "https://dimo.org",
      magicLinkTemplate: `${redirectUrl}&token=%s`,
    },
  });
  const otpId = initResponse.otpId;
<<<<<<< HEAD
=======
  console.info("Sent otp request to email and otpId", email, otpId);
>>>>>>> staging
  if (!otpId) {
    throw new Error("Expected non-null values for otpId.");
  }

<<<<<<< HEAD
  return Response.json({ otpId }, { status: 204 });
=======
  return Response.json({ otpId }, { status: 201 });
>>>>>>> staging
};

const PUT = async (request: NextRequest) => {
  const payload = (await request.json()) as CodeAuthenticationRequest;

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, otpId, otpCode, key } = payload;

<<<<<<< HEAD
=======
  console.info("Received request to login with otpcode.", email, otpId);

>>>>>>> staging
  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: "User email not verified" }, { status: 400 });
  }

  const { subOrganizationId } = user;

  const otpAuthResponse = await turnkeySupportClient.otpAuth({
    organizationId: subOrganizationId!,
    otpId: otpId,
    otpCode: otpCode,
    targetPublicKey: key,
    apiKeyName: "OTP Key",
    expirationSeconds: "900",
    invalidateExisting: true,
  });

  const { credentialBundle, apiKeyId, userId } = otpAuthResponse;
<<<<<<< HEAD

=======
  console.info("Returning bundle to user.", email, apiKeyId, userId);
>>>>>>> staging
  if (!credentialBundle || !apiKeyId || !userId) {
    throw new Error(
      "Expected non-null values for credentialBundle, apiKeyId, and userId."
    );
  }

  return Response.json({ credentialBundle }, { status: 200 });
};
export { POST, PUT };
