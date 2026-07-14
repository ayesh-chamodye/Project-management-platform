import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM notifications WHERE user_id = 'current-user' ORDER BY created_at DESC");
    return NextResponse.json({ notifications: result.rows });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { notificationId, isRead } = await request.json();

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    await pool.query("UPDATE notifications SET is_read = $1 WHERE id = $2", [isRead ?? true, notificationId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
