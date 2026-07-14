import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    return NextResponse.json({ authenticated: true, user: session.user });
  } catch {
    return NextResponse.json({ error: "Auth check failed" }, { status: 500 });
  }
}
