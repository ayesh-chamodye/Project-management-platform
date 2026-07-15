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

    const result = await pool.query("SELECT * FROM custom_fields WHERE workspace_id = $1 ORDER BY name ASC", [workspaceId]);
    return NextResponse.json({ fields: result.rows });
  } catch (e) {
    console.error("[api/custom-fields] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { workspaceId, name, type, options } = await request.json();

    if (!workspaceId || !name || !type) {
      return NextResponse.json({ error: "workspaceId, name, and type are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO custom_fields (workspace_id, name, type, options, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING *", [workspaceId, name, type, options || null, new Date()]);
    return NextResponse.json({ field: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/custom-fields] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
