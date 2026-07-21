import { createSupabaseClient } from "./server";

export async function getServerUser() {
  const supabase = await createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user ?? null;
}

export async function requireServerUser() {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
