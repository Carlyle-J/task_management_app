
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = "tododb";

//fetch aaall users with todo counts
export async function GET(request: NextRequest) {
  const { user, errorResponse } = requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const usersCollection = db.collection("users");
    const todosCollection = db.collection("todos");

    // this is to get all the userss
    const users = await usersCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    // For each user, get their todo counts
    const usersWithStats = await Promise.all(
      users.map(async (u) => {
        const [totalTodos, completedTodos] = await Promise.all([
          todosCollection.countDocuments({ username: u.username }),
          todosCollection.countDocuments({ username: u.username, completed: true }),
        ]);

        return {
          id: u._id.toString(),
          username: u.username,
          email: u.email,
          role: u.role || "user",
          createdAt: u.createdAt,
          totalTodos,
          completedTodos,
          activeTodos: totalTodos - completedTodos,
        };
      })
    );

    return NextResponse.json({ users: usersWithStats }, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/users error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

// changin a users role
export async function PATCH(request: NextRequest) {
  const { user, errorResponse } = requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["admin", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Role must be either 'admin' or 'user'" },
        { status: 400 }
      );
    }

    // Prevent admin from demoting themselves
    if (id === user!.userId) {
      return NextResponse.json(
        { error: "You cannot change your own role" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { role } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, newRole: role }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/admin/users error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to update user role" }, { status: 500 });
  }
}
