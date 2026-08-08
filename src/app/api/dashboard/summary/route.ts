import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getWorkspaces, getProjects } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const workspaces = await getWorkspaces(decoded.uid);
    
    let projectCount = 0;
    let taskCount = 0;
    let completedCount = 0;

    for (const workspace of workspaces) {
      const projects = await getProjects(workspace.id);
      projectCount += projects.length;
      
      for (const project of projects) {
        const boardsSnapshot = await (await import("@/lib/firebase/admin")).adminDb.collection("boards").where("projectId", "==", project.id).get();
        for (const board of boardsSnapshot.docs) {
          const columnsSnapshot = await (await import("@/lib/firebase/admin")).adminDb.collection("boards").doc(board.id).collection("columns").get();
          for (const column of columnsSnapshot.docs) {
            const tasksSnapshot = await (await import("@/lib/firebase/admin")).adminDb.collection("boards").doc(board.id).collection("columns").doc(column.id).collection("tasks").get();
            taskCount += tasksSnapshot.size;
            tasksSnapshot.forEach((doc) => {
              const data = doc.data();
              if (data.status === "done" || data.status === "completed") completedCount++;
            });
          }
        }
      }
    }

    return NextResponse.json({
      stats: {
        workspaceCount: workspaces.length,
        projectCount,
        taskCount,
        completedCount,
        overdueCount: 0,
      },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
