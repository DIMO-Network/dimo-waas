import { NextRequest, NextResponse } from "next/server";
import { AccountCreateRequest } from "@/src/models/account";
import { getUserByEmail } from "@/src/services/user.service";
import { verifyAndCreateKernelAccount } from "@/src/services/wallet.service";

const POST = async (request: NextRequest) => {
  let payload: AccountCreateRequest;

  try {
    payload = (await request.json()) as AccountCreateRequest;
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

  const { encodedChallenge, attestation } = payload;

  console.info("Received request to verify email.", payload);
  if (!encodedChallenge || !attestation) {
    return NextResponse.json(
      { error: "No challenge or attestation for authenticator provided" },
      { status: 400 },
    );
  }

  const user = await getUserByEmail(payload.email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const { emailVerified } = user;

  if (emailVerified) {
    return NextResponse.json(
      { error: "Email already verified" },
      { status: 400 },
    );
  }

  try {
    const kernelAddress = await verifyAndCreateKernelAccount(payload);

    console.info("Verified account and AA deployed.", kernelAddress);
    // this is so vercel doesn't complain about not returning a response
    return new Response(null, { status: 204 });
  } catch (e) {
    const error = e as Error;
    console.error("Error verifying email.", e);
    return NextResponse.json(
      { error: error.message },
      { status: 400 },
    );
  }
};

export { POST };
