import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ workspaceId: string; memberId: string }> }) {
  try {
    const { memberId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    await adminDb.collection("workspace_members").doc(memberId).delete();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
