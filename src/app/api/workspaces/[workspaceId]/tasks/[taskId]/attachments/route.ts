import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getAttachments, createAttachment, deleteAttachment } from "@/lib/firestore";

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string; taskId: string } }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const attachments = await getAttachments(params.taskId);

    return NextResponse.json({ attachments });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string; taskId: string } }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();

    const attachmentId = await createAttachment(params.taskId, {
      name: body.name,
      url: body.url,
      fileType: body.fileType,
      fileSize: body.fileSize,
      taskId: params.taskId,
      uploadedById: decoded.uid,
    });

    return NextResponse.json({ attachment: { id: attachmentId, ...body } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create attachment" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { workspaceId: string; taskId: string } }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const { attachmentId } = await request.json();

    await deleteAttachment(params.taskId, attachmentId);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete attachment" }, { status: 500 });
  }
}
