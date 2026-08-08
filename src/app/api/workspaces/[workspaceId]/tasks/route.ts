import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getTasks, getProject, getWorkspace } from "@/lib/firestore";

export async function GET(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    const { workspaceId } = await params;
    const projectId = request.nextUrl.searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const project = await getProject(projectId) as any;
    if (!project || project.workspaceId !== workspaceId) {
      return NextResponse.json({ error: "Project not found in workspace" }, { status: 404 });
    }

    const workspace = await getWorkspace(workspaceId);
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found" }, { status: 404 });
    }

    const adminDb = (await import("@/lib/firebase/admin")).adminDb;
    const boardSnapshot = await adminDb.collection("boards").where("projectId", "==", projectId).get();
    const board = boardSnapshot.docs[0];
    if (!board) {
      return NextResponse.json({ tasks: [] });
    }

    const boardId = board.id;
    const columnsSnapshot = await adminDb.collection("boards").doc(boardId).collection("columns").orderBy("position", "asc").get();
    const columnIds = columnsSnapshot.docs.map((doc) => doc.id);
    const tasks: any[] = [];

    for (const columnId of columnIds) {
      const columnTasks = await getTasks(columnId);
      tasks.push(...columnTasks);
    }

    return NextResponse.json({ tasks });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const { workspaceId } = await params;
    const { title, description, priority, columnId, assigneeId, dueDate } = await request.json();

    const taskId = await (await import("@/lib/firestore")).createTask({
      title: title.trim(),
      description: description?.trim() || null,
      priority: priority || "medium",
      columnId,
      assigneeId: assigneeId || null,
      dueDate: dueDate || null,
      createdById: decoded.uid,
      position: "0",
      status: "todo",
    });

    return NextResponse.json({ task: { id: taskId, title, description, priority, columnId, assigneeId, dueDate, status: "todo", position: "0" } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
