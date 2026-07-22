import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createSupabaseClient();

    const { data: memberRows } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", user.id);

    const workspaceIds = (memberRows || []).map((m: any) => m.workspace_id);
    const workspaceCount = workspaceIds.length;

    let projectCount = 0;
    let taskCount = 0;
    let boardCount = 0;

    if (workspaceIds.length > 0) {
      const { data: projects } = await supabase
        .from("projects")
        .select("id")
        .in("workspace_id", workspaceIds);
      projectCount = (projects || []).length;

      const projectIds = (projects || []).map((p: any) => p.id);

      if (projectIds.length > 0) {
        const { data: boards } = await supabase
          .from("boards")
          .select("id")
          .in("project_id", projectIds);
        boardCount = (boards || []).length;

        const boardIds = (boards || []).map((b: any) => b.id);

        if (boardIds.length > 0) {
          const { data: columns } = await supabase
            .from("columns")
            .select("id")
            .in("board_id", boardIds);
          const columnIds = (columns || []).map((c: any) => c.id);

          if (columnIds.length > 0) {
            const { data: tasks } = await supabase
              .from("tasks")
              .select("id")
              .in("column_id", columnIds);
            taskCount = (tasks || []).length;
          }
        }
      }
    }

    return NextResponse.json({
      stats: {
        workspaceCount,
        projectCount,
        boardCount,
        taskCount,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
