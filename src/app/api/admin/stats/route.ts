
import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

const DB_NAME = "tododb";

export async function GET(request: NextRequest) {
  const { user, errorResponse } = requireAdmin(request);
  if (errorResponse) return errorResponse;

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const usersCollection = db.collection("users");
    const todosCollection = db.collection("todos");

    const [
      totalUsers,
      totalTodos,
      completedTodos,
      activeTodos,
    ] = await Promise.all([
      usersCollection.countDocuments(),
      todosCollection.countDocuments(),
      todosCollection.countDocuments({ completed: true }),
      todosCollection.countDocuments({ completed: false }),
    ]);

    // Get new users in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsersThisWeek = await usersCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo.toISOString() },
    });

    // Get new todos in the last 7 days
    const newTodosThisWeek = await todosCollection.countDocuments({
      createdAt: { $gte: sevenDaysAgo.toISOString() },
    });

    return NextResponse.json({
      totalUsers,
      totalTodos,
      completedTodos,
      activeTodos,
      newUsersThisWeek,
      newTodosThisWeek,
      completionRate: totalTodos > 0
        ? Math.round((completedTodos / totalTodos) * 100)
        : 0,
    }, { status: 200 });

  } catch (error) {
    console.error("GET /api/admin/stats error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
