import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { requireServerUser } from "@/lib/supabase/server-auth";

export async function GET() {
  try {
    await requireServerUser();
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.from("projects").select("*");
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ projects: data || [] });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: e?.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireServerUser();
    const supabase = await createSupabaseClient();
    const body = await request.json();
    const { name, description, status, workspaceId } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("projects")
      .insert([{
        name,
        description: description || null,
        status: status || "active",
        workspace_id: workspaceId || null,
        created_by_id: user.id,
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ project: data }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: e?.message === "Unauthorized" ? 401 : 500 });
  }
}
