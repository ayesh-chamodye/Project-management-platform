import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const result = await pool.query("SELECT t.*, u.name as assigneeName FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id WHERE t.project_id = $1 ORDER BY t.created_at DESC", [projectId]);
    return NextResponse.json({ tasks: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { projectId, title, description, priority, status, dueDate, assigneeId } = await request.json();

    if (!projectId || !title) {
      return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO tasks (project_id, title, description, priority, status, due_date, assignee_id, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *", [projectId, title, description || null, priority || "medium", status || "todo", dueDate || null, assigneeId || null, user.id, new Date(), new Date()]);

    await logActivity(user.id, "created", "task", result.rows[0].id, { title, projectId });

    return NextResponse.json({ task: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
