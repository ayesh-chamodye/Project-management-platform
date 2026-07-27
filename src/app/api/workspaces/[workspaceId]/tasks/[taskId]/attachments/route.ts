import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { attachments } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const { taskId } = await params;

    const taskAttachments = await database.select().from(attachments).where(eq(attachments.taskId, taskId)).orderBy(desc(attachments.createdAt));

    return NextResponse.json({ attachments: taskAttachments });
  } catch (error) {
    console.error("Get attachments error:", error);
    return NextResponse.json({ error: "Failed to fetch attachments" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; taskId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const { taskId } = await params;
    const { name, url, fileType, fileSize } = await request.json();

    const [attachment] = await database.insert(attachments).values({ name: name.trim(), url, fileType: fileType || null, fileSize: fileSize || null, taskId, uploadedById: session.user.id }).returning();

    return NextResponse.json({ attachment }, { status: 201 });
  } catch (error: any) {
    console.error("Create attachment error:", error);
    return NextResponse.json({ error: error.message || "Failed to create attachment" }, { status: 500 });
  }
}
