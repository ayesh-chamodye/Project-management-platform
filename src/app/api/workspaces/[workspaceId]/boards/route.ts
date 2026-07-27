import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { workspaceMembers, projects, boards } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

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

    if (projectId) {
      const projectBoards = await database.select().from(boards).where(eq(boards.projectId, projectId)).orderBy(desc(boards.createdAt));
      return NextResponse.json({ boards: projectBoards });
    }

    const allProjects = await database.select().from(projects).where(eq(projects.workspaceId, workspaceId));

    return NextResponse.json({ projects: allProjects });
  } catch (error) {
    console.error("Get boards error:", error);
    return NextResponse.json({ error: "Failed to fetch boards" }, { status: 500 });
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
    const { name, description, projectId } = await request.json();

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [board] = await database.insert(boards).values({ name: name.trim(), description: description?.trim() || null, projectId, createdById: session.user.id }).returning();

    return NextResponse.json({ board }, { status: 201 });
  } catch (error: any) {
    console.error("Create board error:", error);
    return NextResponse.json({ error: error.message || "Failed to create board" }, { status: 500 });
  }
}
