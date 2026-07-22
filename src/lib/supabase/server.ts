import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseClient() {
  const cookieStore = await cookies();

  console.log("[supabase] creating server client", {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });

  try {
    const client = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            try {
              return cookieStore.getAll();
            } catch {
              return [];
            }
          },
          setAll(cookiesToSet: Array<{ name: string; value: string }>) {
            try {
              cookiesToSet.forEach(({ name, value }) => {
                cookieStore.set(name, value);
              });
            } catch {
              // ignore in middleware/read-only contexts
            }
          },
        },
      }
    );

    const accessToken = cookieStore.get("sb-access-token")?.value;
    const refreshToken = cookieStore.get("sb-refresh-token")?.value;

    if (accessToken && refreshToken) {
      await client.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    }

    return client;
  } catch (e) {
    console.error("[supabase] createServerClient error", e);
    throw e;
  }
}
