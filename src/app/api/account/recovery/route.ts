import { NextRequest, NextResponse } from "next/server";
import {
  EmailRecoveryRequest,
  PasskeyRecoveryRequest,
} from "@/src/models/auth";
import { getUserByEmail } from "@/src/services/user.service";
import {
  forwardSignedActivity,
  stamperClient,
  turnkeySupportClient,
} from "@/src/clients/turnkey";
import { RootError } from "@/src/models/activity-response";

const POST = async (request: NextRequest) => {
  let payload: EmailRecoveryRequest;

  try {
    payload = (await request.json()) as EmailRecoveryRequest;
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

  console.info("Received request to initiate recovery.", payload);
  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { subOrganizationId } = user;

  await turnkeySupportClient.initUserEmailRecovery({
    organizationId: subOrganizationId!,
    email: email,
    targetPublicKey: key,
    emailCustomization: {
      appName: origin,
      magicLinkTemplate: `${redirectUrl}&token=%s`,
    },
  });

  console.info("Recovery initiated.", payload);

  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

const PUT = async (request: NextRequest) => {
  let payload: PasskeyRecoveryRequest;
  try {
    payload = (await request.json()) as PasskeyRecoveryRequest;
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

  const { signedRecoveryRequest, signedAuthenticatorRemoval } = payload;

  if (!signedRecoveryRequest) {
    return NextResponse.json(
      { error: "No signed recovery request provided" },
      { status: 400 },
    );
  }

  if (!signedAuthenticatorRemoval) {
    return NextResponse.json(
      { error: "No signed authenticator removal request provided" },
      { status: 400 },
    );
  }

  const authenticatorResponse = await forwardSignedActivity(
    signedAuthenticatorRemoval,
  );

  if (!authenticatorResponse.success) {
    const error = authenticatorResponse.response as RootError;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const recoveryResponse = await forwardSignedActivity(signedRecoveryRequest);

  if (!recoveryResponse.success) {
    const error = recoveryResponse.response as RootError;
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  console.info("Recovery complete.", payload);
  return new Response(null, { status: 204 });
};

export { POST, PUT };
