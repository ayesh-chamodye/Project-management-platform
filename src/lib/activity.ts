import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function logActivity(userId: string, action: string, entityType: string, entityId: string, metadata?: any) {
  try {
    await pool.query("INSERT INTO activity_logs (user_id, action, entity_type, entity_id, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6)", [userId, action, entityType, entityId, metadata ? JSON.stringify(metadata) : null, new Date()]);
  } catch {
    // Silently fail activity logging
  }
}
