import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const parentId = searchParams.get("parentId");

    if (!parentId) {
      return NextResponse.json({ error: "parentId is required" }, { status: 400 });
    }

    const result = await pool.query(`SELECT s.*, u.name as assigneeName FROM subtasks s LEFT JOIN users u ON s.assignee_id = u.id WHERE s.parent_id = $1 ORDER BY s.created_at ASC`, [parentId]);
    return NextResponse.json({ subtasks: result.rows });
  } catch (e) {
    console.error("[api/subtasks] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { parentId, title, assigneeId } = await request.json();

    if (!parentId || !title) {
      return NextResponse.json({ error: "parentId and title are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO subtasks (parent_id, title, status, assignee_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [parentId, title, "todo", assigneeId || null, new Date(), new Date()]);
    return NextResponse.json({ subtask: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/subtasks] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
