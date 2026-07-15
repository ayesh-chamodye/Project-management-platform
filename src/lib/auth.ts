import { createSupabaseClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function getSession() {
  try {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error("[auth] getSession error", error);
    }
    return data.session ?? null;
  } catch (e) {
    console.error("[auth] getSession unexpected error", e);
    return null;
  }
}

export async function getUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ error: message }, { status: 401 });
}

export async function requireAuthOrRespond() {
  try {
    return { user: await requireAuth(), response: null as ReturnType<typeof unauthorizedResponse> | null };
  } catch {
    return { user: null as any, response: unauthorizedResponse() };
  }
}
