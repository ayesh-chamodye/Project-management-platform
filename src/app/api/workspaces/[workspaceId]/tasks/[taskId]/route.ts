import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { tasks, comments, attachments, columns, boards, projects, workspaceMembers } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    const [task] = await database.select().from(tasks).where(eq(tasks.id, taskId)).then(r => [r[0]]);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const taskComments = await database.select().from(comments).where(eq(comments.taskId, taskId)).orderBy(desc(comments.createdAt));
    const taskAttachments = await database.select().from(attachments).where(eq(attachments.taskId, taskId)).orderBy(desc(attachments.createdAt));

    return NextResponse.json({ task, comments: taskComments, attachments: taskAttachments });
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json({ error: "Failed to fetch task" }, { status: 500 });
  }
}

export async function PATCH(
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
    const body = await request.json();

    const [task] = await database.select().from(tasks).where(eq(tasks.id, taskId)).then(r => [r[0]]);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const updates: any = {};
    if (body.title !== undefined) updates.title = body.title;
    if (body.description !== undefined) updates.description = body.description;
    if (body.priority !== undefined) updates.priority = body.priority;
    if (body.status !== undefined) updates.status = body.status;
    if (body.column_id !== undefined) updates.columnId = body.column_id;
    if (body.assignee_id !== undefined) updates.assigneeId = body.assignee_id;
    if (body.position !== undefined) updates.position = body.position;
    if (body.due_date !== undefined) updates.dueDate = body.due_date ? new Date(body.due_date) : null;

    updates.updatedAt = new Date();

    const [updated] = await database.update(tasks).set(updates).where(eq(tasks.id, taskId)).returning();

    return NextResponse.json({ task: updated });
  } catch (error: any) {
    console.error("Update task error:", error);
    return NextResponse.json({ error: error.message || "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(
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

    await database.delete(tasks).where(eq(tasks.id, taskId));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete task error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete task" }, { status: 500 });
  }
}
