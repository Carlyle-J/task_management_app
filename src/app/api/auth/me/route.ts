// Returns the currently logged in user's info from their JWT token

import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = requireAuth(request);

  if (errorResponse) return errorResponse;

  return NextResponse.json(
    {
      username: user!.username,
      role: user!.role,
      userId: user!.userId,
    },
    { status: 200 }
  );
}
