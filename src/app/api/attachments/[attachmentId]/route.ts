import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { createClient } from "@supabase/supabase-js";

export async function DELETE(request: NextRequest) {
  try {
    const user = await requireAuth();
    const url = new URL(request.url);
    const attachmentId = url.pathname.split("/").pop();

    if (!attachmentId) {
      return NextResponse.json({ error: "Attachment ID required" }, { status: 400 });
    }

    const attachment = await pool.query("SELECT * FROM attachments WHERE id = $1", [attachmentId]);
    if (attachment.rows.length === 0) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    const taskRow = await pool.query(`SELECT p.workspace_id, w.owner_id as "workspaceOwnerId" FROM attachments a INNER JOIN tasks t ON a.task_id = t.id INNER JOIN projects p ON t.project_id = p.id INNER JOIN workspaces w ON p.workspace_id = w.id WHERE a.id = $1`, [attachmentId]);
    if (taskRow.rows.length > 0) {
      const memberCheck = await pool.query("SELECT id FROM workspace_members WHERE workspace_id = $1 AND user_id = $2", [taskRow.rows[0].workspace_id, user.id]);
      if (taskRow.rows[0].workspaceOwnerId !== user.id && memberCheck.rows.length === 0 && attachment.rows[0].user_id !== user.id) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
    const filePath = attachment.rows[0].file_url.split("/").slice(-2).join("/");
    await supabase.storage.from("attachments").remove([filePath]);

    await pool.query("DELETE FROM attachments WHERE id = $1", [attachmentId]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
