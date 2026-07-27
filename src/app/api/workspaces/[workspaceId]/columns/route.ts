import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { columns, tasks, workspaceMembers } from "@/db/schema";
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
    const boardId = request.nextUrl.searchParams.get("boardId");

    if (!boardId) {
      return NextResponse.json({ columns: [], tasks: [] });
    }

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const boardColumns = await database.select().from(columns).where(eq(columns.boardId, boardId)).orderBy(desc(columns.createdAt));

    const columnIds = boardColumns.map((c) => c.id);
    let tasksData: any[] = [];

    if (columnIds.length > 0) {
      tasksData = await database.select().from(tasks).where(inArray(tasks.columnId, columnIds)).orderBy(desc(tasks.createdAt));
    }

    return NextResponse.json({ columns: boardColumns, tasks: tasksData });
  } catch (error) {
    console.error("Get columns error:", error);
    return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 });
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
    const { name, color, boardId } = await request.json();

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [maxPos] = await database.select({ position: sql<number>`max(position)` }).from(columns).where(eq(columns.boardId, boardId)).then(r => [r[0] || { position: -1 }]);

    const [column] = await database.insert(columns).values({ name: name.trim(), color: color || null, position: String((maxPos?.position ?? -1) + 1), boardId }).returning();

    return NextResponse.json({ column }, { status: 201 });
  } catch (error: any) {
    console.error("Create column error:", error);
    return NextResponse.json({ error: error.message || "Failed to create column" }, { status: 500 });
  }
}
