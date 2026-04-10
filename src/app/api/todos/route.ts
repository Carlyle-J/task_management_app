import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { requireAuth } from "@/lib/auth";
import { ObjectId } from "mongodb";

const DB_NAME = "tododb";

async function getCollection() {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  return db.collection("todos");
}

//fetch todos
export async function GET(request: NextRequest) {
  const { user, errorResponse } = requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const collection = await getCollection();

    let todos;
    if (user!.role === "admin") {
      // AdminS can see ALL todos from every user
      todos = await collection.find({}).sort({ createdAt: -1 }).toArray();
    } else {
      // Regular users only see their own todos
      todos = await collection
        .find({ username: user!.username })
        .sort({ createdAt: -1 })
        .toArray();
    }

    const formatted = todos.map((t) => ({
      id: t._id.toString(),
      text: t.text,
      completed: t.completed,
      dueDate: t.dueDate,
      username: t.username,
      createdAt: t.createdAt,
    }));

    return NextResponse.json({ todos: formatted }, { status: 200 });
  } catch (error) {
    console.error("GET /api/todos error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

//create a new todo
export async function POST(request: NextRequest) {
  const { user, errorResponse } = requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const body = await request.json();
    const { text, dueDate } = body;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const newTodo = {
      text,
      dueDate: dueDate || "",
      completed: false,
      username: user!.username, // always gotta use the username from the JWT, not from the request body
      createdAt: new Date().toISOString(),
    };

    const collection = await getCollection();
    const result = await collection.insertOne(newTodo);

    return NextResponse.json(
      { todo: { ...newTodo, id: result.insertedId.toString() } },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/todos error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}

//update a todo
export async function PATCH(request: NextRequest) {
  const { user, errorResponse } = requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const collection = await getCollection();

    //make sure the user owns this todo
    const todo = await collection.findOne({ _id: new ObjectId(id) });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (user!.role !== "admin" && todo.username !== user!.username) {
      return NextResponse.json(
        { error: "Forbidden. You can only edit your own todos." },
        { status: 403 }
      );
    }

    const updateFields: Record<string, unknown> = {};
    if (typeof body.completed === "boolean") updateFields.completed = body.completed;
    if (body.text) updateFields.text = body.text;
    if (body.dueDate) updateFields.dueDate = body.dueDate;

    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("PATCH /api/todos error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

//delete a todo or clear completed
export async function DELETE(request: NextRequest) {
  const { user, errorResponse } = requireAuth(request);
  if (errorResponse) return errorResponse;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const clearCompleted = searchParams.get("clearCompleted");

    const collection = await getCollection();

    if (clearCompleted === "true") {
      //delete all completed todos for the current user
      await collection.deleteMany({
        username: user!.username,
        completed: true,
      });
      return NextResponse.json({ success: true }, { status: 200 });
    }

    if (!id) {
      return NextResponse.json({ error: "Todo ID is required" }, { status: 400 });
    }

    //make sure the user owns this todo
    const todo = await collection.findOne({ _id: new ObjectId(id) });
    if (!todo) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    if (user!.role !== "admin" && todo.username !== user!.username) {
      return NextResponse.json(
        { error: "Forbidden. You can only delete your own todos." },
        { status: 403 }
      );
    }

    await collection.deleteOne({ _id: new ObjectId(id) });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("DELETE /api/todos error:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
