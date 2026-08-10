import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { idToken } = body;

    if (!idToken) {
      console.error("Session creation error: missing ID token");
      return NextResponse.json({ error: "Missing ID token" }, { status: 401 });
    }

    const decoded = await adminAuth.verifyIdToken(idToken);
    console.log("Token verified for user:", decoded.uid);

    const expiresIn = 60 * 60 * 24 * 7 * 1000;
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log("Session cookie created");

    const response = NextResponse.json({ authenticated: true, user: { uid: decoded.uid, email: decoded.email } });
    response.cookies.set("session", sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("Session creation error:", error);
    return NextResponse.json({ error: "Invalid token", details: error.message }, { status: 401 });
  }
}
