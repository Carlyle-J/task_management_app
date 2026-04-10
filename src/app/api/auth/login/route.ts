// heck username exists in MongoDB
// Use bcrypt to compare hashed password
// return  a JWT token in an HTTP-only cookie

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";

const DB_NAME = "tododb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username and password are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    //find the user by username
    const user = await users.findOne({ username });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    // create a JWT token with user info and their role
    const token = signToken({
      userId: user._id.toString(),
      username: user.username,
      role: user.role || "user",
    });

    const response = NextResponse.json(
      {
        success: true,
        username: user.username,
        role: user.role || "user",
      },
      { status: 200 }
    );

    // Set the JWT as a secure cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,      // js can't access this cookie (prevents XSS attacks)
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // this is 7 days in seconds
      path: "/",
    });

    return response;
  } catch (error) {
    console.error(
      "POST /api/auth/login error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
