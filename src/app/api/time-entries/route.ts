import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get("taskId");

    let query = `SELECT te.*, u.name as userName FROM time_entries te INNER JOIN users u ON te.user_id = u.id`;
    const params: any[] = [user.id];
    const conditions: string[] = [`te.user_id = $${params.length}`];

    if (taskId) {
      conditions.push(`te.task_id = $${params.length + 1}`);
      params.push(taskId);
    }

    query += ` WHERE ${conditions.join(" AND ")} ORDER BY te.start_time DESC`;
    const result = await pool.query(query, params);
    return NextResponse.json({ timeEntries: result.rows });
  } catch (e) {
    console.error("[api/time-entries] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { taskId, description, startTime, endTime, duration } = await request.json();

    if (!taskId || !startTime) {
      return NextResponse.json({ error: "taskId and startTime are required" }, { status: 400 });
    }

    const result = await pool.query("INSERT INTO time_entries (task_id, user_id, description, start_time, end_time, duration, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *", [taskId, user.id, description || null, startTime, endTime || null, duration || null, new Date()]);
    return NextResponse.json({ timeEntry: result.rows[0] }, { status: 201 });
  } catch (e) {
    console.error("[api/time-entries] POST error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
