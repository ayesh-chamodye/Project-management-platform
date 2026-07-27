import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db/index";
import { workspaces, projects, tasks, columns, boards } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session || !db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userWorkspaces = await db.select().from(workspaces).where(eq(workspaces.ownerId, session.user.id));

    const workspaceCount = userWorkspaces.length;
    const projectCount = userWorkspaces.reduce((acc, ws) => {
      return acc + (ws as any).projects?.length || 0;
    }, 0);

    return NextResponse.json({
      stats: {
        workspaceCount,
        projectCount,
        taskCount: 0,
        completedCount: 0,
        overdueCount: 0,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
