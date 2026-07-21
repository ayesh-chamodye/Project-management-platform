import { NextRequest, NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";
import { requireServerUser } from "@/lib/supabase/server-auth";

export async function GET(request: NextRequest) {
  try {
    await requireServerUser();
    const supabase = await createSupabaseClient();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const { data, error } = await supabase.from("projects").select("*").eq("id", projectId).single();
    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: e?.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireServerUser();
    const supabase = await createSupabaseClient();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const body = await request.json();
    const updates: Record<string, any> = {};
    if (body.name !== undefined) updates.name = body.name;
    if (body.description !== undefined) updates.description = body.description;
    if (body.status !== undefined) updates.status = body.status;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const { data, error } = await supabase.from("projects").update(updates).eq("id", projectId).select().single();
    if (error || !data) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: data });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: e?.message === "Unauthorized" ? 401 : 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await requireServerUser();
    const supabase = await createSupabaseClient();
    const url = new URL(request.url);
    const projectId = url.pathname.split("/")[3];

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const { error } = await supabase.from("projects").delete().eq("id", projectId);
    if (error) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: e?.message === "Unauthorized" ? 401 : 500 });
  }
}
