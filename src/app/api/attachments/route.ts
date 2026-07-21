import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const formData = await request.formData();
    const taskId = formData.get("taskId") as string;
    const file = formData.get("file") as File | null;

    if (!taskId || !file) {
      return NextResponse.json({ error: "taskId and file are required" }, { status: 400 });
    }

    const taskRow = await pool.query("SELECT id FROM tasks WHERE id = $1", [taskId]);
    if (taskRow.rows.length === 0) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const fileExt = file.name.split(".").pop();
    const filePath = `${taskId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage.from("attachments").upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(data.path);

    const result = await pool.query(
      "INSERT INTO attachments (task_id, user_id, file_name, file_url, file_type, file_size, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [taskId, user.id, file.name, publicUrl, file.type, file.size, new Date()]
    );

    return NextResponse.json({ attachment: result.rows[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
