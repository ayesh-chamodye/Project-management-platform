import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const supabase = await createSupabaseClient();

    const { data: task, error } = await supabase
      .from("tasks")
      .select("*, assignee:assignee_id(name, avatar_url)")
      .eq("id", taskId)
      .single();

    if (error || !task) return NextResponse.json({ error: "Task not found" }, { status: 404 });

    const { data: comments } = await supabase
      .from("comments")
      .select("*, author:author_id(name, avatar_url)")
      .eq("task_id", taskId)
      .is("parent_id", null)
      .order("created_at", { ascending: false });

    const { data: attachments } = await supabase
      .from("attachments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: false });

    return NextResponse.json({ task, comments: comments || [], attachments: attachments || [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const body = await request.json();
    const supabase = await createSupabaseClient();

    const updates: Record<string, unknown> = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.status !== undefined) updates.status = body.status;
    if (body.column_id !== undefined) updates.column_id = body.column_id;
    if (body.assignee_id !== undefined) updates.assignee_id = body.assignee_id;
    if (body.position !== undefined) updates.position = body.position;
    if (body.due_date !== undefined) updates.due_date = body.due_date;

    updates.updated_at = new Date().toISOString();

    const { data: task, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ task });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { taskId } = await params;
    const supabase = await createSupabaseClient();

    const { error } = await supabase.from("tasks").delete().eq("id", taskId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
