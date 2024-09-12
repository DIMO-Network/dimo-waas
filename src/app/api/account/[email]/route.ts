import { NextRequest, NextResponse } from "next/server";
import { UserRegisteredRequest } from "@/src/models/account";
import { checkUserRegistered } from "@/src/services/user.service";

const GET = async (
  _: NextRequest,
  { params }: { params: UserRegisteredRequest },
) => {

  const { email } = params;

  if (!email) {
    return NextResponse.json({ error: "No email provided" }, { status: 400 });
  }

  const response = await checkUserRegistered(email);

  if (!response) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json(response);
};

export { GET };
