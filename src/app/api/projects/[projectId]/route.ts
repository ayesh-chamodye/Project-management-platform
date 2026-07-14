import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const projectRow = await pool.query(`SELECT p.*, w.owner_id as "workspaceOwnerId" FROM projects p INNER JOIN workspaces w ON p.workspace_id = w.id WHERE p.id = $1`, [projectId]);
    if (projectRow.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [projectRow.rows[0].workspace_id, user.id]);
    if (projectRow.rows[0].workspaceOwnerId !== user.id && memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ project: projectRow.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const projectRow = await pool.query(`SELECT p.*, w.owner_id as "workspaceOwnerId" FROM projects p INNER JOIN workspaces w ON p.workspace_id = w.id WHERE p.id = $1`, [projectId]);
    if (projectRow.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [projectRow.rows[0].workspace_id, user.id]);
    if (projectRow.rows[0].workspaceOwnerId !== user.id && memberCheck.rows.length === 0) {
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
    if (body.description !== undefined) {
      fields.push(`description = $${index++}`);
      values.push(body.description);
    }
    if (body.status !== undefined) {
      fields.push(`status = $${index++}`);
      values.push(body.status);
    }

    if (fields.length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    values.push(projectId);
    const query = `UPDATE projects SET ${fields.join(", ")} WHERE id = $${index} RETURNING *`;
    const result = await pool.query(query, values);

    return NextResponse.json({ project: result.rows[0] });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const projectRow = await pool.query(`SELECT p.*, w.owner_id as "workspaceOwnerId" FROM projects p INNER JOIN workspaces w ON p.workspace_id = w.id WHERE p.id = $1`, [projectId]);
    if (projectRow.rows.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [projectRow.rows[0].workspace_id, user.id]);
    if (projectRow.rows[0].workspaceOwnerId !== user.id && memberCheck.rows.length === 0) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await pool.query("DELETE FROM projects WHERE id = $1", [projectId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
