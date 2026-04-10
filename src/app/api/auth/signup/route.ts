/*Notes to self
 - validate input
- hash the password with bcrypt before saving
- assign a role (first user ever becomes admin, rest are regular users)
*/

import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import clientPromise from "@/lib/mongodb";

const DB_NAME = "tododb";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: "Username, email and password are required" },
        { status: 400 }
      );
    }

    if (username.trim().length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (password.length < 5) {
      return NextResponse.json(
        { error: "Password must be at least 5 characters" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const users = db.collection("users");

    // check if username and email already taken
    const existingUsername = await users.findOne({ username });
    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already taken. Please choose another." },
        { status: 409 }
      );
    }

    const existingEmail = await users.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // make first user admin
    const userCount = await users.countDocuments();
    const role = userCount === 0 ? "admin" : "user";

    // save the new user with the hashed password
    const newUser = {
      username,
      email,
      password: hashedPassword, 
      role,                      
      createdAt: new Date().toISOString(),
    };

    await users.insertOne(newUser);

    return NextResponse.json(
      {
        success: true,
        message: `Account created successfully${role === "admin" ? " (Admin)" : ""}`,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/auth/signup error:",
      JSON.stringify(error, Object.getOwnPropertyNames(error))
    );
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
