import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { workspaceMembers, users } from "@/db/schema";
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

    const [requester] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!requester) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const members = await database.select().from(workspaceMembers).where(eq(workspaceMembers.workspaceId, workspaceId)).orderBy(desc(workspaceMembers.joinedAt));

    const membersWithUsers = await Promise.all(
      members.map(async (m) => {
        const [user] = await database.select().from(users).where(eq(users.id, m.userId)).then(r => [r[0]]);
        return { ...m, user };
      })
    );

    return NextResponse.json({ members: membersWithUsers });
  } catch (error) {
    console.error("Get members error:", error);
    return NextResponse.json({ error: "Failed to fetch members" }, { status: 500 });
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
    const { email, role } = await request.json();

    const [requester] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, session.user.id))).then(r => [r[0]]);

    if (!requester || !["owner", "admin"].includes(requester.role)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [targetUser] = await database.select().from(users).where(eq(users.email, email)).then(r => [r[0]]);

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const [existing] = await database.select().from(workspaceMembers).where(and(eq(workspaceMembers.workspaceId, workspaceId), eq(workspaceMembers.userId, targetUser.id))).then(r => [r[0]]);

    if (existing) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    const [member] = await database.insert(workspaceMembers).values({ workspaceId, userId: targetUser.id, role: role || "member" }).returning();

    return NextResponse.json({ member }, { status: 201 });
  } catch (error: any) {
    console.error("Add member error:", error);
    return NextResponse.json({ error: error.message || "Failed to add member" }, { status: 500 });
  }
}
