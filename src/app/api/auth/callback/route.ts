import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";

export async function GET(request: NextRequest) {
  try {
    const idToken = request.nextUrl.searchParams.get("id_token");

    if (!idToken) {
      return NextResponse.redirect(new URL("/login?error=missing_token", request.url));
    }

    const decoded = await adminAuth.verifyIdToken(idToken);

    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    const response = NextResponse.redirect(new URL("/dashboard", request.url));
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Callback auth error:", error);
    return NextResponse.redirect(new URL("/login?error=invalid_token", request.url));
  }
}
