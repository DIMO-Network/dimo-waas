import { NextRequest, NextResponse } from "next/server";
import {
  EmailAuthRequest,
  CodeDeliveryRequest,
  CodeAuthenticationRequest,
} from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { turnkeySupportClient } from "@/src/clients/turnkey";

const POST = async (request: NextRequest) => {
  let payload: CodeDeliveryRequest;

  try {
    payload = (await request.json()) as CodeDeliveryRequest;
  } catch (error) {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

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
    return NextResponse.json(
      { error: "User email not verified" },
      { status: 400 },
    );
  }

  const { subOrganizationId } = user;

  let otpId: string;

  try {
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
    otpId = initResponse.otpId;
  }catch (e){
    console.error('Error sending OTP code.', e);
    return NextResponse.json({ error: "Failed to send OTP code" }, { status: 400 });
  }

  console.info("Sent otp request to email and otpId.", email, otpId);
  if (!otpId) {
    throw new Error("Expected non-null values for otpId.");
  }

  return Response.json({ otpId }, { status: 201 });
};

const PUT = async (request: NextRequest) => {
  let payload: CodeAuthenticationRequest;

  try {
    payload = (await request.json()) as CodeAuthenticationRequest;
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  if (!payload) {
    return NextResponse.json({ error: "No payload provided" }, { status: 400 });
  }

  const { email, otpId, otpCode, key } = payload;

  console.info("Received request to login with otpcode.", email, otpId);

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

  try {
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
    console.info("Returning bundle to user.", email, apiKeyId, userId);
    if (!credentialBundle || !apiKeyId || !userId) {
      throw new Error(
          "Expected non-null values for credentialBundle, apiKeyId, and userId."
      );
    }

    return Response.json({ credentialBundle }, { status: 200 });
  } catch (e) {
    console.error("Error authenticating with OTP code.", e);
    return NextResponse.json({ error: "Failed to authenticate with OTP code" }, { status: 400 });
  }
};
export { POST, PUT };
