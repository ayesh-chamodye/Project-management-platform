import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ workspaceId: string; columnId: string }> }) {
  try {
    const { columnId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    }

    await adminDb.collection("boards").doc(boardId).collection("columns").doc(columnId).set(body, { merge: true });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to update column" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ workspaceId: string; columnId: string }> }) {
  try {
    const { columnId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ error: "boardId is required" }, { status: 400 });
    }

    await adminDb.collection("boards").doc(boardId).collection("columns").doc(columnId).delete();

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete column" }, { status: 500 });
  }
}
