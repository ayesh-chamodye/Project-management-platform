import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId } = await params;
    const supabase = await createSupabaseClient();

    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) return NextResponse.json({ error: "projectId is required" }, { status: 400 });

    const { data: board } = await supabase
      .from("boards")
      .select("id")
      .eq("project_id", projectId)
      .maybeSingle();

    if (!board) return NextResponse.json({ tasks: [] });

    const { data: columns } = await supabase
      .from("columns")
      .select("id")
      .eq("board_id", board.id);

    const { data: tasks, error } = await supabase
      .from("tasks")
      .select("*, assignee:assignee_id(name, avatar_url)")
      .in("column_id", (columns || []).map((c: { id: string }) => c.id))
      .order("position", { ascending: true });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ tasks: tasks || [] });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId } = await params;
    const { title, description, priority, columnId, assigneeId, dueDate } = await request.json();
    const supabase = await createSupabaseClient();

    const memberResult = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!memberResult.data) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: maxPos } = await supabase
      .from("tasks")
      .select("position")
      .eq("column_id", columnId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: task, error } = await supabase
      .from("tasks")
      .insert({
        title,
        description: description || null,
        priority: priority || "medium",
        column_id: columnId,
        assignee_id: assigneeId || null,
        due_date: dueDate || null,
        created_by_id: user.id,
        position: (maxPos?.position ?? -1) + 1,
      })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ task }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
