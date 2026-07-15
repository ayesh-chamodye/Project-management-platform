import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createSupabaseClient() {
  const cookieStore = await cookies();

  console.log("[supabase] creating server client", {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    hasKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    cookieCount: Array.isArray(cookieStore.getAll) ? undefined : "unknown",
  });

  try {
    const allCookies = Array.isArray(cookieStore.getAll)
      ? cookieStore.getAll()
      : Array.isArray((cookieStore as any).cookies)
        ? (cookieStore as any).cookies.getAll()
        : [];

    console.log("[supabase] cookies count", allCookies.length);

    return createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            try {
              return allCookies;
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
              // ignore
            }
          },
        },
      }
    );
  } catch (e) {
    console.error("[supabase] createServerClient error", e);
    throw e;
  }
}
