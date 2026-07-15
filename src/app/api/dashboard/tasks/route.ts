import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const result = await pool.query(
      `SELECT t.*, p.name as projectName, u.name as assigneeName
       FROM tasks t
       INNER JOIN projects p ON t.project_id = p.id
       INNER JOIN workspace_members wm ON wm.workspace_id = p.workspace_id AND wm.user_id = $1
       LEFT JOIN users u ON t.assignee_id = u.id
       ORDER BY t.created_at DESC
       LIMIT $2`,
      [user.id, limit]
    );

    return NextResponse.json({ tasks: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
