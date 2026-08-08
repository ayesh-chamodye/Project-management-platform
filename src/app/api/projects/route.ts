import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getProject, createProject } from "@/lib/firestore";

export async function GET() {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);
    return NextResponse.json({ projects: [] });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();

    const projectId = await createProject({
      name: body.name,
      description: body.description,
      color: body.color || "#6366f1",
      workspaceId: body.workspaceId,
      createdById: decoded.uid,
    });

    return NextResponse.json({ project: { id: projectId, ...body } });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
