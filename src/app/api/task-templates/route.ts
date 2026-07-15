import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    if (!workspaceId) {
      return NextResponse.json({ error: "workspaceId is required" }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM task_templates WHERE workspace_id = $1 ORDER BY name ASC", [workspaceId]);
    return NextResponse.json({ templates: result.rows });
  } catch (e) {
    console.error("[api/task-templates] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { workspaceId, name, description, priority, estimate } = await request.json();

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO task_templates (workspace_id, name, description, priority, estimate, created_by_id, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [workspaceId, name, description || null, priority || "medium", estimate || null, user.id, new Date()]);
    return NextResponse.json({ template: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/task-templates] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
