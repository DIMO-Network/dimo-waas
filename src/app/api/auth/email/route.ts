import { NextRequest, NextResponse } from "next/server";
import { EmailAuthRequest } from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import {
  forwardSignedActivity,
  supportStamperClient,
  turnkeySupportClient,
} from "@/src/clients/turnkey";
import { RootError } from "@/src/models/activity-response";

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

  try {
    console.info("Initiated email auth for .", email);
    // TODO: need to move this to a service, and set the correct logoUrl
    const signedRequest = await supportStamperClient.stampEmailAuth({
      type: "ACTIVITY_TYPE_EMAIL_AUTH_V2",
      organizationId: subOrganizationId!,
      timestampMs: Date.now().toString(),
      parameters: {
        email: email,
        targetPublicKey: key,
        invalidateExisting: true,
      },
    });

    const response = await forwardSignedActivity(signedRequest);

    if (!response.success) {
      const error = response.response as RootError;
      console.error("Error initiating email auth.", error.message);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
  } catch (e) {
    console.error("Error initiating email auth.", e);
    return NextResponse.json(
      { error: "Failed to initiate email auth" },
      { status: 400 },
    );
  }

  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

export { POST };
