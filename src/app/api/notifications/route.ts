import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuthOrRespond } from "@/lib/auth";

export async function GET() {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const result = await pool.query("SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC", [user.id]);
    return NextResponse.json({ notifications: result.rows });
  } catch (e) {
    console.error("[api/notifications] GET error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const { user, response } = await requireAuthOrRespond();
  if (response) return response;

  try {
    const { notificationId, isRead } = await request.json();

    if (!notificationId) {
      return NextResponse.json({ error: "notificationId is required" }, { status: 400 });
    }

    await pool.query("UPDATE notifications SET is_read = $1 WHERE id = $2 AND user_id = $3", [isRead ?? true, notificationId, user.id]);
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("[api/notifications] PATCH error", e);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
