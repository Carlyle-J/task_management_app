
// this is Middleware helper to protect API routes
//basically Any route that needs authentication calls this function first

import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";

// extract and verify the JWT token from the request cookies or Authorization header
export function getAuthUser(request: NextRequest): JwtPayload | null {
  const cookieToken = request.cookies.get("auth_token")?.value;

  const authHeader = request.headers.get("Authorization");
  const headerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const token = cookieToken || headerToken;

  if (!token) return null;

  return verifyToken(token);
}
//protected routes
export function requireAuth(request: NextRequest): {
  user: JwtPayload | null;
  errorResponse: NextResponse | null;
} {
  const user = getAuthUser(request);

  if (!user) {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Unauthorized. Please log in." },
        { status: 401 }
      ),
    };
  }

  return { user, errorResponse: null };
}

//admin-only routes
export function requireAdmin(request: NextRequest): {
  user: JwtPayload | null;
  errorResponse: NextResponse | null;
} {
  const { user, errorResponse } = requireAuth(request);

  if (errorResponse) return { user: null, errorResponse };

  if (user?.role !== "admin") {
    return {
      user: null,
      errorResponse: NextResponse.json(
        { error: "Forbidden. Admin access required." },
        { status: 403 }
      ),
    };
  }

  return { user, errorResponse: null };
}
