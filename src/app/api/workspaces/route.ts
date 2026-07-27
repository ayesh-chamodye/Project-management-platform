import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { workspaces, workspaceMembers, projects } from "@/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const userWorkspaces = await database.select().from(workspaces).where(eq(workspaces.ownerId, session.user.id)).orderBy(desc(workspaces.createdAt));

    const result = await Promise.all(
      userWorkspaces.map(async (ws) => {
        const [member] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, ws.id), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);
        const [projectCount] = await database.select({ count: sql<number>`count(*)` }).from(projects).where(eq(projects.workspaceId, ws.id)).then(r => [r[0]?.count || 0]);
        return {
          id: ws.id,
          name: ws.name,
          slug: ws.slug,
          role: member?.role || "member",
          isOwner: ws.ownerId === session.user.id,
          projectCount,
        };
      })
    );

    return NextResponse.json({ workspaces: result });
  } catch (error) {
    console.error("Get workspaces error:", error);
    return NextResponse.json({ error: "Failed to fetch workspaces" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const database = db;

    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

    const [workspace] = await database.insert(workspaces).values({ name: name.trim(), slug, ownerId: session.user.id }).returning();

    await database.insert(workspaceMembers).values({ workspaceId: workspace.id, userId: session.user.id, role: "owner" });

    return NextResponse.json({ workspace }, { status: 201 });
  } catch (error: any) {
    console.error("Create workspace error:", error);
    return NextResponse.json({ error: error.message || "Failed to create workspace" }, { status: 500 });
  }
}
