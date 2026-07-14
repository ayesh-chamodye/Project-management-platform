import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM tasks WHERE project_id = $1 ORDER BY created_at DESC", [projectId]);
    return NextResponse.json({ tasks: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { projectId, title, description, priority, status, dueDate } = await request.json();

    if (!projectId || !title) {
      return NextResponse.json({ error: "projectId and title are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO tasks (project_id, title, description, priority, status, due_date, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *", [projectId, title, description || null, priority || "medium", status || "todo", dueDate || null, "current-user", new Date(), new Date()]);
    return NextResponse.json({ task: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
