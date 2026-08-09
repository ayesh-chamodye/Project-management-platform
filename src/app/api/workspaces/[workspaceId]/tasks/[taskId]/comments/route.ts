import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getComments, createComment } from "@/lib/firestore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ workspaceId: string; taskId: string }> }) {
  try {
    const { taskId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const comments = await getComments(taskId);

    return NextResponse.json({ comments });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string; taskId: string }> }) {
  try {
    const { taskId } = await params;
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();

    const commentId = await createComment(taskId, {
      content: body.content,
      taskId: taskId,
      authorId: decoded.uid,
    });

    return NextResponse.json({ comment: { id: commentId, ...body, authorId: decoded.uid } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create comment" }, { status: 500 });
  }
}
