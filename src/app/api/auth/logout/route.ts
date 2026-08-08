import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).delete("session");
  return NextResponse.json({ authenticated: false });
}
