import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import { createOrganizationAndSendEmail } from "@/src/services/wallet.service";
import { forwardSignedActivity, supportStamperClient, turnkeySupportClient } from "@/src/clients/turnkey";
import { InitOtpAuthResponse, RootError } from "@/src/models/activity-response";

const POST = async (request: NextRequest) => {
  let payload: EmailAuthRequest;

  try {
    payload = (await request.json()) as EmailAuthRequest;
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
      try {
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
          },
        });
    
        const response = await forwardSignedActivity(stamped);

        if (!response.success) {
          const error = response.response as RootError;
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
    
        const { activity } = response.response as InitOtpAuthResponse;

        const otpId = activity.result.initOtpAuthResult.otpId;

        console.info("resending otp request to email and otpId.", email, otpId);
        if (!otpId) {
          throw new Error("Expected non-null values for otpId.");
        }
      } catch (e) {
        console.error("Error resending verification email.", e);
        return NextResponse.json(
          { error: "Failed to resend verification email" },
          { status: 400 },
        );
      }
    }

    return NextResponse.json({ error: "User already exists" }, { status: 400 });
  }

  const otpId = await createOrganizationAndSendEmail(payload);

  return NextResponse.json({ otpId }, { status: 201 });
};

export { POST };
