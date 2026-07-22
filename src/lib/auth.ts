import { cookies } from "next/headers";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function getServerUser() {
  const cookieStore = await cookies();
  const user = getUserFromRequest({
    headers: new Headers({ cookie: cookieStore.toString() }),
  } as unknown as Request);
  
  if (!user) return null;

  const supabase = await createSupabaseClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { ...user, profile };
}
