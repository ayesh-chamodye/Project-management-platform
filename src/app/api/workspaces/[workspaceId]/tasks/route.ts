import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { tasks, columns, boards, workspaceMembers } from "@/db/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const { workspaceId } = await params;
    const projectId = request.nextUrl.searchParams.get("projectId");

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const [board] = await database.select().from(boards).where(eq(boards.projectId, projectId)).then(r => [r[0]]);

    if (!board) {
      return NextResponse.json({ tasks: [] });
    }

    const boardColumns = await database.select().from(columns).where(eq(columns.boardId, board.id));
    const columnIds = boardColumns.map((c) => c.id);
    const tasksData: any[] = [];

    if (columnIds.length > 0) {
      const result = await database.select().from(tasks).where(inArray(tasks.columnId, columnIds)).orderBy(desc(tasks.createdAt));
      tasksData.push(...result);
    }

    return NextResponse.json({ tasks: tasksData });
  } catch (error) {
    console.error("Get tasks error:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const { workspaceId } = await params;
    const { title, description, priority, columnId, assigneeId, dueDate } = await request.json();

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [maxPos] = await database.select({ position: sql<number>`max(position)` }).from(tasks).where(eq(tasks.columnId, columnId)).then(r => [r[0] || { position: -1 }]);

    const [task] = await database.insert(tasks).values({ title: title.trim(), description: description?.trim() || null, priority: priority || "medium", columnId, assigneeId: assigneeId || null, dueDate: dueDate ? new Date(dueDate) : null, createdById: session.user.id, position: String((maxPos?.position ?? -1) + 1) }).returning();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error: any) {
    console.error("Create task error:", error);
    return NextResponse.json({ error: error.message || "Failed to create task" }, { status: 500 });
  }
}
