import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/admin";
import { cookies } from "next/headers";
import { adminDb } from "@/lib/firebase/admin";

export async function GET(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await adminAuth.verifySessionCookie(sessionCookie, true);

    const projectsSnapshot = await adminDb.collection("projects").where("workspaceId", "==", params.workspaceId).get();
    const projectIds = projectsSnapshot.docs.map((doc) => doc.id);

    const boards: any[] = [];
    for (const projectId of projectIds) {
      const boardsSnapshot = await adminDb.collection("boards").where("projectId", "==", projectId).get();
      boardsSnapshot.forEach((doc) => boards.push({ id: doc.id, ...doc.data(), projectId }));
    }

    return NextResponse.json({ boards });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { workspaceId: string } }) {
  try {
    const sessionCookie = (await cookies()).get("session")?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const body = await request.json();

    const boardRef = await adminDb.collection("boards").add({
      name: body.name,
      description: body.description,
      projectId: body.projectId,
      createdById: decoded.uid,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ board: { id: boardRef.id, ...body } }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create board" }, { status: 500 });
  }
}
