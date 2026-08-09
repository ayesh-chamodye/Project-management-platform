import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const snapshot = await adminDb.collection("workspace_members").where("workspaceId", "==", workspaceId).get();
    const members: any[] = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const userDoc = await adminDb.collection("users").doc(data.userId).get();
      members.push({ id: doc.id, ...data, user: userDoc.data() });
    }

    return NextResponse.json({ members });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const { workspaceId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();

    await adminDb.collection("workspace_members").add({
      workspaceId: workspaceId,
      userId: body.userId,
      role: body.role || "member",
      joinedAt: new Date(),
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
