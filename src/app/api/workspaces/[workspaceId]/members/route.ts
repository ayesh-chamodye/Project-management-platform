import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/")[3];

    if (!workspaceId) {
      return NextResponse.json({ error: "Workspace ID required" }, { status: 400 });
    }

    const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [workspaceId, user.id]);
    const workspaceRow = await pool.query("SELECT owner_id FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id && memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await pool.query(`SELECT wm.*, u.name, u.email FROM workspace_members wm INNER JOIN users u ON wm.user_id = u.id WHERE wm.workspace_id = $1 ORDER BY wm.joined_at DESC`, [workspaceId]);
    return NextResponse.json({ members: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/")[3];
    const { email, role } = await request.json();

    if (!workspaceId || !email) {
      return NextResponse.json({ error: "Workspace ID and email are required" }, { status: 400 });
    }

    const workspaceRow = await pool.query("SELECT owner_id FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userRow = await pool.query("SELECT id FROM users WHERE email = $1", [email]);
    if (userRow.rows.length === 0) {
      return NextResponse.json({ error: "User not found with this email" }, { status: 404 });
    }

    const existing = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [workspaceId, userRow.rows[0].id]);
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4) RETURNING *", [workspaceId, userRow.rows[0].id, role || "member", new Date()]);
    return NextResponse.json({ member: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const workspaceId = url.pathname.split("/")[3];
    const memberId = url.pathname.split("/")[4];

    if (!workspaceId || !memberId) {
      return NextResponse.json({ error: "Workspace ID and member ID required" }, { status: 400 });
    }

    const workspaceRow = await pool.query("SELECT owner_id FROM workspaces WHERE id = $1", [workspaceId]);
    if (workspaceRow.rows.length === 0) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }
    if (workspaceRow.rows[0].owner_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pool.query("DELETE FROM workspace_members WHERE id = $1 AND workspace_id = $2", [memberId, workspaceId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
