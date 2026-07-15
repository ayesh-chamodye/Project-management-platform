import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    if (!taskId) {
      return NextResponse.json({ error: "taskId is required" }, { status: 400 });
    }

    const result = await pool.query(`SELECT td.*, t.title as dependsOnTitle FROM task_dependencies td INNER JOIN tasks t ON t.id = td.depends_on_id WHERE td.task_id = $1`, [taskId]);
    return NextResponse.json({ dependencies: result.rows });
  } catch (e) {
    console.error("[api/task-dependencies] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { taskId, dependsOnId, type } = await request.json();

    if (!taskId || !dependsOnId) {
      return NextResponse.json({ error: "taskId and dependsOnId are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO task_dependencies (task_id, depends_on_id, type, created_at) VALUES ($1, $2, $3, $4) RETURNING *", [taskId, dependsOnId, type || "blocks", new Date()]);
    return NextResponse.json({ dependency: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/task-dependencies] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
