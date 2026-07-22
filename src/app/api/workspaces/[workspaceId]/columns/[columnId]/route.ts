import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; columnId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { columnId } = await params;
    const { name, color, position } = await request.json();
    const supabase = await createSupabaseClient();

    const { data: column, error } = await supabase
      .from("columns")
      .update({ name: name || undefined, color: color !== undefined ? color : undefined, position: position !== undefined ? position : undefined, updated_at: new Date().toISOString() })
      .eq("id", columnId)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ column });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; columnId: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { columnId } = await params;
    const supabase = await createSupabaseClient();

    const { error } = await supabase.from("columns").delete().eq("id", columnId);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Internal server error" }, { status: 500 });
  }
}
