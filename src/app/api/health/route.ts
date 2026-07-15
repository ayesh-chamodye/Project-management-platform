import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!connectionString) {
      return NextResponse.json({ status: "error", error: "DATABASE_URL or POSTGRES_URL is not set" }, { status: 500 });
    }

    const start = Date.now();
    const result = await pool.query("SELECT NOW() as time, version() as version");
    const duration = Date.now() - start;

    return NextResponse.json({
      status: "ok",
      db: "connected",
      durationMs: duration,
      time: result.rows[0]?.time,
      postgresVersion: result.rows[0]?.version,
      connectionString: connectionString.replace(/\/\/.*@/, "//****@"),
    });
  } catch (e: any) {
    return NextResponse.json({ status: "error", error: e?.message || String(e) }, { status: 500 });
  }
}
