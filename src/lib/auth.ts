import { cookies } from "next/headers";
import { createSupabaseClient } from "@/lib/supabase/server";
import { getUserFromRequest } from "@/lib/supabase/server-auth";

export async function getServerUser() {
  const cookieStore = await cookies();
  const requestLike = {
    headers: {
      get: (name: string) => {
        const cookieHeader = cookieStore.toString();
        if (name.toLowerCase() === "cookie") return cookieHeader || null;
        return null;
      },
    } as Headers,
  };
  const user = getUserFromRequest(requestLike);

  if (!user) return null;

  const supabase = await createSupabaseClient();
  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  return { ...user, profile };
}
