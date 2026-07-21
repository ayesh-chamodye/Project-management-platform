import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/").slice(-1)[0];

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const memberCheck = await pool.query("SELECT id, role FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [workspaceId, user.id]);
    const workspaceRow = await pool.query("SELECT * FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id && memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await pool.query(`SELECT w.*, u.name as "ownerName", u.email as "ownerEmail" FROM workspaces w INNER JOIN users u ON w.owner_id = u.id WHERE w.id = $1`, [workspaceId]);
    return NextResponse.json({ workspace: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/").slice(-1)[0];

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const workspaceRow = await pool.query("SELECT * FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    if (body.name !== undefined) {
      fields.push(`name = $${index++}`);
      values.push(body.name);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(workspaceId);
    const query = `UPDATE workspaces SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);

    return NextResponse.json({ workspace: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/").slice(-1)[0];

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const workspaceRow = await pool.query("SELECT * FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pool.query("DELETE FROM workspaces WHERE id = $1", [workspaceId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
