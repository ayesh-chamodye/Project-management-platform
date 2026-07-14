import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();
    const { searchParams } = new URL(request.url);
    const entityType = searchParams.get("entityType");
    const entityId = searchParams.get("entityId");

    let query = "SELECT al.*, u.name as userName FROM activity_logs al INNER JOIN users u ON al.user_id = u.id";
    const params: any[] = [];
    const conditions: string[] = [];

    if (entityType && entityId) {
      conditions.push(`al.entity_type = $${params.length + 1} AND al.entity_id = $${params.length + 2}`);
      params.push(entityType, entityId);
    } else {
      conditions.push(`al.user_id = $${params.length + 1}`);
      params.push(user.id);
    }

    query += ` WHERE ${conditions.join(" AND ")} ORDER BY al.created_at DESC LIMIT 50`;
    const result = await pool.query(query, params);
    return NextResponse.json({ logs: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
