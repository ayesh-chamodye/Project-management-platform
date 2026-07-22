import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await createSupabaseClient();
    const { data: members, error } = await supabase
      .from("workspace_members")
      .select("*, workspaces(name, slug)")
      .eq("user_id", user.id)
      .order("joined_at", { ascending: false });

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    const workspaces = members.map((m: { workspace_id: string; workspaces?: { name?: string; slug?: string }; role: string }) => ({
      id: m.workspace_id,
      name: m.workspaces?.name || "Untitled",
      slug: m.workspaces?.slug || "",
      role: m.role,
      isOwner: m.role === "owner",
    }));

    return NextResponse.json({ workspaces });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name } = await request.json();
    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
    const supabase = await createSupabaseClient();

    const { data: workspace, error } = await supabase
      .from("workspaces")
      .insert({ name, slug, owner_id: user.id })
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    await supabase.from("workspace_members").insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "owner",
    });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
