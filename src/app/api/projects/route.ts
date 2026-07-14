import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");

    let query = "SELECT p.*, u.name as createdByName FROM projects p INNER JOIN users u ON p.created_by_id = u.id";
    const params: any[] = [];

    if (workspaceId) {
      query += " WHERE p.workspace_id = $1";
      params.push(workspaceId);
    }

    query += " ORDER BY p.created_at DESC";
    const result = await pool.query(query, params);
    return NextResponse.json({ projects: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workspaceId, name, description, status } = await request.json();

    if (!workspaceId || !name) {
      return NextResponse.json({ error: "workspaceId and name are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO projects (workspace_id, name, description, status, created_by_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [workspaceId, name, description || null, status || "active", "current-user", new Date(), new Date()]);
    return NextResponse.json({ project: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
