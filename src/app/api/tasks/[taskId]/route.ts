import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const taskId = url.pathname.split("/").pop();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const result = await pool.query("SELECT t.*, u.name as assigneeName, p.workspace_id FROM tasks t LEFT JOIN users u ON t.assignee_id = u.id LEFT JOIN projects p ON p.id = t.project_id WHERE t.id = $1", [taskId]);
    if (result.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json({ task: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const taskId = url.pathname.split("/").pop();
    const body = await request.json();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    const allowed = ["title", "description", "priority", "status", "due_date", "assignee_id"];
    for (const key of allowed) {
      if (body[key] !== undefined) {
        fields.push(`${key} = $${index++}`);
        values.push(body[key]);
      }
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(taskId);
    const query = `UPDATE tasks SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);

    await logActivity(user.id, "updated", "task", taskId, body);

    return NextResponse.json({ task: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const taskId = url.pathname.split("/").pop();

    if (!taskId) {
      return NextResponse.json({ error: "Task ID required" }, { status: 400 });
    }

    await pool.query("DELETE FROM tasks WHERE id = $1", [taskId]);
    await logActivity(user.id, "deleted", "task", taskId || "");

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
