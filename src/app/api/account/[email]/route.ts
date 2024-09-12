import { NextRequest, NextResponse } from "next/server";
import { UserRegisteredRequest } from "@/src/models/account";
import { checkUserRegistered } from "@/src/services/user.service";

const GET = async (
  _: NextRequest,
  { params }: { params: UserRegisteredRequest },
) => {
  const { email } = params;

  const response = await checkUserRegistered(email);

  return NextResponse.json(response);
};

export { GET };
