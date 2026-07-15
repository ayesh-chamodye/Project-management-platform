import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    let query = `SELECT p.*, u.name as createdByName FROM projects p
                 INNER JOIN users u ON p.created_by_id = u.id
                 LEFT JOIN workspace_members wm ON wm.workspace_id = p.workspace_id AND wm.user_id = $1
                 LEFT JOIN workspaces w ON w.id = p.workspace_id`;
    const params: any[] = [user.id];
    const conditions: string[] = [];

    if (workspaceId) {
      conditions.push(`p.workspace_id = $${params.length + 1}`);
      params.push(workspaceId);
    }

    conditions.push(`(w.owner_id = $${params.length + 1} OR wm.user_id = $${params.length} OR p.created_by_id = $${params.length})`);
    params.push(user.id);

    query += ` WHERE ${conditions.join(" AND ")} ORDER BY p.created_at DESC`;
    const result = await pool.query(query, params);
    console.log("[api/projects] result count", result.rows.length, "params", params, "workspaceId", workspaceId);
    return NextResponse.json({ projects: result.rows });
  } catch (e) {
    console.error("[api/projects] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { workspaceId, name, description, status } = await request.json();

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [workspaceId, user.id]);
    const workspaceRow = await pool.query("SELECT owner_id FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length > 0 && workspaceRow.rows[0].owner_id !== user.id && memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await pool.query("INSERT INTO projects (workspace_id, name, description, status, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [workspaceId, name, description || null, status || "active", user.id, new Date(), new Date()]);
    return NextResponse.json({ project: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
