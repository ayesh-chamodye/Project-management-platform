import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const result = await pool.query("SELECT c.*, u.name as userName FROM comments c INNER JOIN users u ON c.user_id = u.id WHERE c.task_id = $1 ORDER BY c.created_at DESC", [taskId]);
    return NextResponse.json({ comments: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { taskId, message } = await request.json();

    if (!taskId || !message) {
      return NextResponse.json({ error: "taskId and message are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO comments (task_id, user_id, message, created_at) VALUES ($1, $2, $3, $4) RETURNING *", [taskId, user.id, message, new Date()]);
    return NextResponse.json({ comment: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
