
// Helper functions for creating and verifying JWT tokens

import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

if (!JWT_SECRET) {
  throw new Error("Please add JWT_SECRET to your .env.local file");
}

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

// create a token for a user after they log in
export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

// cerify and decode a token
export function verifyToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded;
  } catch (error) {
    // token is invalid or expired
    return null;
  }
}
