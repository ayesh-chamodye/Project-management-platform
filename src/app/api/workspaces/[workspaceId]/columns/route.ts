import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

interface ColumnRow {
  id: string;
  name: string;
  color?: string;
  position: number;
  created_at: string;
  updated_at: string;
}

interface TaskRow {
  id: string;
  title: string;
  description?: string;
  priority: string;
  status: string;
  position: number;
  due_date?: string;
  assignee_id?: string;
  column_id: string;
  created_by_id: string;
  created_at: string;
  updated_at: string;
  assignee?: { name?: string; avatar_url?: string };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { workspaceId } = await params;
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ columns: [], tasks: [] });
    }

    const supabase = await createSupabaseClient();

    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { data: columns } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("position", { ascending: true });

    const columnIds = (columns as ColumnRow[] || []).map((c) => c.id);
    let tasks: TaskRow[] = [];

    if (columnIds.length > 0) {
      const { data: tasksData } = await supabase
        .from("tasks")
        .select("*, assignee:assignee_id(name, avatar_url)")
        .in("column_id", columnIds)
        .order("position", { ascending: true });
      tasks = (tasksData as TaskRow[] || []);
    }

    return NextResponse.json({ columns: columns || [], tasks });
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
    const supabase = await createSupabaseClient();

    const { data: member } = await supabase
      .from("workspace_members")
      .select("role")
      .eq("workspace_id", workspaceId)
      .eq("user_id", user.id)
      .single();

    if (!member) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { name, color, boardId } = await request.json();

    if (!boardId) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    }

    const { data: maxPos } = await supabase
      .from("columns")
      .select("position")
      .eq("board_id", boardId)
      .order("position", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { data: column, error } = await supabase
      .from("columns")
      .insert({ name, color: color || null, position: (maxPos?.position ?? -1) + 1, board_id: boardId })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ column }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
