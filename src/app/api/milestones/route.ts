import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM milestones WHERE project_id = $1 ORDER BY due_date ASC", [projectId]);
    return NextResponse.json({ milestones: result.rows });
  } catch (e) {
    console.error("[api/milestones] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond(request);
  if (response) return response;

  try {
    const { projectId, name, dueDate } = await request.json();

    if (!projectId || !name) {
      return NextResponse.json({ error: "projectId and name are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO milestones (project_id, name, due_date, created_at) VALUES ($1, $2, $3, $4) RETURNING *", [projectId, name, dueDate || null, new Date()]);
    return NextResponse.json({ milestone: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/milestones] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
