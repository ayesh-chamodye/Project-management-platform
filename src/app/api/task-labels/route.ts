import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { taskId, labelId } = await request.json();

    if (!taskId || !labelId) {
      return NextResponse.json({ error: "taskId and labelId are required" }, { status: 400 });
    }

    const result = await pool.query(
      "INSERT INTO task_labels (task_id, label_id) VALUES ($1, $2) RETURNING *",
      [taskId, labelId]
    );
    return NextResponse.json({ taskLabel: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/task-labels] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");
    const labelId = searchParams.get("labelId");

    if (!taskId || !labelId) {
      return NextResponse.json({ error: "taskId and labelId are required" }, { status: 400 });
    }

    await pool.query("DELETE FROM task_labels WHERE task_id = $1 AND label_id = $2", [taskId, labelId]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/task-labels] DELETE error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
