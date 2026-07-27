import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { workspaceMembers, projects } from "@/db/schema";
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

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userProjects = await database.select().from(projects).where(eq(projects.workspaceId, workspaceId)).orderBy(desc(projects.createdAt));

    return NextResponse.json({ projects: userProjects });
  } catch (error) {
    console.error("Get projects error:", error);
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
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
    const { name, description, color } = await request.json();

    const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!member || !["owner", "admin"].includes(member.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [project] = await database.insert(projects).values({ name: name.trim(), description: description?.trim() || null, color: color || "#6366f1", workspaceId, createdById: session.user.id }).returning();

    return NextResponse.json({ project }, { status: 201 });
  } catch (error: any) {
    console.error("Create project error:", error);
    return NextResponse.json({ error: error.message || "Failed to create project" }, { status: 500 });
  }
}
