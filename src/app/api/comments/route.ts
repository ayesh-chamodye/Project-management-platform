import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.pathname.split("/")[4];

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const result = await pool.query("SELECT c.*, u.name as userName FROM comments c INNER JOIN users u ON c.user_id = u.id WHERE c.task_id = $1 ORDER BY c.created_at DESC", [taskId]);
    return NextResponse.json({ comments: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.pathname.split("/")[4];
    const { message } = await request.json();

    if (!taskId || !message) {
      return NextResponse.json({ error: "Task ID and message are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO comments (task_id, user_id, message, created_at) VALUES ($1, $2, $3, $4) RETURNING *", [taskId, "current-user", message, new Date()]);
    return NextResponse.json({ comment: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
