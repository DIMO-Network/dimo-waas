import { NextRequest, NextResponse } from "next/server";
import {
  CodeDeliveryRequest,
  CodeAuthenticationRequest,
} from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import {
  forwardSignedActivity,
  supportStamperClient,
} from "@/src/clients/turnkey";

import {InitOtpAuthResponse, OtpAuthResponse, RootError} from "@/src/models/activity-response";

const POST = async (request: NextRequest) => {
  let payload: CodeDeliveryRequest;

  try {
    payload = (await request.json()) as CodeDeliveryRequest;
  } catch (error) {
    console.error("Invalid JSON payload", error);
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
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
    const stamped = await supportStamperClient.stampInitOtpAuth({
        type: "ACTIVITY_TYPE_INIT_OTP_AUTH",
        organizationId: subOrganizationId!,
        timestampMs: Date.now().toString(),
        parameters: {
          otpType: "OTP_TYPE_EMAIL",
          contact: email,
          emailCustomization: {
            appName: "DIMO",
          },
        }
      });

    const response = await forwardSignedActivity(stamped);

    if (!response.success) {
      const error = response.response as RootError;
      return NextResponse.json(
          { error: error.message },
          { status: 400 },
      );
    }

    const { activity } = response.response as InitOtpAuthResponse;

    otpId = activity.result.initOtpAuthResult.otpId;
  } catch (e) {
    console.error("Error sending OTP code.", e);
    return NextResponse.json(
      { error: "Failed to send OTP code" },
      { status: 400 },
    );
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
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
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

  try {
    const { subOrganizationId } = user;
    const stamped = await supportStamperClient.stampOtpAuth({
      type: "ACTIVITY_TYPE_OTP_AUTH",
      timestampMs: Date.now().toString(),
      organizationId: subOrganizationId!,
      parameters: {
        otpId: otpId,
        otpCode: otpCode,
        targetPublicKey: key,
        apiKeyName: "OTP Key",
        expirationSeconds: "900",
        invalidateExisting: true,
      },
    });

    const result = await forwardSignedActivity(stamped);

    if (!result.success) {
      const error = result.response as RootError;
      return NextResponse.json(
          { error: error.message },
          { status: 400 },
      );
    }

    const { activity } = result.response as OtpAuthResponse;

    const { credentialBundle, apiKeyId, userId } = activity.result.otpAuthResult;

    if (!credentialBundle || !apiKeyId || !userId) {
      throw new Error(
          "Expected non-null values for credentialBundle, apiKeyId, and userId.",
      );
    }

    return Response.json({ credentialBundle }, { status: 200 });
  } catch (e) {
    return NextResponse.json(
      { error: "Failed to authenticate with OTP code" },
      { status: 400 },
    );
  }
};
export { POST, PUT };
