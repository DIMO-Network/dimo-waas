import { NextRequest, NextResponse } from "next/server";
import { AccountCreateRequest } from "@/src/models/account";
import { getUserByEmail } from "@/src/services/user.service";
import { verifyAndCreateKernelAccount } from "@/src/services/wallet.service";

const POST = async (request: NextRequest) => {
  const payload = (await request.json()) as AccountCreateRequest;

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

<<<<<<< HEAD
  await verifyAndCreateKernelAccount(payload);

=======
  const kernelAddress = await verifyAndCreateKernelAccount(payload);

  console.info("Verified account and AA deployed.", kernelAddress);
>>>>>>> staging
  // this is so vercel doesn't complain about not returning a response
  return new Response(null, { status: 204 });
};

export { POST };
