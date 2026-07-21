import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    const taskId = searchParams.get("taskId");

    let query = `SELECT l.* FROM labels l
                 INNER JOIN workspace_members wm ON wm.workspace_id = l.workspace_id AND wm.user_id = $1
                 LEFT JOIN task_labels tl ON tl.label_id = l.id
                 LEFT JOIN tasks t ON t.id = tl.task_id`;
    const params: any[] = [user.id];
    const conditions: string[] = [];

    if (workspaceId) {
      conditions.push(`l.workspace_id = $${params.length + 1}`);
      params.push(workspaceId);
    }

    if (taskId) {
      conditions.push(`t.id = $${params.length + 1}`);
      params.push(taskId);
    }

    query += ` WHERE ${conditions.join(" AND ")} GROUP BY l.id ORDER BY l.name ASC`;
    const result = await pool.query(query, params);
    return NextResponse.json({ labels: result.rows });
  } catch (e) {
    console.error("[api/labels] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { workspaceId, name, color } = await request.json();

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO labels (workspace_id, name, color, created_at) VALUES ($1, $2, $3, $4) RETURNING *", [workspaceId, name, color || "blue", new Date()]);
    return NextResponse.json({ label: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/labels] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
