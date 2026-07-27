import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = body?.email;
    const password = body?.password;
    const name = body?.name;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const result = await auth.api.signUpEmail({ body: { email, password, name } });

    if (result.user) {
      return NextResponse.json({ success: true, user: result.user });
    }

    return NextResponse.json({ error: "Signup failed" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Signup failed" }, { status: 400 });
  }
}
