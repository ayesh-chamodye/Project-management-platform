import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 });
    }

    const projectResult = await pool.query(`SELECT p.*, u.name as createdByName FROM projects p INNER JOIN users u ON p.created_by_id = u.id INNER JOIN workspace_members wm ON wm.workspace_id = p.workspace_id AND wm.user_id = $1 WHERE p.name ILIKE $2 OR p.description ILIKE $2 LIMIT 20`, [user.id, `%${query}%`]);
    const taskResult = await pool.query(`SELECT t.*, p.name as projectName FROM tasks t INNER JOIN projects p ON t.project_id = p.id INNER JOIN workspace_members wm ON wm.workspace_id = p.workspace_id AND wm.user_id = $1 WHERE t.title ILIKE $2 OR t.description ILIKE $2 LIMIT 20`, [user.id, `%${query}%`]);

    return NextResponse.json({ tasks: taskResult.rows, projects: projectResult.rows });
  } catch (e) {
    console.error("[api/search] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
