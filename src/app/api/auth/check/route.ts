import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session")?.value;

    if (!sessionCookie) {
      console.log("Auth check: no session cookie");
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    console.log("Auth check: verifying session cookie");
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    console.log("Auth check: verified user", decoded.uid);
    return NextResponse.json({
      authenticated: true,
      user: {
        uid: decoded.uid,
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
      },
    });
  } catch (error: any) {
    console.error("Auth check error:", error);
    (await cookies()).delete("session");
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }
}
