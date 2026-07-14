import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

function isUUID(str: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const result = await pool.query(
      `SELECT w.id, w.name, w.owner_id as "ownerId", w.created_at as "createdAt", w.updated_at as "updatedAt",
              u.name as "ownerName", u.email as "ownerEmail",
              wm.role as "memberRole"
       FROM workspaces w
       INNER JOIN users u ON w.owner_id = u.id
       LEFT JOIN workspace_members wm ON wm.workspace_id = w.id AND wm.user_id = $1
       WHERE w.owner_id = $1 OR wm.user_id = $1
       ORDER BY w.created_at DESC`,
      [user.id]
    );
    return NextResponse.json({ workspaces: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const existingUser = await pool.query("SELECT id FROM users WHERE id = $1", [user.id]);
    if (existingUser.rows.length === 0) {
      await pool.query("INSERT INTO users (id, name, email, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)", [user.id, user.user_metadata?.name || user.email?.split("@")[0], user.email, new Date(), new Date()]);
    }

    const result = await pool.query("INSERT INTO workspaces (name, owner_id, created_at, updated_at) VALUES ($1, $2, $3, $4) RETURNING *", [name, user.id, new Date(), new Date()]);
    await pool.query("INSERT INTO workspace_members (workspace_id, user_id, role, joined_at) VALUES ($1, $2, $3, $4)", [result.rows[0].id, user.id, "owner", new Date()]);

    return NextResponse.json({ workspace: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
