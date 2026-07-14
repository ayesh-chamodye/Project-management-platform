import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 });
    }

    const taskResult = await pool.query("SELECT * FROM tasks WHERE title ILIKE $1 OR description ILIKE $1 LIMIT 20", [`%${query}%`]);
    const projectResult = await pool.query("SELECT * FROM projects WHERE name ILIKE $1 OR description ILIKE $1 LIMIT 20", [`%${query}%`]);

    return NextResponse.json({ tasks: taskResult.rows, projects: projectResult.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
