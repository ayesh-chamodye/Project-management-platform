import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { getWorkspaces, createWorkspace } from "@/lib/firestore";

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const workspaces = await getWorkspaces(decoded.uid);

    return NextResponse.json({ workspaces });
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

    const workspaceId = await createWorkspace({
      name: body.name,
      slug: body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      ownerId: decoded.uid,
      icon: body.icon,
    });

    await adminDb.collection("workspace_members").add({
      workspaceId,
      userId: decoded.uid,
      role: "owner",
    });

    return NextResponse.json({ workspace: { id: workspaceId, ...body } });
  } catch {
    return NextResponse.json({ error: "Failed to create workspace" }, { status: 500 });
  }
}
