import { NextResponse } from "next/server";
import { createSupabaseClient } from "@/lib/supabase/server";

export async function proxy(request: Request) {
  const supabase = await createSupabaseClient();
  const { data: { session } } = await supabase.auth.getSession();

  const isAuthenticated = !!session;
  const url = new URL(request.url);
  const isOnAuthPage = url.pathname.startsWith("/login") ||
    url.pathname.startsWith("/register") ||
    url.pathname.startsWith("/forgot-password");
  const isOnApiAuth = url.pathname.startsWith("/api/auth");
  const isOnAuthCallback = url.pathname.startsWith("/auth/callback");
  const isHomePage = url.pathname === "/";

  if (!isAuthenticated && !isOnAuthPage && !isOnApiAuth && !isOnAuthCallback && !isHomePage) {
    return NextResponse.redirect(new URL("/login", url));
  }

  if (isAuthenticated && (isOnAuthPage || isHomePage)) {
    return NextResponse.redirect(new URL("/dashboard", url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/[^?/]+|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)"],
};
