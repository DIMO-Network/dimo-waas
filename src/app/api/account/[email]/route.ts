import { NextRequest, NextResponse } from "next/server";
import { UserRegisteredRequest } from "@/src/models/account";
import { getUserByEmail } from "@/src/services/user.service";

const GET = async (
  _: NextRequest,
  { params }: { params: Promise<UserRegisteredRequest> },
) => {
  const { email } = await params;

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  console.info(`Checking user registration for ${email}`);

  const user = await getUserByEmail(email);

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(user);
};

export { GET };
