import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { comments } from "@/db/schema";
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

    const taskComments = await database.select().from(comments).where(eq(comments.taskId, taskId)).orderBy(desc(comments.createdAt));

    return NextResponse.json({ comments: taskComments });
  } catch (error) {
    console.error("Get comments error:", error);
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 });
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
    const { content, parentId } = await request.json();

    const [comment] = await database.insert(comments).values({ content: content.trim(), taskId, authorId: session.user.id, parentId: parentId || null }).returning();

    return NextResponse.json({ comment }, { status: 201 });
  } catch (error: any) {
    console.error("Create comment error:", error);
    return NextResponse.json({ error: error.message || "Failed to create comment" }, { status: 500 });
  }
}
